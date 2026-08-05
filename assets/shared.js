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

// ── Feature di lettura (progresso, preferiti): CSS, icone e helper condivisi ──
(function () {
  var css = [
    // barra progresso in cima alla sidebar
    '#dn-progress{padding:.55rem .75rem .7rem}',
    '.dn-progress-label{font-size:.74rem;opacity:.75;margin-bottom:.35rem;display:flex;justify-content:space-between}',
    '.dn-progress-bar{height:6px;border-radius:4px;background:rgba(127,127,127,.22);overflow:hidden}',
    '.dn-progress-bar span{display:block;height:100%;width:0;background:var(--link);transition:width .3s ease}',
    // spunta ✓ sui capitoli letti nella sidebar
    '.sidebar-nav a.dn-read::before,.sidebar a.dn-read::before{content:"\\2713";color:var(--link);font-weight:700;margin-right:.35em}',
    // bottone "segna come letto" a fine capitolo
    '.dn-read-toggle{display:inline-flex;align-items:center;gap:.5rem;margin:2.4rem 0 .5rem;padding:.55rem .9rem;border:1px solid var(--border);border-radius:9px;background:var(--bg-soft);color:var(--text);font:inherit;font-size:.9rem;cursor:pointer}',
    '.dn-read-toggle:hover{border-color:var(--link)}',
    '.dn-read-toggle.is-read{border-color:var(--link);color:var(--link)}',
    // stella preferiti accanto al titolo
    '.dn-star{margin-left:.5rem;vertical-align:middle;border:0;background:transparent;color:inherit;cursor:pointer;opacity:.5;padding:.1em;line-height:0}',
    '.dn-star:hover,.dn-star.is-fav{opacity:1;color:var(--link)}',
    // dock preferiti (stessa estetica del dock dati)
    '#dn-fav{position:fixed;top:110px;right:16px;z-index:100}',
    '#dn-fav-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-fav-btn:hover,#dn-fav-btn.has-fav{border-color:var(--link);color:var(--link)}',
    '.dn-fav-list{position:absolute;top:48px;right:0;min-width:240px;max-width:320px;max-height:60vh;overflow:auto;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.20);padding:.4rem;display:none}',
    '.dn-fav-list.open{display:block}',
    '.dn-fav-list .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.35rem .6rem}',
    '.dn-fav-list .dn-empty{padding:.5rem .6rem;opacity:.6;font-size:.86rem}',
    '.dn-fav-row{display:flex;align-items:center;gap:.4rem;border-radius:8px}',
    '.dn-fav-row:hover{background:rgba(127,127,127,.14)}',
    '.dn-fav-row a{flex:1 1 auto;padding:.5rem .6rem;color:var(--text);text-decoration:none;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.dn-fav-del{flex:0 0 auto;border:0;background:transparent;color:inherit;opacity:.5;cursor:pointer;padding:.35rem .5rem;border-radius:8px;line-height:0}',
    '.dn-fav-del:hover{opacity:1;color:var(--link)}'
  ].join('');
  var el = document.createElement('style');
  el.id = 'dn-reading-styles';
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
})();

