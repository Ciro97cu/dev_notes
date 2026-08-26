# 06 · Logica con gli interruttori
> cap. 6 di «Code» (Petzold, 2ª ed.) — orig. *Logic with Switches*

Il capitolo precedente ha lasciato in mano un mattone semplicissimo — l'**interruttore**, che è aperto o chiuso, 0 o 1. Questo capitolo compie il salto che rende possibili i computer: mostra che con gli interruttori si può fare **logica**. Il ponte tra le due cose è l'algebra inventata da **George Boole**, e la scoperta chiave sarà che due interruttori **in serie** si comportano come un *AND* e due **in parallelo** come un *OR*.

## Dalla logica di Aristotele a Boole

Che cos'è la verità? Per Aristotele la logica c'entrava, e la sua forma più famosa è il **sillogismo**:

> *Tutti gli uomini sono mortali; Socrate è un uomo; dunque Socrate è mortale.*

Da due premesse assunte vere si deduce una conclusione. I sillogismi però hanno molte varianti insidiose — ne inventò di celebri anche Charles Dodgson (**Lewis Carroll**) — e per oltre duemila anni si è cercato di trattarli con simboli e operatori matematici. Ci andò vicino Leibniz (1648-1716); ma la svolta la diede **George Boole** (1815-1864): figlio di un calzolaio, in gran parte autodidatta, nel 1849 divenne primo professore di matematica al Queen's College di Cork. Nei libri *The Mathematical Analysis of Logic* (1847) e *An Investigation of the Laws of Thought* (1854) fondò quella che oggi si chiama **algebra booleana**: un modo per descrivere le "leggi del pensiero" con la matematica.

## L'algebra di Boole: classi, non numeri

Nell'algebra normale le lettere stanno per **numeri**, combinati con `+` e `×` secondo regole note (commutativa, associativa, distributiva). Il colpo di genio di Boole fu rendere l'algebra più astratta, sganciandola dai numeri: nella sua algebra le lettere non sono numeri ma **classi** (quelli che oggi chiamiamo *insiemi*). Con l'esempio dei gatti: `M` è la classe dei gatti maschi, `F` delle femmine, `W` bianchi, `T` fulvi, `B` neri, `O` di altri colori, `N` sterilizzati, `U` non sterilizzati.

In questa algebra `+` e `×` cambiano significato:

- **`+` = unione** (in parole: **OR**): `B + W` è la classe dei gatti neri *o* bianchi.
- **`×` = intersezione** (in parole: **AND**): `F × T` è la classe dei gatti *sia* femmine *sia* fulvi.

Compaiono poi tre simboli speciali. **`1` è l'universo** (tutto ciò di cui parliamo): `M + F = 1` (maschi o femmine = tutti i gatti). **`0` è la classe vuota** (niente): `F × M = 0` (nessun gatto è sia maschio sia femmina). E **`1 − `** significa **NOT**: `1 − M = F` (tutti i gatti tranne i maschi = le femmine). Alcune uguaglianze sembrano strane rispetto all'algebra dei numeri (`F × F = F`, `F + F = F`, `1 + F = 1`) ma hanno perfettamente senso parlando di classi. E la *legge di contraddizione* diventa `F × (1 − F) = 0`: niente può essere insieme sé stesso e il proprio opposto.

Con questi strumenti persino il sillogismo di Socrate si risolve come un conticino: da `P × M = P` (tutte le persone sono mortali) e `S × P = S` (Socrate è una persona), sostituendo si arriva a `S × M = S` — Socrate è mortale.

## Il "Boolean test": scegliere un gatto

Ecco l'esempio che regge tutto il capitolo. In un negozio dici: *"Voglio un gatto maschio, sterilizzato, bianco o fulvo; oppure una femmina, sterilizzata, di qualsiasi colore tranne il bianco; oppure un gatto qualsiasi purché nero."* Il commesso traduce la richiesta in un'espressione booleana:

> **(M × N × (W + T)) + (F × N × (1 − W)) + B**

cioè **(maschio E sterilizzato E (bianco O fulvo)) OPPURE (femmina E sterilizzata E NON bianco) OPPURE nero**, con `×` = AND, `+` = OR, `1 −` = NOT.

Per verificare se un gatto va bene si fa un **Boolean test**: a ogni proprietà si assegna **1** (Sì/vero) o **0** (No/falso), si sostituisce e si semplifica. Se il risultato è `1` il gatto soddisfa i criteri, se è `0` no. Le due operazioni seguono queste tabelle:

