/*
 * Configurazione specifica del vault AWS. Tema, ricerca avanzata, progresso,
 * preferiti, evidenziatore, Mermaid e callout sono condivisi da ../assets/shared/.
 */
window.__VAULT = 'aws';

window.$docsify = {
  name: 'AWS · SAA-C03',
  nameLink: '#/',
  loadSidebar: true,
  coverpage: true,
  onlyCover: false,
  homepage: 'README.md',
  notFoundPage: true,
  subMaxLevel: 4,
  relativePath: true,
  auto2top: true,
  alias: {
    '/docs/_sidebar.md': '/_sidebar.md',
    '/exam/_sidebar.md': '/_sidebar.md',
    '/labs/_sidebar.md': '/_sidebar.md',
    '/.*/_sidebar.md': '/_sidebar.md'
  },
  markdown: {
    renderer: {
      code: function (code, lang) {
        if (lang === 'mermaid') {
          return '<div class="mermaid">' + code + '</div>';
        }
        return this.origin.code.apply(this, arguments);
      }
    }
  },
  'flexible-alerts': {
    style: 'callout',
    note:    { label: 'Nota' },
    tip:     { label: 'Suggerimento' },
    warning: { label: 'Attenzione' },
    info:    { label: 'Info', className: 'note', icon: 'icon-note' },
    success: { label: 'Risposta', className: 'callout-answer', icon: 'icon-success' }
  },
  pagination: {
    previousText: 'Precedente',
    nextText: 'Successivo',
    crossChapter: true,
    crossChapterText: true
  },
  search: {
    namespace: 'dev-notes-aws',
    placeholder: 'Cerca nel vault AWS...',
    noData: 'Nessun risultato',
    depth: 4
  },
  copyCode: { buttonText: 'Copia', successText: 'Copiato' },
  plugins: [
    mermaidPlugin,
    collapsibleAnswersPlugin,
    themeTogglePlugin,
    resumePlugin,
    studyProgressPlugin,
    bookmarksPlugin,
    highlighterPlugin,
    coverDotsPlugin,
    simulatorePlugin
  ]
};
