# civica/ — regole specifiche

Vault docsify **privato e cifrato** di educazione civica: capire la società di cui si fa parte (fisco, Stato, istituzioni, attualità, termini politici). Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche. L'architettura cifrata è spiegata in [README.md](README.md).

## Flusso di lavoro (importante)
Il vault nasce da un'esigenza precisa: **un argomento al giorno**, non liste che non si leggono. In chat l'utente dice un argomento (una sigla, un termine, una situazione di attualità); io scrivo la nota in chiaro in `_plain/`, poi **è l'utente a cifrare e committare**.

- **Io scrivo solo in `_plain/`** (testo in chiaro, gitignored). Non tocco `content.enc`/`crypto.json`: li rigenera l'utente con `node civica/encrypt.mjs` usando **la sua** passphrase, che **non devo mai conoscere né chiedere**.
- **Mai** mettere testo in chiaro in un commit; **mai** committare `_plain/`. Committo solo la macchineria (`index.html`, `assets/`, `encrypt.mjs`, doc). I cifrati li committa l'utente dopo aver cifrato.
- Il push lo fa l'utente (vedi regola dell'hub).

## Contenuto e voce
- Voce **professore** del [root](../CLAUDE.md): prosa distesa e discorsiva in italiano, impersonale, ogni tecnicismo sciolto alla prima occorrenza. Il lettore parte da zero: niente gergo dato per scontato (una sigla si apre spiegandola).
- Ogni nota è **autosufficiente** e apre con una frase-definizione (cos'è, a cosa serve) prima dei dettagli.
- **Una fonte di verità**: i termini ricorrenti (imposta, tassa, tributo, erario, gettito, aliquota…) stanno nel [glossario](_plain/glossario.md). Se serve rimandarci, si **linka la parola stessa** in prosa (es. l'*[erario](glossario.md)*), **mai** con una clausola meta tipo *«per i termini X e Y usati qui, vedi il glossario»* o *«(vedi il glossario)»*: è voce reattiva/meta, vietata dal [root](../CLAUDE.md). Nel dubbio, spiegare il termine in una parola sul posto e basta.
- **Accuratezza con fonte ufficiale**: i dati (aliquote, regole, cifre) vanno verificati sulla fonte istituzionale (Agenzia delle Entrate, Gazzetta Ufficiale, siti .gov) e la voce chiude con *Fonte* + data di verifica. Le regole cambiano nel tempo: segnalare che vanno ricontrollate.

## Visual-first
Dove un concetto ha una dimensione visiva (un flusso, una filiera, una gerarchia, una relazione), va un **SVG inline** — non è opzionale (principio del [root](../CLAUDE.md#diagrammi)). docsify rende gli SVG nativamente. Valgono le regole SVG del root: `currentColor` per testi e tratti, riquadri `fill="var(--bg,#fff)"`, accento `fill="var(--link,#1c7d70)"`, escaping di `&`/`<`/`>`, e **verifica obbligatoria in WebKit** (`python3 scripts/svg-preview.py` o `qlmanage`) prima di committare — resa *e* correttezza. Esempio: la filiera dell'IVA in [_plain/iva.md](_plain/iva.md).

## Struttura (piatta)
```
_plain/            contenuti IN CHIARO (gitignored)
  README.md        home/indice
  _sidebar.md      navigazione
  _coverpage.md    copertina
  <argomento>.md   una nota per argomento (filename kebab, es. iva.md)
  glossario.md     termini ricorrenti
content.enc        blob cifrato di tutto _plain/ (lo genera l'utente)
crypto.json        salt/iterazioni + verificatore (pubblici)
index.html         cancello + bootstrap docsify differito
assets/            app.js (config $docsify), gate.js (cancello+cifratura), styles.css, favicon/logo
encrypt.mjs        cifratore locale
```

## Callout e Ripasso lampo
Come gli altri vault docsify: callout con **sintassi a pipe** (`> [!tipo|label:Titolo]`, vedi [root](../CLAUDE.md)); l'auto-valutazione a fine nota è la sezione **`## Ripasso lampo`** con box `<details>` pieghevoli (`<summary>` = domanda). Il reso di callout e `<details>` è già stilizzato in `assets/styles.css`.

## Checklist quando aggiungi/rinomini una nota
- [ ] `_plain/_sidebar.md` — voce nel gruppo giusto.
- [ ] `_plain/README.md` — riga nell'indice degli argomenti.
- [ ] Termini nuovi ricorrenti → aggiunti al [glossario](_plain/glossario.md), con link dalla nota.
- [ ] **SVG inline** dove la nota ha una dimensione visiva, verificato in WebKit.
- [ ] *Fonte* ufficiale + data di verifica in fondo.
- [ ] Il vault resta **fuori dall'hub** (nessuna card/voce in index.html, hub.js, ricerca).
