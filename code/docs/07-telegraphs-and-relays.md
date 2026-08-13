# 07 · Telegrafi e relè
> cap. 7 di «Code» (Petzold, 2ª ed.) — orig. *Telegraphs and Relays*

Il capitolo 6 si è chiuso con un desiderio preciso: un dispositivo che faccia logica **da solo**, comandato dall'elettricità e non dalla mano. La risposta arriva da un'invenzione dell'Ottocento, il **telegrafo**, e dal componente che lo rendeva possibile sulle lunghe distanze: il **relè**. È il pezzo che, nel prossimo capitolo, diventerà una porta logica.

## Samuel Morse e l'idea del telegrafo

Samuel Finley Breese Morse nacque nel **1791** a Charlestown, Massachusetts. Prima di essere l'inventore che tutti ricordano fu un affermato **ritrattista** (il suo *General Lafayette* del 1825 è al municipio di New York) e un pioniere della **fotografia** (imparò il dagherrotipo da Louis Daguerre e lo insegnò a Mathew Brady). Ma è per il telegrafo e per il codice che porta il suo nome che lo si ricorda.

Prima del telegrafo, la comunicazione era **istantanea solo a portata di voce o di vista** (il *semaforo*, cioè bracci o bandiere su colline, in schemi codificati); su lunghe distanze viaggiava lenta, affidata a cavalli, treni e navi. L'idea del telegrafo elettrico è la stessa della torcia a distanza del [capitolo 5](05-communicating-around-corners.md): fai qualcosa a un capo del filo e succede qualcosa all'altro capo. Morse però non poteva usare una lampadina (sarebbe stata inventata solo nel 1879): sfruttò invece l'**elettromagnetismo**.

## L'elettromagnete

Nel 1820 il fisico danese Hans Christian Ørsted mostrò che una corrente elettrica devia l'ago di una bussola; da lì, con Faraday e Maxwell, nacque l'elettromagnetismo. Il fatto pratico che serve è semplice: se si avvolgono molte spire di filo sottile attorno a una barra di ferro e vi si fa passare corrente, la barra **diventa una calamita** e attira altri pezzi di ferro; tolta la corrente, il magnetismo sparisce.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 340 150" role="img" aria-label="Un elettromagnete: bobina attorno a una barra di ferro, alimentata da una batteria tramite un interruttore" style="width:100%;max-width:360px;height:auto;color:inherit">
  <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
    <path d="M35 45 V65"/><rect x="26" y="65" width="18" height="36" rx="3"/><path d="M35 101 V125 H150"/>
    <path d="M35 45 H75"/><path d="M105 45 H150 V72"/>
    <circle cx="75" cy="45" r="2.6" style="fill:var(--link,#059669)"/><circle cx="105" cy="45" r="2.6" style="fill:var(--link,#059669)"/><path d="M75 45 L100 37"/>
  </g>
  <!-- nucleo di ferro -->
  <rect x="150" y="72" width="120" height="30" rx="4" fill="currentColor" opacity=".12" stroke="currentColor" stroke-width="1.4"/>
  <!-- avvolgimenti -->
  <g fill="none" style="stroke:var(--link,#059669)" stroke-width="2">
    <ellipse cx="168" cy="87" rx="7" ry="22"/><ellipse cx="188" cy="87" rx="7" ry="22"/><ellipse cx="208" cy="87" rx="7" ry="22"/><ellipse cx="228" cy="87" rx="7" ry="22"/><ellipse cx="248" cy="87" rx="7" ry="22"/>
  </g>
  <path d="M256 65 H150" fill="none" style="stroke:var(--link,#059669)" stroke-width="0"/>
  <!-- chiodo attratto -->
  <rect x="286" y="83" width="22" height="7" rx="2" fill="currentColor"/>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7"><text x="210" y="128" text-anchor="middle">barra di ferro + spire</text><text x="297" y="105" text-anchor="middle">ferro</text></g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Chiudendo l'interruttore, la corrente scorre nelle spire e la barra di ferro diventa una calamita che attira il pezzo di ferro a destra. Aprendolo, il magnetismo svanisce.</figcaption>
</figure>

Sembra un corto circuito, ma il filo è così sottile da avere resistenza a sufficienza. Questo componente — un interruttore a un capo che "fa succedere qualcosa" all'altro capo — è il fondamento del telegrafo.

