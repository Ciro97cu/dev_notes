# 17 · Feedback e flip-flop
> cap. 17 di «Code» (Petzold, 2ª ed.) — orig. *Feedback and Flip-Flops*

Fino a qui i circuiti costruiti hanno una qualità precisa: sono **senza memoria**. Il sommatore del capitolo 14 e il sommatore-sottrattore del 16 reagiscono agli ingressi del momento e nient'altro; tolti gli ingressi, non resta traccia di ciò che è passato. Sono quelli che si chiamano circuiti **combinatori**: l'uscita è una pura funzione degli ingressi presenti. Questo capitolo introduce l'ingrediente che mancava per fare un vero computer — la capacità di **ricordare** — e lo fa a partire da un'idea sola, tanto semplice quanto potente: rimandare l'uscita di un circuito **indietro** verso il suo stesso ingresso. Questo anello si chiama **feedback** (retroazione), e da esso nascono due cose che sembrano magia: un circuito che si muove da solo e un circuito che si ricorda le cose.

## Un circuito che si comanda da solo: il feedback

Si consideri un relè cablato in un modo particolare: invece di comandare un carico esterno, l'uscita del relè comanda il **proprio** elettromagnete. In altre parole, i contatti che il relè apre e chiude sono proprio quelli che alimentano la sua bobina. Chiudendo l'interruttore che avvia il tutto, la corrente attraversa l'elettromagnete, che attira il contatto flessibile; ma quel contatto, spostandosi, **interrompe** il circuito che alimenta l'elettromagnete stesso; senza corrente l'elettromagnete lascia andare il contatto, che torna al suo posto e **richiude** il circuito; la corrente riparte, l'elettromagnete riattira il contatto, e così via, all'infinito.

Il risultato è un relè che vibra da solo, aprendosi e chiudendosi molte volte al secondo: è esattamente il principio del **ronzatore** (buzzer) e del vecchio campanello elettrico. La novità concettuale è enorme. Ogni circuito visto finora aspettava che una **persona** chiudesse un interruttore; questo, una volta avviato, **si muove da sé**. È il feedback a renderlo possibile: l'uscita che torna a comandare l'ingresso crea un ciclo che non ha bisogno di nessuno per continuare.

> [!tip]
> **Feedback** vuol dire ricondurre l'uscita di un circuito verso il suo ingresso. È l'idea-madre del capitolo: a seconda di come lo si costruisce, un anello di retroazione può far **oscillare** un circuito (il ronzatore) oppure fargli **conservare** uno stato (il flip-flop).

## L'oscillatore e il clock

Un circuito che alterna la sua uscita tra 0 e 1 in modo autonomo, senza alcun intervento esterno, si chiama **oscillatore**. Il ronzatore è il primo esempio: la sua uscita è 1 quando il contatto è chiuso, 0 quando è aperto, e passa dall'uno all'altro in continuazione. Se si disegna quel valore nel tempo — il tempo che scorre in orizzontale, il valore 0/1 in verticale — si ottiene la caratteristica forma a gradini di un'**onda quadra**: un tratto in alto (1), un salto a 0, un tratto in basso, un salto a 1, e avanti a ritmo costante. Questo modo di disegnare un segnale che cambia nel tempo si chiama **diagramma di timing** ed è lo strumento con cui, d'ora in poi, si ragionerà su ciò che accade *quando*.

Un oscillatore che batte a ritmo regolare ha un nome più familiare: è un **clock** (orologio). Il nome non è casuale: contando quante volte oscilla si può misurare il tempo, ed è precisamente ciò che fa un orologio. Ogni computer ne ha uno al proprio interno che scandisce e sincronizza ogni operazione; nei calcolatori reali, al posto di un relè che sbatte, si usa la vibrazione stabilissima di un **cristallo di quarzo**, ma l'idea è la stessa. Quanto velocemente oscilla dipende da come è fatto. Il clock è il cuore pulsante della macchina, e il capitolo 18 lo userà per costruire, letteralmente, un orologio.

