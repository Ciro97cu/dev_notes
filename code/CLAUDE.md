# code/ — regole specifiche

**Vault docsify**. Appunti di studio sul libro **«Code — The Hidden Language of Computer Hardware and Software»** di **Charles Petzold** (2ª edizione, 2023): come funziona un computer, partendo da zero (codici, binario, elettricità) e salendo un gradino alla volta fino alla CPU e al software. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Fonte: `code/code.pdf` (in locale, `.gitignore`d). ⚠️ È una **scansione**: ogni pagina è un'immagine, **senza testo estraibile** (né `pypdf` né PyMuPDF ne cavano testo). Per lavorare su un capitolo si **rendono le pagine a immagine** con PyMuPDF (`import fitz; fitz.open("code/code.pdf")[n].get_pixmap(dpi=150).save("out.png")`) e si leggono con lo strumento immagini, **oppure** si incolla il testo del capitolo in chat (come è stato fatto per i capp. 1-5). **28 capitoli**, ordine e titoli fedeli al libro.

## Specifiche di contenuto
- **Fedeltà al libro e accuratezza assoluta**: struttura, ordine e contenuto ricalcano i 28 capitoli di Petzold. Ogni claim, numero, tabella e passaggio va **verificato sul PDF** prima di scrivere. **Niente allucinazioni, niente fretta**: la precisione viene prima della quantità.
- **Autosufficienza (regola dura)**: se il libro spiega un concetto, lo si spiega **per esteso qui**, anche quando una voce breve esiste già nel glossario. Il glossario resta la versione sintetica trasversale; questo vault è la fonte **approfondita**. Non si sostituisce la spiegazione con un semplice rimando al glossario (lì il concetto è meno dettagliato).
- **Termini tecnici EN non tradotti** (bit, byte, gate, latch, flip-flop, bus, opcode, clock…). Il **titolo originale** del capitolo (es. *Best Friends*) va nel sottotitolo della nota; il titolo italiano sta nell'H1 e nella sidebar.
- **Aggiunte oltre il libro**: contenuto non presente in Petzold va segnalato con la nota in corsivo ➕ (regola root). I **diagrammi aggiuntivi** che illustrano concetti già nel libro **non** sono "oltre il libro": sono aiuti visivi, non serve marcarli.

## Tono e chiarezza
Voce **"professore"** del [root](../CLAUDE.md): **prosa narrativa e distesa**, impersonale, ogni tecnicismo spiegato la prima volta — lo stesso registro esteso con cui sono scritti i vault book-based JS e Angular. Non tagliare la profondità: il valore del libro è la salita graduale **ma completa**.

## Vault visual-first — diagrammi
L'utente fissa meglio i concetti con la **controprova visiva**: questo vault è quindi **ricco di diagrammi**.
- **Ricostruire tutte le figure del libro** (tabelle di codici, alberi, circuiti, schemi logici, diagrammi di timing) e **aggiungerne** dove chiariscono un passaggio.
- **Mermaid** per alberi/gerarchie/sequenze/macchine a stati; **SVG inline** per ciò che mermaid non rende bene (circuiti, interruttori, relè, gate, forme d'onda/timing).
- **Nessun colore custom in mermaid** (`classDef`/`style` con `fill` fissi): rompe il dark mode → distinguere con le **forme** (regola root). Gli SVG-illustrazione hanno sfondo e tratto propri, così restano leggibili su tema chiaro e scuro.

## Struttura
```
README.md        home = indice completo: mappa dei 28 capitoli in 6 parti
_coverpage.md    copertina docsify
_sidebar.md      navigazione (un solo file, alias per docs/)
docs/            28 capitoli (NN-kebab-inglese.md)
assets/          styles.css, favicon.svg, immagini/SVG
index.html       app docsify (mermaid, callout, prism-bash)
```

## Naming file
`NN-kebab-inglese.md`, NN a 2 cifre + titolo del capitolo in inglese: `01-best-friends.md`, `12-bytes-and-hexadecimal.md`.

## Template di un capitolo
```markdown
# NN · <Titolo italiano>
> cap. N di «Code» (Petzold, 2ª ed.) — orig. *<Titolo inglese>*

<Intro in prosa: cosa copre il capitolo e perché conta, in continuità col precedente.>

## <Sezione>

<Prosa distesa in italiano; termini tecnici in inglese/backtick.>

​```mermaid
%% diagramma dove aiuta a fissare il concetto
​```

> [!tip]
> <cosa ricordare>

> [!warning]
> <insidia / punto sottile>

## Ripasso lampo

<details>
<summary><domanda></summary>

<risposta concisa>

</details>

(3-6 domande, ognuna in un `<details>` pieghevole; backtick della domanda resi come `<code>` nel `<summary>`)

**In sintesi:** <2-4 bullet con i punti chiave.>
```

## Callout
- `> [!warning]` (insidie) e `> [!tip]` (da ricordare) **senza** titolo custom.
- `> [!info]` mantiene il titolo quando è informativo.
- Le risposte del **Ripasso lampo** vanno in un **`<details>`** (`<summary>` = domanda), non nel callout.

## Le 6 parti (raggruppamento editoriale; il libro è lineare)
1. **I codici** (capp. 1-3) · 2. **Elettricità e interruttori** (4-8) · 3. **Numeri e bit** (9-13) · 4. **Aritmetica e memoria** (14-19) · 5. **Il processore** (20-24) · 6. **Dal computer al software** (25-28).

## Checklist manutenzione (quando aggiungi un capitolo)
- [ ] `_sidebar.md` — voce nella parte e nell'ordine giusto.
- [ ] `README.md` (= indice) — trasforma il titolo in link (togli lo stato "in preparazione").
- [ ] Diagrammi del libro ricostruiti (+ extra se aiutano).
- [ ] Sezione **Ripasso lampo** con risposte pieghevoli a fine capitolo.
- [ ] Accuratezza verificata sul PDF.
