# 09 · Le nostre dieci cifre
> cap. 9 di «Code» (Petzold, 2ª ed.) — orig. *Our Ten Digits*

Costruite le porte logiche, il libro si ferma un momento sui **numeri** — perché per far calcolare un computer bisogna prima capire *come* si rappresentano i numeri. I numeri sono forse il codice più astratto che usiamo, eppure, in qualunque lingua, quasi tutti sul pianeta li scrivono allo stesso modo:

> **1 2 3 4 5 6 7 8 9 10**

L'obiettivo del capitolo è persuaderci che "questa quantità" di mele — 🍎🍎🍎 — non deve per forza scriversi `3`: potrebbe scriversi `11`. Una volta accettato questo, saremo pronti a rappresentare i numeri con i circuiti.

## Dieci dita, base arbitraria

Fin dalle origini si è contato con le **dita**, ed è per questo che quasi tutte le civiltà hanno costruito i loro numeri intorno al **dieci** (le poche eccezioni ruotano attorno a 5, 20 o 60 — il sistema babilonese in base 60 sopravvive ancora nei minuti e nei secondi). Non c'è però **nulla di speciale nel dieci**: dipende solo dalla fisiologia della mano. Con otto o dodici dita conteremmo diversamente. Non a caso *digit* significa "dito", e in inglese *five* e *fist* ("pugno") hanno radici simili. Il dieci, insomma, è una scelta **arbitraria**; le sue potenze danno i nomi che conosciamo:

| Potenza | 10⁰ | 10¹ | 10² | 10³ | 10⁶ | 10⁹ |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Valore | 1 | 10 | 100 | 1000 | 1 000 000 | 1 000 000 000 |
| Nome | uno | dieci | cento | mille | milione | miliardo |

## Prima della posizione: i numeri romani

I numeri nacquero per **contare** cose. Le tacche (una per oggetto) diventano presto ingestibili: 27 anatre sarebbero 27 tacche. "Ci deve essere un modo migliore", e nascono i sistemi di numerazione. Di quelli antichi, i **numeri romani** sono gli unici ancora in uso (orologi, monumenti, date di copyright — *MCMLIII*). Ventisette si scrive **XXVII**, e i simboli superstiti sono:

| Simbolo | I | V | X | L | C | D | M |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Valore | 1 | 5 | 10 | 50 | 100 | 500 | 1000 |

(La `C` viene da *centum*, cento; la `M` da *mille*.) Con i romani **sommare e sottrarre** è facile — si accostano i simboli e si semplifica (cinque `I` fanno una `V`, due `V` una `X`) — ma **moltiplicare e dividere** è arduo. È il limite di tutti i sistemi **non posizionali**: vanno bene per annotare, non per calcolare.

## Il sistema indo-arabo: posizione e zero

Il sistema che usiamo oggi è quello **indo-arabo**: di origine indiana, portato in Europa dai matematici arabi. Attorno all'820 d.C. il persiano **al-Khwārizmī** scrisse un libro sul calcolo con queste cifre — dal suo nome deriva la parola *algoritmo* — e una traduzione latina del 1145 ne accelerò l'adozione. Rispetto ai sistemi precedenti ha **tre differenze**:

1. È **posizionale**: il valore di una cifra dipende da **dove** si trova. Sia `100` sia `1 000 000` contengono un solo `1`, eppure un milione è molto più grande di cento.
2. **Non** ha un simbolo speciale per il **dieci**: il dieci si ottiene mettendo `1` in una posizione diversa.
3. Ha una cosa che agli altri mancava, ancora più importante di un simbolo per il dieci: lo **zero**.

Lo **zero** è una delle invenzioni più importanti nella storia dei numeri. È ciò che rende possibile la posizione, perché fa da **segnaposto**: senza di esso non distingueremmo `25`, `205` e `250`. E semplifica enormemente i calcoli, soprattutto moltiplicazione e divisione.

## La notazione posizionale = potenze di dieci

Che il sistema sia posizionale lo tradisce già il modo in cui pronunciamo i numeri: `4825` si legge "quattromila, ottocento, venticinque", cioè **quattro migliaia, otto centinaia, due decine e cinque**. Ogni posizione vale una **potenza di dieci**:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 384 150" role="img" aria-label="Scomposizione posizionale del numero 4825 in potenze di dieci" style="width:100%;max-width:400px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" text-anchor="middle" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="20" y="14" width="64" height="50" rx="4"/><rect x="114" y="14" width="64" height="50" rx="4"/><rect x="208" y="14" width="64" height="50" rx="4"/><rect x="302" y="14" width="64" height="50" rx="4"/></g>
    <g font-size="30" font-weight="700"><text x="52" y="49">4</text><text x="146" y="49">8</text><text x="240" y="49">2</text><text x="334" y="49">5</text></g>
    <g font-size="14"><text x="52" y="88">× 10³</text><text x="146" y="88">× 10²</text><text x="240" y="88">× 10¹</text><text x="334" y="88">× 10⁰</text></g>
    <g font-size="12" opacity=".75"><text x="52" y="108">= 4000</text><text x="146" y="108">= 800</text><text x="240" y="108">= 20</text><text x="334" y="108">= 5</text></g>
    <g font-size="10" opacity=".5"><text x="52" y="126">migliaia</text><text x="146" y="126">centinaia</text><text x="240" y="126">decine</text><text x="334" y="126">unità</text></g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">4825 = 4×10³ + 8×10² + 2×10¹ + 5×10⁰ = 4000 + 800 + 20 + 5. Ogni cifra è moltiplicata per la potenza di dieci della sua posizione (ricorda: qualsiasi numero elevato a 0 fa 1).</figcaption>
