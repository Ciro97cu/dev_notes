/*
 * Playground CSS — editor Monaco (il motore di VS Code) caricato da CDN in lazy alla
 * prima apertura: IntelliSense reale di CSS e HTML (completamento proprietà/valori,
 * validazione) in un web worker. Due tab (HTML / CSS) su un unico editor; l'anteprima
 * a destra si aggiorna in tempo reale renderizzando HTML+CSS in un <iframe> isolato.
 *
 * Espone window.__pgOpen(css) per aprire il playground con uno snippet CSS
 * (usato dal bottone «▶ Prova» sui blocchi CSS; il markup HTML resta quello di default,
 * modificabile nella tab HTML).
 */
(function () {
  var MONACO = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";

  var DEFAULT_HTML = [
    '<div class="card">',
    "  <h2>Ciao CSS</h2>",
    "  <p>Modifica lo stile e guarda l'anteprima aggiornarsi in tempo reale.</p>",
    '  <button>Azione</button>',
    "</div>"
  ].join("\n");

  var DEFAULT_CSS = [
    "/* Playground CSS — IntelliSense attivo (anche con Ctrl+Spazio). */",
    "body { display: grid; place-items: center; min-height: 100vh; margin: 0; }",
    "",
    ".card {",
    "  max-width: 320px;",
    "  padding: 1.5rem;",
    "  border-radius: 12px;",
    "  font-family: system-ui, sans-serif;",
    "  background: linear-gradient(135deg, #1572b6, #6dd5ed);",
    "  color: #fff;",
    "  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);",
    "}",
    ".card button {",
    "  margin-top: 1rem;",
    "  padding: 0.5rem 1rem;",
    "  border: 0;",
    "  border-radius: 8px;",
    "  background: #fff;",
    "  color: #1572b6;",
    "  font-weight: 600;",
    "  cursor: pointer;",
    "}"
  ].join("\n");

  var dialog, host, preview, tabs, mEditor = null, htmlModel = null, cssModel = null;
  var monacoReady = null, current = "css", pendingCss = null, rt;

  function build() {
    var open = document.createElement("button");
    open.id = "pg-toggle";
    open.type = "button";
    open.title = "Playground CSS";
    open.setAttribute("aria-label", "Apri il playground CSS");
    open.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="7.5 9 10.5 12 7.5 15"/><line x1="13" y1="15" x2="16.5" y2="15"/></svg>';
    document.body.appendChild(open);

    dialog = document.createElement("dialog");
    dialog.id = "pg-dialog";
    dialog.innerHTML =
      '<div class="pg-head">' +
        '<span class="pg-title">Playground CSS</span>' +
        '<span class="pg-hint">Anteprima in tempo reale · Esc chiude</span>' +
        '<button type="button" class="pg-close" aria-label="Chiudi">✕</button>' +
      "</div>" +
      '<div class="pg-body">' +
        '<div class="pg-pane">' +
          '<div class="pg-tabs">' +
            '<button type="button" class="pg-tab" data-model="html">HTML</button>' +
            '<button type="button" class="pg-tab is-active" data-model="css">CSS</button>' +
          "</div>" +
          '<div class="pg-monaco"></div>' +
          '<div class="pg-actions">' +
            '<button type="button" class="pg-fmt" title="Formatta (⇧ + Ctrl/Cmd + F)">Formatta</button>' +
          "</div>" +
        "</div>" +
        '<div class="pg-pane">' +
          '<div class="pg-pane-label">Anteprima</div>' +
          '<iframe class="pg-preview" title="Anteprima" sandbox="allow-scripts"></iframe>' +
        "</div>" +
      "</div>";
    document.body.appendChild(dialog);

    host = dialog.querySelector(".pg-monaco");
    preview = dialog.querySelector(".pg-preview");
    tabs = dialog.querySelectorAll(".pg-tab");

    open.addEventListener("click", function () { openWith(null); });
    dialog.querySelector(".pg-close").addEventListener("click", function () { dialog.close(); });
    Array.prototype.forEach.call(tabs, function (t) {
      t.addEventListener("click", function () { setModel(t.getAttribute("data-model")); });
    });
    dialog.querySelector(".pg-fmt").addEventListener("click", format);

    // Chiude sul click nel backdrop, ma solo se ANCHE la pressione iniziale era fuori
    // dal box: così il resize (che parte sulla maniglia) non chiude la modale.
    var downOutside = false;
    function outside(e, r) {
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    }
    dialog.addEventListener("pointerdown", function (e) {
      downOutside = outside(e, dialog.getBoundingClientRect());
    });
    dialog.addEventListener("click", function (e) {
      if (downOutside && outside(e, dialog.getBoundingClientRect())) dialog.close();
    });

    makeDraggable(dialog, dialog.querySelector(".pg-head"));

    window.__pgOpen = openWith;   // API per il bottone «▶ Prova» sui blocchi di codice
  }

  // Apre la modale; se css è una stringa, la carica nel modello CSS (sovrascrive).
  // Il markup HTML resta quello corrente/di default (l'utente lo modifica nella tab HTML).
  function openWith(css) {
    pendingCss = (typeof css === "string") ? css : null;
    dialog.showModal();
    ensureEditor();
  }

  function setModel(which) {
    if (!mEditor) return;
    current = which;
    mEditor.setModel(which === "html" ? htmlModel : cssModel);
    syncTabs();
    mEditor.focus();
  }

  function syncTabs() {
    Array.prototype.forEach.call(tabs, function (t) {
      t.classList.toggle("is-active", t.getAttribute("data-model") === current);
    });
  }

  function themeName() {
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
  }

  function scheduleRender() { clearTimeout(rt); rt = setTimeout(render, 250); }

  function render() {
    if (!preview || !cssModel || !htmlModel) return;
    preview.srcdoc =
      '<!doctype html><html><head><meta charset="utf-8"><style>' +
      cssModel.getValue() +
      "</style></head><body>" + htmlModel.getValue() + "</body></html>";
  }

  function format() {
    if (mEditor) mEditor.getAction("editor.action.formatDocument").run();  // formatta il modello attivo
  }

  // Crea l'editor Monaco alla prima apertura; nelle successive rilancia il layout.
  function ensureEditor() {
    if (mEditor) {
      if (pendingCss != null) { cssModel.setValue(pendingCss); pendingCss = null; setModel("css"); render(); }
      mEditor.layout();
      mEditor.focus();
      return;
    }
    host.innerHTML = '<div class="pg-loading">Caricamento dell\'editor…</div>';
    loadMonaco().then(function (monaco) {
      host.textContent = "";
      htmlModel = monaco.editor.createModel(DEFAULT_HTML, "html");
      cssModel = monaco.editor.createModel(pendingCss != null ? pendingCss : DEFAULT_CSS, "css");
      pendingCss = null;
      current = "css";
      mEditor = monaco.editor.create(host, {
        model: cssModel,
        theme: themeName(),
        automaticLayout: true,      // si ridisegna quando la modale cambia dimensione
        fixedOverflowWidgets: true, // suggerimenti/hover non tagliati dall'overflow del dialog
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
        padding: { top: 10 }
      });
      mEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, format);
      syncTabs();
      htmlModel.onDidChangeContent(scheduleRender);
      cssModel.onDidChangeContent(scheduleRender);
      // Allinea il tema di Monaco al tema chiaro/scuro del sito.
      new MutationObserver(function () { monaco.editor.setTheme(themeName()); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      render();
      mEditor.focus();
    }).catch(function (err) {
      host.innerHTML = '<div class="pg-loading"></div>';
      host.firstChild.textContent = "Impossibile caricare l'editor Monaco (" +
        (err && err.message ? err.message : err) + "). Serve la rete al primo avvio.";
    });
  }

  // Carica il loader AMD di Monaco da CDN una sola volta. I web worker cross-origin
  // si abilitano con uno shim: un worker "data:" che importa il workerMain dal CDN.
  function loadMonaco() {
    if (monacoReady) return monacoReady;
    monacoReady = new Promise(function (resolve, reject) {
      window.MonacoEnvironment = {
        getWorkerUrl: function () {
          return "data:text/javascript;charset=utf-8," + encodeURIComponent(
            "self.MonacoEnvironment={baseUrl:'" + MONACO + "/'};" +
            "importScripts('" + MONACO + "/vs/base/worker/workerMain.js');"
          );
        }
      };
      var s = document.createElement("script");
      s.src = MONACO + "/vs/loader.js";
      s.onload = function () {
        window.require.config({ paths: { vs: MONACO + "/vs" } });
        window.require(["vs/editor/editor.main"], function () { resolve(window.monaco); });
      };
      s.onerror = function () { reject(new Error("loader non raggiungibile")); };
      document.head.appendChild(s);
    });
    return monacoReady;
  }

  // Drag della modale afferrandola per l'header. Al primo trascinamento la "sgancia"
  // dal centraggio nativo (position:fixed + left/top) e la vincola dentro il viewport;
  // posizione e dimensioni restano tra un'apertura e l'altra.
  function makeDraggable(dlg, handle) {
    var dragging = false, sx, sy, sl, st;
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;   // la ✕ non avvia il drag
      var r = dlg.getBoundingClientRect();
      dlg.style.position = "fixed";
      dlg.style.margin = "0";
      dlg.style.inset = "auto";
      dlg.style.left = r.left + "px";
      dlg.style.top = r.top + "px";
      dragging = true;
      dlg.classList.add("pg-dragging");   // toglie la sfocatura del backdrop
      sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    var KEEP = 48;   // fetta minima che resta sempre a schermo, per poterla riafferrare
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var nl = sl + (e.clientX - sx);
      var nt = st + (e.clientY - sy);
      nl = Math.max(KEEP - dlg.offsetWidth, Math.min(nl, window.innerWidth - KEEP));
      nt = Math.max(0, Math.min(nt, window.innerHeight - KEEP));
      dlg.style.left = nl + "px";
      dlg.style.top = nt + "px";
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      dlg.classList.remove("pg-dragging");
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
