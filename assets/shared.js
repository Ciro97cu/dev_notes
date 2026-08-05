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
  // Chiavi vietate: evitano il prototype pollution in fase di merge di dati importati.
  function unsafeKey(k) { return k === '__proto__' || k === 'constructor' || k === 'prototype'; }
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
      val = cur;
      Object.keys(incoming).forEach(function (kk) { if (!unsafeKey(kk)) val[kk] = incoming[kk]; });  // oggetto → shallow-merge
    }
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  // Importa SOLO chiavi `dev-notes-*` (niente scritture arbitrarie), validando i tipi.
  function importObj(obj, mode) {           // mode: 'merge' | 'replace'
    if (!obj || typeof obj !== 'object' || !obj.data || typeof obj.data !== 'object') throw new Error('file non valido');
    Object.keys(obj.data).forEach(function (key) {
      if (typeof key !== 'string' || key.indexOf(PREFIX) !== 0 || unsafeKey(key)) return;
      if (mode === 'merge') mergeInto(key, obj.data[key]);
      else { try { localStorage.setItem(key, JSON.stringify(obj.data[key])); } catch (e) {} }
    });
  }
  function importFile(file, mode, done) {
    if (!file) { done && done(new Error('nessun file')); return; }
    if (file.size > 8 * 1024 * 1024) { done && done(new Error('file troppo grande (max 8 MB)')); return; }
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

// Chiude i popover dei pulsanti fissi (dati/preferiti/evidenziatore) tranne `keep`,
// così aprendone uno gli altri non restano aperti in sovrapposizione.
function dnCloseAllPops(keep) {
  [['.dn-pop', '#dn-data-btn'], ['.dn-fav-list', '#dn-fav-btn'], ['.dn-hl-pop', '#dn-hl-btn']].forEach(function (pair) {
    var pop = document.querySelector(pair[0]);
    if (pop && pop !== keep && pop.classList.contains('open')) {
      pop.classList.remove('open');
      var b = document.querySelector(pair[1]); if (b) b.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Dock "Dati": Esporta / Importa il file dei progressi ──────────────────────
// Pulsante fisso (sotto il toggle tema) che apre un popover. È UI globale, quindi
// vive in un IIFE su DOMContentLoaded (non serve registrarlo come plugin docsify).
(function () {
  var css = [
    // speed-dial "Strumenti": raggruppa i tool sotto un unico bottone (il tema resta a parte)
    '#dn-tools{position:fixed;top:62px;right:16px;z-index:101}',
    '#dn-tools-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-data{position:fixed;top:110px;right:16px;z-index:100}',
    '#dn-data-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-data-btn:hover{border-color:var(--link);color:var(--link)}',
    // i tool restano nascosti finché non si apre lo speed-dial
    '#dn-data,#dn-fav,#dn-hl{opacity:0;pointer-events:none;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease}',
    'body.dn-tools-open #dn-data,body.dn-tools-open #dn-fav,body.dn-tools-open #dn-hl{opacity:1;pointer-events:auto;transform:none}',
    // hover uniforme di tutti i pulsanti fissi (icona che cambia colore, niente fondo pieno) + micro-zoom
    '#dn-data-btn,#dn-fav-btn,#dn-hl-btn,#dn-tools-btn{transition:transform .15s ease,color .2s ease,border-color .2s ease}',
    '#dn-data-btn:hover,#dn-fav-btn:hover,#dn-hl-btn:hover,#dn-tools-btn:hover{transform:scale(1.08)}',
    '#dn-tools-btn:hover{border-color:var(--link);color:var(--link)}',
    // i pannelli si aprono a SINISTRA del bottone, così non finiscono dietro gli altri
    '.dn-pop{position:absolute;top:0;right:48px;min-width:210px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.20);padding:.4rem;display:none}',
    '.dn-pop.open{display:block}',
    '.dn-pop .dn-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;opacity:.6;padding:.35rem .6rem .2rem}',
    '.dn-pop button{display:flex;gap:.55rem;align-items:center;width:100%;padding:.5rem .6rem;border:0;background:transparent;color:var(--text);font:inherit;font-size:.9rem;cursor:pointer;border-radius:8px;text-align:left}',
    '.dn-pop button:hover{background:rgba(127,127,127,.14)}',
    '.dn-pop button svg{flex:0 0 auto;opacity:.8}',
    '.dn-pop .dn-note{font-size:.74rem;line-height:1.45;opacity:.7;padding:.4rem .6rem .3rem;border-top:1px solid var(--border);margin-top:.3rem}',
    // il toggle tema usa un\'icona SVG come gli altri: centrala
    '#theme-toggle{display:flex;align-items:center;justify-content:center}',
    '#theme-toggle svg{display:block}',
    // i pulsanti fissi in basso a destra (home/menu/playground) erano bianchi fissi:
    // li rendo theme-aware come quelli in alto, così cambiano col tema
    'a[aria-label="Torna a Dev Notes"],.sidebar-toggle,#pg-toggle,#ng-play{background:var(--bg-soft) !important;color:var(--text) !important;border-color:var(--border) !important}',
    '.sidebar-toggle span{background-color:var(--text) !important}',
    // hover: icona/bordo in accento (!important perché la base qui sopra è !important e vincerebbe)
    'a[aria-label="Torna a Dev Notes"]:hover,.sidebar-toggle:hover,#pg-toggle:hover,#ng-play:hover{color:var(--link) !important;border-color:var(--link) !important}',
    '.sidebar-toggle:hover span{background-color:var(--link) !important}'
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
        '<div class="dn-note">Progresso, preferiti ed evidenziazioni restano in questo browser. <strong>Esporta</strong> per salvarli in un file (da conservare o spostare su un altro dispositivo); <strong>Importa</strong> per ripristinarli.</div>' +
      '</div>' +
      '<input type="file" accept="application/json,.json" hidden>';
    document.body.appendChild(wrap);

    var btn = wrap.querySelector('#dn-data-btn');
    var pop = wrap.querySelector('.dn-pop');
    var file = wrap.querySelector('input[type=file]');
    function close() { pop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !pop.classList.contains('open');
      dnCloseAllPops(pop);                       // chiudi gli altri popover
      pop.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
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

// ── Speed-dial "Strumenti": un unico bottone (sotto il tema) che apre/chiude i
// tool raggruppati (dati, preferiti, evidenziatore). Il tema resta separato.
(function () {
  var TOOLS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
  var CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  function build() {
    if (document.getElementById('dn-tools')) return;
    var wrap = document.createElement('div');
    wrap.id = 'dn-tools';
    wrap.innerHTML = '<button id="dn-tools-btn" type="button" title="Strumenti" aria-label="Strumenti" aria-expanded="false">' + TOOLS + '</button>';
    document.body.appendChild(wrap);
    var btn = wrap.querySelector('#dn-tools-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = document.body.classList.toggle('dn-tools-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.innerHTML = open ? CLOSE : TOOLS;
      btn.title = open ? 'Chiudi strumenti' : 'Strumenti';
      if (!open) dnCloseAllPops(null);   // chiudendo il gruppo, chiudi anche i pannelli aperti
    });
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();

// ── Navigazione da tastiera ───────────────────────────────────────────────────
// ←/→ capitolo precedente/successivo · «/» ricerca · «t» tema · «?» aiuto · Esc chiude.
// Gli shortcut a lettera/freccia sono ignorati mentre si scrive in un campo.
(function () {
  var css = [
    '#dn-keyhelp{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45)}',
    '#dn-keyhelp.open{display:flex}',
    '#dn-keyhelp .box{background:var(--bg-soft);color:var(--text);border:1px solid var(--border);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.4);padding:1rem 1.2rem;min-width:260px;max-width:90vw}',
    '#dn-keyhelp h3{margin:0 0 .7rem;font-size:1rem}',
    '#dn-keyhelp dl{display:grid;grid-template-columns:auto 1fr;gap:.45rem .9rem;margin:0;font-size:.9rem;align-items:center}',
    '#dn-keyhelp dt{white-space:nowrap}',
    '#dn-keyhelp dd{margin:0;opacity:.85}',
    '#dn-keyhelp kbd{font-family:var(--font-mono,ui-monospace,monospace);background:rgba(127,127,127,.16);border:1px solid var(--border);border-radius:6px;padding:.08em .5em;font-size:.85em}'
  ].join('');
  var st = document.createElement('style'); st.id = 'dn-keyhelp-styles'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  function help() {
    var h = document.getElementById('dn-keyhelp');
    if (h) return h;
    h = document.createElement('div');
    h.id = 'dn-keyhelp';
    h.innerHTML = '<div class="box"><h3>Scorciatoie da tastiera</h3><dl>' +
      '<dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Capitolo precedente / successivo</dd>' +
      '<dt><kbd>/</kbd></dt><dd>Cerca</dd>' +
      '<dt><kbd>t</kbd></dt><dd>Tema chiaro / scuro</dd>' +
      '<dt><kbd>?</kbd></dt><dd>Mostra questo aiuto</dd>' +
      '<dt><kbd>Esc</kbd></dt><dd>Chiudi</dd>' +
      '</dl></div>';
    h.addEventListener('click', function (e) { if (e.target === h) h.classList.remove('open'); });
    (document.body || document.documentElement).appendChild(h);
    return h;
  }
  function typing() {
    var a = document.activeElement; if (!a) return false;
    var t = a.tagName; return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || a.isContentEditable;
  }
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '?') { e.preventDefault(); help().classList.toggle('open'); return; }
    if (e.key === 'Escape') { var h = document.getElementById('dn-keyhelp'); if (h && h.classList.contains('open')) { h.classList.remove('open'); return; } }
    if (e.key === '/') {
      if (typing()) return;
      e.preventDefault();
      dnSearchOpen();               // ricerca avanzata (overlay con toggle)
      return;
    }
    if (typing()) return;
    if (e.key === 'ArrowLeft') { var p = document.querySelector('.pagination-item--previous a'); if (p) { e.preventDefault(); p.click(); } }
    else if (e.key === 'ArrowRight') { var n = document.querySelector('.pagination-item--next a'); if (n) { e.preventDefault(); n.click(); } }
    else if (e.key === 't' || e.key === 'T') { var tt = document.getElementById('theme-toggle'); if (tt) { e.preventDefault(); tt.click(); } }
  });
})();

// ── Ricerca avanzata (stile VS Code: match case · parola intera · regex) ──────
// Riusa l'indice full-text che docsify costruisce in localStorage
// (`docsify.search.index` = { [path]: { [headingId]: {slug,title,body} } }) e ci
// mette sopra un matcher configurabile. Overlay aperto con «/» o cliccando la
// casella di ricerca della sidebar; il dropdown fuzzy di docsify è nascosto.
var dnSearchState = { case: false, word: false, regex: false };

function dnSearchReadIndex() {
  // I vault condividono l'origine → localStorage condiviso e docsify namespacizza
  // l'indice per path: possono esistere più chiavi `docsify.search.index*`, una
  // per vault. Si sceglie quella del vault CORRENTE = l'indice che contiene la
  // pagina attuale (fallback: l'ultima trovata).
  var vault = window.__VAULT || '';
  var curPath = (location.hash || '').replace(/^#/, '').split('?')[0] || '/';
  var candidates = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (!k || k.indexOf('docsify.search.index') !== 0) continue;
    var obj; try { obj = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
    if (obj && typeof obj === 'object') candidates.push({ k: k, o: obj });
  }
  if (!candidates.length) return [];
  var chosen = null;
  // 1) chiave namespacizzata col vault corrente (deterministico)
  if (vault) candidates.forEach(function (c) { if (c.k.indexOf('dev-notes-' + vault) >= 0) chosen = c.o; });
  // 2) altrimenti l'indice che contiene la pagina attuale
  if (!chosen) candidates.forEach(function (c) { if (c.o[curPath]) chosen = c.o; });
  // 3) fallback
  if (!chosen) chosen = candidates[candidates.length - 1].o;
  var out = [];
  Object.keys(chosen).forEach(function (path) {
    var secs = chosen[path]; if (!secs || typeof secs !== 'object') return;
    Object.keys(secs).forEach(function (hid) {
      var s = secs[hid];
      if (s && s.slug) out.push({ slug: s.slug, title: s.title || '', body: s.body || '', path: path });
    });
  });
  return out;
}
function dnSearchRe(q) {
  var pat = dnSearchState.regex ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (dnSearchState.word) { var L = '[A-Za-z0-9_À-ÿ]'; pat = '(?<!' + L + ')(?:' + pat + ')(?!' + L + ')'; }
  return new RegExp(pat, 'g' + (dnSearchState.case ? '' : 'i'));
}
function dnSearchCount(text, re) { re.lastIndex = 0; var n = 0, m; while ((m = re.exec(text))) { n++; if (m.index === re.lastIndex) re.lastIndex++; if (n > 999) break; } return n; }
function dnSearchSnippet(text, re) {
  re.lastIndex = 0; var m = re.exec(text); if (!m) return '';
  var i = m.index, start = Math.max(0, i - 55), end = Math.min(text.length, i + m[0].length + 90);
  var slice = text.slice(start, end), out = '', last = 0, mm; re.lastIndex = 0;
  while ((mm = re.exec(slice))) {
    out += dnEscHtml(slice.slice(last, mm.index)) + '<mark>' + dnEscHtml(mm[0]) + '</mark>';
    last = mm.index + mm[0].length; if (mm.index === re.lastIndex) re.lastIndex++;
  }
  out += dnEscHtml(slice.slice(last));
  return (start > 0 ? '… ' : '') + out + (end < text.length ? ' …' : '');
}
function dnSearchRun() {
  var box = document.getElementById('dn-search'); if (!box) return;
  var q = box.querySelector('.dn-s-input').value.trim();
  var res = box.querySelector('.dn-s-results');
  if (!q) { res.innerHTML = '<div class="dn-s-empty">Digita per cercare in questo vault.</div>'; return; }
  var re; try { re = dnSearchRe(q); } catch (e) { res.innerHTML = '<div class="dn-s-empty">Espressione regolare non valida.</div>'; return; }
  var idx = dnSearchReadIndex();
  if (!idx.length) { res.innerHTML = '<div class="dn-s-empty">Indice non ancora pronto: apri qualche pagina e riprova.</div>'; return; }
  var hits = [];
  idx.forEach(function (s) {
    var ct = dnSearchCount(s.title, new RegExp(re.source, re.flags));
    var cb = dnSearchCount(s.body, new RegExp(re.source, re.flags));
    if (ct + cb === 0) return;
    hits.push({ s: s, score: ct * 8 + cb });
  });
  if (!hits.length) { res.innerHTML = '<div class="dn-s-empty">Nessun risultato per «' + dnEscHtml(q) + '».</div>'; return; }
  hits.sort(function (a, b) { return b.score - a.score; });
  var html = '';
  hits.slice(0, 60).forEach(function (h, ix) {
    var snip = dnSearchSnippet(h.s.body || h.s.title, new RegExp(re.source, re.flags));
    var page = h.s.path.split('/').filter(Boolean).pop() || h.s.path;
    var slug = h.s.slug.charAt(0) === '#' ? h.s.slug : '#' + h.s.slug;   // assicura la rotta hash
    html += '<a class="dn-s-item' + (ix === 0 ? ' sel' : '') + '" href="' + dnEscHtml(slug) + '">' +
      '<span class="dn-s-title">' + dnEscHtml(h.s.title || '(senza titolo)') + '<span class="dn-s-path">' + dnEscHtml(page) + '</span></span>' +
      (snip ? '<div class="dn-s-snip">' + snip + '</div>' : '') + '</a>';
  });
  res.innerHTML = html;
}
function dnSearchClose() { var b = document.getElementById('dn-search'); if (b) b.classList.remove('open'); }
function dnSearchOpen() {
  var box = dnSearchBuild();
  box.classList.add('open');
  var inp = box.querySelector('.dn-s-input');
  inp.focus(); inp.select();
  dnSearchRun();
}
function dnSearchBuild() {
  var box = document.getElementById('dn-search');
  if (box) return box;
  box = document.createElement('div');
  box.id = 'dn-search';
  box.innerHTML = '<div class="dn-s-box" role="dialog" aria-label="Ricerca">' +
    '<div class="dn-s-top">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:.55;flex:0 0 auto"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input class="dn-s-input" type="text" placeholder="Cerca nel vault…" autocomplete="off" spellcheck="false" aria-label="Cerca">' +
      '<div class="dn-s-toggles">' +
        '<button class="dn-s-tog" type="button" data-t="case" title="Maiuscole/minuscole" aria-pressed="false">Aa</button>' +
        '<button class="dn-s-tog" type="button" data-t="word" title="Parola intera" aria-pressed="false">W</button>' +
        '<button class="dn-s-tog" type="button" data-t="regex" title="Espressione regolare" aria-pressed="false">.*</button>' +
      '</div>' +
    '</div>' +
    '<div class="dn-s-results"></div>' +
    '<div class="dn-s-hint">Invio: apri il primo risultato · ↑↓: scorri · Esc: chiudi</div>' +
  '</div>';
  document.body.appendChild(box);
  var inp = box.querySelector('.dn-s-input'), timer = null;
  inp.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(dnSearchRun, 110); });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var sel = box.querySelector('.dn-s-item.sel') || box.querySelector('.dn-s-item'); if (sel) sel.click(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var items = [].slice.call(box.querySelectorAll('.dn-s-item')); if (!items.length) return;
      e.preventDefault();
      var cur = box.querySelector('.dn-s-item.sel'), ci = items.indexOf(cur);
      if (cur) cur.classList.remove('sel');
      var ni = e.key === 'ArrowDown' ? (ci + 1) % items.length : (ci - 1 + items.length) % items.length;
      items[ni].classList.add('sel'); items[ni].scrollIntoView({ block: 'nearest' });
    }
  });
  box.querySelector('.dn-s-toggles').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dn-s-tog'); if (!b) return;
    var t = b.getAttribute('data-t'); dnSearchState[t] = !dnSearchState[t];
    b.classList.toggle('active', dnSearchState[t]); b.setAttribute('aria-pressed', dnSearchState[t] ? 'true' : 'false');
    dnSearchRun(); inp.focus();
  });
  box.querySelector('.dn-s-results').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.dn-s-item')) setTimeout(dnSearchClose, 0);
  });
  box.addEventListener('click', function (e) { if (e.target === box) dnSearchClose(); });
  return box;
}
// init: CSS + intercetta la casella di docsify (apre l'overlay) + nasconde il dropdown fuzzy
(function () {
  var css = [
    '#dn-search{position:fixed;inset:0;z-index:2147483500;display:none;justify-content:center;align-items:flex-start;background:rgba(0,0,0,.45)}',
    '#dn-search.open{display:flex}',
    '#dn-search .dn-s-box{margin-top:8vh;width:min(680px,92vw);max-height:80vh;display:flex;flex-direction:column;background:var(--bg-soft);color:var(--text);border:1px solid var(--border);border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.45);overflow:hidden}',
    '#dn-search .dn-s-top{display:flex;align-items:center;gap:.5rem;padding:.6rem .7rem;border-bottom:1px solid var(--border)}',
    '#dn-search .dn-s-input{flex:1;min-width:0;border:0;background:transparent;color:var(--text);font:inherit;font-size:1rem;outline:none}',
    '#dn-search .dn-s-toggles{display:flex;gap:.25rem;flex:0 0 auto}',
    '#dn-search .dn-s-tog{width:30px;height:28px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;font-size:.78rem;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:.7}',
    '#dn-search .dn-s-tog:hover{opacity:1;border-color:var(--link)}',
    '#dn-search .dn-s-tog.active{opacity:1;color:var(--link);border-color:var(--link);background:color-mix(in srgb,var(--link) 12%,transparent)}',
    '#dn-search .dn-s-results{overflow:auto;padding:.35rem}',
    '#dn-search .dn-s-item{display:block;padding:.5rem .6rem;border-radius:9px;text-decoration:none;color:inherit}',
    '#dn-search .dn-s-item:hover,#dn-search .dn-s-item.sel{background:rgba(127,127,127,.14)}',
    '#dn-search .dn-s-title{font-weight:650;font-size:.92rem}',
    '#dn-search .dn-s-path{font-size:.72rem;opacity:.5;margin-left:.45rem;font-weight:400}',
    '#dn-search .dn-s-snip{font-size:.82rem;opacity:.8;margin-top:.15rem;line-height:1.4}',
    '#dn-search .dn-s-snip mark{background:color-mix(in srgb,var(--link) 32%,transparent);color:inherit;border-radius:3px;padding:0 .1em}',
    '#dn-search .dn-s-empty{padding:1.1rem;opacity:.6;font-size:.9rem;text-align:center}',
    '#dn-search .dn-s-hint{padding:.4rem .7rem;border-top:1px solid var(--border);font-size:.72rem;opacity:.5}',
    '.search .results-panel{display:none !important}'   // via il dropdown fuzzy di docsify
  ].join('');
  var st = document.createElement('style'); st.id = 'dn-search-styles'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('.search input')) { t.blur(); dnSearchOpen(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dnSearchClose(); });
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
  // Icone SVG (Lucide) coerenti con gli altri pulsanti: sole quando è scuro (→ passa a chiaro), luna quando è chiaro.
  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
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
      btn.innerHTML = dark ? SUN : MOON;
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
    try { localStorage.setItem(KEY, JSON.stringify({ p: current, id: currentId(), t: Date.now() })); } catch (e) {}  // t: per il «Continua» globale sull'hub
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
    // stella preferiti sulle sotto-sezioni: discreta, compare all'hover del titolo (o se è preferita)
    '.dn-star{margin-left:.4rem;vertical-align:baseline;border:0;background:transparent;color:inherit;cursor:pointer;opacity:0;padding:0 .15em;line-height:0;transition:opacity .15s ease,color .15s ease}',
    '.dn-star svg{width:.82em;height:.82em;vertical-align:-.06em}',
    '.markdown-section h2:hover .dn-star,.markdown-section h3:hover .dn-star,.markdown-section h4:hover .dn-star,.dn-star:focus-visible,.dn-star.is-fav{opacity:1}',
    '.dn-star:hover,.dn-star.is-fav{color:var(--link)}',
    // dock preferiti (stessa estetica del dock dati)
    '#dn-fav{position:fixed;top:158px;right:16px;z-index:100}',
    '#dn-fav-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-fav-btn:hover,#dn-fav-btn.has-fav{border-color:var(--link);color:var(--link)}',
    '.dn-fav-list{position:absolute;top:0;right:48px;min-width:240px;max-width:320px;max-height:60vh;overflow:auto;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.20);padding:.4rem;display:none}',
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
  function getRead() { var v = window.NotesStore.read('read', []); return Array.isArray(v) ? v : []; }
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

// "Preferiti": stella su ogni SOTTO-SEZIONE (h2/h3/h4) del capitolo — segnalibrare
// il capitolo intero è poco utile — più un dock fisso con l'elenco (click per
// navigare alla sezione, ✕ per rimuovere). Persistito via NotesStore: {path, id, title}.
function bookmarksPlugin(hook, vm) {
  function get() { var v = window.NotesStore.read('favorites', []); return Array.isArray(v) ? v.filter(function (x) { return x && typeof x.path === 'string'; }) : []; }
  function eq(x, p, id) { return x.path === p && (x.id || '') === (id || ''); }
  function idx(p, id) { var a = get(), r = -1; a.forEach(function (x, i) { if (eq(x, p, id)) r = i; }); return r; }
  function toggle(p, id, title) { var a = get(), i = idx(p, id); if (i >= 0) a.splice(i, 1); else a.push({ path: p, id: id || '', title: title }); window.NotesStore.write('favorites', a); }
  function remove(p, id) { var a = get(), i = idx(p, id); if (i >= 0) { a.splice(i, 1); window.NotesStore.write('favorites', a); } }
  function href(f) { return '#' + f.path + (f.id ? '?id=' + f.id : ''); }

  function ensureDock() {
    if (document.getElementById('dn-fav')) return;
    var w = document.createElement('div');
    w.id = 'dn-fav';
    w.innerHTML = '<button id="dn-fav-btn" type="button" title="Preferiti" aria-label="Preferiti" aria-expanded="false">' + DN_ICON.starOut + '</button><div class="dn-fav-list" role="menu"></div>';
    document.body.appendChild(w);
    var btn = w.querySelector('#dn-fav-btn'), list = w.querySelector('.dn-fav-list');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !list.classList.contains('open');
      dnCloseAllPops(list);                     // chiudi gli altri popover
      list.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen) renderList();
    });
    document.addEventListener('click', function (e) { if (!w.contains(e.target)) list.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') list.classList.remove('open'); });
  }
  function renderList() {
    var list = document.querySelector('#dn-fav .dn-fav-list'); if (!list) return;
    var favs = get(), html = '<div class="dn-title">Preferiti</div>';
    if (!favs.length) html += '<div class="dn-empty">Nessun preferito. Usa la ☆ che compare accanto ai titoli delle sezioni.</div>';
    else favs.forEach(function (f) {
      html += '<div class="dn-fav-row"><a href="' + dnEscHtml(href(f)) + '">' + dnEscHtml(f.title || f.path) + '</a>' +
              '<button class="dn-fav-del" type="button" data-path="' + dnEscHtml(f.path) + '" data-id="' + dnEscHtml(f.id || '') + '" title="Rimuovi" aria-label="Rimuovi">' + DN_ICON.x + '</button></div>';
    });
    list.innerHTML = html;
    [].forEach.call(list.querySelectorAll('.dn-fav-del'), function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        remove(b.getAttribute('data-path'), b.getAttribute('data-id')); renderList(); refreshBtn(); syncStars();
      });
    });
  }
  function refreshBtn() { var b = document.getElementById('dn-fav-btn'); if (b) b.classList.toggle('has-fav', get().length > 0); }
  // una stella per ogni sotto-sezione (h2/h3/h4 con id); il capitolo intero (h1) no.
  function addStars(path) {
    var hs = document.querySelectorAll('.markdown-section h2[id], .markdown-section h3[id], .markdown-section h4[id]');
    [].forEach.call(hs, function (h) {
      if (h.querySelector('.dn-star')) return;
      var id = h.id || '', title = (h.textContent || '').trim();
      var s = document.createElement('button');
      s.type = 'button'; s.className = 'dn-star';
      s.title = 'Aggiungi ai preferiti'; s.setAttribute('aria-label', 'Aggiungi ai preferiti');
      s.setAttribute('data-id', id);
      s.innerHTML = idx(path, id) >= 0 ? DN_ICON.starFull : DN_ICON.starOut;
      s.classList.toggle('is-fav', idx(path, id) >= 0);
      s.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        toggle(path, id, title);
        var f = idx(path, id) >= 0;
        s.classList.toggle('is-fav', f); s.innerHTML = f ? DN_ICON.starFull : DN_ICON.starOut;
        renderList(); refreshBtn();
      });
      h.appendChild(s);
    });
  }
  function syncStars() {
    var path = (vm.route && vm.route.path) || '';
    [].forEach.call(document.querySelectorAll('.markdown-section .dn-star'), function (s) {
      var f = idx(path, s.getAttribute('data-id') || '') >= 0;
      s.classList.toggle('is-fav', f); s.innerHTML = f ? DN_ICON.starFull : DN_ICON.starOut;
    });
  }
  hook.mounted(function () { ensureDock(); refreshBtn(); });
  hook.doneEach(function () {
    ensureDock(); refreshBtn();
    var path = (vm.route && vm.route.path) || '';
    if (path && !DN_SKIP[path]) addStars(path);
  });
  document.addEventListener('notesstore:change', function (e) {
    if (e.detail && (e.detail.name === 'favorites' || e.detail.name === '*')) {
      refreshBtn(); syncStars();
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
  var store = window.NotesStore.read('highlights', {});
  if (!store || typeof store !== 'object') return;
  var list = store[path];
  if (!Array.isArray(list) || !list.length) return;
  var index = dnTextIndex(sec);
  list.forEach(function (hl) {
    if (!hl || typeof hl.q !== 'string' || !hl.q) return;  // voce malformata: ignora
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
  if (!all || typeof all !== 'object') all = {};
  if (!Array.isArray(all[p])) all[p] = [];
  all[p].push(item);
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
        var it = dnRendered[i].item, all = window.NotesStore.read('highlights', {}), p = dnPath();
        if (!all || typeof all !== 'object') all = {};
        var list = Array.isArray(all[p]) ? all[p] : [];
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
    '#dn-hl{position:fixed;top:206px;right:16px;z-index:100}',
    '#dn-hl-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '#dn-hl-btn:hover{border-color:var(--link);color:var(--link)}',
    '#dn-hl-btn.is-on{border-color:var(--link)}',
    '.dn-hl-pop{position:absolute;top:0;right:48px;width:214px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 34px rgba(0,0,0,.2);padding:.55rem;display:none}',
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
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var willOpen = !pop.classList.contains('open');
    dnCloseAllPops(pop);                        // chiudi gli altri popover
    pop.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });
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
