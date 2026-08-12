# 05 · Comunicare dietro l'angolo
> cap. 5 di «Code» (Petzold, 2ª ed.) — orig. *Communicating Around Corners*

Il nuovo migliore amico abita nella casa **accanto**, ma le finestre delle camere guardano nella stessa direzione: le torce, che funzionano solo in linea di vista, non bastano più. La soluzione è costruire torce "fatte in casa" con batterie, lampadine, interruttori e **fili**, e tirare i fili da una casa all'altra. È un passaggio enorme: con i fili ci si libera del vincolo della linea di vista e, in prospettiva, della distanza — è la nascita del **telegrafo**. Lungo la strada incontriamo due idee che torneranno ovunque: il **comune** e la **Terra usata come conduttore**.

## Dalla torcia ai fili

Il primo esperimento: batteria e interruttore nella tua stanza, due fili che escono dalla finestra, scavalcano la recinzione ed entrano nella stanza dell'amico, dove alimentano una lampadina. Chiudi l'interruttore e la lampadina si accende a casa sua: puoi mandare Morse. Aggiungendo un secondo circuito identico (batteria e interruttore da lui, lampadina da te) la comunicazione diventa **bidirezionale**: due circuiti indipendenti, ognuno un cerchio a sé. In tutto, però, servono **quattro fili** che attraversano la recinzione.

Da qui in poi i circuiti si disegnano in modo più **simbolico** che realistico. L'interruttore ha due stati:

<figure style="margin:.8rem 0;text-align:center">
<svg viewBox="0 0 300 60" role="img" aria-label="Simbolo dell'interruttore: aperto e chiuso" style="width:100%;max-width:300px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <path d="M20 40 H70"/><circle cx="70" cy="40" r="3.5" fill="currentColor"/><line x1="70" y1="40" x2="104" y2="22"/><circle cx="110" cy="40" r="3.5" fill="currentColor"/><path d="M110 40 H140"/>
    <path d="M190 40 H240"/><circle cx="240" cy="40" r="3.5" fill="currentColor"/><line x1="240" y1="40" x2="280" y2="40"/><circle cx="280" cy="40" r="3.5" fill="currentColor"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" opacity=".8" text-anchor="middle"><text x="80" y="58">aperto (off)</text><text x="235" y="58">chiuso (on)</text></g>
</svg>
</figure>

## Il "comune": da quattro fili a tre

Con un po' di astuzia si può eliminare uno dei quattro fili. Basta **unire i terminali negativi** delle due batterie con un unico filo condiviso: quel collegamento in comune tra i due circuiti si chiama **comune** (nei disegni i fili connessi si segnano con un pallino). I due cerchi continuano a funzionare in modo indipendente anche se ora sono uniti; e c'è una curiosità: quando **entrambe** le lampadine sono accese, nel tratto comune **non passa corrente**. Il risultato è che i fili che attraversano la recinzione scendono da quattro a tre.

| Configurazione | Fili tra le due case |
|---|:--:|
| Due circuiti indipendenti | 4 |
| Con il **comune** (negativi uniti) | 3 |
| Con la **Terra** come ritorno (serve alta tensione) | 2 |

## La Terra come conduttore

E l'ultima riga della tabella? Il trucco è che, una volta stabilito un tratto **comune**, non serve per forza un filo per realizzarlo: lo si può sostituire con qualcosa di enorme, una sfera di circa **7900 miglia** di diametro fatta di metallo, roccia, acqua e materia organica — la **Terra**. Il terreno non è un ottimo conduttore (la terra umida conduce meglio della sabbia asciutta), ma vale la regola dei conduttori: **più è grande, meglio conduce**, e la Terra è semplicemente enorme. Per sfruttarla non basta infilare un filo nel terreno: serve un contatto ad **ampia superficie**, tipicamente un palo di rame lungo almeno 8 piedi (o i tubi di rame dell'acqua fredda).

