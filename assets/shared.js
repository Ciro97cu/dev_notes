/*
 * Codice CONDIVISO da tutti i vault dell'hub — una sola fonte di verità.
 * Contiene l'anti-flash del tema e i plugin docsify riusabili (tema, mermaid,
 * callout collassabili, "Riprendi", puntini della cover). Quando qualcosa cambia
 * qui, cambia per tutti i vault.
 *
 * Ogni vault lo carica con <script src="../assets/shared.js"> PRIMA del proprio
 * assets/app.js (che definisce le parti specifiche: wikilink e window.$docsify).
 * La chiave di "Riprendi" è per-vault: il vault imposta window.__VAULT in app.js.
 */

// Anti-flash: imposta il tema il prima possibile, prima del render di docsify.
(function () {
  try {
    var saved = localStorage.getItem('dev-notes-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();

// ── Persistenza condivisa: NotesStore ────────────────────────────────────────
// Cache su localStorage (chiavi `dev-notes-<vault>-<nome>`, namespace via __VAULT)
// come store di lavoro, + Esporta/Importa di UN file JSON che l'utente possiede:
// sopravvive alla cancellazione dei dati del browser, portabile fra dispositivi.
// Nessun backend, nessun account, nessuna dipendenza. È la "fonte di verità" durevole.
window.NotesStore = (function () {
  var PREFIX = 'dev-notes-';
  function k(name) { return PREFIX + (window.__VAULT || 'hub') + '-' + name; }
  function read(name, fallback) {
    try { var r = localStorage.getItem(k(name)); return r == null ? fallback : JSON.parse(r); }
    catch (e) { return fallback; }
  }
  function write(name, val) {
    try { localStorage.setItem(k(name), JSON.stringify(val)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('notesstore:change', { detail: { name: name } })); } catch (e) {}
  }
  // Fotografia di TUTTE le chiavi dev-notes-* (tutti i vault) per l'esportazione.
  function snapshot() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(PREFIX) === 0) {
        try { out[key] = JSON.parse(localStorage.getItem(key)); }
        catch (e) { out[key] = localStorage.getItem(key); }
      }
    }
    return { app: 'dev-notes', version: 1, exportedAt: new Date().toISOString(), data: out };
  }
  function download() {
    var blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'dev-notes-dati.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }
  function mergeInto(key, incoming) {
    var cur; try { cur = JSON.parse(localStorage.getItem(key)); } catch (e) { cur = null; }
    var val = incoming;
    if (isArr(cur) && isArr(incoming)) {                 // array → unione senza duplicati
      var seen = {}, out = [];
      cur.concat(incoming).forEach(function (x) {
        var s = (x && typeof x === 'object') ? JSON.stringify(x) : String(x);
        if (!seen[s]) { seen[s] = 1; out.push(x); }
      });
      val = out;
    } else if (cur && incoming && typeof cur === 'object' && typeof incoming === 'object') {
      val = cur; Object.keys(incoming).forEach(function (kk) { val[kk] = incoming[kk]; });  // oggetto → shallow-merge
    }
    localStorage.setItem(key, JSON.stringify(val));
  }
  function importObj(obj, mode) {           // mode: 'merge' | 'replace'
    if (!obj || !obj.data) throw new Error('file non valido');
    Object.keys(obj.data).forEach(function (key) {
      if (key.indexOf(PREFIX) !== 0) return;
      if (mode === 'merge') mergeInto(key, obj.data[key]);
      else localStorage.setItem(key, JSON.stringify(obj.data[key]));
    });
  }
  function importFile(file, mode, done) {
    var r = new FileReader();
    r.onload = function () {
      try { importObj(JSON.parse(r.result), mode); done && done(null); }
      catch (e) { done && done(e); }
    };
    r.onerror = function () { done && done(new Error('lettura fallita')); };
    r.readAsText(file);
  }
  return { read: read, write: write, snapshot: snapshot, download: download, importFile: importFile, keyFor: k };
})();

// ── Dock "Dati": Esporta / Importa il file dei progressi ──────────────────────
// Pulsante fisso (sotto il toggle tema) che apre un popover. È UI globale, quindi
// vive in un IIFE su DOMContentLoaded (non serve registrarlo come plugin docsify).
(function () {
  var css = [
    '#dn-data{position:fixed;top:62px;right:16px;z-index:100}',
    '#dn-data-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-data-btn:hover{border-color:var(--link);color:var(--link)}',
    '.dn-pop{position:absolute;top:48px;right:0;min-width:210px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.20);padding:.4rem;display:none}',
    '.dn-pop.open{display:block}',
    '.dn-pop .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.35rem .6rem .2rem}',
    '.dn-pop button{display:flex;gap:.55rem;align-items:center;width:100%;padding:.5rem .6rem;border:0;background:transparent;color:var(--text);font:inherit;font-size:.9rem;cursor:pointer;border-radius:8px;text-align:left}',
    '.dn-pop button:hover{background:rgba(127,127,127,.14)}',
    '.dn-pop button svg{flex:0 0 auto;opacity:.8}'
  ].join('');
  var el = document.createElement('style');
  el.id = 'dn-data-styles';
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);

  var ICON_DB = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>';
  var ICON_DL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>';
  var ICON_UP = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>';

  function build() {
    if (document.getElementById('dn-data')) return;
    var wrap = document.createElement('div');
    wrap.id = 'dn-data';
    wrap.innerHTML =
      '<button id="dn-data-btn" type="button" title="Dati e progressi" aria-label="Dati e progressi" aria-expanded="false">' + ICON_DB + '</button>' +
      '<div class="dn-pop" role="menu">' +
        '<div class="dn-title">Dati e progressi</div>' +
        '<button type="button" data-act="export" role="menuitem">' + ICON_DL + 'Esporta su file…</button>' +
        '<button type="button" data-act="import" role="menuitem">' + ICON_UP + 'Importa da file…</button>' +
      '</div>' +
      '<input type="file" accept="application/json,.json" hidden>';
    document.body.appendChild(wrap);

    var btn = wrap.querySelector('#dn-data-btn');
    var pop = wrap.querySelector('.dn-pop');
    var file = wrap.querySelector('input[type=file]');
    function close() { pop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = pop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'export') { window.NotesStore.download(); close(); }
      else { file.value = ''; file.click(); close(); }
    });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var merge = window.confirm('Importa "' + f.name + '".\n\nOK = unisci ai dati attuali\nAnnulla = sostituisci tutto');
      window.NotesStore.importFile(f, merge ? 'merge' : 'replace', function (err) {
        if (err) { window.alert('Import non riuscito: ' + err.message); return; }
        location.reload();
      });
    });
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();

