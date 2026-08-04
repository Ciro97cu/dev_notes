# Appunti CSS

Appunti di studio su **CSS**, dai fondamenti al layout moderno. Prosa in italiano, proprietà e sintassi in inglese. Ogni modulo chiude con un **🔁 Ripasso lampo** e una sintesi.

**Sintassi moderna in primo piano** (2026): dove una tecnica recente sostituisce la vecchia, si spiega quella; il legacy resta come nota di contesto. Le novità additive (`oklch()`, container queries, `:has()`, nesting nativo, subgrid, `@layer`…) sono integrate nei moduli pertinenti.

> Appunti personali di studio, verificati su [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS) e [Can I Use](https://caniuse.com/).

## Indice dei moduli

| # | Modulo | Contenuto |
|---|--------|-----------|
| 01 | [Fondamenti](docs/01-fondamenti.md) | Cos'è, sintassi, come si aggiunge il CSS a una pagina |
| 02 | [Selettori & combinatori](docs/02-selettori-combinatori.md) | Tipo/classe/id, attributo, combinatori, `:is()`/`:where()`, nesting |
| 03 | [Pseudo-classi & pseudo-elementi](docs/03-pseudo-classi-elementi.md) | `:hover`, `:nth-*`, `:not()`, `:has()`, `::before/after`, `::marker` |
| 04 | [Cascade, specificità, ereditarietà](docs/04-cascade-specificita-ereditarieta.md) | Cascade, specificità, `!important`, ereditarietà, `@layer` |
| 05 | [Box model](docs/05-box-model.md) | Content/padding/border/margin, `box-sizing`, margin collapsing, gap |
| 06 | [Unità, valori & funzioni](docs/06-unita-valori-funzioni.md) | Unità, `calc()`/`clamp()`, custom properties, DPR |
| 07 | [Colori](docs/07-colori.md) | hex/rgb/hsl, `oklch()`, `color-mix()`, relative colors, `color-scheme` |
| 08 | [Testo & font](docs/08-testo-font.md) | `font` shorthand, `@font-face`, text-decoration, `text-wrap` |
| 09 | [Display & posizionamento](docs/09-display-posizionamento.md) | display, position, z-index, overflow, float |
| 10 | [Sfondi & effetti visivi](docs/10-sfondi-effetti.md) | background, gradienti, `box-shadow`, `filter`, SVG |
| 11 | [Responsive design](docs/11-responsive.md) | viewport, media query, container queries, `aspect-ratio` |
| 12 | [Flexbox](docs/12-flexbox.md) | Container e item, allineamenti, `gap` |
| 13 | [Grid](docs/13-grid.md) | Template, aree, `minmax`/`repeat`, subgrid |
| 14 | [Transforms](docs/14-transforms.md) | 2D/3D, `transform-origin`, proprietà individuali |
| 15 | [Transizioni & animazioni](docs/15-transizioni-animazioni.md) | `transition`, `@keyframes`, timing, reduced-motion |
| 16 | [Future-proof CSS](docs/16-future-proof.md) | Browser support, `@supports`, prefissi, BEM, Sass, framework |
