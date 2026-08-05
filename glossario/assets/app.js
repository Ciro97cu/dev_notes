/*
 * Parti SPECIFICHE del vault Glossario: solo la configurazione window.$docsify.
 * Anti-flash e plugin condivisi (tema, resume, coverDots) vivono in
 * ../assets/shared.js, caricato prima di questo file.
 */
window.__VAULT = 'glossario';   // chiave per "Riprendi" (glossario-last-page)

window.$docsify = {
  name: 'Glossario',
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
    placeholder: 'Cerca un termine…',
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
  // plugin condivisi (../assets/shared.js)
  plugins: [themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
