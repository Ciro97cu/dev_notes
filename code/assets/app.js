/*
 * Parti SPECIFICHE del vault Code (Petzold): solo la configurazione window.$docsify.
 * Anti-flash e plugin condivisi (tema, mermaid, callout, risposte pieghevoli, resume,
 * coverDots) vivono in ../assets/shared/ (01-core … 06-highlighter), caricato prima.
 */
window.__VAULT = 'code';   // chiave per "Riprendi" (code-last-page)

window.$docsify = {
  name: 'Code',
  nameLink: '#/',
  loadSidebar: true,
  coverpage: true,
  onlyCover: false,
  homepage: 'README.md',
  notFoundPage: true,
  subMaxLevel: 4,   // sotto-TOC nella sidebar fino agli h4 (####)
  relativePath: true,
  auto2top: true,
  // un solo _sidebar.md (root) anche nella sottocartella docs/
  alias: {
    '/docs/_sidebar.md': '/_sidebar.md',
    '/.*/_sidebar.md': '/_sidebar.md'
  },
  // i blocchi ```mermaid diventano <div class="mermaid">, gli altri mantengono l'highlight Prism
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
  // callout Obsidian: [!info] [!tip] [!warning] [!note] [!success] (corpo markdown preservato)
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
    namespace: 'dev-notes-code',
    placeholder: 'Cerca…',
    noData: 'Nessun risultato',
    depth: 4
  },
  copyCode: { buttonText: 'Copia', successText: 'Copiato' },
  // plugin condivisi + specifici del vault (mermaid, risposte pieghevoli)
  plugins: [mermaidPlugin, collapsibleAnswersPlugin, themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