// Stile (condiviso) delle 3 sezioni "Come funziona" sulla cover: layout a colonne e
// animazione. I colori sono fissi (testo bianco sul fondo brand), quindi vale per tutti.
(function () {
  var css = [
    '.cover-about{display:grid;grid-template-columns:repeat(3,1fr);align-items:start;gap:.8rem;width:100%;max-width:860px;margin:1.6rem auto .2rem;text-align:left}',
    '.cover-about .about-col{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:0 .95rem}',
    '.cover-about .about-head{width:100%;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.7rem 0;border:0;background:transparent;font:inherit;font-weight:700;font-size:.92rem;color:#fff;text-align:left}',
    '.cover-about .about-head::after{content:"+";font-weight:400;opacity:.65}',
    '.cover-about .about-col.open .about-head::after{content:"\\2212"}',
    '.cover-about .about-body{overflow:hidden;max-height:0;transition:max-height .32s ease}',
    '.cover-about .about-col.open .about-body{max-height:30rem}',
    '.cover-about .about-inner{font-size:.8rem;line-height:1.5;color:rgba(255,255,255,.85)}',
    '.cover-about .about-inner ul{margin:.35rem 0 .85rem;padding-left:1.1rem}',
    '.cover-about .about-inner li{margin:.28rem 0}',
    '.cover-about .about-inner code{background:rgba(255,255,255,.14);padding:0 .3em;border-radius:4px}',
    '@media (max-width:720px){.cover-about{grid-template-columns:1fr;max-width:460px}}'
  ].join('');
  var el = document.createElement('style');
  el.id = 'cover-about-styles';
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
})();