| `×` (AND) | 0 | 1 |     | `+` (OR) | 0 | 1 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **0** | 0 | 0 |     | **0** | 0 | 1 |
| **1** | 0 | 1 |     | **1** | 1 | 1 |

L'`AND` dà `1` solo se **entrambi** gli operandi sono `1`; l'`OR` dà `1` se **almeno uno** lo è. Per un maschio fulvo *non* sterilizzato l'espressione vale `0` (niente da fare, non è sterilizzato); per una femmina grigia sterilizzata vale `1` — il gattino ha trovato casa.

## Interruttori come operatori: serie e parallelo

E qui avviene il salto. Invece di calcolare a mano, si possono **cablare degli interruttori**. Basta collegarne due (invece di uno solo) tra batteria e lampadina, e ci sono due modi di farlo.

Collegati **uno dopo l'altro** (*in serie*) la lampadina si accende **solo se entrambi** sono chiusi. È un `AND`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 340 165" role="img" aria-label="Due interruttori in serie: la lampadina si accende solo se entrambi sono chiusi (AND)" style="width:100%;max-width:360px;height:auto;color:inherit">
  <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
    <path d="M45 45 V70"/><rect x="36" y="70" width="18" height="40" rx="3"/><path d="M45 110 V140 H300"/>
    <path d="M300 140 V115"/><circle cx="300" cy="100" r="15" style="fill:var(--link,#059669);fill-opacity:.18"/><path d="M293 100 l4 -6 l4 11 l4 -6"/><path d="M300 85 V45 H195"/>
    <path d="M45 45 H95"/>
    <circle cx="95" cy="45" r="3" style="fill:var(--link,#059669)"/><line x1="95" y1="45" x2="130" y2="45"/><circle cx="130" cy="45" r="3" style="fill:var(--link,#059669)"/>
    <path d="M130 45 H160"/>
    <circle cx="160" cy="45" r="3" style="fill:var(--link,#059669)"/><line x1="160" y1="45" x2="195" y2="45"/><circle cx="195" cy="45" r="3" style="fill:var(--link,#059669)"/>
    <g><line x1="300" y1="80" x2="300" y2="74"/><line x1="322" y1="100" x2="328" y2="100"/><line x1="278" y1="100" x2="272" y2="100"/></g>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" text-anchor="middle"><text x="112" y="34">A</text><text x="177" y="34">B</text></g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Interruttori <strong>in serie</strong> = <strong>AND</strong>: serve che A <em>e</em> B siano chiusi perché la corrente passi.</figcaption>
</figure>

Collegati **fianco a fianco** (*in parallelo*) basta che **almeno uno** sia chiuso. È un `OR`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 360 165" role="img" aria-label="Due interruttori in parallelo: basta che uno sia chiuso perché la lampadina si accenda (OR)" style="width:100%;max-width:380px;height:auto;color:inherit">
  <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
    <path d="M45 45 V70"/><rect x="36" y="70" width="18" height="40" rx="3"/><path d="M45 110 V140 H320"/>
    <path d="M320 140 V105"/><circle cx="320" cy="90" r="15" style="fill:var(--link,#059669);fill-opacity:.18"/><path d="M313 90 l4 -6 l4 11 l4 -6"/><path d="M320 75 V40 H240"/>
    <path d="M45 45 H100"/><path d="M100 40 V75"/><path d="M240 40 V75"/>
    <circle cx="140" cy="40" r="3" style="fill:var(--link,#059669)"/><line x1="140" y1="40" x2="175" y2="40"/><circle cx="180" cy="40" r="3" style="fill:var(--link,#059669)"/>
    <path d="M100 40 H140"/><path d="M180 40 H240"/>
    <g><line x1="320" y1="70" x2="320" y2="64"/><line x1="342" y1="90" x2="348" y2="90"/><line x1="298" y1="90" x2="292" y2="90"/></g>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <path d="M100 75 H140"/><circle cx="140" cy="75" r="3" fill="currentColor"/><line x1="140" y1="75" x2="172" y2="60"/><circle cx="180" cy="75" r="3" fill="currentColor"/><path d="M180 75 H240"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12" text-anchor="middle"><text x="140" y="30">A</text><text x="140" y="95">B</text></g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Interruttori <strong>in parallelo</strong> = <strong>OR</strong>: qui A è chiuso (verde) e la lampadina è accesa anche se B è aperto.</figcaption>
</figure>

Assegnando **0** all'interruttore aperto (lampadina spenta) e **1** al chiuso (accesa), le due configurazioni danno esattamente le tabelle `AND` e `OR`:

