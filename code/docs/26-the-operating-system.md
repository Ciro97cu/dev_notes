# 26 · Il sistema operativo
> cap. 26 di «Code» (Petzold, 2ª ed.) — orig. *The Operating System*

Al termine del capitolo 25 la macchina è, in teoria, completa: CPU, memoria, periferiche. Eppure manca ancora l'ingrediente che la rende viva e usabile: il **software** giusto. Due domande, in particolare, restano aperte. Primo: quando si accende il computer, come fa il primissimo pezzo di codice ad arrivare in memoria? Secondo: una volta avviato, chi gestisce i file su disco, chi coordina le periferiche, e chi offre ai programmi un modo comodo per usarle senza doverne conoscere ogni filo? La risposta a entrambe porta allo stesso protagonista: il **sistema operativo**.

## Come parte tutto: il bootstrap

Quando l'Intel 8080 viene acceso o resettato, comincia a eseguire codice macchina a un indirizzo preciso: `0000h`. Ci si aspetta quindi che lì ci sia già la prima istruzione da eseguire. Ma come ci è finita? Nei computer più primitivi la si inseriva a mano, con un **pannello di controllo** di interruttori simile a quello del capitolo 19 (con in più un tasto **Reset** collegato alla CPU). È scomodissimo. La soluzione elegante è mettere in una **ROM** un piccolo programma, il **bootstrap loader** (caricatore d'avvio): all'accensione, questo codice legge dal disco il primo settore, lo carica in memoria e lo esegue, e quel settore a sua volta carica il resto del sistema operativo. Il nome viene dall'idea, un po' paradossale, di "tirarsi su per i lacci dei propri stivali" (*to pull oneself up by one's bootstraps*) — da cui anche il verbo moderno *fare il boot*.

## Che cos'è un sistema operativo

Un **sistema operativo** (spesso abbreviato **SO**, in inglese OS) è lo strato di software che sta **tra l'hardware e i programmi applicativi**, e che gestisce le risorse della macchina offrendo a tutti un accesso ordinato. Lo si può vedere come una pila di livelli:

<figure>
<svg viewBox="0 0 382 244" role="img" aria-label="I livelli: l'utente usa le applicazioni tramite l'interfaccia utente (UI); le applicazioni usano il sistema operativo tramite l'API; il sistema operativo pilota l'hardware" style="width:100%;max-width:400px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="200.0" y="22" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Utente</text><path d="M200 30 L200 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M200 44 L195 35 L205 35 Z" fill="currentColor"/><rect x="70" y="44" width="260" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="200.0" y="75.0" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Applicazioni (programmi)</text><rect x="70" y="112" width="260" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="200.0" y="135" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Sistema operativo</text><text x="200.0" y="153" font-size="9" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">file system · shell · driver · API</text><rect x="70" y="180" width="260" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="200.0" y="203" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Hardware</text><text x="200.0" y="221" font-size="9" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">CPU · RAM · periferiche</text><path d="M200 98 L200 112" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M200 166 L200 180" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><text x="342" y="40" font-size="10" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">UI</text><text x="342" y="107" font-size="10" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">API</text></g></svg>
<figcaption><em>I livelli. L'<strong>utente</strong> comanda le <strong>applicazioni</strong> tramite l'interfaccia utente (<strong>UI</strong>); le applicazioni chiamano il <strong>sistema operativo</strong> tramite l'<strong>API</strong>; il sistema operativo pilota l'<strong>hardware</strong>. Ogni livello nasconde i dettagli di quello sotto.</em></figcaption>
</figure>

