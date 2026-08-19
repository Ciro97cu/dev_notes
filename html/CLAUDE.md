# html/ — regole specifiche

**Vault docsify**. Appunti di studio su **HTML**, con taglio *semantica, form e accessibilità*. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Fonte: rielaborazioni originali, verificate su **[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML)** e sulle specifiche **[WHATWG HTML](https://html.spec.whatwg.org/)**; per il supporto browser si cita **[Baseline](https://web.dev/baseline)** / [Can I Use](https://caniuse.com/); per l'accessibilità le **[WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)** e **[ARIA APG](https://www.w3.org/WAI/ARIA/apg/)**.

## Tono e chiarezza
Vale la **voce "professore"** del [root](../CLAUDE.md): prosa narrativa e distesa, impersonale, ogni tecnicismo spiegato la prima volta. Tag, attributi e valori restano in inglese, in backtick.

## Policy sui contenuti — *decisioni, non catalogo* (regola cardine)
Linea editoriale: HTML *sintatticamente* è banale (tag e attributi), quindi il vault **non** è un elenco di tag — quello è MDN. Si scrive solo ciò che è **scelta o insidia**:
1. **Semantica prima di tutto**: quale elemento per quale scopo, e perché la scelta conta (albero di accessibilità, SEO, manutenzione). Il tag giusto batte `<div>` + ARIA.
2. **Accessibilità di serie, non in fondo**: l'a11y non è un modulo isolato ma un criterio che attraversa form, media, struttura. Il modulo 07 la approfondisce, ma i riflessi (label, alt, focus) si citano dove nascono.
3. **Moderno di default**: HTML Living Standard (WHATWG); il legacy (`<center>`, `<font>`, tabelle per il layout, `<marquee>`) solo come nota storica in `> [!info] Legacy`, mai come tecnica.
4. **Stato & supporto**: per feature recenti indicare se **Baseline** o da controllare su Can I Use, con data di verifica se in evoluzione.
5. **HTML/CSS/JS separati**: la presentazione rimanda al vault CSS, il comportamento a JavaScript; qui si sta sul markup e sul suo significato.

## Struttura
```
README.md        home/MOC: indice degli 8 moduli
_coverpage.md    copertina docsify
_sidebar.md      navigazione (un solo file, alias per docs/)
docs/            moduli tematici (NN-kebab-italiano.md)
assets/          app.js, styles.css, favicon.svg, html-logo.svg, immagini
index.html       app docsify (plugin: wikilink, mermaid, callout collassabili, tema)
```

## Naming file
`NN-kebab-italiano.md` con NN = numero modulo a 2 cifre (i termini HTML restano inglesi nel testo, non nel filename: `05-form.md`, `07-accessibilita-aria.md`). Wikilink tra moduli: `[[03-semantica-struttura]]` → risolto dal plugin a `/docs/03-semantica-struttura.md`.

## Template nota-modulo
```markdown
---
modulo: N
titolo: "<Titolo>"
tags: [tipo/modulo, <tematici>]
---
# NN · <Titolo>
> modulo N — *HTML* · rif. MDN

<Intro breve: cosa copre il modulo e perché conta.>

## <Sezione>

<Prosa distesa e discorsiva; tag/attributi in backtick.>

```html
<!-- esempio commentato, re-indentato -->
<figure>…</figure>
```

> [!tip]
> <cosa ricordare>

Collegamenti: [[NN-altro-modulo]]

## Ripasso lampo

<details>
<summary><domanda></summary>

<risposta concisa>

</details>

(3-6 domande in `<details>` pieghevoli; backtick della domanda resi `<code>` nel `<summary>`)

**In sintesi:** <2-4 bullet coi punti chiave.>
```

## Callout
- `> [!warning]` (insidie) e `> [!tip]` (cose da ricordare) **senza** titolo custom.
- `> [!info] Legacy` per la sintassi vecchia; `> [!info] Baseline` per lo stato di supporto.
- **Data di verifica nei Baseline in evoluzione** (`newly available`, disponibilità limitata): chiudere con `*(verificato: AAAA-MM-GG)*`.
- Le risposte del **Ripasso lampo** vanno in un **`<details>`** (stile Q&A del monorepo), non nel callout.

## Diagrammi — visual-first
Il vault è **visual-first**: SVG inline dove chiariscono davvero (scheletro documento, albero DOM, albero di accessibilità, flusso di validazione dei form, struttura di un form). Valgono le regole SVG del [root](../CLAUDE.md): `currentColor`, nessun colore custom, escaping di `&`/`<`/`>`, e **verifica obbligatoria in WebKit** con `python3 scripts/svg-preview.py` prima di committare.

## Verifica (checklist prima di scrivere)
- [ ] Elementi/attributi verificati su MDN; niente tag/attributi inventati.
- [ ] Taglio "decisioni non catalogo": si spiega la scelta, non l'elenco.
- [ ] Accessibilità considerata (label, alt, focus, ruoli) dove pertinente.
- [ ] Esempi `html` re-indentati e validi.
- [ ] SVG verificati in WebKit.

## Checklist manutenzione (quando aggiungi/rinomini un modulo)
- [ ] `_sidebar.md` — voce nel gruppo giusto.
- [ ] `README.md` — riga nell'indice dei moduli.
- [ ] Link incrociati `[[NN-...]]` dai/ai moduli correlati.
