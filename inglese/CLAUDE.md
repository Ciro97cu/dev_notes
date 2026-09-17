# inglese/ — regole specifiche

Vault docsify **privato e cifrato** per lo studio della **lingua inglese** (grammatica di base, dubbi comuni degli italiani, parole che sembrano sinonimi, falsi amici, verbi irregolari, esercizi). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). L'architettura cifrata è in [README.md](README.md) (identica a `civica/`).

## Fonte e taglio
Nasce da una guida PDF personale («Inglese — Teoria fondamentale e dubbi comuni»), **verificata** e da **ampliare** con i temi mancanti. Il taglio è pratico: spiegare la regola, mostrare l'uso, segnalare l'errore tipico di chi parla italiano.

## Voce e formato
- Voce **professore** del [root](../CLAUDE.md): prosa distesa in **italiano**, impersonale; ogni regola aperta da una frase che dice cos'è e a cosa serve.
- **Esempi in inglese in grassetto, seguiti dalla traduzione italiana in corsivo**, come nella fonte:
  `**She lives near the station.** — *Vive vicino alla stazione.*`
- I **termini grammaticali inglesi** (Present Perfect, phrasal verb, countable…) restano in inglese; in backtick i costrutti quando serve precisione.
- Le **tabelle** (tempo/struttura/esempio, quantificatori, preposizioni, verbi irregolari…) sono il formato naturale di molte sezioni: usarle dove la fonte le usa.
- Gli **errori tipici** vanno in callout `> [!warning]` (o `> [!warning|label:Attenzione]`), come i box «Attenzione» della fonte.

## Accuratezza (fondamentale)
L'utente studia su queste note e **non può cogliere un errore** su una lingua che sta imparando: ogni regola, forma verbale, aliquota d'uso e soluzione degli esercizi va **verificata**. In caso di dubbio su usi/varianti (UK/US, registro), controllare una fonte affidabile (dizionari Cambridge/Oxford/Merriam-Webster) prima di scrivere. Contenuto aggiunto rispetto alla guida di partenza si integra e basta (non serve marcarlo), purché corretto.

## Visual-first
Dove un concetto ha una dimensione visiva (la logica dei tempi verbali, la scelta Present Perfect vs Past Simple su una linea del tempo, la mappa delle preposizioni at/on/in), un **SVG inline** aiuta e ci va (principio del [root](../CLAUDE.md#diagrammi)): `currentColor`, riquadri `fill="var(--bg,#fff)"`, accento `fill="var(--link,#2f5c8a)"`, escaping di `&`/`<`/`>`, e **verifica in WebKit** prima di committare.

## Struttura (piatta) e ordinamento LOGICO
Come `civica/`: contenuti in `_plain/` (gitignored), un file per tema. L'ordine di sidebar/indice segue una **logica didattica**, non l'ordine in cui scrivo: dalle fondamenta all'uso. Bozza di percorso:
1. **Fondamenti**: tempi verbali → articoli e nomi (numerabili, plurali) → pronomi e dimostrativi → ordine delle parole, there is/are, domande.
2. **Costruzioni**: quantificatori → comparativi → modali (+ deduzione e modali al passato) → gerundio/infinito → condizionali (+ wish) → passivo (+ causativo) → relative → discorso indiretto → phrasal verbs → connettivi.
3. **Lessico**: parole che sembrano sinonimi → falsi amici → UK vs US.
4. **Riferimento**: preposizioni → verbi irregolari → regole di spelling.
5. **Esercizi** (con soluzioni).

Le nuove note vanno inserite **al loro posto logico**, non in coda.

## Callout e Ripasso lampo
Callout con **sintassi a pipe** (`> [!tipo|label:Titolo]`, vedi [root](../CLAUDE.md)). Dove utile, chiudere una nota con **`## Ripasso lampo`** in box `<details>` pieghevoli (domanda nel `<summary>`), stile del monorepo.

## Checklist quando aggiungi/rinomini una nota
- [ ] `_plain/_sidebar.md` — voce al **posto logico** del gruppo giusto.
- [ ] `_plain/README.md` — riga nell'indice, stesso ordine della sidebar.
- [ ] Esempi in grassetto + traduzione in corsivo; termini grammaticali in inglese.
- [ ] Regola **verificata**; errori tipici in callout Attenzione.
- [ ] SVG dove il tema ha una dimensione visiva, verificato in WebKit.
- [ ] Il vault resta **fuori dall'hub**.
