# 11 · Bit dopo bit dopo bit
> cap. 11 di «Code» (Petzold, 2ª ed.) — orig. *Bit by Bit by Bit*

Il capitolo 10 ha presentato il **bit** come cifra del binario, uno `0` o un `1`. Questo capitolo lo guarda da un'altra angolazione — non come cifra di un numero, ma come **unità di informazione** — e mostra che gran parte dei codici che ci circondano, dal Braille al codice a barre della zuppa in scatola, sono in fondo mucchietti di bit. Il titolo triplicato è un piccolo scherzo: si costruisce tutto *bit dopo bit dopo bit*.

## Un bit è la più piccola quantità d'informazione

Fuori dalla matematica, un bit è semplicemente una risposta a una domanda che ammette **due sole risposte**: sì/no, acceso/spento, vero/falso, presente/assente. È la quantità d'informazione più piccola che possa esistere, perché una domanda con una sola risposta possibile non informa di nulla, e una con due è già il minimo che riduca l'incertezza. Il mondo ne è pieno: un interruttore della luce (su/giù), il pollice di un imperatore romano (verso l'alto/verso il basso), la risposta a "sei sposato?" — ognuno di questi porta esattamente **un bit**.

Un solo bit, però, può pesare moltissimo se ci si è **accordati prima** su cosa significa. L'esempio che Petzold ama è la celebre cavalcata di **Paul Revere** (18 aprile 1775), resa immortale dal verso di Longfellow *"One, if by land, and two, if by sea"*. L'accordo era: **una** lanterna accesa nel campanile della Old North Church avrebbe significato "gli inglesi arrivano via terra", **due** lanterne "via mare". La scelta tra le due possibilità è un solo bit — ma un bit capace di cambiare la storia, perché il **codice** (il patto stabilito in anticipo) è ciò che gli dà senso. Si noti anche il terzo stato implicito: **nessuna** lanterna significava "non arrivano ancora". Il valore di un bit non sta nel bit, ma nell'accordo che lo interpreta.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 320 150" role="img" aria-label="Le lanterne di Paul Revere: una lanterna via terra, due lanterne via mare" style="width:100%;max-width:360px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
    <!-- campanile 1: una lanterna -->
    <path d="M40 118 H120 V54 L80 24 L40 54 Z"/>
    <rect x="72" y="70" width="16" height="22" rx="2" fill="var(--link,#059669)" fill-opacity=".85"/>
    <!-- campanile 2: due lanterne -->
    <path d="M200 118 H280 V54 L240 24 L200 54 Z"/>
    <rect x="222" y="70" width="16" height="22" rx="2" fill="var(--link,#059669)" fill-opacity=".85"/>
    <rect x="244" y="70" width="16" height="22" rx="2" fill="var(--link,#059669)" fill-opacity=".85"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <text x="80" y="138" font-size="13" font-weight="700">via terra</text>
    <text x="240" y="138" font-size="13" font-weight="700">via mare</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Una lanterna o due: la scelta tra due possibilità è <strong>un bit</strong>. È il codice concordato in anticipo a renderlo comprensibile.</figcaption>
</figure>

## Quante cose dicono *n* bit: 2ⁿ

Un bit distingue due possibilità; ma **mettendo insieme più bit** il numero di casi distinguibili cresce in fretta. Ogni bit aggiunto **raddoppia** i codici possibili, perché per ciascuna combinazione dei bit precedenti il nuovo bit può essere 0 oppure 1. Con `n` bit si hanno dunque **2ⁿ** combinazioni:

| bit | combinazioni (2ⁿ) |
|:--:|:--:|
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 16 |
| 5 | 32 |
| 6 | 64 |
| 7 | 128 |
| 8 | 256 |
| 9 | 512 |
| 10 | 1024 |

Questa è la stessa legge già incontrata più volte: le combinazioni del Braille (6 punti → 2⁶ = 64 caratteri) del [capitolo 3](03-braille-and-binary-codes.md), e in generale il conteggio del [capitolo 2](02-codes-and-combinations.md). Il messaggio da portare via è semplice: **ogni bit in più moltiplica per due** la capacità del codice.

## A ritroso: quanti bit servono? (il logaritmo in base due)

Spesso la domanda arriva dal verso opposto: *"ho un certo numero di cose da distinguere — quanti bit mi servono?"*. È l'operazione inversa dell'elevamento a potenza, cioè il **logaritmo in base due**. Se `2⁷ = 128`, allora `log₂ 128 = 7`: sette bit bastano per 128 codici. Quando il numero non è una potenza esatta di due si **arrotonda per eccesso**: per rappresentare il numero decimale `200` non bastano 7 bit (che arrivano a 128), ne servono **8** (2⁸ = 256, più che sufficienti). Allo stesso modo, le tre possibilità di Paul Revere (terra / mare / niente) darebbero `log₂ 3 ≈ 1,6`, che in pratica si arrotonda a **2 bit**.

> [!tip]
> Le due direzioni della stessa legge: **avanti** con la potenza — *"con `n` bit distinguo `2ⁿ` cose"*; **indietro** con il logaritmo — *"per distinguere `N` cose mi servono `log₂ N` bit, arrotondati per eccesso"*.

## Codici del mondo reale, fatti di bit

Una volta capito che *qualunque* scelta tra alternative si può codificare in bit, si comincia a vederli ovunque. Il **Morse** (punto/linea) e il **Braille** (punto in rilievo/liscio) dei primi capitoli erano già codici binari. Un esempio più recente e spettacolare è il paracadute del rover **Perseverance**, atterrato su Marte il **18 febbraio 2021**: le sue strisce arancioni e bianche, disposte in quattro anelli concentrici, non erano decorative ma un **messaggio binario** (bianco = 0, arancione = 1) che, decodificato a gruppi, componeva il motto del JPL *"DARE MIGHTY THINGS"* e le coordinate del laboratorio. Puro spirito da ingegneri: nascondere dei bit in bella vista.

## Il codice a barre UPC

L'esempio principe del capitolo è il codice a barre che sta su quasi ogni confezione: lo **UPC** (*Universal Product Code*), diffuso negli Stati Uniti dagli anni '70. Le righe nere e gli spazi bianchi di larghezza variabile non sono altro che **bit**: una barra sottile o uno spazio valgono `1` o `0` secondo un ritmo fisso. Ecco il codice reale della celebre zuppa Campbell's Chicken Noodle da 10¾ once, che corrisponde alle dodici cifre **`0 51000 01251 7`**:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 275 118" role="img" aria-label="Codice a barre UPC di 0 51000 01251 7" style="width:100%;max-width:320px;height:auto"><rect x="0" y="0" width="275" height="118" fill="#ffffff"/><g fill="#111111"><rect x="14.0" y="6" width="2.6" height="90"/><rect x="19.2" y="6" width="2.6" height="90"/><rect x="29.6" y="6" width="2.6" height="80"/><rect x="32.2" y="6" width="2.6" height="80"/><rect x="37.4" y="6" width="2.6" height="80"/><rect x="42.6" y="6" width="2.6" height="80"/><rect x="45.2" y="6" width="2.6" height="80"/><rect x="55.6" y="6" width="2.6" height="80"/><rect x="63.4" y="6" width="2.6" height="80"/><rect x="66.0" y="6" width="2.6" height="80"/><rect x="73.8" y="6" width="2.6" height="80"/><rect x="84.2" y="6" width="2.6" height="80"/><rect x="86.8" y="6" width="2.6" height="80"/><rect x="92.0" y="6" width="2.6" height="80"/><rect x="102.4" y="6" width="2.6" height="80"/><rect x="105.0" y="6" width="2.6" height="80"/><rect x="110.2" y="6" width="2.6" height="80"/><rect x="120.6" y="6" width="2.6" height="80"/><rect x="123.2" y="6" width="2.6" height="80"/><rect x="128.4" y="6" width="2.6" height="80"/><rect x="133.6" y="6" width="2.6" height="90"/><rect x="138.8" y="6" width="2.6" height="90"/><rect x="144.0" y="6" width="2.6" height="80"/><rect x="146.6" y="6" width="2.6" height="80"/><rect x="149.2" y="6" width="2.6" height="80"/><rect x="157.0" y="6" width="2.6" height="80"/><rect x="162.2" y="6" width="2.6" height="80"/><rect x="164.8" y="6" width="2.6" height="80"/><rect x="172.6" y="6" width="2.6" height="80"/><rect x="175.2" y="6" width="2.6" height="80"/><rect x="180.4" y="6" width="2.6" height="80"/><rect x="183.0" y="6" width="2.6" height="80"/><rect x="188.2" y="6" width="2.6" height="80"/><rect x="190.8" y="6" width="2.6" height="80"/><rect x="198.6" y="6" width="2.6" height="80"/><rect x="206.4" y="6" width="2.6" height="80"/><rect x="209.0" y="6" width="2.6" height="80"/><rect x="211.6" y="6" width="2.6" height="80"/><rect x="216.8" y="6" width="2.6" height="80"/><rect x="219.4" y="6" width="2.6" height="80"/><rect x="227.2" y="6" width="2.6" height="80"/><rect x="229.8" y="6" width="2.6" height="80"/><rect x="235.0" y="6" width="2.6" height="80"/><rect x="245.4" y="6" width="2.6" height="80"/><rect x="253.2" y="6" width="2.6" height="90"/><rect x="258.4" y="6" width="2.6" height="90"/></g><g fill="#111111" font-family="system-ui,Arial,sans-serif" font-size="12" text-anchor="middle"><text x="6" y="112">0</text><text x="71" y="112">5 1 0 0 0</text><text x="191" y="112">0 1 2 5 1</text><text x="269" y="112">7</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il codice a barre reale di <code>0 51000 01251 7</code>, disegnato bit per bit dai codici UPC. Le barre più lunghe in alto sono le tre "guardie" (inizio, centro, fine).</figcaption>
</figure>

### 95 bit per 12 cifre

Un UPC completo è fatto di **95 bit**, letti sempre come una sequenza fissa di barre e spazi tutti della stessa larghezza di base. La struttura è simmetrica:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="-16 0 432 96" role="img" aria-label="Anatomia dei 95 bit di un codice UPC" style="width:100%;max-width:440px;height:auto;color:inherit">
  <g stroke="currentColor" stroke-width="1.2">
    <rect x="10" y="16" width="12" height="40" fill="var(--link,#059669)" fill-opacity=".75"/>
    <rect x="22" y="16" width="168" height="40" fill="var(--link,#059669)" fill-opacity=".14"/>
    <rect x="190" y="16" width="20" height="40" fill="var(--link,#059669)" fill-opacity=".75"/>
    <rect x="210" y="16" width="168" height="40" fill="var(--link,#059669)" fill-opacity=".14"/>
    <rect x="378" y="16" width="12" height="40" fill="var(--link,#059669)" fill-opacity=".75"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <g font-size="10" font-weight="700">
      <text x="16" y="74">3</text><text x="106" y="74">42</text><text x="200" y="74">5</text><text x="294" y="74">42</text><text x="384" y="74">3</text>
    </g>
    <g font-size="9" opacity=".7">
      <text x="16" y="88">guardia</text><text x="106" y="88">6 cifre × 7 bit</text><text x="200" y="88">centro</text><text x="294" y="88">6 cifre × 7 bit</text><text x="384" y="88">guardia</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">3 + 42 + 5 + 42 + 3 = <strong>95 bit</strong>. Le guardie (`101` ai lati, `01010` al centro) non portano cifre: orientano il lettore e verificano la lettura.</figcaption>
</figure>

Le **guardie** — `101` all'inizio e alla fine, `01010` in mezzo — non codificano cifre. Servono a due cose: dicono allo scanner **quant'è larga** una singola barra (così il codice può essere stampato in qualunque dimensione e letto lo stesso), e fanno da controllo, perché se al posto delle guardie lo scanner non trova quel motivo fisso, sa di aver letto male o storto. In mezzo stanno **dodici cifre**, sei a sinistra e sei a destra, ciascuna codificata da **7 bit**.

### I codici delle cifre: la parità come rete di sicurezza

Ogni cifra da 0 a 9 ha il suo codice di 7 bit. Le cifre a **sinistra** usano codici che iniziano sempre con `0` e finiscono con `1`, con un numero **dispari** di `1` (parità dispari):

| cifra | codice sinistro | cifra | codice sinistro |
|:--:|:--:|:--:|:--:|
| 0 | 0001101 | 5 | 0110001 |
| 1 | 0011001 | 6 | 0101111 |
| 2 | 0010011 | 7 | 0111011 |
| 3 | 0111101 | 8 | 0110111 |
| 4 | 0100011 | 9 | 0001011 |

Le cifre a **destra** usano i codici **complementari** (ogni `0` diventa `1` e viceversa): iniziano con `1`, finiscono con `0` e hanno parità **pari**. Così lo `0` a destra è `1110010`. Questa asimmetria è furba: permette allo scanner di capire se sta leggendo il codice **dritto o alla rovescia** (passandolo al contrario sul lettore) e di raddrizzare la lettura da sé.

### Cosa dicono le dodici cifre (e cosa *non* dicono)

Le dodici cifre stampate sotto le barre — `0 51000 01251 7` — non sono lì per bellezza: se lo scanner fallisce, il cassiere le digita a mano. Ognuna ha un ruolo:

- La **prima cifra** (`0`) è il *number system character*, che dice di che tipo di prodotto si tratta: `0` è un UPC ordinario da supermercato, altri valori sono riservati (per esempio ai prodotti a peso variabile come la carne, o ai coupon).
- Le cinque cifre successive (`51000`) sono il **codice del produttore**, assegnato in modo univoco: qui la Campbell Soup Company.
- Le cinque dopo (`01251`) sono il **codice del prodotto**, scelto dal produttore per quello specifico articolo (la zuppa di pollo da 10¾ oz).
- L'ultima cifra (`7`) è la **cifra di controllo** (*modulo check character*), calcolata dalle altre undici per smascherare le letture sbagliate.

Il calcolo della cifra di controllo è un piccolo gioiello di semplicità: si sommano le cifre di posto **dispari**, si moltiplica per 3, si aggiunge la somma delle cifre di posto **pari**, e la cifra di controllo è quella che rende il totale un **multiplo di 10**. Per la zuppa: `(0+1+0+0+2+1) × 3 + (5+0+0+1+5) = 12 + 11 = 23`, e `23 + 7 = 30`, multiplo di 10. Se lo scanner legge una cifra sbagliata, quasi sempre il conto non torna e la lettura viene **rifiutata** invece di far pagare il prodotto sbagliato.

> [!warning]
> Una cosa che il codice a barre **non** contiene è il **prezzo**. Lo scanner legge solo l'identità del prodotto; il prezzo lo cerca il computer del negozio nel proprio archivio. È il motivo per cui un supermercato può cambiare i prezzi senza rietichettare gli scaffali — e per cui lo stesso prodotto costa diversamente in due negozi con lo stesso identico codice a barre.

> [!tip]
> L'idea da fissare del capitolo: dietro codici apparentemente diversissimi (lanterne, Morse, Braille, barre nere) c'è **sempre** la stessa sostanza — bit, cioè scelte tra due stati. Cambiano il supporto e l'accordo, non la natura dell'informazione.

## Ripasso lampo

<details>
<summary>In che senso un bit è "la più piccola quantità d'informazione"?</summary>

Perché è la risposta a una domanda con **due sole** possibilità (sì/no, acceso/spento). Una domanda con una sola risposta possibile non informa di nulla; due è il minimo che riduca l'incertezza. Da lì in giù non si può scendere.

</details>

<details>
<summary>Perché le lanterne di Paul Revere valgono un solo bit, e cosa lo rende significativo?</summary>

Perché comunicano una scelta tra **due** possibilità (via terra / via mare) = un bit. A dargli senso è il **codice concordato in anticipo** ("una se via terra, due se via mare"): senza quell'accordo, le lanterne accese non direbbero nulla.

</details>

<details>
<summary>Quante combinazioni danno n bit, e come si va a ritroso?</summary>

Con `n` bit si hanno **2ⁿ** combinazioni (ogni bit in più raddoppia). Per sapere quanti bit servono a distinguere `N` cose si usa il **logaritmo in base due** arrotondato per eccesso: per 200 valori servono 8 bit, perché 7 bit arrivano solo a 128.

</details>

<details>
<summary>Com'è strutturato un codice UPC e quanti bit contiene?</summary>

**95 bit**: guardia `101`, sei cifre da 7 bit, guardia centrale `01010`, altre sei cifre da 7 bit, guardia finale `101` (3 + 42 + 5 + 42 + 3). Le guardie non portano cifre: orientano lo scanner e permettono di leggere il codice in qualunque dimensione e verso.

</details>

<details>
<summary>Il codice a barre contiene il prezzo del prodotto?</summary>

**No.** Contiene solo l'identità del prodotto (tipo, produttore, prodotto) più una cifra di controllo. Il prezzo lo cerca il computer del negozio nel proprio archivio: per questo i prezzi si cambiano senza rietichettare i prodotti.

</details>

**In sintesi:**

- Un **bit** è la più piccola quantità d'informazione: la scelta tra **due** stati. Il suo significato nasce dal **codice** concordato in anticipo (le lanterne di Paul Revere).
- Con `n` bit si distinguono **2ⁿ** cose (ogni bit raddoppia); all'inverso, per `N` possibilità servono **log₂ N** bit, arrotondati per eccesso.
- Innumerevoli codici reali sono bit travestiti: Morse, Braille, il paracadute di Perseverance e i **codici a barre**.
- Lo **UPC** usa **95 bit** per 12 cifre (guardie + 6 + 6 cifre da 7 bit, con parità che consente la lettura in entrambi i versi). Codifica tipo di prodotto, produttore, prodotto e una **cifra di controllo** — ma **non** il prezzo.
