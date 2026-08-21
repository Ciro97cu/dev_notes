# Dev Notes — regole comuni

Monorepo di appunti di studio personali, pubblicati come **hub** di 7 siti [docsify](https://docsify.js.org/) statici e indipendenti (zero build): [`git/`](git/), [`javascript/`](javascript/), [`typescript/`](typescript/), [`angular/`](angular/), [`css/`](css/), [`glossario/`](glossario/), [`code/`](code/). Vedi [README.md](README.md) per l'architettura del sito.

Questo file raccoglie le regole **comuni a tutti i vault**. Ogni cartella ha un proprio `CLAUDE.md` con le regole **specifiche** del vault, che ha la precedenza dove più stringente. Entrambi si caricano da soli: il generale sempre, quello di cartella quando lavori su file di quel sottoalbero.

## Lingua e registro — voce "professore"
Questo è il registro **comune a tutti i vault**: gli altri `CLAUDE.md` lo richiamano e dichiarano solo le proprie eccezioni.

- **Prosa in italiano, registro "professore"**: si spiega come farebbe un docente appassionato e chiaro a chi parte da zero — **prosa narrativa e distesa**, non telegrafica; ma diretta e **senza fronzoli** (distesa non vuol dire prolissa).
- **Apertura in parole semplici**: ogni sezione/voce apre con una frase-definizione (cos'è, a cosa serve) prima dei dettagli; niente incipit telegrafici senza verbo. Ogni tecnicismo si introduce spiegandolo la prima volta, senza però tagliare la profondità tecnica.
- **Registro impersonale**: *"si usa"*, *"è possibile"*, *"si consideri"*. Mai "io"; la seconda persona ("tu"/"puoi"/"vedi") è evitata nella teoria. Nei passi operativi delle ricette è ammesso l'infinito o l'imperativo (*"Eseguire…"*).
- **Prosa, non elenchi spezzati** quando serve spiegare un concetto o un ragionamento; bullet e tabelle **solo** per enumerazioni vere (valori ammessi, stati, comandi). **Niente `→`** come connettivo di prosa nelle note: si usano le congiunzioni (*"così"*, *"quindi"*, *"perché"*, *"invece"*).
- **Filename, titoli di sezione, nomi di API e keyword in inglese** — non tradurre i termini tecnici.

**Eccezioni** (dettagliate nei `CLAUDE.md` di cartella): le note atomiche `concetti/` di Angular restano **concise** (definizione essenziale + snippet); il glossario resta **contenuto** (spiegazione breve ma discorsiva, poi rimando); in Git i **comandi** stanno in tabella e i **passi delle ricette** vanno all'imperativo — la prosa narrativa è la spiegazione *attorno* ai comandi.

## Precisione contestuale (keyword di codice)
Quando la prosa descrive un **meccanismo di codice**, citare il costrutto esatto in backtick invece di parafrasarlo con una parola italiana. Vale soprattutto per le keyword (`this`, `new`, `super`, …) facili da fondere in un dimostrativo: non *"questo tab"* quando il codice fa `currentTab() === this`, ma *"confronto d'identità con `this`"* (l'istanza corrente). Obiettivo: prosa fluida **e** ancorata al codice.

## Accuratezza
- **Niente comandi, API o flag inventati**: solo sintassi reale e verificata della tecnologia trattata.
- **Claim non ovvi con fonte**: un'affermazione non banale ha un link alla documentazione ufficiale.
- **Codice funzionante e re-indentato** fedelmente alle convenzioni del linguaggio (l'estrazione da PDF appiattisce l'indentazione → ricostruirla).
- **Aggiunte oltre la fonte**: contenuto non presente nel libro/serie del vault va segnalato con una nota in corsivo prefissata dall'icona ➕ (es. *➕ Fuori dal libro …*), così si distingue a colpo d'occhio da ciò che viene dalla fonte.

## Controllo periodico delle novità (ECMAScript / TypeScript / CSS)
Alcuni vault trattano tecnologie che si evolvono e vanno tenute aggiornate: **ECMAScript** (sezione `moderno` di `javascript/`), **TypeScript** (versione del compilatore in `typescript/`), **CSS** (feature Baseline in `css/`). Per non lavorare su informazioni stale senza però appesantire ogni turno, vale una **verifica a cadenza mensile**:

- **Quando**: il controllo è **mensile**, ancorato al **mese di calendario**. Se il mese di `currentDate` è **successivo** a quello indicato qui sotto (*Ultima verifica novità*), alla prima occasione utile eseguire il controllo; altrimenti **saltare** (costo zero sugli altri turni).
- **Cosa**: una ricerca web mirata sullo stato più recente di ECMAScript (ultima edizione ratificata + proposte Stage 4), TypeScript (ultima release stabile) e CSS (feature entrate in Baseline). **Angular escluso per ora.**
- **Come riportare**: **segnalare** le novità **in fondo al messaggio**, dopo aver completato ciò che era stato chiesto. L'integrazione nei vault **non** è automatica: se e come recepirle è **decisione dell'utente** (una volta decisa, si integra con le note storiche del caso — vedi sotto).
- Dopo il controllo, **aggiornare la data** qui sotto al **primo giorno del mese corrente** (formato `AAAA-MM-01`).

**Ultima verifica novità: 2026-08-01.**

## Organizzazione
- **Una fonte di verità**: un concetto è spiegato in un solo punto; gli altri file rimandano con un link, non riscrivono.
- Terminologia coerente in tutto il vault.

## Diagrammi
Mermaid **solo dove rende davvero** (flussi, gerarchie, sequenze non banali), non ovunque. **Nessun colore custom** (`classDef`/`style` con `fill` fissi): i siti hanno tema chiaro/scuro, i colori hardcoded rompono il dark mode → distinguere con le **forme**, non con i colori.

### Visual-first — l'SVG dove il concetto è visivo
Dove un concetto ha una **dimensione visiva** — una struttura, un flusso, una gerarchia, una relazione spaziale (albero DOM, grafo dei moduli, bundle e chunk, macchina a stati, sequenza di passi) — l'SVG inline **non è un extra opzionale: ci va**. È la norma nei vault a taglio *visual-first* (html, css, glossario). L'unico limite è la pertinenza: se la voce è puramente testuale (una definizione di una riga) e non c'è nulla di spaziale da mostrare, si lascia stare — vale «laddove possibile», non «a forza ovunque». Quando l'SVG c'è: poche etichette essenziali dentro il disegno, il resto nella `figcaption`. Le regole di scrittura e la **verifica obbligatoria** sono qui sotto.

### SVG inline — verifica obbligatoria (XML + resa WebKit)
Un SVG scritto a mano ha due classi di difetti invisibili nel codice: **(1) XML non valido** — una `&` o un `<` grezzi nel testo (es. `A & B`, `opacity < 1`) rompono il parsing e il browser smette di disegnare l'SVG; vanno scritti `&amp;`/`&lt;`. **(2) Layout** — testo tagliato dal viewBox, frecce/etichette sovrapposte: dipendono dai **font del motore di rendering**, quindi si vedono solo guardando l'immagine resa dallo **stesso motore del browser**. Prima di committare un SVG non banale, eseguire:

```
python3 scripts/svg-preview.py <file.md|file.svg>
```

Lo script **valida l'XML** di ogni SVG e li **renderizza con `qlmanage`** (Quick Look = **WebKit**, il motore che vede l'utente), poi impila i risultati in un PNG da **ispezionare a occhio**. ⚠️ **Non** verificare con **PyMuPDF**: usa metriche di font diverse dal browser e ha un parser XML permissivo → i difetti sfuggono (una `&` grezza "passa" e poi rompe il render reale). Linee guida per sbagliare meno a monte:

- **Escapare** sempre nel testo SVG: `&` → `&amp;`, `<` → `&lt;`.
- **Margini abbondanti** nel `viewBox`; mai testo a ridosso dei bordi (verrebbe tagliato). Se un'etichetta sfora, allargare `viewBox`/altezza.
- **Connettori e frecce da bordo a bordo** degli elementi, mai da centro a centro (sennò passano *sopra* i nodi).
- **Niente testo in spazi stretti** tra due elementi, né linee che attraversano etichette: accorciare, allargare lo spazio, o spostare nella `figcaption`.
- Preferire poche etichette essenziali nell'SVG e demandare il resto alla **didascalia** in prosa sotto la figura.

## Architettura (zero-build) — tenerla documentata
L'hub è **zero-build** e **client-side**: docsify rende i Markdown nel browser (CSR) e le dipendenze sono **self-hosted** in `assets/vendor/` (non da CDN), con la sola eccezione dell'editor Monaco del playground. La mappa completa — com'è fatto e **perché** questa scelta è stata preferita ad altre — vive in [README.md](README.md), sezione *Architettura*.

Il *perché*, in sintesi: per appunti personali semplicità e zero attrito valgono più di SEO e prima-pittura (che qui non servono). Un **SSG** richiederebbe una build più una CI; un **bundler** sposterebbe file già pronti a vuoto (docsify è a runtime, non c'è nulla da compilare); un **framework** sarebbe sproporzionato per note in Markdown. Le dipendenze in locale tolgono il single-point-of-failure del CDN senza introdurre alcuna build.

**Regola:** ogni **modifica architetturale** (dipendenze, motore/rendering, struttura di build o deploy, plugin, spostamenti tra CDN e locale) va **riflessa anche in [README.md](README.md)**, così la mappa resta aggiornata. E prima di reintrodurre build/bundler/framework, rileggere il *perché*: è una decisione già presa, non un default da cambiare a cuor leggero.

## Workflow di scrittura
Quando l'utente chiede di scrivere o modificare una nota (di solito linkando un file):
1. **Identifica il vault** dal path del file → si applicano root `CLAUDE.md` + il `CLAUDE.md` di quella cartella.
2. **Segui il template/scheletro** del vault (definito nel suo `CLAUDE.md`).
3. **Verifica l'accuratezza** (regole qui sopra) prima di scrivere.
4. **Stile coerente col contorno**: registro, callout e struttura come le note vicine.
5. **Aggiorna i file di supporto** (indice, `_sidebar.md`, glossario…) secondo la checklist del `CLAUDE.md` di cartella quando aggiungi o rinomini una nota.

## Creare un nuovo vault — checklist e trappole
Aggiungere un vault è una **modifica architetturale** (va riflessa nel [README.md](README.md) di root). Lezioni imparate sul campo, da non riperdere:

- **Da dove clonare il boilerplate**: copiare `index.html`/`app.js`/`styles.css` da un vault che ha **già** le feature che servono, **non** da `git/` se il nuovo vault avrà sezioni domanda/risposta. Il vault `git/` non ha "Domande", quindi il suo `styles.css` **non** definisce le variabili `--cl-ans-*` né le regole del **callout "Risposta" collassabile**: clonando da lì, le risposte non diventano box pieghevoli. Per un vault con Ripasso, clonare da **`css/`** o **`angular/`**.
- **Sidebar / alberatura a sinistra**: serve `_sidebar.md` **e**, se i contenuti stanno in `docs/`, nel `app.js` l'`alias` `'/docs/_sidebar.md' → '/_sidebar.md'` (più `'/.*/_sidebar.md'`). Senza, docsify ripiega su una sidebar **auto-generata** dai titoli della pagina, diversa dal tree curato degli altri vault.
- **Link della sidebar assoluti (trappola del "doppio `docs`")**: se `relativePath: true` è attivo (com'è nei vault clonati da `git/`, che però ha i capitoli *flat*) e i contenuti stanno in `docs/`, i link della sidebar ai capitoli **devono** essere **assoluti** — `/docs/NN-...md` con lo slash iniziale (come fa CSS). Con link relativi `docs/NN-...md`, navigando *dentro* `docs/` docsify li risolve rispetto alla pagina corrente e li **raddoppia** (`#/docs/docs/...` → 404). Alternativa: togliere del tutto `relativePath` (come fa TS).
- **Box domanda/risposta — stile unico del monorepo**: la sezione di auto-valutazione a fine capitolo usa il **`<details>` nativo** — `<details>` + `<summary>domanda</summary>` + riga vuota + risposta in markdown + `</details>` — con i backtick della domanda resi `<code>` nel `<summary>`. Lo stile del box è nel `styles.css` di ogni vault (`.markdown-section details`, con bordo sinistro nel colore brand `var(--link)`); i vault che clonano da uno che già ce l'ha lo ereditano. La sezione si chiama **`## Ripasso lampo`** (in JS/TS storicamente **`## Domande`**). **Non** usare il vecchio callout `> [!success]-` (dismesso).
- **Registrare il vault nell'hub**: card in [index.html](index.html) (con `--accent` distinto), voce in [assets/hub.js](assets/hub.js) `VAULTS` (banner "Riprendi" + % di lettura sulle card), riga in tabella + conteggio "N raccolte" + nota di architettura in [README.md](README.md).
- **Dopo aver aggiunto file/vault: riavviare il server locale** e fare hard refresh. Un server statico avviato **prima** vede i nuovi file come **404** e la sidebar come auto-generata — non è un bug del vault (verificabile con `curl`: se i file rispondono 200, è cache/server stale).
- **Identità**: `theme-color` e `favicon.svg` propri, colore accent **distinto** dagli altri.