Storicamente, il sistema operativo più importante per i microprocessori a 8 bit fu **CP/M** (all'inizio *Control Program/Monitor*, poi *Control Program for Microcomputers*), scritto a metà degli anni '70 per l'Intel 8080 da **Gary Kildall** (1942-1994), fondatore della Digital Research (DRI). Serve da modello per questo capitolo.

## Il file system

Una delle funzioni fondamentali di un SO è il **file system**, che organizza i dati sul disco in **file**, ciascuno con un **nome**. Il file system di CP/M, pur semplice, soddisfa due requisiti importanti. Primo: ogni file è identificato da un nome, anch'esso registrato sul disco. Secondo — meno ovvio ma cruciale — un file **non** deve occupare settori consecutivi: mentre si creano e cancellano file di dimensioni diverse, lo spazio libero si **frammenta**, e poter sparpagliare un file su settori non contigui è ciò che permette di sfruttarlo tutto. Una **tabella** sul disco tiene traccia di quali settori appartengono a quale file.

<figure>
<svg viewBox="0 0 450 116" role="img" aria-label="Un file occupa settori sparsi e non consecutivi sul disco; una tabella associa il file ai suoi settori" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="30" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="50.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">0</text><rect x="70" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="90.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">1</text><rect x="110" y="52" width="40" height="40" fill="var(--link,#059669)" stroke="currentColor" stroke-width="1.3"/><text x="130.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="#fff">2</text><rect x="150" y="52" width="40" height="40" fill="var(--link,#059669)" stroke="currentColor" stroke-width="1.3"/><text x="170.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="#fff">3</text><rect x="190" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="210.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">4</text><rect x="230" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="250.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">5</text><rect x="270" y="52" width="40" height="40" fill="var(--link,#059669)" stroke="currentColor" stroke-width="1.3"/><text x="290.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="#fff">6</text><rect x="310" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="330.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">7</text><rect x="350" y="52" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="370.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">8</text><rect x="390" y="52" width="40" height="40" fill="var(--link,#059669)" stroke="currentColor" stroke-width="1.3"/><text x="410.0" y="76.0" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="#fff">9</text><text x="230.0" y="38" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">settori del disco</text><text x="30" y="114" font-size="10" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">File A → settori 2, 3, 6, 9  (non consecutivi)</text></g></svg>
<figcaption><em>Un file può occupare settori <strong>sparsi</strong> sul disco (qui il 2, 3, 6, 9): è così che il file system usa anche lo spazio frammentato. Una tabella sul disco associa ogni file all'elenco dei suoi settori.</em></figcaption>
</figure>

In CP/M il nome di un file ha due parti: il **filename** (fino a 8 caratteri) e il **tipo** o **estensione** (fino a 3 caratteri), separati da un punto. Alcuni tipi sono standard: `TXT` indica un file di testo (solo codici ASCII, leggibile dagli umani), `COM` (da *command*) un file che contiene istruzioni in codice macchina — cioè un **programma**. Questa convenzione, detta **8.3** ("otto punto tre"), è sopravvissuta: i file system moderni hanno tolto i limiti di lunghezza, ma l'idea del nome-più-estensione è tuttora dappertutto.

## L'API: i servizi per i programmi

Perché un programma non debba conoscere i dettagli elettrici di ogni periferica, il sistema operativo gli mette a disposizione una collezione di **subroutine** già pronte: è l'**API** (*application programming interface*). In CP/M queste subroutine avevano un unico punto d'ingresso all'indirizzo `0005h`: un programma le invocava con un `CALL 0005h` (da cui il nome storico di interfaccia **"Call 5"**), specificando **quale** servizio voleva nel registro **C**:

| Registro C | Funzione CP/M |
|:---:|---|
| `01h` | Console Input — leggi un carattere dalla tastiera |
| `02h` | Console Output — scrivi un carattere sul display |
| `09h` | Print String — stampa una stringa di caratteri |
| `15h` | Open File — apri un file esistente |
| `16h` | Close File — chiudi un file |
| `20h` | Read Sequential — leggi byte dal file |
| `21h` | Write Sequential — scrivi byte nel file |
| `22h` | Make File — crea un nuovo file |

Dietro le quinte, l'indirizzo `0005h` contiene un'istruzione `JMP` che salta al codice vero del sistema operativo. Il programma applicativo, così, chiede *cosa* vuole senza sapere *come* venga fatto né su quale hardware: è la stessa idea dei livelli vista sopra.

## L'interfaccia utente: la shell

Se all'API guarda il programmatore, all'**interfaccia utente** (UI) guarda invece chi usa il computer. In CP/M la UI era un'**interfaccia a riga di comando** (*command-line interface*, CLI), gestita da un componente chiamato CCP (*console command processor*), l'antenato di quella che oggi si chiama **shell**: si digita il nome di un programma e il sistema lo carica ed esegue. Un sistema operativo ha dunque due volti: verso l'utente è la **UI**, verso il programmatore è l'**API**.

## Un po' di storia

Da CP/M la genealogia dei sistemi operativi si dirama. Il **MS-DOS** dei primi PC IBM ne ereditò molte idee. Poi vennero le interfacce **grafiche** di Windows e del Mac, e — sui dispositivi mobili — i sistemi di Apple e Android, con API diverse ma interfacce simili. A parte, e influentissimo, c'è **UNIX**, sviluppato nei primi anni '70 ai Bell Labs soprattutto da **Ken Thompson** (n. 1943) e **Dennis Ritchie** (1941-2011); il nome è un gioco di parole su *Multics*, un sistema precedente. UNIX fu concepito per essere **portabile** (adattabile a computer diversi) e diffuso nelle università dal 1973; da qui la sua "filosofia" — usare i file di testo come denominatore comune e concatenare tante piccole **utility** a riga di comando. Da questo ceppo, con il progetto **GNU** della *Free Software Foundation*, è poi nato tutto il mondo di **Linux**.

> [!tip]
> Un sistema operativo è, in fondo, un grande esercizio di **astrazione**: nasconde la complessità dell'hardware dietro concetti semplici e stabili — un *file* con un nome, una *stringa* da stampare, un *comando* da lanciare. Il programma dice cosa vuole, il SO sa come farlo. Ogni livello semplifica quello sopra ignorando i dettagli di quello sotto.

Anche con un sistema operativo che offre file e servizi, però, scrivere programmi in codice macchina o in assembly resta faticoso e legato a un singolo processore. Il passo successivo — rendere la programmazione più umana e indipendente dall'hardware — sono i **linguaggi ad alto livello**, protagonisti del capitolo 27.

## Ripasso lampo

<details>
<summary>Cos'è il <code>bootstrap</code> e perché si chiama così?</summary>

È il modo in cui il primo codice arriva in memoria all'accensione: un piccolo programma in **ROM** (il *bootstrap loader*) legge dal disco il primo settore, lo carica ed esegue, e quello carica il resto del sistema operativo. Il nome viene dall'idea paradossale di "tirarsi su per i lacci degli stivali" — da cui il verbo *fare il boot*.

</details>

<details>
<summary>Che cos'è un sistema operativo e dove si colloca?</summary>

È lo strato di software **tra l'hardware e i programmi applicativi** che gestisce le risorse della macchina (file system, periferiche) e offre a tutti un accesso ordinato. Verso l'utente presenta un'**interfaccia utente** (UI); verso i programmi, un'**API**.

</details>

<details>
<summary>Perché è importante che un file possa occupare settori non consecutivi?</summary>

Perché, creando e cancellando file di dimensioni diverse, lo spazio libero sul disco si **frammenta**. Se un file potesse stare solo in settori contigui, molto spazio resterebbe inutilizzabile. Potendolo sparpagliare su settori sparsi (con una tabella che li elenca), il file system sfrutta tutto lo spazio disponibile.

</details>

<details>
<summary>Cosa indica la convenzione <code>8.3</code>, e cosa sono i file <code>TXT</code> e <code>COM</code>?</summary>

Indica un nome di file fatto da un **filename** fino a 8 caratteri e un'**estensione** fino a 3, separati da un punto (di qui "otto punto tre"). `TXT` è un file di testo (solo ASCII, leggibile), `COM` è un file che contiene codice macchina, cioè un programma.

</details>

<details>
<summary>Cos'è l'<code>API</code> di un sistema operativo, e com'era realizzata in CP/M?</summary>

È la collezione di **subroutine** che il SO mette a disposizione dei programmi, così che non debbano toccare direttamente l'hardware. In CP/M avevano un punto d'ingresso a `0005h`: il programma faceva `CALL 0005h` (interfaccia "Call 5") indicando nel registro **C** quale servizio voleva (input/output da console, apertura/lettura/scrittura di file, ecc.).

</details>

<details>
<summary>Quali sono i "due volti" di un sistema operativo?</summary>

Verso l'**utente** è l'**interfaccia utente** (in CP/M una riga di comando gestita dalla shell); verso il **programmatore** è l'**API**, l'insieme di subroutine invocabili. Lo stesso SO serve entrambi, a livelli diversi.

</details>

**In sintesi:**
- All'accensione il primo codice arriva via **bootstrap**: una piccola ROM (*bootstrap loader*) carica il sistema operativo dal disco.
- Il **sistema operativo** sta tra hardware e applicazioni; le nasconde la complessità dell'hardware. Modello storico: **CP/M** (Kildall, DRI, 8080).
- Il **file system** dà ai dati dei **file** con un nome (convenzione **8.3**, tipi `TXT`/`COM`), memorizzati anche su **settori non consecutivi** grazie a una tabella.
- L'**API** offre ai programmi subroutine di servizio (in CP/M l'interfaccia **"Call 5"**); l'**interfaccia utente** (shell) serve invece chi usa il computer.
- La storia va da CP/M a MS-DOS, Windows/macOS, mobile, e soprattutto **UNIX** (Thompson e Ritchie) → **GNU/Linux**. Programmare resta però scomodo: servono i **linguaggi ad alto livello** (cap. 27).