</figure>

Lo stesso schema si estende **a destra della virgola** con le **potenze negative**: `42 705,684` vale `4×10⁴ + 2×10³ + 7×10² + 0×10¹ + 5×10⁰ + 6×10⁻¹ + 8×10⁻² + 4×10⁻³` — gli esponenti scendono fino a zero e poi diventano negativi. Questa è tutta l'eleganza (che diamo per scontata) del sistema indo-arabo.

Ed è proprio la struttura posizionale a rendere semplici i conti: `3 + 4 = 7`, e quindi anche `30 + 40 = 70`, `300 + 400 = 700`. Qualsiasi addizione, per quanto lunga, si spezza in **somme di singole cifre** — ecco perché, da piccoli, ci hanno fatto imparare a memoria la **tavola dell'addizione** (e quella della moltiplicazione): sono i mattoni con cui la posizione fa il resto.

## Perché tutto questo (verso il binario)

Il punto da fissare è che il **dieci non ha nulla di sacro**: è la base che usiamo perché abbiamo dieci dita. La stessa quantità può scriversi in **basi diverse**, con lo stesso meccanismo posizionale (cifre × potenze della base). Il prossimo capitolo esplora proprio le basi alternative fino ad arrivare a quella che conta per i circuiti — la **base due**, il binario, fatta di due sole cifre come l'acceso/spento di un interruttore.

> [!tip]
> La formula da portare via: un numero è la somma delle sue **cifre × potenze della base**. In base dieci le potenze sono di 10; cambiando base cambiano solo le potenze. Posizione + zero: è tutto qui il segreto del nostro sistema.

> [!warning]
> Non confondere la **cifra** con il suo **valore**: nello stesso numero, la cifra `2` in `4825` vale *venti* (`2×10¹`), non due. Il valore dipende dalla **posizione** — è la differenza tra un sistema posizionale (indo-arabo) e uno non posizionale (romano).

## Ripasso lampo

<details>
<summary>Perché la base dieci è "arbitraria"?</summary>

Perché deriva soltanto dall'avere **dieci dita**. Altre culture hanno usato basi intorno a 5, 20 o 60 (il 60 babilonese sopravvive in minuti e secondi). Non c'è nulla di matematicamente speciale nel dieci: con otto o dodici dita conteremmo in un'altra base.

</details>

<details>
<summary>Perché i numeri romani sono scomodi per i calcoli?</summary>

Perché sono **non posizionali** e privi di **zero**: si prestano ad annotare (e ad addizionare/sottrarre accostando simboli), ma rendono difficili **moltiplicazione e divisione**. Il valore di un simbolo non dipende dalla sua posizione.

</details>

<details>
<summary>Quali sono le tre novità del sistema indo-arabo?</summary>

È **posizionale** (il valore di una cifra dipende da dove si trova); **non** ha un simbolo speciale per il **dieci** (lo si ottiene spostando l'1 di posizione); e ha lo **zero**.

</details>

<details>
<summary>Perché lo zero è così importante?</summary>

Perché rende possibile la **notazione posizionale** facendo da **segnaposto**: senza di esso non distingueremmo `25`, `205` e `250`. Inoltre semplifica moltiplicazione e divisione. È una delle invenzioni più importanti nella storia dei numeri.

</details>

<details>
<summary>Come si scrive 4825 con le potenze di dieci?</summary>

`4825 = 4×10³ + 8×10² + 2×10¹ + 5×10⁰` (= 4000 + 800 + 20 + 5). Le cifre a destra della virgola proseguono con esponenti **negativi** (`10⁻¹`, `10⁻²`, …).

</details>

**In sintesi:**

- I numeri sono un **codice astratto**; la **base dieci** che usiamo è **arbitraria**, figlia delle nostre dieci dita.
- I **numeri romani** sono non posizionali e senza zero: buoni per annotare, scomodi per calcolare.
- Il sistema **indo-arabo** vince grazie a tre cose: è **posizionale**, non spreca un simbolo per il dieci, e ha lo **zero** (segnaposto).
- Un numero è la somma delle **cifre × potenze della base** (`4825 = 4×10³ + …`); il dieci non è speciale, e cambiando base si arriva al **binario** dei circuiti (prossimo capitolo).
