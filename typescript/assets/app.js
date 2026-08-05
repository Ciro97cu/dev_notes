/*
 * Parti SPECIFICHE del vault TypeScript: bottone «▶ Prova» sui blocchi TS e la
 * configurazione window.$docsify. Anti-flash e plugin condivisi (tema, resume,
 * coverDots) vivono in ../assets/shared/ (01-core … 06-highlighter), caricato prima di questo file.
 */
window.__VAULT = 'typescript';   // chiave per "Riprendi" (typescript-last-page)

// «▶ Prova»: sotto a ogni blocco di codice TS aggiunge un bottone che apre il
// playground precompilato con quello snippet (l'editor è in assets/playground.js).
function playgroundTryPlugin(hook) {
  hook.doneEach(function () {
    var LANGS = { ts: 1, typescript: 1 };
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
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:.45em"><polygon points="6 3 20 12 6 21 6 3"/></svg>Prova nel playground';
      btn.addEventListener('click', function () {
        if (window.__pgOpen) window.__pgOpen(code.textContent.replace(/\n+$/, ''));
      });
      pre.insertAdjacentElement('afterend', btn);
    });
  });
}

window.$docsify = {
  name: 'TypeScript',
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
    namespace: 'dev-notes-typescript',
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
  // plugin condivisi (../assets/shared/ (01-core … 06-highlighter)) + «Prova» locale
  plugins: [playgroundTryPlugin, themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