Il contatto elettrico con il terreno si chiama *earth* in Inghilterra e **ground** ("massa") in America, e si disegna con questo simbolo: <svg viewBox="0 0 40 40" style="height:1.3em;width:auto;vertical-align:-.35em;color:inherit"><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="20" y1="9" x2="20" y2="21"/><line x1="8" y1="21" x2="32" y2="21"/><line x1="12" y1="27" x2="28" y2="27"/><line x1="16" y1="33" x2="24" y2="33"/></g></svg> . Con batterie ad **alta tensione**, la Terra può fare da secondo conduttore: basta allora **un solo filo** tra le case, e il ritorno passa nel terreno.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 210" role="img" aria-label="Telegrafo a un filo: la Terra fa da conduttore di ritorno" style="width:100%;max-width:480px;height:auto;color:inherit">
  <rect x="0" y="172" width="470" height="38" fill="currentColor" opacity="0.07"/>
  <line x1="0" y1="172" x2="470" y2="172" stroke="currentColor" stroke-width="1" opacity=".3"/>
  <text x="235" y="196" text-anchor="middle" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" opacity=".6">Terra — sorgente e mare di elettroni</text>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" opacity=".75" text-anchor="middle">
    <text x="60" y="22">Casa tua</text><text x="410" y="22">Casa amico</text>
  </g>
  <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
    <path d="M60 50 H150"/><path d="M150 50 H190"/><path d="M190 50 H393"/>
    <path d="M60 50 V150"/><path d="M410 65 V150"/>
    <circle cx="150" cy="50" r="3" style="fill:var(--link,#059669)"/><circle cx="190" cy="50" r="3" style="fill:var(--link,#059669)"/>
    <circle cx="410" cy="50" r="15" style="fill:var(--link,#059669);fill-opacity:.18"/>
    <path d="M403 50 l4 -6 l4 11 l4 -6"/>
    <g><line x1="410" y1="30" x2="410" y2="24"/><line x1="432" y1="50" x2="438" y2="50"/><line x1="388" y1="50" x2="382" y2="50"/></g>
    <g><line x1="60" y1="150" x2="60" y2="162"/><line x1="49" y1="162" x2="71" y2="162"/><line x1="53" y1="167" x2="67" y2="167"/><line x1="56" y1="172" x2="64" y2="172"/></g>
    <g><line x1="410" y1="150" x2="410" y2="162"/><line x1="399" y1="162" x2="421" y2="162"/><line x1="403" y1="167" x2="417" y2="167"/><line x1="406" y1="172" x2="414" y2="172"/></g>
  </g>
  <text x="46" y="106" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="15" font-weight="700">V</text>
  <text x="170" y="40" text-anchor="middle" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7">interruttore</text>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un solo filo tra le case: la corrente torna attraverso la <strong>Terra</strong>, collegata a entrambe le estremità con la massa. La <strong>V</strong> a sinistra è il generatore.</figcaption>
</figure>

Vale la pena immaginare la Terra non come un filo, ma come un **oceano di elettroni**: *la Terra sta agli elettroni come l'oceano sta alle gocce d'acqua*, sorgente e serbatoio praticamente infiniti. La Terra ha però una **sua resistenza**, ed è per questo che il trucco funziona solo con alte tensioni: con le pile da 1,5 V la resistenza del terreno è troppa.

## Il simbolo V e la "massa a potenziale zero"

Per non ridisegnare ogni volta una batteria col negativo a terra, si usa una **V** (sta per *voltage*, tensione): un filo che esce da una V equivale al filo collegato al **+** di una batteria il cui **−** è a massa. Un'immagine utile: la V è un **aspirapolvere di elettroni** e la Terra è l'oceano da cui li aspira, facendoli passare per il circuito e lavorare (accendere la lampadina). La massa, all'altro capo, è il **punto di potenziale zero**: come un mattone appoggiato a terra, non ha più "dove cadere".