## Il flip-flop R-S: la prima memoria

Il feedback del ronzatore era "distruttivo": l'uscita spegneva la propria causa, e da qui l'oscillazione perpetua. Ma il feedback si può costruire anche in modo **stabile**, e allora accade qualcosa di completamente diverso. Si prendano due porte **NOR** e le si colleghino a incrocio: l'uscita di ciascuna torna a essere uno degli ingressi dell'altra. Questo circuito ha un nome storico, **flip-flop R-S**, e un merito che lo rende una pietra miliare: è il primo circuito capace di **ricordare**.

<figure>
<svg viewBox="0 0 360 212" role="img" aria-label="Flip-flop R-S: due porte NOR incrociate; l'uscita di ciascuna torna all'ingresso dell'altra, così il circuito ricorda l'ultimo comando" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="160" y="48" width="64" height="38" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="192.0" y="71.0" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">NOR</text><circle cx="230" cy="67.0" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="160" y="124" width="64" height="38" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="192.0" y="147.0" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">NOR</text><circle cx="230" cy="143.0" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M70 58 L160 58" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="62" font-size="12" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">R</text><path d="M70 152 L160 152" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="156" font-size="12" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">S</text><path d="M234 67 L300 67" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="312" y="71" font-size="13" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">Q</text><path d="M234 143 L300 143" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="312" y="147" font-size="13" text-anchor="start" font-weight="700" opacity="1" fill="currentColor">Q̅</text><path d="M270 67 L270 22 L120 22 L120 134 L160 134" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M286 143 L286 192 L100 192 L100 76 L160 76" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>
<figcaption><em>Flip-flop R-S: due NOR incrociate. L'uscita <strong>Q</strong> della porta in alto torna all'ingresso di quella in basso; l'uscita <strong>Q̄</strong> di quella in basso torna alla porta in alto. È questo anello che tiene in vita lo stato.</em></figcaption>
</figure>