// Icone (Lucide-style) per le feature di lettura.
var DN_ICON = {
  check: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  circle: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>',
  starOut: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  starFull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
};
// Pagine non-capitolo (cover/indice) escluse da progresso e preferiti.
var DN_SKIP = { '/': 1, '/README': 1, '/_coverpage': 1, '': 1 };
// "#/docs/x?id=y" → "/docs/x"
function dnPathOf(href) {
  if (!href) return '';
  var h = href.indexOf('#'); if (h >= 0) href = href.slice(h + 1);
  href = href.split('?')[0];
  if (href.length > 1 && href.charAt(href.length - 1) === '/') href = href.slice(0, -1);
  return href;
}
function dnEscHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// "Progresso di studio": segna i capitoli come letti (persistito via NotesStore),
// mostra ✓ nella sidebar e una barra "X/N" in cima alla navigazione, con un
// bottone "Segna come letto" a fine capitolo. Robusto: salva i path, non citazioni.
function studyProgressPlugin(hook, vm) {
  function getRead() { return window.NotesStore.read('read', []); }
  function isRead(p) { return getRead().indexOf(p) >= 0; }
  function toggle(p) {
    var arr = getRead(), i = arr.indexOf(p);
    if (i >= 0) arr.splice(i, 1); else arr.push(p);
    window.NotesStore.write('read', arr);
  }
  function decorate() {
    var read = getRead();
    var links = [].slice.call(document.querySelectorAll('.sidebar-nav a, .sidebar a'));
    var total = 0, done = 0;
    links.forEach(function (a) {
      var p = dnPathOf(a.getAttribute('href'));
      if (!p || DN_SKIP[p]) return;
      total++;
      var r = read.indexOf(p) >= 0;
      if (r) done++;
      a.classList.toggle('dn-read', r);
    });
    updateMeter(done, total);
  }
  function updateMeter(done, total) {
    var nav = document.querySelector('.sidebar-nav') || document.querySelector('.sidebar');
    if (!nav) return;
    var m = document.getElementById('dn-progress');
    if (!m) {
      m = document.createElement('div');
      m.id = 'dn-progress';
      m.innerHTML = '<div class="dn-progress-label"><span class="dn-progress-text"></span><span class="dn-progress-pct"></span></div><div class="dn-progress-bar"><span></span></div>';
      nav.insertBefore(m, nav.firstChild);
    }
    var pct = total ? Math.round(done / total * 100) : 0;
    var txt = done + '/' + total + ' letti';
    var t = m.querySelector('.dn-progress-text'); if (t.textContent !== txt) t.textContent = txt;
    var pc = m.querySelector('.dn-progress-pct'); var ps = pct + '%'; if (pc.textContent !== ps) pc.textContent = ps;
    m.querySelector('.dn-progress-bar span').style.width = pct + '%';
    m.style.display = total ? '' : 'none';
  }
  function addToggle(path) {
    var sec = document.querySelector('.markdown-section');
    if (!sec) return;
    var old = sec.querySelector('.dn-read-toggle'); if (old) old.remove();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dn-read-toggle';
    function sync() {
      var r = isRead(path);
      b.classList.toggle('is-read', r);
      b.innerHTML = (r ? DN_ICON.check : DN_ICON.circle) + '<span>' + (r ? 'Letto' : 'Segna come letto') + '</span>';
    }
    sync();
    b.addEventListener('click', function () { toggle(path); sync(); decorate(); });
    sec.appendChild(b);
  }
  hook.doneEach(function () {
    var path = (vm.route && vm.route.path) || '';
    decorate();
    if (path && !DN_SKIP[path]) addToggle(path);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'read' || e.detail.name === '*')) decorate();
  });
}

// "Preferiti": stella accanto al titolo del capitolo + dock fisso con l'elenco
// (click per navigare, ✕ per rimuovere). Persistito via NotesStore (path + titolo).
function bookmarksPlugin(hook, vm) {
  function get() { return window.NotesStore.read('favorites', []); }
  function idx(p) { var a = get(), r = -1; a.forEach(function (x, i) { if (x.path === p) r = i; }); return r; }
  function toggle(p, title) { var a = get(), i = idx(p); if (i >= 0) a.splice(i, 1); else a.push({ path: p, title: title }); window.NotesStore.write('favorites', a); }
  function remove(p) { var a = get(), i = idx(p); if (i >= 0) { a.splice(i, 1); window.NotesStore.write('favorites', a); } }

  function ensureDock() {
    if (document.getElementById('dn-fav')) return;
    var w = document.createElement('div');
    w.id = 'dn-fav';
    w.innerHTML = '<button id="dn-fav-btn" type="button" title="Preferiti" aria-label="Preferiti" aria-expanded="false">' + DN_ICON.starOut + '</button><div class="dn-fav-list" role="menu"></div>';
    document.body.appendChild(w);
    var btn = w.querySelector('#dn-fav-btn'), list = w.querySelector('.dn-fav-list');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) renderList();
    });
    document.addEventListener('click', function (e) { if (!w.contains(e.target)) list.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') list.classList.remove('open'); });
  }
  function renderList() {
    var list = document.querySelector('#dn-fav .dn-fav-list'); if (!list) return;
    var favs = get(), html = '<div class="dn-title">Preferiti</div>';
    if (!favs.length) html += '<div class="dn-empty">Nessun preferito. Usa la ☆ accanto al titolo del capitolo.</div>';
    else favs.forEach(function (f) {
      html += '<div class="dn-fav-row"><a href="#' + dnEscHtml(f.path) + '">' + dnEscHtml(f.title || f.path) + '</a>' +
              '<button class="dn-fav-del" type="button" data-path="' + dnEscHtml(f.path) + '" title="Rimuovi" aria-label="Rimuovi">' + DN_ICON.x + '</button></div>';
    });
    list.innerHTML = html;
    [].forEach.call(list.querySelectorAll('.dn-fav-del'), function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        remove(b.getAttribute('data-path')); renderList(); refreshBtn();
      });
    });
  }
  function refreshBtn() { var b = document.getElementById('dn-fav-btn'); if (b) b.classList.toggle('has-fav', get().length > 0); }
  function addStar(path) {
    var h1 = document.querySelector('.markdown-section h1'); if (!h1 || h1.querySelector('.dn-star')) return;
    var title = (h1.textContent || '').trim();
    var s = document.createElement('button');
    s.type = 'button'; s.className = 'dn-star';
    s.title = 'Aggiungi ai preferiti'; s.setAttribute('aria-label', 'Aggiungi ai preferiti');
    function sync() { var f = idx(path) >= 0; s.classList.toggle('is-fav', f); s.innerHTML = f ? DN_ICON.starFull : DN_ICON.starOut; }
    sync();
    s.addEventListener('click', function () { toggle(path, title); sync(); renderList(); refreshBtn(); });
    h1.appendChild(s);
  }
  hook.mounted(function () { ensureDock(); refreshBtn(); });
  hook.doneEach(function () {
    ensureDock(); refreshBtn();
    var path = (vm.route && vm.route.path) || '';
    if (path && !DN_SKIP[path]) addStar(path);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'favorites' || e.detail.name === '*')) {
      refreshBtn();
      if (document.querySelector('#dn-fav .dn-fav-list.open')) renderList();
    }
  });
}

