/*
 * Parti SPECIFICHE del vault HTML: wikilink (moduli in /docs/) e la configurazione
 * window.$docsify. Anti-flash e plugin condivisi (tema, mermaid, callout, resume,
 * coverDots) vivono in ../assets/shared/ (01-core … 06-highlighter), caricato prima.
 */
window.__VAULT = 'html';   // chiave per "Riprendi" (html-last-page)

// Risolve i link Obsidian [[nome]] / [[nome|alias]] in link Docsify (a render-time).
// Tutti i moduli stanno in /docs/, quindi [[NN-...]] -> /docs/NN-....md
function wikilinkPlugin(hook) {
  hook.beforeEach(function (content) {
    content = content.replace(/^\s*---\n[\s\S]*?\n---\n/, '');
    return content.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, function (_, target, label) {
      target = target.trim();
      var anchor = '';
      var hashIdx = target.indexOf('#');
      if (hashIdx >= 0) { anchor = target.slice(hashIdx + 1).trim(); target = target.slice(0, hashIdx).trim(); }
      var text = (label || (anchor || target)).trim();
      var q = anchor ? '?id=' + anchor : '';
      return '[' + text + '](/docs/' + target + '.md' + q + ')';
    });
  });
}

window.$docsify = {
  name: 'Appunti HTML',
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
  // callout Obsidian: [!info] [!tip] [!warning] [!note] [!success]  (corpo markdown preservato)
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
    namespace: 'dev-notes-html', placeholder: 'Cerca…', noData: 'Nessun risultato', depth: 4 },
  copyCode: { buttonText: 'Copia', successText: 'Copiato' },
  // plugin condivisi (../assets/shared/ (01-core … 06-highlighter)) + specifici del vault
  plugins: [wikilinkPlugin, mermaidPlugin, collapsibleAnswersPlugin, themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
