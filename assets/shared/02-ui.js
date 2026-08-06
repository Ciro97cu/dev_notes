
// ── Stili condivisi dei pulsanti fissi ────────────────────────────────────────
// Speed-dial "Strumenti", popover (.dn-pop di Preferiti/Evidenziatore), toggle tema
// e i pulsanti docsify in basso a destra (home/menu/playground) resi theme-aware.
// Il trasferimento dati (export/import, QR) vive solo nell'hub, non più nei vault.
(function () {
  var css = [
    // speed-dial "Strumenti" in basso a destra: il bottone-chiave sta sopra menu(70)+home(16),
    // i tool si aprono verso l'alto. Il toggle tema resta da solo in alto a destra.
    '#dn-tools{position:fixed;bottom:124px;right:16px;z-index:101}',
    '#dn-tools-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    // Playground ("terminale") assorbito nella speed-dial: in cima alla colonna (opzionale:
    // git/glossario non ce l'hanno) e nascosto finché il dial è chiuso. La posizione/misura
    // dallo shared vince sul CSS del vault (lo <style> runtime è iniettato dopo styles.css);
    // 44px per uniformarsi a menu/home, passo 54px come tra home(16)→menu(70)→chiave(124).
    '#pg-toggle,#ng-play{top:auto;bottom:286px;right:16px;width:44px;height:44px}',
    // i tool restano nascosti finché non si apre lo speed-dial (slittano su dal basso)
    '#dn-fav,#dn-hl{opacity:0;pointer-events:none;transform:translateY(6px);transition:opacity .18s ease,transform .18s ease}',
    '#pg-toggle,#ng-play{opacity:0;pointer-events:none;transition:opacity .18s ease}',
    'body.dn-tools-open #dn-fav,body.dn-tools-open #dn-hl{opacity:1;pointer-events:auto;transform:none}',
    'body.dn-tools-open #pg-toggle,body.dn-tools-open #ng-play{opacity:1;pointer-events:auto}',
    // hover uniforme di tutti i pulsanti fissi (icona che cambia colore, niente fondo pieno) + micro-zoom
    '#dn-fav-btn,#dn-hl-btn,#dn-tools-btn{transition:transform .15s ease,color .2s ease,border-color .2s ease}',
    '#dn-fav-btn:hover,#dn-hl-btn:hover,#dn-tools-btn:hover{transform:scale(1.08)}',
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
    // il toggle tema usa un\'icona SVG come gli altri: centrala e uniformala a 44px
    // (come menu/home/strumenti) — l\'override dallo shared vince sul styles.css del vault
    '#theme-toggle{display:flex;align-items:center;justify-content:center;width:44px;height:44px}',
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

})();

// ── Speed-dial "Strumenti": un unico bottone (sotto il tema) che apre/chiude i
// tool raggruppati (preferiti, evidenziatore). Il tema resta separato.
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