// ── Evidenziatore (modalità pennarello, stile macOS Preview) ──────────────────
// Scegli un colore UNA volta: poi ogni selezione di testo si evidenzia in quel
// colore finché non cambi colore, passi alla gomma o esci (Esc). Rendering con
// CSS Custom Highlight API (nessuna mutazione del DOM → non rompe copy-code né i
// re-render). Persistenza robusta: ogni evidenziazione è {colore, heading, quote,
// testo-prima, testo-dopo}, ri-localizzata a ogni render (modello W3C
// TextQuoteSelector); se il testo esatto viene editato l'evidenziazione diventa
// orfana — conservata, non persa né crash. Storage cancellato → Esporta/Importa.
var DN_COLORS = [
  { k: 'yellow', label: 'Giallo',  bg: 'rgba(255,214,0,.45)' },
  { k: 'green',  label: 'Verde',   bg: 'rgba(52,199,89,.42)' },
  { k: 'blue',   label: 'Azzurro', bg: 'rgba(10,132,255,.38)' },
  { k: 'pink',   label: 'Rosa',    bg: 'rgba(255,55,120,.38)' },
  { k: 'purple', label: 'Viola',   bg: 'rgba(175,82,222,.40)' },
  { k: 'orange', label: 'Arancio', bg: 'rgba(255,149,0,.45)' },
  { k: 'accent', label: 'Tinta del vault', bg: 'color-mix(in srgb, var(--link) 42%, transparent)' }
];
var DN_PEN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>';
var DN_ERASER = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';

var dnMode = 'off';   // 'off' | 'color' | 'erase'
var dnColor = 'yellow';
var dnHL = null;      // { colorKey: Highlight }
var dnRendered = [];  // [{range, item}] della pagina corrente (per la gomma)
var dnInited = false;

function dnSupported() { return !!(window.CSS && CSS.highlights && window.Highlight); }
function dnPath() { return window.__dnPath || ''; }

