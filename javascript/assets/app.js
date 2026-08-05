/*
 * Parti SPECIFICHE del vault JavaScript: bottone «▶ Prova» sui blocchi JS e la
 * configurazione window.$docsify. Anti-flash e plugin condivisi (tema, resume,
 * coverDots) vivono in ../assets/shared.js, caricato prima di questo file.
 */
window.__VAULT = 'javascript';   // chiave per "Riprendi" (javascript-last-page)

// «▶ Prova»: sotto a ogni blocco di codice JS aggiunge un bottone che apre il
// playground precompilato con quello snippet (l'editor è in assets/playground.js).
function playgroundTryPlugin(hook) {
  hook.doneEach(function () {
    var LANGS = { js: 1, javascript: 1 };
    var blocks = document.querySelectorAll('.markdown-section pre[data-lang]');
    Array.prototype.forEach.call(blocks, function (pre) {
      var next = pre.nextElementSibling;
      if (next && next.classList.contains('pg-try')) return;
      if (!LANGS[(pre.getAttribute('data-lang') || '').toLowerCase()]) return;
      var code = pre.querySelector('code');
      if (!code) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pg-try';
      btn.textContent = '▶ Prova nel playground';
      btn.addEventListener('click', function () {
        if (window.__pgOpen) window.__pgOpen(code.textContent.replace(/\n+$/, ''));
      });
      pre.insertAdjacentElement('afterend', btn);
    });
  });
}

window.$docsify = {
  name: 'JavaScript',
  nameLink: '#/',
  loadSidebar: true,
  loadNavbar: false,
  coverpage: true,
  onlyCover: false,
  auto2top: true,
  maxLevel: 3,
  subMaxLevel: 4,   // sotto-TOC nella sidebar fino agli h4 (####)
  homepage: 'README.md',
  notFoundPage: true,
  search: {
    placeholder: 'Cerca nella guida…',
    noData: 'Nessun risultato.',
    depth: 4
  },
  pagination: {
    previousText: 'Precedente',
    nextText: 'Successivo',
    crossChapter: true,
    crossChapterText: true
  },
  copyCode: {
    buttonText: 'Copia',
    errorText: 'Errore',
    successText: 'Copiato'
  },
  'flexible-alerts': {
    style: 'callout',
    note:    { label: 'Nota' },
    tip:     { label: 'Suggerimento' },
    warning: { label: 'Attenzione' },
    info:    { label: 'Info', className: 'note', icon: 'icon-note' }
  },
  // plugin condivisi (../assets/shared.js) + «Prova» locale
  plugins: [playgroundTryPlugin, themeTogglePlugin, resumePlugin, coverDotsPlugin]
};
