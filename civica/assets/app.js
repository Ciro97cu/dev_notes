/*
 * Parti SPECIFICHE del vault civica: solo la configurazione window.$docsify.
 * Anti-flash e plugin condivisi (tema, resume, studio, preferiti, evidenziatore,
 * coverDots) vivono in ../assets/shared/ (01-core … 06-highlighter), caricati
 * prima di questo file. Il core docsify NON parte qui: lo inietta assets/gate.js
 * dopo lo sblocco, quando i contenuti decifrati sono già in memoria.
 */
window.__VAULT = 'civica';   // chiave per "Riprendi" (civica-last-page)

window.$docsify = {
  name: 'civica',
  nameLink: '#/',
  loadSidebar: true,
  loadNavbar: false,
  coverpage: true,
  onlyCover: false,
  auto2top: true,
  maxLevel: 3,
  subMaxLevel: 3,
  homepage: 'README.md',
  notFoundPage: false,
  search: {
    namespace: 'dev-notes-civica',
    placeholder: 'Cerca…',
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
  // plugin condivisi (../assets/shared/ (01-core … 06-highlighter))
  plugins: [themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