Anche se ora il disegno non sembra più un cerchio, **lo è ancora**: sostituendo ogni V con la sua batteria e collegando tutti i simboli di massa, si ritrova il cerchio di partenza. Con due pali di rame, insomma, si ottiene un Morse bidirezionale con **due soli fili** che scavalcano la recinzione.

## Un passo avanti (e un limite)

Il bilancio è notevole: prima si comunicava solo **in linea di vista** e per la portata di una torcia; ora, con i fili, si comunica **dietro l'angolo**, oltre la linea di vista, e in teoria a grandi distanze allungando i fili. In teoria, appunto. Il rame è un buon conduttore ma non perfetto: **più il filo è lungo, più resistenza ha; più resistenza, meno corrente; meno corrente, luce più fioca.** È proprio questo limite a spingere verso l'invenzione successiva — il telegrafo con i suoi relè — nei prossimi capitoli.

> [!tip]
> Due idee da portare via: il **comune** (un tratto condiviso tra circuiti, che fa risparmiare fili) e la **massa** (la Terra come conduttore di ritorno *e* come mare di elettroni). Il simbolo **V + massa** è solo un modo compatto per disegnare "batteria col negativo a terra".

> [!warning]
> La Terra fa da conduttore **solo ad alta tensione**: ha troppa resistenza per le pile da 1,5 V. E "massa" (ground) a volte indica il *comune* di un circuito, a volte il collegamento fisico col terreno — qui è il terreno.

## Ripasso lampo

<details>
<summary>Perché con la casa accanto le torce non bastano più?</summary>

Perché le finestre guardano nella **stessa direzione**: non c'è linea di vista tra le due camere, e la torcia funziona solo in linea di vista. La soluzione è passare ai **fili**, che portano il segnale anche dietro l'angolo.

</details>

<details>
<summary>Cos'è il "comune" e quanti fili fa risparmiare?</summary>

È un **filo condiviso** tra i due circuiti, ottenuto unendo i loro terminali negativi. Porta i fili tra le case da **4 a 3** (−25%). Curiosità: quando entrambe le lampadine sono accese, nel tratto comune non scorre corrente.

</details>

<details>
<summary>Perché la Terra può fare da conduttore, e cosa serve per usarla?</summary>

Perché, pur non essendo un ottimo conduttore, è **enorme** (vale la regola "più grande, meglio conduce"). Serve un contatto ad **ampia superficie** (un palo di rame lungo ≥ 8 piedi, o i tubi dell'acqua) e serve **alta tensione**: con 1,5 V la resistenza del terreno è troppa.

</details>

<details>
<summary>Cosa rappresenta il simbolo <strong>V</strong>?</summary>

Un **generatore**: un filo che esce da una V equivale al filo collegato al **+** di una batteria col **−** a massa. La V "aspira" elettroni dalla Terra (un mare di elettroni) e li fa lavorare nel circuito; la massa è il **potenziale zero**, l'altro capo del cerchio.

</details>

<details>
<summary>Qual è il limite dei fili lunghi, e cosa prepara?</summary>

Più il filo è lungo, **più resistenza** ha → **meno corrente** → **luce più fioca**. Questo limite è ciò che rende necessari il **telegrafo e i relè** dei capitoli successivi, per rilanciare il segnale sulle lunghe distanze.

</details>

**In sintesi:**

- Sostituendo la torcia con **batteria + interruttore + fili**, si comunica **dietro l'angolo** e oltre la linea di vista: è il principio del **telegrafo**.
- Il **comune** (filo condiviso che unisce i negativi) riduce i fili tra le case da 4 a 3.
- La **Terra** può fare da conduttore di ritorno — è un **oceano di elettroni**, sorgente e serbatoio — se la tensione è alta; il simbolo **V + massa** riassume "batteria col negativo a terra".
- Il limite del rame (**più lungo = più resistenza = più fioco**) apre la strada al telegrafo e ai **relè**.
