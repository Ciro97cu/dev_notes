# css/ — regole specifiche

**Vault Obsidian/docsify**. Appunti di studio su **CSS**, dai fondamenti al layout moderno. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Fonte: appunti personali (Google Doc), modernizzati e riscritti. Ogni claim non ovvio va verificato su **[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS)**; per il supporto browser si cita **[Can I Use](https://caniuse.com/)** / [Baseline](https://web.dev/baseline).

## Tono e chiarezza
Vale la **voce "professore"** del [root](../CLAUDE.md): prosa narrativa e distesa, impersonale, ogni tecnicismo spiegato la prima volta. Le proprietà/valori CSS restano in inglese, in backtick.

## Policy sui contenuti — *modern-first* (regola cardine)
Linea editoriale: la sintassi CSS **attuale (2026)** è il default; il legacy resta solo dove ha ancora valore (contesto storico, fallback). I moduli sono già scritti così — questa policy vale per ogni aggiunta o revisione.
1. **Sintassi moderna in primo piano**: se una tecnica recente **sostituisce** quella vecchia, si spiega la moderna come default (es. `gap` nei flex/grid invece dei margini; `inset` invece di top/right/bottom/left; nesting nativo; range syntax nelle media query).
2. **Novità additive integrate dove pertinenti**: `oklch()`/`color-mix()`/relative colors (→ Colori), container queries (→ Responsive), `:has()`/`:is()`/`:where()`/nesting (→ Selettori), `@layer` (→ Cascade), subgrid (→ Grid), `clamp()`/`min()`/`max()`/`dvh` (→ Unità), logical properties (→ Box model), `text-wrap: balance/pretty` (→ Testo), scroll-driven animations & view transitions (→ Animazioni).
3. **Legacy in secondo piano**: si cita solo se ha ancora valore (contesto storico, codice esistente, fallback). Va in un callout `> [!info] Legacy` o in una frase marcata, **mai** come tecnica principale. Tecniche superate (es. clearfix per il float, hack `-prefix-`) → menzione breve, non tutorial.
4. **Stato & supporto**: per feature recenti indicare se sono **Baseline** (ampiamente supportate) o ancora da controllare su Can I Use; niente allarmismi da browser morti (IE è fuori scope, citabile solo come nota storica).

## Struttura
```
README.md        home/MOC: mappa dei 16 moduli
_coverpage.md    copertina docsify
_sidebar.md      navigazione (un solo file, alias per docs/)
docs/            16 moduli tematici (NN-kebab-italiano.md)
assets/          immagini/diagrammi
index.html       app docsify (plugin: wikilink, mermaid, callout collassabili, tema)
```
Un modulo = un file-hub che raggruppa più topic affini. I 16 moduli e i loro filename sono elencati in [README.md](README.md).

## Naming file
`NN-kebab-italiano.md` con NN = numero modulo a 2 cifre (i termini CSS restano inglesi: `05-box-model.md`, `12-flexbox.md`). Wikilink tra moduli: `[[05-box-model]]` → risolto dal plugin a `/docs/05-box-model.md`.

## Template nota-modulo
```markdown
---
modulo: N
titolo: "<Titolo>"
tags: [tipo/modulo, <tematici>]
---
# NN · <Titolo>
> modulo N — *CSS* · rif. MDN

<Intro breve: cosa copre il modulo e perché conta.>

## <Sezione>

<Prosa distesa e discorsiva in italiano; proprietà/valori in backtick.>

```css
/* esempio commentato, re-indentato */
.selector { property: value; }
```

> [!tip]
> <cosa ricordare>

> [!warning]
> <insidia tipica>

> [!info] Legacy
> <vecchia sintassi, solo se vale la pena>

Collegamenti: [[NN-altro-modulo]]

## Ripasso lampo

<details>
<summary><domanda></summary>

<risposta concisa>

</details>

(3-6 domande, ognuna in un `<details>` pieghevole; backtick della domanda resi come `<code>` nel `<summary>`)

**In sintesi:** <2-4 bullet con i punti chiave.>
```

## Callout
- `> [!warning]` (insidie) e `> [!tip]` (cose da ricordare) **senza** titolo custom.
- `> [!info]` mantiene il titolo quando è informativo: usare `> [!info] Legacy` per la sintassi vecchia, `> [!info] Baseline` per lo stato di supporto di una feature moderna.
- **Data di verifica nei callout Baseline**: quando un `> [!info] Baseline` riporta uno stato **ancora in evoluzione** (`newly available`, disponibilità limitata, "in diffusione"), chiudere la nota con la data di verifica in corsivo — `*(verificato: AAAA-MM-GG)*`. Così, se il modulo non viene toccato per un po', il lettore capisce quanto è fresca l'informazione e sa di doverla ricontrollare su MDN / Can I Use. Per feature ormai `widely available` (stabili) la data è facoltativa.
- Le risposte del **Ripasso lampo** vanno in un **`<details>`** (`<summary>` = domanda), stile Q&A unico del monorepo — non nel callout.

## Aggiunte e modernizzazioni
Contenuto aggiunto perché utile/moderno **non** va marcato ogni volta (il modern-first è la linea editoriale): si integra e basta. Riservare la nota in corsivo ➕ (es. `➕ *Approfondimento — …*`) solo per **tangenti/approfondimenti** che escono dal filo del modulo.

## Tag controllati
- tipo: `tipo/modulo`
- tematici: `fondamenti`, `selettori`, `cascade`, `box-model`, `unita`, `colori`, `testo`, `layout`, `posizionamento`, `sfondi`, `responsive`, `flexbox`, `grid`, `transforms`, `animazioni`, `future-proof`, `moderno`

## Diagrammi
Mermaid solo dove rende (es. box model, stacking context, flusso della cascade). **Nessun colore custom** (`fill` fissi): rompe il dark mode → distinguere con le forme. Per gli schemi visivi di layout, preferire SVG in `assets/` o esempi di codice renderizzabili.

## Verifica (checklist prima di scrivere)
- [ ] Sintassi e valori verificati su MDN; niente proprietà/valori inventati.
- [ ] Modern-first applicato: la tecnica principale è quella attuale, il legacy è in secondo piano.
- [ ] Feature recenti: stato di supporto indicato (Baseline / Can I Use) con fonte.
- [ ] Esempi `css` re-indentati e funzionanti.

## Checklist manutenzione (quando aggiungi/rinomini un modulo)
- [ ] `_sidebar.md` — voce nel gruppo giusto.
- [ ] `README.md` — riga nell'indice dei moduli.
- [ ] Link incrociati `[[NN-...]]` dai/ai moduli correlati.