// Espansione fluida delle sezioni "Come funziona" sulla cover: ogni sezione si apre e
// chiude in modo indipendente (più di una può restare aperta). L'animazione è CSS.
document.addEventListener('click', function (e) {
  var h = e.target && e.target.closest && e.target.closest('.about-head');
  if (!h) return;
  var open = h.parentNode.classList.toggle('open');
  h.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Toggle tema chiaro/scuro, persistito in localStorage (key: dev-notes-theme).
// Il ramo mermaid è no-op nei vault che non caricano mermaid.
function themeTogglePlugin(hook) {
  hook.mounted(function () {
    var KEY = 'dev-notes-theme';
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cambia tema chiaro/scuro');
    var saved = localStorage.getItem(KEY);
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    function apply() {
      document.documentElement.classList.toggle('dark', dark);
      btn.textContent = dark ? '☀' : '☾';
      btn.title = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
      if (window.mermaid && window.__mermaidInit) {
        mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
      }
    }
    apply();
    btn.addEventListener('click', function () {
      dark = !dark;
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
      apply();
    });
    document.body.appendChild(btn);
  });
}

// Renderizza i diagrammi mermaid dopo ogni cambio pagina (attivo solo se mermaid è caricato).
function mermaidPlugin(hook) {
  hook.doneEach(function () {
    if (!window.mermaid) return;
    if (!window.__mermaidInit) {
      var darkNow = document.documentElement.classList.contains('dark');
      mermaid.initialize({ startOnLoad: false, theme: darkNow ? 'dark' : 'neutral' });
      window.__mermaidInit = true;
    }
    try { mermaid.run({ querySelector: '.markdown-section .mermaid' }); } catch (e) { /* già renderizzati */ }
  });
}

// Rende collassabili i callout "Risposta" (Obsidian [!success]- / [!success]+) sul sito.
function collapsibleAnswersPlugin(hook) {
  hook.doneEach(function () {
    var callouts = document.querySelectorAll('.markdown-section .alert.callout-answer');
    callouts.forEach(function (el) {
      if (el.dataset.collapsibleReady) return;
      var heading = el.querySelector('p:first-child, .alert-heading, strong');
      if (!heading) return;
      var raw = (heading.textContent || '').trim();
      var startsCollapsed = true;
      if (/^[-+]/.test(raw)) {
        startsCollapsed = raw.charAt(0) === '-';
        heading.textContent = raw.replace(/^[-+]\s*/, '');
      }
      el.classList.add('is-collapsible');
      el.dataset.collapsibleReady = '1';
      var body = [];
      var n = heading.nextSibling;
      while (n) { body.push(n); n = n.nextSibling; }
      var wrap = document.createElement('div');
      wrap.className = 'answer-body';
      body.forEach(function (node) { wrap.appendChild(node); });
      el.appendChild(wrap);
      heading.classList.add('answer-toggle');
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      function setState(open) {
        el.classList.toggle('open', open);
        heading.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      setState(!startsCollapsed);
      heading.addEventListener('click', function () { setState(!el.classList.contains('open')); });
      heading.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setState(!el.classList.contains('open')); }
      });
    });
  });
}