## Tasto, sounder e "What hath God wrought"

Per **trasmettere** si usa il **tasto** (*key*), in sostanza un interruttore fatto per essere azionato in fretta: un tocco breve è un punto, uno più lungo una linea. Al **ricevitore**, un elettromagnete tira un braccio metallico: in origine il braccio muoveva un pennino che tracciava punti e linee su un rotolo di carta, ma gli operatori impararono presto a *ascoltare* il rimbalzo, e il pennino fu sostituito dal **sounder**, che fa "click" quando la corrente arriva e "clack" quando cessa (click-clack veloce = punto, lento = linea).

Notificato l'ufficio brevetti nel 1836 e ottenuto il finanziamento del Congresso, il **24 maggio 1844** una linea tra Washington e Baltimora trasmise il celebre messaggio *"What hath God wrought!"*. Tasto, sounder, batteria e fili si collegano come la torcia del capitolo 5: con l'alta tensione basta **un filo** (la Terra fa da ritorno) e si usa la **V** al posto della batteria a massa. È l'inizio della comunicazione moderna — la prima più veloce di un cavallo — e, cosa notevole, si basa su un **codice binario**.

## Il problema della distanza → il relè

C'è però il limite già visto nel capitolo 5: **più lungo è il filo, più resistenza**, e il segnale si indebolisce. Le linee arrivavano a ~300 volt su ~300 miglia, ma non oltre. La soluzione è un **sistema a relè**: ogni paio di centinaia di miglia, una persona con tasto e sounder **riceve** il messaggio e lo **ritrasmette** con energia fresca.

Immagina di essere tu quell'addetto, in una capanna tra New York e la California: dalla finestra a est arriva un filo collegato a un sounder, il tuo tasto è collegato a una batteria e a un filo che esce a ovest. A furia di ripetere, noti che il braccio del sounder rimbalza esattamente come rimbalza il tasto — così colleghi i due con un pezzo di legno e dello spago, e il ritrasmettitore **funziona da solo**. Questo dispositivo, che Morse aveva capito da subito, si chiama **relè** (o *repeater*): una corrente in ingresso alimenta un elettromagnete che tira una leva; ma la leva è parte di un **interruttore che collega una batteria all'uscita**. Così un segnale in ingresso **debole** viene "amplificato" in un segnale in uscita **forte**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 340 205" role="img" aria-label="Schema di un relè: la corrente In aziona l'elettromagnete che tira la leva e chiude il contatto verso Out, alimentato da V" style="width:100%;max-width:360px;height:auto;color:inherit">
  <rect x="80" y="40" width="200" height="140" rx="8" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".45"/>
  <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
    <!-- V alimenta il perno della leva -->
    <path d="M150 30 V62"/>
    <circle cx="150" cy="62" r="3.5" style="fill:var(--link,#059669)"/>
    <!-- leva (armatura) tirata giù: dal perno al contatto Out -->
    <line x1="150" y1="62" x2="232" y2="108"/>
    <!-- contatto e uscita -->
    <circle cx="236" cy="110" r="3.5" style="fill:var(--link,#059669)"/><path d="M236 110 H312"/>
    <!-- In verso la bobina -->
    <path d="M28 150 H150"/>
    <!-- ritorno bobina a massa -->
    <path d="M205 168 V182"/><line x1="193" y1="182" x2="217" y2="182"/><line x1="197" y1="187" x2="213" y2="187"/><line x1="201" y1="191" x2="209" y2="191"/>
  </g>
  <!-- elettromagnete (bobina) -->
  <rect x="150" y="130" width="4" height="38" fill="currentColor" opacity=".3"/>
  <g fill="none" style="stroke:var(--link,#059669)" stroke-width="2">
    <ellipse cx="165" cy="149" rx="6" ry="19"/><ellipse cx="181" cy="149" rx="6" ry="19"/><ellipse cx="197" cy="149" rx="6" ry="19"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13" font-weight="700"><text x="150" y="26" text-anchor="middle">V</text><text x="20" y="154">In</text><text x="316" y="114">Out</text></g>
  <text x="182" y="200" text-anchor="middle" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7">elettromagnete</text>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Quando la corrente <strong>In</strong> percorre l'elettromagnete, questo attira la leva verso il basso: la leva chiude il contatto e collega <strong>V</strong> all'uscita <strong>Out</strong>. Un ingresso debole comanda un'uscita forte e fresca.</figcaption>
