# Dev Notes — regole comuni

Monorepo di appunti di studio personali, pubblicati come **hub** di 6 siti [docsify](https://docsify.js.org/) statici e indipendenti (zero build): [`git/`](git/), [`javascript/`](javascript/), [`typescript/`](typescript/), [`angular/`](angular/), [`css/`](css/), [`glossario/`](glossario/). Vedi [README.md](README.md) per l'architettura del sito.

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

## Organizzazione
- **Una fonte di verità**: un concetto è spiegato in un solo punto; gli altri file rimandano con un link, non riscrivono.
- Terminologia coerente in tutto il vault.

## Diagrammi
Mermaid **solo dove rende davvero** (flussi, gerarchie, sequenze non banali), non ovunque. **Nessun colore custom** (`classDef`/`style` con `fill` fissi): i siti hanno tema chiaro/scuro, i colori hardcoded rompono il dark mode → distinguere con le **forme**, non con i colori.

## Workflow di scrittura
Quando l'utente chiede di scrivere o modificare una nota (di solito linkando un file):
1. **Identifica il vault** dal path del file → si applicano root `CLAUDE.md` + il `CLAUDE.md` di quella cartella.
2. **Segui il template/scheletro** del vault (definito nel suo `CLAUDE.md`).
3. **Verifica l'accuratezza** (regole qui sopra) prima di scrivere.
4. **Stile coerente col contorno**: registro, callout e struttura come le note vicine.
5. **Aggiorna i file di supporto** (indice, `_sidebar.md`, glossario…) secondo la checklist del `CLAUDE.md` di cartella quando aggiungi o rinomini una nota.