| A | B | In **serie** (AND) | In **parallelo** (OR) |
|:--:|:--:|:--:|:--:|
| 0 | 0 | 0 (spenta) | 0 (spenta) |
| 0 | 1 | 0 (spenta) | 1 (accesa) |
| 1 | 0 | 0 (spenta) | 1 (accesa) |
| 1 | 1 | 1 (accesa) | 1 (accesa) |

Un semplice circuito, insomma, **esegue** un'operazione dell'algebra di Boole.

## Il circuito che sceglie il gatto

Se la serie è `×` e il parallelo è `+`, allora **qualsiasi espressione booleana diventa un circuito di interruttori**: ogni `×` è un tratto in serie, ogni `+` una biforcazione in parallelo, ogni lettera un interruttore etichettato (`W̄` = `1 − W` = NOT bianco). L'espressione del gatto diventa così una rete a tre rami in parallelo:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 620 320" role="img" aria-label="L'espressione booleana del gatto realizzata come rete di interruttori in serie e parallelo" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><line x1="70" y1="64" x2="70" y2="272" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="560" y1="64" x2="560" y2="272" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="70" y1="64" x2="110" y2="64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="110" cy="64" r="3" fill="currentColor"/><circle cx="144" cy="64" r="3" fill="currentColor"/><line x1="110" y1="64" x2="141" y2="51" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="127.0" y="45" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">M</text><line x1="144" y1="64" x2="180" y2="64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="180" cy="64" r="3" fill="currentColor"/><circle cx="214" cy="64" r="3" fill="currentColor"/><line x1="180" y1="64" x2="211" y2="51" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="197.0" y="45" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">N</text><line x1="214" y1="64" x2="250" y2="64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="250" y1="42" x2="250" y2="86" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="360" y1="42" x2="360" y2="86" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="250" y1="42" x2="270" y2="42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="270" cy="42" r="3" fill="currentColor"/><circle cx="304" cy="42" r="3" fill="currentColor"/><line x1="270" y1="42" x2="301" y2="29" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="287.0" y="23" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">W</text><line x1="304" y1="42" x2="360" y2="42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="250" y1="86" x2="270" y2="86" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="270" cy="86" r="3" fill="currentColor"/><circle cx="304" cy="86" r="3" fill="currentColor"/><line x1="270" y1="86" x2="301" y2="73" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="287.0" y="67" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">T</text><line x1="304" y1="86" x2="360" y2="86" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="360" y1="64" x2="560" y2="64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="70" y1="140" x2="110" y2="140" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="110" cy="140" r="3" fill="currentColor"/><circle cx="144" cy="140" r="3" fill="currentColor"/><line x1="110" y1="140" x2="141" y2="127" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="127.0" y="121" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">F</text><line x1="144" y1="140" x2="180" y2="140" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="180" cy="140" r="3" fill="currentColor"/><circle cx="214" cy="140" r="3" fill="currentColor"/><line x1="180" y1="140" x2="211" y2="127" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="197.0" y="121" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">N</text><line x1="214" y1="140" x2="250" y2="140" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="250" cy="140" r="3" fill="currentColor"/><circle cx="284" cy="140" r="3" fill="currentColor"/><line x1="250" y1="140" x2="281" y2="127" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="267.0" y="121" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">W</text><line x1="259.0" y1="110" x2="275.0" y2="110" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="284" y1="140" x2="560" y2="140" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="70" y1="210" x2="110" y2="210" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="110" cy="210" r="3" fill="currentColor"/><circle cx="144" cy="210" r="3" fill="currentColor"/><line x1="110" y1="210" x2="141" y2="197" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><text x="127.0" y="191" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor" opacity="1">B</text><line x1="144" y1="210" x2="560" y2="210" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="70" y1="272" x2="150" y2="272" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="150" y1="260" x2="150" y2="284" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="162" y1="266" x2="162" y2="278" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><line x1="162" y1="272" x2="314" y2="272" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="330" cy="272" r="16" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="319" y1="261" x2="341" y2="283" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="319" y1="283" x2="341" y2="261" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><text x="330" y="306" font-size="11" text-anchor="middle" font-weight="400" fill="currentColor" opacity=".75">gatto (uscita)</text><line x1="346" y1="272" x2="560" y2="272" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I tre rami in <strong>parallelo</strong> sono i tre <code>+</code> dell'espressione; dentro ogni ramo gli interruttori <strong>in serie</strong> sono i <code>×</code>. Chiudendo gli interruttori che descrivono un gatto (il "Boolean test"), la lampadina si accende <em>esattamente</em> quando il gatto soddisfa i criteri — per esempio una femmina grigia sterilizzata chiude il ramo <code>F · N · W̄</code>.</figcaption>
</figure>

