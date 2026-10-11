# node/ — regole specifiche

Appunti di studio su **Node.js per chi fa frontend**: il runtime che sta sotto a tutto il tooling quotidiano (dev server, bundler, test, linter, package manager), anche quando il codice finale gira nel browser. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche.

## Fonte e struttura
- **Spina dorsale**: l'indice di *Modern Frontend Development with Node.js* (Florian Rappl, Packt, novembre 2022), 11 capitoli in 3 parti. Il libro **non è disponibile in locale**: se ne segue l'**indice**, cioè la scelta e l'ordine degli argomenti, ma i contenuti sono **rielaborazioni originali** scritte sulla documentazione ufficiale ([nodejs.org/api](https://nodejs.org/api/), [nodejs.org/en/learn](https://nodejs.org/en/learn), le documentazioni dei singoli strumenti). Non si cita né si parafrasa il testo del libro.
- **➕ in questo vault** segnala ciò che è **fuori dall'indice** del libro (per esempio l'approfondimento sulle API di base `fs`/`path`/`process`), coerente con la regola delle aggiunte del [root](../CLAUDE.md#accuratezza).
- Il libro presuppone Node 14+ (2022): si scrive **sempre per la versione attuale**, non per quella del libro.

## Versioni di riferimento (verificate il 2026-10-11)
- **Node 24 LTS** «Krypton»: è la versione di riferimento (quella installata). In *Maintenance* dal 2026-10-20, fine supporto 2028-04-30.
- **Node 26**: *Current* dal 2026-05-05, diventa **LTS il 2026-10-28** → alla prossima revisione mensile si valuta il passaggio di riferimento.
- **Node 22** in *Maintenance* fino al 2027-04-30; **Node 20** a fine vita dal 2026-04-30.
- Fonte: il calendario ufficiale [nodejs/Release](https://github.com/nodejs/Release). Quando una feature citata ha una versione minima rilevante, la si scrive accanto (es. «stabile da Node 24»).

## Modern-first e Legacy
Come nel vault CSS: la tecnica **attuale** è il default (ESM, prefisso `node:`, `fs/promises`, `fetch` nativo…); il legacy si cita solo se ha ancora valore (codice esistente, contesto storico), in un callout `> [!info|label:Legacy]` o in una frase marcata, mai come strada principale.

## Revisione mensile (questo vault è soggetto a revisione)
Il vault rientra nel **controllo periodico delle novità** del [root](../CLAUDE.md#controllo-periodico-delle-novità-ecmascript--typescript--css--nodejs): a cadenza mensile si verificano le release di Node (LTS/Current, API passate a stabile o deprecate) e le versioni principali degli strumenti trattati (npm/pnpm/Yarn, TypeScript e i runner, ESLint/Prettier/Biome, Vite/Rolldown/esbuild/webpack, Vitest/Jest/Playwright, Deno/Bun). Le novità si **segnalano** all'utente; se si decide di recepirle:
- ciò che diventa superato **non si cancella in silenzio**: si sposta in un callout `> [!info|label:Legacy]` con la data (es. *«Legacy da Node 26 (2026-10)»*) e si scrive la strada attuale come principale;
- si aggiorna la sezione *Versioni di riferimento* qui sopra.

## Tono e codice
- Voce **professore** del [root](../CLAUDE.md): prosa narrativa e distesa, impersonale, ogni tecnicismo sciolto alla prima occorrenza. Chi legge fa frontend e parte da zero su Node.
- Esempi in **ESM** (`import`), CommonJS solo dove è l'argomento; moduli integrati **sempre** con il prefisso `node:` (`node:fs/promises`, `node:path`).
- Come nel vault terminale, i **comandi** stanno in tabella (comando/effetto) e i passi operativi all'infinito/imperativo.
- **Esempi dal repo**: dove aiuta a fissare un concetto, un callout `> [!info|label:Nel repo]` rimanda a uno script vero di questo progetto (oggi soprattutto `scripts/sync-setup.mjs`), così l'astrazione si ancora a codice già visto. È un rinforzo, non la struttura del capitolo. Gli script dei vault privati (`civica/`, `inglese/`) non si citano: quei vault sono tenuti fuori dall'hub di proposito.

## Una fonte di verità con glossario e terminale
Alcuni argomenti hanno già una voce altrove: nel [glossario](../glossario/README.md) (`package-manager.md`, `transpiler.md`, `bundler.md`, `moduli-e-bundling.md`) e nel [vault terminale](../terminale/README.md) (capitolo 07, npm visto dalla shell). Regola: ciò che è **già spiegato** altrove non si riscrive. Il capitolo dà al massimo una frase di contesto e **rimanda** con un link (le definizioni di npm/Yarn/pnpm, il catalogo dei bundler, Babel e SWC, il linguaggio TypeScript), e sviluppa **solo ciò che manca**: il punto di vista di Node e del progetto frontend (come funzionano dentro, configurazione, scelte e confronti). Le voci esistenti del glossario e del terminale **non si tagliano**: se una sovrapposizione diventa ampia, si segnala all'utente invece di riscrivere. Fa eccezione ciò che il capitolo spiega meglio e per intero (come l'interoperabilità CommonJS/ESM del capitolo 02): lì la voce del glossario può limitarsi a rimandare qui.

## Template di un capitolo
```markdown
# NN · <Titolo>

<Intro-definizione in prosa: cos'è e a cosa serve, subito sotto il titolo.>

## <Sezione>

<Prosa distesa; codice e API in backtick; versione minima accanto alle feature recenti.>

<SVG inline dove il concetto è spaziale (architettura a strati, event loop, grafo dei moduli,
risoluzione dei pacchetti): regole SVG del root, currentColor, verifica in WebKit.>

> [!tip]
> <cosa ricordare>

## Ripasso lampo

<details>
<summary><domanda></summary>

<risposta concisa>

</details>
```
(3–5 domande in `<details>`; i backtick della domanda diventano `<code>` nel `<summary>`.)

## Struttura
```
README.md        indice di tutti i capitoli (anche quelli non ancora scritti, marcati «in arrivo»)
_coverpage.md    copertina docsify
_sidebar.md      navigazione: solo i capitoli scritti (link assoluti /docs/NN-*.md; alias in app.js)
docs/            capitoli NN-kebab-italiano.md (numerazione = capitoli del libro); approfondimenti ➕ in fondo
assets/          styles.css, app.js, favicon.svg, node-logo.svg
index.html       app docsify (senza playground)
```

## Checklist (quando aggiungi un capitolo)
- [ ] `_sidebar.md` — voce nel gruppo della sua parte (link assoluto `/docs/NN-*.md`).
- [ ] `README.md` — la riga perde «in arrivo» e diventa un link.
- [ ] Wikilink `[[NN-...]]` dai/ai capitoli correlati.
- [ ] Riallineamento **una fonte di verità** con glossario/terminale (vedi sopra).
- [ ] **SVG** verificato in WebKit dove il capitolo è visivo.
- [ ] Versioni minime e fonti ufficiali linkate per ogni affermazione non ovvia.