// Indice piatto dei text node del contenuto (escludendo la UI iniettata) per
// mappare offset globali ⇄ Range.
function dnTextIndex(root) {
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      var p = n.parentNode;
      if (p && p.closest && p.closest('.dn-read-toggle,.dn-star,button,#dn-progress,.dn-fav-list')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [], text = '', n;
  while ((n = walker.nextNode())) { nodes.push({ node: n, start: text.length, len: n.nodeValue.length }); text += n.nodeValue; }
  return { text: text, nodes: nodes };
}
function dnGlobalOffset(index, node, off) {
  for (var i = 0; i < index.nodes.length; i++) if (index.nodes[i].node === node) return index.nodes[i].start + off;
  return -1;
}
function dnRangeAt(index, gStart, gEnd) {
  var r = document.createRange(), set = 0;
  for (var i = 0; i < index.nodes.length; i++) {
    var e = index.nodes[i], s = e.start, en = e.start + e.len;
    if (set === 0 && gStart >= s && gStart <= en) { r.setStart(e.node, gStart - s); set = 1; }
    if (set === 1 && gEnd >= s && gEnd <= en) { r.setEnd(e.node, gEnd - s); return r; }
  }
  return null;
}
function dnLocate(index, hl) {
  var needle = (hl.pre || '') + hl.q + (hl.suf || '');
  var at = index.text.indexOf(needle);
  if (at >= 0) { var qs = at + (hl.pre || '').length; return dnRangeAt(index, qs, qs + hl.q.length); }
  at = index.text.indexOf(hl.q);                       // fallback: solo il quote
  return at >= 0 ? dnRangeAt(index, at, at + hl.q.length) : null;
}
function dnScopeFor(node) {
  var sec = document.querySelector('.markdown-section'); if (!sec) return '';
  var hs = [].slice.call(sec.querySelectorAll('h1[id],h2[id],h3[id],h4[id]'));
  var el = node.nodeType === 1 ? node : node.parentNode, best = '';
  for (var i = 0; i < hs.length; i++) {
    if (hs[i].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = hs[i].id; else break;
  }
  return best;
}
function dnRender(path) {
  if (!dnSupported() || !dnHL) return;
  dnRendered = [];
  Object.keys(dnHL).forEach(function (c) { dnHL[c].clear(); });
  var sec = document.querySelector('.markdown-section'); if (!sec) return;
  var list = (window.NotesStore.read('highlights', {})[path]) || [];
  if (!list.length) return;
  var index = dnTextIndex(sec);
  list.forEach(function (hl) {
    var range = dnLocate(index, hl); if (!range) return;   // orfana: si conserva, si salta
    var c = dnHL[hl.c] ? hl.c : 'yellow';
    dnHL[c].add(range);
    dnRendered.push({ range: range, item: hl });
  });
}
function dnCapture(color) {
  var sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  var range = sel.getRangeAt(0);
  var sec = document.querySelector('.markdown-section');
  if (!sec || !sec.contains(range.startContainer) || !sec.contains(range.endContainer)) return;
  var quote = sel.toString(); if (!quote.trim()) return;
  var index = dnTextIndex(sec);
  var gs = dnGlobalOffset(index, range.startContainer, range.startOffset);
  var ge = dnGlobalOffset(index, range.endContainer, range.endOffset);
  if (gs < 0 || ge < 0 || ge <= gs) return;
  var item = { c: color, scope: dnScopeFor(range.startContainer), q: quote,
               pre: index.text.slice(Math.max(0, gs - 32), gs), suf: index.text.slice(ge, ge + 32) };
  var all = window.NotesStore.read('highlights', {}), p = dnPath();
  (all[p] = all[p] || []).push(item);
  window.NotesStore.write('highlights', all);
  sel.removeAllRanges();
  dnRender(p);
}
function dnEraseAt(x, y) {
  for (var i = 0; i < dnRendered.length; i++) {
    var rects = dnRendered[i].range.getClientRects();
    for (var j = 0; j < rects.length; j++) {
      var r = rects[j];
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        var it = dnRendered[i].item, all = window.NotesStore.read('highlights', {}), p = dnPath(), list = all[p] || [];
        for (var k = 0; k < list.length; k++) {
          if (list[k].q === it.q && list[k].pre === it.pre && list[k].suf === it.suf && list[k].c === it.c) { list.splice(k, 1); break; }
        }
        all[p] = list; window.NotesStore.write('highlights', all);
        dnRender(p); return true;
      }
    }
  }
  return false;
}
function dnSetMode(mode, color) {
  dnMode = mode;
  if (color) dnColor = color;
  document.body.classList.toggle('dn-hl-mode', mode === 'color');
  document.body.classList.toggle('dn-hl-erase', mode === 'erase');
  var btn = document.getElementById('dn-hl-btn');
  if (btn) btn.classList.toggle('is-on', mode !== 'off');
  var pop = document.querySelector('.dn-hl-pop');
  if (pop) {
    [].forEach.call(pop.querySelectorAll('.dn-swatch'), function (s) { s.classList.toggle('active', mode === 'color' && s.getAttribute('data-c') === dnColor); });
    var er = pop.querySelector('[data-act=erase]'); if (er) er.classList.toggle('active', mode === 'erase');
  }
}
function dnInit() {
  if (dnInited || !dnSupported()) return;
  dnInited = true;
  var rules = [
    '#dn-hl{position:fixed;top:158px;right:16px;z-index:100}',
    '#dn-hl-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-hl-btn:hover{border-color:var(--link);color:var(--link)}',
    '#dn-hl-btn.is-on{border-color:var(--link)}',
    '.dn-hl-pop{position:absolute;top:48px;right:0;width:214px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.2);padding:.55rem;display:none}',
    '.dn-hl-pop.open{display:block}',
    '.dn-hl-pop .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.1rem .25rem .45rem}',
    '.dn-swatches{display:grid;grid-template-columns:repeat(7,1fr);gap:.28rem}',
    '.dn-swatch{height:26px;border-radius:6px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px rgba(127,127,127,.25)}',
    '.dn-swatch:hover{transform:scale(1.08)}',
    '.dn-swatch.active{border-color:var(--text)}',
    '.dn-hl-actions{display:flex;gap:.4rem;margin-top:.55rem}',
    '.dn-hl-actions button{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.45rem;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);font:inherit;font-size:.82rem;cursor:pointer}',
    '.dn-hl-actions button:hover{border-color:var(--link)}',
    '.dn-hl-actions button.active{border-color:var(--link);color:var(--link)}',
    '.dn-hl-hint{font-size:.72rem;opacity:.6;margin-top:.5rem;padding:0 .25rem;line-height:1.4}',
    'body.dn-hl-mode .markdown-section,body.dn-hl-mode .markdown-section *{cursor:text}',
    'body.dn-hl-erase .markdown-section,body.dn-hl-erase .markdown-section *{cursor:crosshair}'
  ];
  DN_COLORS.forEach(function (c) { rules.push('::highlight(dn-hl-' + c.k + '){background-color:' + c.bg + '}'); });
  var st = document.createElement('style'); st.id = 'dn-hl-styles'; st.textContent = rules.join('');
  (document.head || document.documentElement).appendChild(st);

  dnHL = {};
  DN_COLORS.forEach(function (c) { var h = new Highlight(); dnHL[c.k] = h; CSS.highlights.set('dn-hl-' + c.k, h); });

  document.addEventListener('mouseup', function () { if (dnMode === 'color') setTimeout(function () { dnCapture(dnColor); }, 0); });
  document.addEventListener('click', function (e) {
    if (dnMode !== 'erase') return;
    if (e.target.closest && e.target.closest('.markdown-section')) dnEraseAt(e.clientX, e.clientY);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dnMode !== 'off') dnSetMode('off'); });
}
function dnBuildToolbar() {
  dnInit();
  if (!dnSupported() || document.getElementById('dn-hl')) return;
  var sw = '';
  DN_COLORS.forEach(function (c) { sw += '<button class="dn-swatch" type="button" data-c="' + c.k + '" title="' + c.label + '" aria-label="' + c.label + '" style="background:' + c.bg + '"></button>'; });
  var w = document.createElement('div'); w.id = 'dn-hl';
  w.innerHTML =
    '<button id="dn-hl-btn" type="button" title="Evidenziatore" aria-label="Evidenziatore" aria-expanded="false">' + DN_PEN + '</button>' +
    '<div class="dn-hl-pop" role="menu"><div class="dn-title">Evidenziatore</div>' +
      '<div class="dn-swatches">' + sw + '</div>' +
      '<div class="dn-hl-actions"><button type="button" data-act="erase">' + DN_ERASER + 'Gomma</button><button type="button" data-act="off">Chiudi</button></div>' +
      '<div class="dn-hl-hint">Scegli un colore, poi seleziona il testo. Gomma → clic per rimuovere.</div>' +
    '</div>';
  document.body.appendChild(w);
  var btn = w.querySelector('#dn-hl-btn'), pop = w.querySelector('.dn-hl-pop');
  btn.addEventListener('click', function (e) { e.stopPropagation(); var o = pop.classList.toggle('open'); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  document.addEventListener('click', function (e) { if (!w.contains(e.target)) pop.classList.remove('open'); });
  pop.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.dn-swatch');
    if (s) { dnSetMode('color', s.getAttribute('data-c')); return; }
    var a = e.target.closest && e.target.closest('[data-act]');
    if (a) dnSetMode(a.getAttribute('data-act') === 'erase' ? 'erase' : 'off');
  });
}
// Plugin: costruisce la toolbar (una volta) e ri-applica le evidenziazioni a ogni pagina.
function highlighterPlugin(hook, vm) {
  hook.mounted(function () { dnBuildToolbar(); });
  hook.doneEach(function () {
    window.__dnPath = (vm.route && vm.route.path) || '';
    dnRender(window.__dnPath);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'highlights' || e.detail.name === '*')) dnRender(window.__dnPath || '');
  });
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