La corrispondenza si riassume così:

| Boole | Circuito | Significato |
|---|---|---|
| `×` | interruttori **in serie** | **AND** — tutti chiusi |
| `+` | interruttori **in parallelo** | **OR** — almeno uno chiuso |
| `1 −` | interruttore che rappresenta il "non" | **NOT** |
| `1` / `0` | chiuso, acceso / aperto, spento | vero / falso |

## Boole incontra i circuiti (e un limite)

George Boole non cablò mai un circuito del genere: la lampadina a incandescenza fu inventata quindici anni dopo la sua morte. Eppure unire la sua algebra ai circuiti elettrici è ciò che rende possibili i **computer digitali**. C'è però un limite in questi interruttori: vanno azionati **a mano**. Il telegrafo (inventato circa dieci anni *prima* di *The Laws of Thought*) conteneva un dispositivo capace di eseguire operazioni di logica con molta più agilità di un semplice interruttore: il **relè**, protagonista del prossimo capitolo.

> [!tip]
> La regola d'oro da ricordare: **serie = AND**, **parallelo = OR**. Da qui in poi tutta la logica del computer si costruisce combinando questi due schemi (più il NOT), esattamente come si combinano `×`, `+` e `1 −` in un'espressione booleana.

> [!warning]
> Attenzione ai due significati di `+` e `×`: nell'algebra di Boole **non** sono somma e prodotto tra numeri, ma **unione (OR)** e **intersezione (AND)** tra classi. Ecco perché valgono uguaglianze "strane" come `1 + 1 = 1` o `F × F = F`.

## Ripasso lampo

<details>
<summary>Qual è il "colpo di genio" di Boole rispetto all'algebra normale?</summary>

Aver reso l'algebra **astratta**, facendola operare non su **numeri** ma su **classi** (insiemi). Così `+` diventa l'**unione** (OR) e `×` l'**intersezione** (AND), con `1` = universo e `0` = classe vuota. Questo permette di trattare la logica come un calcolo.

</details>

<details>
<summary>Cosa fanno, in termini logici, due interruttori in serie e due in parallelo?</summary>

**In serie** realizzano un **AND**: la lampadina si accende solo se **entrambi** sono chiusi. **In parallelo** realizzano un **OR**: basta che **almeno uno** sia chiuso. Assegnando 0 = aperto/spento e 1 = chiuso/acceso, riproducono esattamente le tabelle di AND e OR.

</details>

<details>
<summary>Nel "Boolean test", cosa rappresentano 0 e 1?</summary>

**1** = Sì/vero, **0** = No/falso. Applicati agli interruttori: 1 = chiuso, 0 = aperto; alla lampadina: 1 = accesa, 0 = spenta. Si assegnano 0/1 alle proprietà di un gatto, si semplifica l'espressione: se vale **1**, il gatto soddisfa i criteri.

</details>

<details>
<summary>Come si traduce un'espressione booleana in un circuito di interruttori?</summary>

Ogni `×` diventa un tratto di interruttori **in serie**, ogni `+` una biforcazione **in parallelo**, ogni lettera un **interruttore** etichettato (e `1 − X` un interruttore che rappresenta il NOT di X). La lampadina si accende esattamente quando l'intera espressione vale **1**.

</details>

<details>
<summary>Perché il capitolo si chiude puntando al relè?</summary>

Perché gli interruttori vanno azionati **a mano**: per costruire un computer serve un dispositivo che faccia logica **da solo**. Il telegrafo ne aveva già uno (il **relè**) capace di aprire e chiudere circuiti automaticamente. È il passo successivo verso le porte logiche e la macchina.

</details>

**In sintesi:**

- **Boole** trasformò la logica in **algebra di classi**: `+` = unione (OR), `×` = intersezione (AND), `1` = universo, `0` = vuoto, `1 −` = NOT.
- Un'espressione booleana si verifica con un **Boolean test** (0/1 alle proprietà) e si legge con le tabelle di **AND** e **OR**.
- La scoperta chiave: **interruttori in serie = AND**, **in parallelo = OR**. Così un circuito *esegue* la logica, e qualsiasi espressione diventa una rete di interruttori (il circuito che "sceglie il gatto").
- Gli interruttori manuali sono il limite: il **relè** del telegrafo (prossimo capitolo) farà logica in automatico, aprendo la strada al computer.