I due ingressi si chiamano **S** (*Set*) e **R** (*Reset*), le due uscite **Q** e **Q̄** (si legge "Q negato", ed è sempre l'opposto di Q). Il comportamento è quello di un interruttore a memoria. Dare un impulso su **S** — cioè portare S a 1 per un istante e poi rilasciarlo — porta l'uscita Q a **1**, e Q **ci resta** anche quando S torna a 0. Dare un impulso su **R** porta Q a **0**, e anche stavolta Q ci resta. Con entrambi gli ingressi a riposo (0), il circuito non fa che **conservare** l'ultimo valore che gli è stato imposto: se l'ultimo comando è stato Set, ricorda 1; se è stato Reset, ricorda 0. Il flip-flop ha così **due stati stabili** — da cui il nome — e la sua uscita dice quale dei due ingressi è stato attivato per ultimo. È, in tutto e per tutto, una memoria da **un bit**.

| S (Set) | R (Reset) | Q | effetto |
|:---:|:---:|:---:|---|
| 0 | 0 | *invariato* | conserva il bit memorizzato |
| 1 | 0 | 1 | scrive 1 (*Set*) |
| 0 | 1 | 0 | scrive 0 (*Reset*) |
| 1 | 1 | — | **da evitare** (vedi sotto) |

> [!warning]
> Attivare **contemporaneamente** S e R è la combinazione proibita del flip-flop R-S. Con entrambi gli ingressi a 1, tutte e due le NOR danno in uscita 0, quindi Q e Q̄ non sono più l'uno l'opposto dell'altro: lo stato perde di significato. Peggio, se poi si rilasciano insieme, quale dei due stati "vince" dipende da corse infinitesimali tra i componenti ed è imprevedibile. La regola pratica è semplice: un comando alla volta.

## Ricordare un bit "al momento giusto": il latch a D

Il flip-flop R-S è affascinante, ma il modo in cui lo si comanda — due ingressi separati, uno per scrivere 1 e uno per scrivere 0 — è scomodo. Quel che serve davvero, per costruire una memoria, è un circuito che ricordi se un certo segnale valeva 0 oppure 1 **in un preciso momento** scelto da noi. Immaginiamolo prima di costruirlo: avrà due ingressi. Il primo, chiamiamolo **Data**, porta il bit da ricordare (0 o 1). Il secondo è l'equivalente elettrico del dire "**tieni a mente questo**": finché vale 0, il circuito ignora del tutto Data e continua a conservare quel che aveva; quando lo si porta a 1, il circuito **cattura** il valore di Data; riportandolo a 0, quel valore resta congelato, e da lì in poi cambiare Data non ha più alcun effetto.

Il comportamento voluto sta tutto in questa tabella:

| Data | Tieni a mente | Q |
|:---:|:---:|:---:|
| 0 | 1 | 0 |
| 1 | 1 | 1 |
| 0 | 0 | *invariato* |
| 1 | 0 | *invariato* |

Quando "tieni a mente" vale 1, l'uscita Q copia semplicemente l'ingresso Data; quando vale 0, Q resta com'era, qualunque cosa faccia Data. Un flip-flop R-S opportunamente arricchito con un paio di porte davanti realizza esattamente questa tabella. Il circuito che ne risulta si chiama **latch a D** (*D* sta per *Data*), ed è il vero mattone della memoria: il segnale "tieni a mente" prende di solito il nome di **Write** (scrittura) quando serve a memorizzare, oppure di **Clock** quando è il clock a decidere il momento della cattura. È da qui che, nel capitolo 19, si costruiranno banchi di memoria capaci di ricordare migliaia di bit.

> [!tip]
> Un **latch** è un flip-flop con un ingresso di abilitazione (Write/Clock): scrive il valore di Data **solo** quando quell'ingresso lo consente, altrimenti lo tiene fermo. Un bit di memoria è, alla base, esattamente questo.

## Agganciare sul fronte: il flip-flop edge-triggered

Il latch a D appena descritto ha una caratteristica da tenere a mente: finché "tieni a mente" resta a 1, l'uscita **insegue** Data momento per momento. Va benissimo per scrivere in memoria, ma diventa un problema quando l'uscita del flip-flop, tramite un anello di feedback, torna a influenzare il proprio ingresso: si rischiano rincorse incontrollate. La soluzione è un flip-flop più raffinato, detto **edge-triggered** (attivato sul fronte): invece di catturare Data per *tutto* il tempo in cui il clock è a 1, lo cattura **solo nell'istante** in cui il clock passa da 0 a 1 — il cosiddetto **fronte di salita**. Fuori da quell'istante, qualunque cambiamento di Data viene ignorato.

| D | Clk | Q |
|:---:|:---:|:---:|
| *qualsiasi* | 0 oppure 1 stabile | *invariato* |
| D | ↑ (fronte di salita) | D |

Il flip-flop edge-triggered è il tipo che si userà per costruire registri e contatori, perché "fotografa" l'ingresso in un istante ben definito e non si lascia disturbare da ciò che accade tra un colpo di clock e l'altro. È l'elemento su cui poggia gran parte della macchina dei capitoli successivi.

## Preset e Clear: forzare uno stato iniziale

C'è ancora un dettaglio pratico. Un flip-flop, appena acceso, parte in uno stato qualunque; e a volte serve poterlo portare a 0 o a 1 **d'autorità**, senza aspettare un colpo di clock. Per questo il flip-flop edge-triggered completo ha due ingressi in più, **Preset** (Pre) e **Clear** (Clr), che **scavalcano** Clock e Data. Di norma entrambi valgono 0 e non fanno nulla; portando **Preset** a 1 l'uscita Q va subito a **1** (e Q̄ a 0), portando **Clear** a 1 va subito a **0** (e Q̄ a 1). Sono, in pratica, gli ingressi *Set* e *Reset* del flip-flop R-S ripresentati qui, e come quelli non vanno mai attivati insieme. La loro utilità si vedrà già nel capitolo 18: per impostare l'ora iniziale di un orologio digitale, si usano proprio Preset e Clear per "caricare" i contatori sul valore voluto.

> [!tip]
> Un flip-flop edge-triggered "da manuale" ha quindi quattro ingressi — **D**, **Clk**, **Preset**, **Clear** — e due uscite complementari **Q** e **Q̄**. Nella logica TTL del capitolo 15 non serve costruirlo da zero: esiste già impacchettato, per esempio nel chip **7474**, descritto come *«Dual D-Type Positive-Edge-Triggered Flip-Flop with Preset and Clear»* (due flip-flop di questo tipo in un solo integrato).

## Dividere la frequenza: nasce il contatore

Ecco il collegamento che chiude il capitolo e apre il prossimo. Si prenda un flip-flop edge-triggered e si colleghi la sua uscita **Q̄** all'ingresso **D** dello stesso flip-flop. Poiché Q̄ è sempre l'opposto di Q, a ogni fronte di salita del clock il flip-flop cattura il valore *opposto* a quello che ha ora, e quindi **si ribalta**: se Q era 0 diventa 1, al colpo dopo torna 0, e così via.

<figure>
<svg viewBox="0 0 325 172" role="img" aria-label="Diagramma di timing: il Clock è un'onda quadra; a ogni suo fronte di salita l'uscita Q si ribalta, oscillando a metà frequenza" style="width:100%;max-width:500px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M121 34 L121 158" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 4"/><path d="M173 34 L173 158" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 4"/><path d="M225 34 L225 158" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 4"/><path d="M277 34 L277 158" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 4"/><path d="M95 72 L95 40 L121 40 L121 72 L147 72 L147 40 L173 40 L173 72 L199 72 L199 40 L225 40 L225 72 L251 72 L251 40 L277 40 L277 72 L303 72" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><text x="81" y="64" font-size="12" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">Clock</text><path d="M95 152 L121 152 L121 120 L173 120 L173 152 L225 152 L225 120 L277 120 L277 152 L303 152" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><text x="81" y="144" font-size="13" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">Q</text></g></svg>
<figcaption><em>A ogni <strong>fronte di salita</strong> del Clock (le linee tratteggiate) l'uscita Q si ribalta. Ne segue che Q compie un ciclo completo ogni <strong>due</strong> cicli del Clock: oscilla a <strong>metà</strong> della frequenza. Un flip-flop così collegato è un <strong>divisore di frequenza per 2</strong>.</em></figcaption>
</figure>

Il diagramma di timing mostra il risultato: mentre il clock oscilla velocemente, Q oscilla esattamente a **metà** della sua frequenza. Un flip-flop collegato così è un **divisore di frequenza per 2**. E qui sta la scintilla: dimezzare la frequenza equivale a **contare**. Se si guarda Q solo nei momenti giusti, esso dice "0, 1, 0, 1…" — cioè conta gli impulsi del clock, ripartendo da capo ogni due. Mettendo in cascata più flip-flop, ciascuno pilotato dal precedente, ogni stadio dimezza ancora, e l'insieme conta in **binario**: due stadi contano fino a 3, tre stadi fino a 7, otto stadi fino a 255. Si è appena costruito un **contatore**. Contare gli impulsi di un clock è precisamente ciò che serve per far segnare le ore a un orologio: è da qui che riparte il capitolo 18.

> [!warning]
> Attenzione a non confondere i due tipi di flip-flop. Il latch **level-triggered** (a livello) copia Data per *tutto* il tempo in cui l'abilitazione è a 1. Il flip-flop **edge-triggered** (a fronte) cattura Data solo nell'*istante* del fronte di salita. Il trucco del divisore di frequenza funziona con l'edge-triggered: è quello, non il latch a livello, che sopporta il feedback di Q̄ su D senza impazzire.

## Ripasso lampo

<details>
<summary>Che cosa distingue un circuito <em>combinatorio</em> da uno <em>sequenziale</em>, e qual è l'ingrediente che segna il confine?</summary>

Un circuito **combinatorio** (come il sommatore) ha l'uscita che dipende solo dagli ingressi del momento: tolti gli ingressi, non resta memoria del passato. Un circuito **sequenziale** ricorda: la sua uscita dipende anche dalla storia precedente. L'ingrediente che segna il confine è il **feedback**, cioè l'uscita ricondotta all'ingresso.

</details>

<details>
<summary>Perché un relè cablato per comandare il proprio elettromagnete si mette a oscillare?</summary>

Perché crea un anello di feedback "che si contraddice": chiudendo il circuito, l'elettromagnete attira il contatto, ma quel contatto interrompe la corrente dell'elettromagnete stesso; senza corrente il contatto ricade e richiude il circuito, e il ciclo ricomincia. Il risultato è un'apertura-chiusura continua, cioè un **oscillatore** (il principio del ronzatore).

</details>

<details>
<summary>Che cos'è un <code>clock</code> e perché ogni computer ne ha uno?</summary>

Un clock è un oscillatore che batte a ritmo regolare, la cui uscita è un'onda quadra 0-1-0-1. Serve a **sincronizzare** e scandire le operazioni della macchina, e contandone le oscillazioni si misura il tempo. Nei computer reali è realizzato con un cristallo di quarzo per la sua stabilità.

</details>

<details>
<summary>Nel flip-flop R-S, cosa succede se si portano <code>S</code> e <code>R</code> a 1 nello stesso momento?</summary>

È la combinazione **proibita**: entrambe le NOR danno 0, quindi Q e Q̄ diventano uguali (tutt'e due 0) invece di essere l'uno l'opposto dell'altro, e lo stato perde significato. Se poi si rilasciano insieme, quale stato prevalga è imprevedibile. Va evitata: un comando alla volta.

</details>

<details>
<summary>Qual è la differenza tra un latch <code>level-triggered</code> e un flip-flop <code>edge-triggered</code>?</summary>

Il latch **level-triggered** copia l'ingresso Data per *tutto* il tempo in cui il segnale di abilitazione (Write/Clock) è a 1. Il flip-flop **edge-triggered** cattura Data solo nell'**istante** del fronte di salita del clock (0→1), ignorandolo nel resto del tempo. L'edge-triggered è quello adatto ai contatori, perché regge il feedback senza rincorrersi.

</details>

<details>
<summary>Come fa un flip-flop a diventare un <code>divisore di frequenza per 2</code>, e cosa c'entra con il contare?</summary>

Collegando l'uscita Q̄ all'ingresso D di un flip-flop edge-triggered, a ogni fronte di salita del clock l'uscita si ribalta; così Q compie un ciclo ogni due del clock, cioè oscilla a metà frequenza. Dimezzare la frequenza equivale a **contare gli impulsi** (0,1,0,1…); mettendo più flip-flop in cascata si ottiene un **contatore binario**.

</details>

**In sintesi:**
- Il **feedback** (uscita ricondotta all'ingresso) è ciò che trasforma circuiti senza memoria in circuiti capaci di oscillare o di ricordare.
- Un anello di feedback "distruttivo" dà un **oscillatore**; a ritmo regolare è un **clock**, il battito che sincronizza tutta la macchina, disegnato come **onda quadra** in un diagramma di timing.
- Due NOR incrociate formano il **flip-flop R-S**, prima memoria da **1 bit**: due stati stabili, comandati da *Set* e *Reset* (con S=R=1 combinazione da evitare).
- Il **latch a D** ricorda un bit "al momento giusto" (ingressi *Data* e *Write*/Clock) ed è il mattone della memoria; il flip-flop **edge-triggered** cattura Data solo sul fronte di salita.
- Con Q̄ ricollegata a D, un flip-flop **dimezza la frequenza** del clock: è un divisore per 2, e in cascata diventa un **contatore binario** — la base dell'orologio del capitolo 18.