</figure>

I nomi *In* e *Out* descrivono i fili che entrano ed escono dalla capanna, ma valgono anche come **ingresso** e **uscita** di un segnale elettrico: il segnale *In* provoca un cambiamento nel segnale *Out*. È **causa ed effetto**.

## Un interruttore comandato dall'elettricità

Ed ecco il punto che apre tutto il resto del libro. Il relè è un **interruttore**, sì, ma un interruttore acceso e spento **non da una mano, bensì da una corrente elettrica**. Nel capitolo 6 gli interruttori in serie e in parallelo facevano logica, ma andavano azionati a mano; il relè fa esattamente quel lavoro **in automatico**, e l'uscita di un relè può azionare l'ingresso di un altro. Con dispositivi del genere — come suggerisce Petzold — "si potrebbe davvero assemblare gran parte di un computer". È proprio ciò che faremo nel prossimo capitolo, collegando i relè per costruire le **porte logiche**.

> [!tip]
> Il relè in una frase: **un interruttore azionato da un elettromagnete** invece che dalla mano. Questa singola idea — *In* comanda *Out* per via elettrica — è il mattone da cui, combinandolo, nascono le porte logiche e quindi il processore.

> [!warning]
> Non confondere i due ruoli del relè: da telegrafo è un **ripetitore** (rinfresca un segnale debole su lunghe distanze); da mattone logico è un **interruttore comandato elettricamente**. È lo stesso dispositivo, letto in due modi.

## Ripasso lampo

<details>
<summary>Perché Morse non poté usare una lampadina, e cosa usò al suo posto?</summary>

Perché la lampadina a incandescenza sarebbe stata inventata solo nel **1879**, decenni dopo. Morse sfruttò invece l'**elettromagnetismo**: un elettromagnete (bobina attorno a una barra di ferro) che si attiva e disattiva con la corrente all'altro capo del filo.

</details>

<details>
<summary>Come funziona il ricevitore del telegrafo (il sounder)?</summary>

Un **elettromagnete** tira un braccio metallico: quando la corrente arriva fa "click", quando cessa il braccio torna su e fa "clack". Click-clack veloce = punto, lento = linea. In origine il braccio muoveva un pennino che scriveva punti e linee su carta, poi bastò ascoltare.

</details>

<details>
<summary>Qual è il problema delle lunghe distanze, e come si risolve?</summary>

La **resistenza** del filo (vista nel cap.5) indebolisce il segnale: oltre un certo tratto (~300 miglia) non arriva più. Si risolve con un **sistema a relè**: ogni paio di centinaia di miglia si riceve il segnale e lo si **ritrasmette** con energia fresca.

</details>

<details>
<summary>Cos'è un relè e in che senso "amplifica" il segnale?</summary>

È un dispositivo in cui una corrente **in ingresso** alimenta un elettromagnete che tira una leva; la leva è parte di un **interruttore che collega una batteria (V) all'uscita**. Così un ingresso **debole** comanda un'uscita **forte e fresca**: non amplifica l'energia in sé, ma usa il segnale debole per *comandare* una nuova sorgente (è un ripetitore).

</details>

<details>
<summary>Perché il relè è la chiave verso il computer?</summary>

Perché è un **interruttore comandato dall'elettricità**, non dalla mano. Gli interruttori del cap.6 facevano logica ma andavano azionati manualmente; i relè fanno lo stesso **in automatico**, e l'uscita di uno può comandare l'ingresso di un altro. Collegandoli si costruiscono le **porte logiche** (cap.8) e, da lì, il processore.

</details>

**In sintesi:**

- Il **telegrafo** di Morse (1844) porta l'idea della "torcia a distanza" del cap.5 nel mondo reale, usando l'**elettromagnete** (niente lampadina, non ancora inventata) e un **codice binario** (punto/linea).
- Su lunghe distanze la **resistenza** indebolisce il segnale: servono stazioni a **relè** che ricevono e ritrasmettono.
- Il **relè** è un elettromagnete che aziona un interruttore collegato a una batteria fresca: un ingresso debole comanda un'uscita forte (ripetitore).
- Soprattutto, il relè è un **interruttore comandato dall'elettricità**: combinandolo si fa logica in automatico — la base delle **porte logiche** del prossimo capitolo.
