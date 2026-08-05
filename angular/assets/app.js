/*
 * Parti SPECIFICHE del vault Angular: risoluzione dei wikilink (percorsi capitoli/
 * concetti/meta) e la configurazione window.$docsify. Anti-flash e plugin condivisi
 * (tema, mermaid, callout, resume, coverDots) vivono in ../assets/shared.js, caricato
 * prima di questo file.
 */
window.__VAULT = 'angular';   // chiave per "Riprendi" (angular-last-page)

// Risolve i link Obsidian [[nome]] / [[nome|alias]] in link Docsify (a render-time).
// [[NN-...]] -> /capitoli/ ; 00-index -> / (home = indice) ; glossario -> /_meta/ ; resto -> /concetti/
function wikilinkPlugin(hook) {
  hook.beforeEach(function (content) {
    // rimuove il frontmatter YAML (--- ... ---) così non viene stampato come testo
    content = content.replace(/^\s*---\n[\s\S]*?\n---\n/, '');
    return content.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, function (_, target, label) {
      target = target.trim();
      var anchor = '';
      var hashIdx = target.indexOf('#');
      if (hashIdx >= 0) { anchor = target.slice(hashIdx + 1).trim(); target = target.slice(0, hashIdx).trim(); }
      var text = (label || (anchor || target)).trim();
      var q = anchor ? '?id=' + anchor : '';
      var path;
      if (target === 'glossario') path = '/_meta/glossario.md' + q;
      else if (/^\d{2}-/.test(target)) path = '/capitoli/' + target + '.md' + q;
      else if (target === '00-index') path = '/';
      else path = '/concetti/' + target + '.md' + q;
      return '[' + text + '](' + path + ')';
    });
  });
}

window.$docsify = {
  name: 'Appunti Angular',
  nameLink: '#/',
  loadSidebar: true,
  coverpage: true,
  onlyCover: false,
  homepage: 'README.md',
  notFoundPage: true,
  subMaxLevel: 4,   // sotto-TOC nella sidebar fino agli h4 (####)
  relativePath: true,
  auto2top: true,
  // un solo _sidebar.md (root) anche nelle sottocartelle capitoli/ e concetti/
  alias: {
    '/capitoli/_sidebar.md': '/_sidebar.md',
    '/concetti/_sidebar.md': '/_sidebar.md',
    '/_meta/_sidebar.md': '/_sidebar.md',
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
  search: { placeholder: 'Cerca…', noData: 'Nessun risultato', depth: 4 },
  copyCode: { buttonText: 'Copia', successText: 'Copiato' },
  // plugin condivisi (../assets/shared.js) + wikilink locale
  plugins: [wikilinkPlugin, mermaidPlugin, collapsibleAnswersPlugin, themeTogglePlugin, resumePlugin, studyProgressPlugin, bookmarksPlugin, highlighterPlugin, coverDotsPlugin]
};
