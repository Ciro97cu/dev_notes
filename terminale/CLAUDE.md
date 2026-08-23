# terminale/ — regole specifiche

Appunti di studio sul **terminale** e la **shell** (Unix-like). Nato estraendo e ampliando la vecchia sezione «Terminale» del vault Git: qui la shell è trattata come argomento a sé, trasversale (serve per Git, npm, dev server, qualsiasi cosa). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche.

## Ambiente di riferimento
**macOS con zsh** (è la macchina di riferimento). Le differenze rilevanti con **Linux** e con **bash** si segnalano lungo il testo (non si scrive una guida separata per shell). Quando un comando è specifico di macOS (`open`, `pbcopy`, `brew` in `/opt/homebrew`) lo si dice; quando differisce su Linux (`xdg-open`, path dei pacchetti) si annota.

## Tono e chiarezza
Vale la **voce "professore"** del [root](../CLAUDE.md): la **spiegazione** va in prosa narrativa e distesa, impersonale, ogni tecnicismo introdotto la prima volta. Eccezione del vault (come in Git): i **comandi** stanno in tabella (comando/effetto) e i **passi delle ricette** all'infinito/imperativo — la prosa narrativa è la teoria *attorno* ai comandi. Nomi di comandi, opzioni, path e variabili in inglese, in backtick.

## Accuratezza (regole dure)
1. **Comandi verificati**: nessun comando o flag inventato; sintassi reale, controllata sulle *man page* (`man <comando>`) e sulla documentazione ufficiale (npm, Homebrew, zsh, GNU coreutils).
2. **Distruttivo marcato**: ogni comando che cancella o sovrascrive senza rete (`rm -rf`, `>` che tronca) è marcato con ⚠️ e spiega cosa perde.
3. **Path e default verificati**: prefissi (`/opt/homebrew` Apple Silicon vs `/usr/local` Intel), cartelle di npm globale, ordine di lettura dei file di avvio — sono facili da sbagliare: verificare, non assumere.
4. **Aggiunte fuori dal filo** del capitolo → nota in corsivo prefissata da ➕ (come da root).

## Identità visiva
Accent **"ink" tema-adattivo**: quasi-nero `#0d0d0d` sul tema chiaro, quasi-bianco `#e6e6e6` sullo scuro (definito in `assets/styles.css`, `:root` e `html.dark`). La coverpage è una **"finestra di terminale" scura** su entrambi i temi. Icona: glifo `>_` (favicon = tile scuro + glifo bianco; logo coverpage = glifo bianco). L'accent tema-adattivo della **card nell'hub** è gestito in `../assets/hub.css` (`.card--term` con override su `html.dark`).

## Struttura
```
README.md        indice degli 8 capitoli
_coverpage.md    copertina docsify (hero "terminale")
_sidebar.md      navigazione (link assoluti /docs/NN-*.md; alias in app.js)
docs/            8 capitoli (NN-kebab-italiano.md)
assets/          styles.css, app.js, favicon.svg, terminale-logo.svg
index.html       app docsify (senza playground; prism-bash)
```

## Template di un capitolo
```markdown
# NN · <Titolo>

<Intro-definizione in prosa: cos'è e a cosa serve, subito sotto il titolo.>

## <Sezione>

<Prosa distesa; i comandi in backtick.>

| Comando | Cosa fa |
|---------|---------|
| ...     | ...     |

```bash
# esempio eseguibile e commentato
comando --opzione argomento
```

<Uno schema SVG inline dove il concetto è spaziale (albero del filesystem,
risoluzione lungo il PATH, stream e pipe): regole SVG del root, currentColor,
verifica in WebKit.>

> [!tip]
> <cosa ricordare>

> [!warning]
> <insidia / comando distruttivo>

## Ripasso lampo

<details>
<summary><domanda></summary>

<risposta concisa>

</details>

(3–5 domande in `<details>` pieghevoli; backtick della domanda resi `<code>` nel `<summary>`.)
```

## Callout
`> [!tip]` (da ricordare) e `> [!warning]` (insidie / distruttivo) **senza** titolo custom; `> [!info]` con titolo quando informativo. Le risposte del **Ripasso lampo** vanno nel `<details>` nativo, non in un callout.

## Diagrammi — visual-first
Vale il principio *visual-first* del root: dove un concetto ha una dimensione spaziale (albero del filesystem, PATH come lista di cartelle, stdin/stdout/stderr e pipe, ordine dei file di avvio) si aggiunge un **SVG inline**. Regole SVG del root: `currentColor`, `var(--bg)`/`var(--link)`, nessun colore custom (dark-safe), escaping di `&`/`<`/`>`, e **verifica obbligatoria in WebKit** (`python3 scripts/svg-preview.py`) prima di committare — resa *e* correttezza, una figura per volta.

## Checklist manutenzione (quando aggiungi/rinomini un capitolo)
- [ ] `_sidebar.md` — voce nel gruppo giusto (link assoluto `/docs/NN-*.md`).
- [ ] `README.md` — riga nell'indice.
- [ ] Wikilink incrociati `[[NN-...]]` dai/ai capitoli correlati.
- [ ] Rimando al **glossario** (NPM/NPX/NVM ecc. sono definiti lì — *una fonte di verità*).
- [ ] **SVG** verificato in WebKit dove la voce è visiva.
