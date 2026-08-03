/*
 * Playground TypeScript — editor Monaco (il motore di VS Code) caricato da CDN in lazy
 * alla prima apertura: IntelliSense e type-check reali di TypeScript (completamento,
 * hover coi tipi, diagnostica) in un web worker. All'esecuzione il codice viene
 * transpilato TS→JS dallo stesso worker (getEmitOutput) e messo in esecuzione in un
 * <iframe sandbox> isolato che dirotta console ed errori nel terminale.
 *
 * Espone window.__pgOpen(code) per aprire il playground precompilato con uno snippet
 * (usato dal bottone «▶ Prova» iniettato sui blocchi di codice TS della doc).
 */
(function () {
  var MONACO = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
  var PREFILL = [
    "// Playground TypeScript — IntelliSense e type-check reali (anche con Ctrl+Spazio).",
    "// Premi Esegui (Ctrl/Cmd+Invio): il codice viene transpilato ed eseguito.",
    "",
    "interface Punto {",
    "  x: number;",
    "  y: number;",
    "}",
    "",
    "function distanza(a: Punto, b: Punto): number {",
    "  return Math.hypot(b.x - a.x, b.y - a.y);",
    "}",
    "",
    'console.log("distanza:", distanza({ x: 0, y: 0 }, { x: 3, y: 4 }));'
  ].join("\n");

  // Script iniettato nell'iframe: dirotta console + errori verso il parent.
  var HARNESS = [
    "(function(){",
    "  function fmt(v){",
    "    if (typeof v === 'string') return v;",
    "    if (typeof v === 'function') return v.toString();",
    "    if (typeof v === 'bigint') return v + 'n';",
    "    if (typeof v === 'symbol') return v.toString();",
    "    if (v === undefined) return 'undefined';",
    "    if (v === null) return 'null';",
    "    if (v instanceof Error) return (v.stack || (v.name + ': ' + v.message));",
    "    try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }",
    "  }",
    "  function send(level, args){",
    "    var t = Array.prototype.map.call(args, fmt).join(' ');",
    "    parent.postMessage({ __pg: true, level: level, text: t }, '*');",
    "  }",
    "  ['log','info','debug','warn','error'].forEach(function(m){",
    "    var orig = (typeof console[m] === 'function') ? console[m].bind(console) : function(){};",
    "    console[m] = function(){ send(m === 'debug' ? 'log' : m, arguments); orig.apply(null, arguments); };",
    "  });",
    "  window.addEventListener('error', function(e){",
    "    parent.postMessage({ __pg: true, level: 'error', text: e.message + (e.lineno ? ' (riga ' + e.lineno + ')' : '') }, '*');",
    "  });",
    "  window.addEventListener('unhandledrejection', function(e){",
    "    parent.postMessage({ __pg: true, level: 'error', text: 'Uncaught (in promise) ' + fmt(e.reason) }, '*');",
    "  });",
    "})();"
  ].join("\n");

  var dialog, host, output, runner, mEditor = null, monaco = null, tsModel = null, monacoReady = null, pendingValue = null;

  function build() {
    var open = document.createElement("button");
    open.id = "pg-toggle";
    open.type = "button";
    open.title = "Playground TypeScript";
    open.setAttribute("aria-label", "Apri il playground TypeScript");
    open.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="7.5 9 10.5 12 7.5 15"/><line x1="13" y1="15" x2="16.5" y2="15"/></svg>';
    document.body.appendChild(open);

    dialog = document.createElement("dialog");
    dialog.id = "pg-dialog";
    dialog.innerHTML =
      '<div class="pg-head">' +
        '<span class="pg-title">Playground TypeScript</span>' +
        '<span class="pg-hint">Ctrl/Cmd + Invio esegue · Esc chiude</span>' +
        '<button type="button" class="pg-close" aria-label="Chiudi">✕</button>' +
      "</div>" +
      '<div class="pg-body">' +
        '<div class="pg-pane">' +
          '<div class="pg-pane-label">Codice</div>' +
          '<div class="pg-monaco"></div>' +
          '<div class="pg-actions">' +
            '<button type="button" class="pg-run">Esegui ▶</button>' +
            '<button type="button" class="pg-fmt">Formatta</button>' +
            '<button type="button" class="pg-clear">Pulisci</button>' +
          "</div>" +
        "</div>" +
        '<div class="pg-pane">' +
          '<div class="pg-pane-label">Terminale</div>' +
          '<pre class="pg-output" aria-live="polite"></pre>' +
        "</div>" +
      "</div>";
    document.body.appendChild(dialog);

    host = dialog.querySelector(".pg-monaco");
    output = dialog.querySelector(".pg-output");

    open.addEventListener("click", function () { openWith(null); });
    dialog.querySelector(".pg-close").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector(".pg-run").addEventListener("click", run);
    dialog.querySelector(".pg-fmt").addEventListener("click", format);
    dialog.querySelector(".pg-clear").addEventListener("click", function () { output.textContent = ""; });

    // Chiude sul click nel backdrop, ma solo se ANCHE la pressione iniziale era
    // fuori dal box: così il resize (che parte sulla maniglia, dentro il box, e
    // rilasciando può finire fuori quando si rimpicciolisce) non chiude la modale.
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

    window.addEventListener("message", function (e) {
      var d = e.data;
      if (!d || d.__pg !== true) return;
      appendLine(d.level, d.text);
    });

    window.__pgOpen = openWith;   // API per il bottone «▶ Prova» sui blocchi di codice
  }

  // Apre la modale; se code è una stringa, la carica nell'editor (sovrascrive).
  function openWith(code) {
    pendingValue = (typeof code === "string") ? code : null;
    dialog.showModal();
    ensureEditor();
  }

  // Crea l'editor Monaco alla prima apertura; nelle successive rilancia il layout.
  function ensureEditor() {
    if (mEditor) {
      if (pendingValue != null) { mEditor.setValue(pendingValue); pendingValue = null; }
      mEditor.layout();
      mEditor.focus();
      return;
    }
    host.innerHTML = '<div class="pg-loading">Caricamento dell\'editor…</div>';
    loadMonaco().then(function (m) {
      monaco = m;
      host.textContent = "";
      function themeName() {
        return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
      }
      // Target moderno per l'emit (niente downlevel inutile) e type-check completo.
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        strict: true,
        noEmitOnError: false        // si può eseguire anche con errori di tipo (come il TS Playground)
      });
      // Modello con URI file:///main.ts: il worker TS lo riconosce come "source file",
      // necessario per getEmitOutput (con l'URI di default inmemory://model/1 fallisce
      // con "Could not find source file").
      var uri = monaco.Uri.parse("file:///main.ts");
      tsModel = monaco.editor.getModel(uri) || monaco.editor.createModel("", "typescript", uri);
      tsModel.setValue(pendingValue != null ? pendingValue : PREFILL);
      pendingValue = null;
      mEditor = monaco.editor.create(host, {
        model: tsModel,
        theme: themeName(),
        automaticLayout: true,      // si ridisegna quando la modale cambia dimensione
        fixedOverflowWidgets: true, // suggerimenti/hover non tagliati dall'overflow del dialog
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
        padding: { top: 10 }
      });
      mEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
      mEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, format);
      // Allinea il tema di Monaco al tema chiaro/scuro del sito.
      new MutationObserver(function () { monaco.editor.setTheme(themeName()); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
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

  function format() {
    if (mEditor) mEditor.getAction("editor.action.formatDocument").run();
  }

  function appendLine(level, text) {
    var line = document.createElement("span");
    line.className = "pg-line pg-" + (level || "log");
    line.textContent = text;
    output.appendChild(line);
    output.appendChild(document.createTextNode("\n"));
    output.scrollTop = output.scrollHeight;
  }

  // Transpila il modello TS con il worker Monaco, poi esegue il JS risultante.
  function run() {
    if (!mEditor || !monaco) return;
    output.textContent = "";
    var model = mEditor.getModel();
    monaco.languages.typescript.getTypeScriptWorker()
      .then(function (getWorker) { return getWorker(model.uri); })
      .then(function (client) { return client.getEmitOutput(model.uri.toString()); })
      .then(function (result) {
        var file = result && result.outputFiles && result.outputFiles[0];
        execute(file ? file.text : "");
      })
      .catch(function (err) {
        appendLine("error", "Errore di transpile: " + (err && err.message ? err.message : err));
      });
  }

  function execute(js) {
    if (runner) runner.remove();
    runner = document.createElement("iframe");
    runner.className = "pg-runner";
    runner.setAttribute("sandbox", "allow-scripts");
    var code = js.replace(/<\/script>/gi, "<\\/script>");
    runner.srcdoc =
      '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
      "<script>" + HARNESS + "</script>" +
      "<script>\n" + code + "\n</script>" +
      "</body></html>";
    dialog.appendChild(runner);
  }

  // Drag della modale afferrandola per l'header. Al primo trascinamento la
  // "sgancia" dal centraggio nativo (position:fixed + left/top) e la vincola
  // dentro il viewport; posizione e dimensioni restano tra un'apertura e l'altra.
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
