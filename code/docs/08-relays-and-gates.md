# 08 · Relè e porte logiche
> cap. 8 di «Code» (Petzold, 2ª ed.) — orig. *Relays and Gates*

Ridotto all'essenziale, **un computer è una sintesi di algebra booleana ed elettricità**, e i componenti che incarnano questa fusione sono le **porte logiche** (*logic gates*). Non sono i cancelli attraverso cui passano acqua o persone: sono dispositivi che eseguono semplici operazioni della logica di Boole **bloccando o lasciando passare la corrente**. Questo capitolo le costruisce mettendo insieme i **relè** del capitolo 7 — quegli interruttori comandati dall'elettricità.

## Dal circuito di interruttori alle porte

Riprendiamo il gatto del [capitolo 6](06-logic-with-switches.md), la cui espressione era `(M × N × (W + T)) + (F × N × (1 − W)) + B`. Quel circuito di interruttori è una **rete**: `×` = interruttori in serie (AND), `+` = in parallelo (OR). Poiché equivale a un'espressione booleana, si può **semplificare** con l'algebra. Riordinando (commutativa) e raccogliendo `N` (distributiva), da due comparse di `N` si passa a una sola:

> `N × ((M × (W + T)) + (F × (1 − W))) + B`

Un interruttore in meno. Ma restano ancora interruttori separati per *maschio*/*femmina* e per *bianco*/*non bianco*, mentre uno solo dovrebbe bastare: acceso per femmina, spento per maschio. Serve un dispositivo che, dallo stesso ingresso, ricavi **sia un valore sia il suo opposto**. È qui che entrano i relè — e nascono le porte.

## AND: relè in serie

Due relè collegati **in serie** formano una porta **AND**: l'uscita è "1" (corrente presente) **solo se entrambi** gli ingressi sono 1, esattamente come i due interruttori in serie del capitolo 6. Per non disegnare ogni volta i relè, gli ingegneri usano un **simbolo**: gli ingressi a sinistra, l'uscita a destra (si legge da sinistra a destra).

## OR: relè in parallelo

Due relè **in parallelo** formano una porta **OR**: l'uscita è 1 se **almeno uno** degli ingressi è 1. Sia AND sia OR possono avere più di due ingressi.

## NOT: l'inverter

I relè hanno in realtà **due contatti** (sono a *doppio scambio*): a riposo la barra tocca il contatto *normalmente chiuso*, e quando l'elettromagnete la attira tocca quello *normalmente aperto* (quello usato finora). Usando il contatto **normalmente chiuso** l'uscita si **rovescia**: la lampadina è accesa quando l'ingresso è **spento**. Un singolo relè cablato così è un **inverter**, cioè l'operatore booleano **NOT**: trasforma 0 in 1 e 1 in 0. Il suo simbolo è un triangolo con un **pallino** sull'uscita (il pallino significa "inverti"). Risolve anche il problema di prima: da un solo interruttore *femmina* si ottiene `F` diretto e `M` come `NOT F`.

## NAND e NOR: le porte "negate"

Combinando l'inversione con AND e OR si ottengono le loro versioni negate. La **NAND** (*NOT-AND*) dà l'opposto della AND; la **NOR** (*NOT-OR*) l'opposto della OR. I loro simboli sono quelli di AND e OR con il **pallino** di inversione sull'uscita.

## Le sei porte fondamentali

In tutto sono **sei** i mattoni di base. Ecco i loro simboli:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 480 250" role="img" aria-label="Simboli delle sei porte logiche: AND, OR, NOT, NAND, NOR, buffer" style="width:100%;max-width:500px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <!-- AND -->
    <g transform="translate(55,25)"><path d="M0 0 H30 A22 22 0 0 1 30 44 H0 Z"/><path d="M-18 12 H0"/><path d="M-18 32 H0"/><path d="M52 22 H70"/></g>
    <!-- OR -->
    <g transform="translate(215,25)"><path d="M0 0 Q14 22 0 44 Q40 44 62 22 Q40 0 0 0 Z"/><path d="M-18 12 H8"/><path d="M-18 32 H8"/><path d="M62 22 H80"/></g>
    <!-- NOT -->
    <g transform="translate(375,25)"><path d="M0 4 L44 22 L0 40 Z"/><circle cx="49" cy="22" r="4"/><path d="M-18 22 H0"/><path d="M53 22 H70"/></g>
    <!-- NAND -->
    <g transform="translate(55,150)"><path d="M0 0 H30 A22 22 0 0 1 30 44 H0 Z"/><circle cx="56" cy="22" r="4"/><path d="M-18 12 H0"/><path d="M-18 32 H0"/><path d="M60 22 H78"/></g>
    <!-- NOR -->
    <g transform="translate(215,150)"><path d="M0 0 Q14 22 0 44 Q40 44 62 22 Q40 0 0 0 Z"/><circle cx="67" cy="22" r="4"/><path d="M-18 12 H8"/><path d="M-18 32 H8"/><path d="M71 22 H88"/></g>
    <!-- BUFFER -->
    <g transform="translate(375,150)"><path d="M0 4 L44 22 L0 40 Z"/><path d="M-18 22 H0"/><path d="M44 22 H70"/></g>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13" font-weight="700" text-anchor="middle">
    <text x="81" y="120">AND</text><text x="245" y="120">OR</text><text x="397" y="120">NOT</text>
    <text x="81" y="245">NAND</text><text x="245" y="245">NOR</text><text x="397" y="245">buffer</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le sei porte. AND e OR (con più ingressi); NOT (inverter) e <em>buffer</em> a un solo ingresso; NAND e NOR sono AND e OR con il pallino di inversione. Il <em>buffer</em> non fa nulla di logico: rilancia il segnale (come un relè-ripetitore).</figcaption>
