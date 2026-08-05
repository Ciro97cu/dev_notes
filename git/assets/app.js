/*
 * Parti SPECIFICHE del vault Git: solo la configurazione window.$docsify.
 * Anti-flash e plugin condivisi (tema, resume, coverDots) vivono in
 * ../assets/shared.js, caricato prima di questo file.
 */
window.__VAULT = 'git';   // chiave per "Riprendi" (git-last-page)

window.$docsify = {
  name: 'Appunti Git',
  nameLink: '#/',
  loadSidebar: true,
  coverpage: true,
  onlyCover: false,
  homepage: 'README.md',
  notFoundPage: true,
  subMaxLevel: 4,   // sotto-TOC nella sidebar fino agli h4 (####)
  relativePath: true,
  auto2top: true,
  search: {
    placeholder: 'Cerca…',
    noData: 'Nessun risultato',
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
  plugins: [themeTogglePlugin, resumePlugin, coverDotsPlugin]
};
