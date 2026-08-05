
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
    '.dn-pop .dn-sep{border:none;border-top:1px solid var(--border);margin:.3rem .3rem}',
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

  var ICON_DB  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>';
  var ICON_DL  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>';
  var ICON_UP  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>';
  var ICON_QR  = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>';
  var ICON_CAM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-3z"/><circle cx="12" cy="13" r="3"/></svg>';

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
        '<hr class="dn-sep">' +
        '<button type="button" data-act="qr-show" role="menuitem">' + ICON_QR + 'Condividi via QR / Link…</button>' +
        '<button type="button" data-act="qr-scan" role="menuitem">' + ICON_CAM + 'Scannerizza QR…</button>' +
        '<div class="dn-note"><strong>File</strong>: backup completo (incluse evidenziazioni). <strong>QR / Link</strong>: sincronizzazione rapida di progresso e segnalibri tra dispositivi.</div>' +
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
      var act = b.getAttribute('data-act');
      if (act === 'export')   { window.NotesStore.download(); close(); }
      else if (act === 'import')  { file.value = ''; file.click(); close(); }
      else if (act === 'qr-show') { close(); window.dnQrOpen && window.dnQrOpen(); }
      else if (act === 'qr-scan') { close(); window.dnScanOpen && window.dnScanOpen(); }
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