</figure>

E il loro comportamento, in due tabelle di verità (0 = niente tensione/falso, 1 = tensione/vero):

| A | B | AND | OR | NAND | NOR |
|:--:|:--:|:--:|:--:|:--:|:--:|
| 0 | 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 |

| A | NOT | buffer |
|:--:|:--:|:--:|
| 0 | 1 | 0 |
| 1 | 0 | 1 |

## La porta come "scatola nera"

Il vero salto è concettuale: una volta definito il simbolo, si può **dimenticare come è fatta dentro** una porta. Non importa se è cablata con relè, con valvole o con transistor: conta solo la relazione tra **ingressi** e **uscita**, espressa dalla sua tabella. Da qui in poi si ragiona con le porte come mattoni astratti, e l'uscita di una porta può diventare l'ingresso di un'altra.

Questo permette anche di vedere le stesse funzioni da angolazioni diverse — è la sostanza delle *leggi di De Morgan*. Cablando due relè "in un altro modo" (usando i contatti opposti) si scopre, per esempio, che una **NAND** equivale a una **OR con gli ingressi invertiti**, e una **NOR** a una **AND con gli ingressi invertiti**. Stessa tabella, circuiti diversi.

> [!tip]
> Le regole da memorizzare: **relè in serie = AND**, **in parallelo = OR**, **contatto normalmente chiuso = NOT**. Aggiungendo un pallino di inversione all'uscita si ottengono **NAND** e **NOR**. Con queste sei porte — anzi, si dimostrerà, con le sole NAND (o le sole NOR) — si può costruire *qualsiasi* funzione logica.

> [!warning]
> Il pallino sul simbolo significa sempre **inversione** dell'uscita: AND + pallino = NAND, OR + pallino = NOR, triangolo + pallino = NOT. Il triangolo **senza** pallino è il *buffer*, che lascia il segnale invariato.

## Verso l'aritmetica

Con le porte logiche abbiamo il vocabolario con cui è scritto tutto l'hardware digitale. Il passo naturale sarebbe usarle per **fare i conti** — ed è esattamente dove il libro arriverà (sommare con le porte logiche). Prima, però, conviene fermarsi a capire bene i **numeri** e come rappresentarli: è il tema dei prossimi capitoli, dai sistemi di numerazione al binario, ai byte e all'esadecimale.

## Ripasso lampo

<details>
<summary>Cos'è una porta logica e con che cosa la costruiamo qui?</summary>

È un dispositivo che esegue una semplice operazione dell'algebra di Boole **bloccando o lasciando passare la corrente**. In questo capitolo la si costruisce con i **relè**, cioè interruttori comandati dall'elettricità (cap.7). Un computer è, in essenza, una sintesi di algebra booleana ed elettricità.

</details>

<details>
<summary>Come si ottengono le porte AND e OR dai relè?</summary>

Con i relè **in serie** si ottiene la **AND**: l'uscita è 1 solo se **tutti** gli ingressi sono 1. Con i relè **in parallelo** si ottiene la **OR**: l'uscita è 1 se **almeno un** ingresso è 1. È lo stesso comportamento degli interruttori in serie/parallelo del cap.6, ma ora automatico.

</details>

<details>
<summary>Cos'è un inverter (NOT) e come lo realizza un relè?</summary>

È la porta **NOT**: trasforma 0 in 1 e 1 in 0. La si ottiene sfruttando il contatto **normalmente chiuso** del relè a doppio scambio: l'uscita è accesa quando l'ingresso è **spento**. Il simbolo è un triangolo con un **pallino** sull'uscita.

</details>

<details>
<summary>Cosa sono NAND e NOR?</summary>

Sono le **negazioni** di AND e OR (simbolo = AND/OR con il pallino di inversione). La **NAND** dà 0 solo quando **tutti** gli ingressi sono 1 (altrimenti 1); la **NOR** dà 1 solo quando **tutti** gli ingressi sono 0 (altrimenti 0).

</details>

<details>
<summary>Perché il concetto di porta come "scatola nera" è così importante?</summary>

Perché permette di **dimenticare l'implementazione** (relè, valvole, transistor) e ragionare solo su **ingressi e uscita** tramite la tabella di verità. Così le porte diventano mattoni astratti componibili: l'uscita di una alimenta l'ingresso di un'altra, e combinandole si costruisce qualunque funzione — fino all'aritmetica e al processore.

</details>

**In sintesi:**

- Un computer è **algebra di Boole + elettricità**, e le **porte logiche** sono i componenti che le fondono, agendo sul flusso di corrente.
- Dai **relè**: in **serie** → **AND**, in **parallelo** → **OR**, contatto **normalmente chiuso** → **NOT**; col pallino di inversione → **NAND** e **NOR**. Il *buffer* rilancia soltanto il segnale.
- Le **sei porte** hanno simboli e tabelle di verità standard; una volta fissato il simbolo, la porta è una **scatola nera** (conta solo ingresso→uscita), e vale l'equivalenza di De Morgan tra NAND/NOR e le forme a ingressi invertiti.
- Con le porte c'è il vocabolario dell'hardware digitale: il prossimo obiettivo è **fare aritmetica**, dopo una tappa sui **numeri** e sul binario.