// "Riprendi": memorizza l'ultima posizione di lettura (pagina + sotto-sezione) e popola
// la card #nav-resume sulla cover (nascosta finché non c'è cronologia). La sotto-sezione
// è l'ultima heading superata durante lo scroll → si riapre esattamente lì (?id=…).
// Chiave per-vault via window.__VAULT.
function resumePlugin(hook, vm) {
  var KEY = (window.__VAULT || 'dev-notes') + '-last-page';
  var SKIP = { '/': 1, '/00-index': 1, '/README': 1, '/_coverpage': 1 };
  var current = null, timer = null;

  // id dell'ultima heading (h1..h4) il cui bordo superiore è sopra la soglia = sezione corrente
  function currentId() {
    var hs = document.querySelectorAll('.markdown-section h1[id], .markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]');
    var id = '';
    for (var i = 0; i < hs.length; i++) {
      if (hs[i].getBoundingClientRect().top <= 120) id = hs[i].id; else break;
    }
    return id;
  }
  function persist() {
    if (!current) return;
    try { localStorage.setItem(KEY, JSON.stringify({ p: current, id: currentId() })); } catch (e) {}
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      if (raw.charAt(0) === '{') return JSON.parse(raw);
      return { p: raw, id: '' };   // retro-compatibilità con la vecchia chiave (solo path)
    } catch (e) { return null; }
  }

  hook.doneEach(function () {
    var path = (vm.route && vm.route.path) || '';
    current = (path && !SKIP[path]) ? path : null;
    if (current) persist();   // salva almeno la pagina appena arrivati

    var card = document.getElementById('nav-resume');
    if (!card) return;
    var rec = read();
    if (rec && rec.p && !SKIP[rec.p]) {
      card.setAttribute('href', '#' + rec.p + (rec.id ? '?id=' + rec.id : ''));
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  // mentre si scorre, aggiorna la sotto-sezione salvata (debounced); capture per intercettare
  // lo scroll su qualsiasi contenitore.
  document.addEventListener('scroll', function () {
    if (!current) return;
    clearTimeout(timer);
    timer = setTimeout(persist, 200);
  }, true);
}

// Puntini interattivi sulla cover: griglia su <canvas>, respinta dal cursore.
// A riposo non consuma CPU (rAF solo mentre i puntini si muovono/riassestano).
// Il colore dei puntini e lo sfondo sono definiti in CSS per ciascun vault.
function coverDotsPlugin(hook) {
  hook.ready(function () {
    var cover = document.querySelector('section.cover');
    if (!cover || cover.querySelector('#cover-dots')) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.createElement('canvas');
    canvas.id = 'cover-dots';
    cover.insertBefore(canvas, cover.firstChild);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var GAP = 28, R = 1.5, INFLU = 120, PUSH = 26, EASE = 0.15;
    var dots = [], W = 0, H = 0, mx = -9999, my = -9999, raf = null;

    function build() {
      var r = cover.getBoundingClientRect();
      W = Math.ceil(r.width); H = Math.ceil(r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (var y = GAP / 2; y < H; y += GAP)
        for (var x = GAP / 2; x < W; x += GAP)
          dots.push({ x: x, y: y, ox: x, oy: y });
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, R, 0, 6.2832);
        ctx.fill();
      }
    }
    function tick() {
      var moving = false;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], tx = d.ox, ty = d.oy;
        var dx = d.ox - mx, dy = d.oy - my, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < INFLU && dist > 0.001) {
          var f = 1 - dist / INFLU;
          tx = d.ox + (dx / dist) * f * PUSH;
          ty = d.oy + (dy / dist) * f * PUSH;
        }
        d.x += (tx - d.x) * EASE;
        d.y += (ty - d.y) * EASE;
        if (Math.abs(tx - d.x) > 0.1 || Math.abs(ty - d.y) > 0.1) moving = true;
      }
      draw();
      raf = moving ? requestAnimationFrame(tick) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(cover);
    else window.addEventListener('resize', build);
    if (reduce) return;   // reduced-motion: griglia statica, niente animazione
    cover.addEventListener('pointermove', function (e) {
      var r = cover.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; kick();
    });
    cover.addEventListener('pointerleave', function () { mx = my = -9999; kick(); });
  });
}
