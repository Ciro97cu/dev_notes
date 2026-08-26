# 14 · Sommare con le porte logiche
> cap. 14 di «Code» (Petzold, 2ª ed.) — orig. *Adding with Logic Gates*

L'addizione è l'operazione aritmetica più elementare, e per costruire un computer bisogna prima saper costruire qualcosa che **sommi due numeri**. Non è un dettaglio: a ben vedere, sommare è quasi l'*unica* cosa che un computer sa fare — sottrarre, moltiplicare, dividere, guidare una sonda su Marte, tutto poggia in fondo sull'addizione. In questo capitolo si mette insieme una **macchina addizionatrice** usando i mattoni dei capitoli precedenti (interruttori, lampadine, relè) già cablati nelle **porte logiche** del [capitolo 8](08-relays-and-gates.md). Sarà una macchina di carta e di mente: lavora in **binario**, riceve i due numeri da una fila di **interruttori** e mostra il risultato con una fila di **lampadine**.

## L'addizione binaria: somma e riporto

Sommare in binario funziona come in decimale: si procede **colonna per colonna**, dalla cifra meno significativa (la più a destra), sommando una coppia di cifre alla volta. La tavola dell'addizione binaria è però semplicissima:

> `0 + 0 = 0` · `0 + 1 = 1` · `1 + 0 = 1` · `1 + 1 = 10`

L'ultimo caso è la chiave: `1 + 1` non entra in una cifra sola, quindi dà `0` **con riporto di 1**. Sommare una coppia di bit produce dunque **due** bit di risultato: un **bit di somma** e un **bit di riporto** (*carry*), esattamente come quando si dice "1 più 1 fa 0, riporto 1". Conviene perciò spezzare l'addizione in **due tabelle separate**, una per la somma e una per il riporto:

| A | B | Somma |
|:--:|:--:|:--:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

| A | B | Riporto |
|:--:|:--:|:--:|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Sommando due numeri interi si procede colonna per colonna riportando l'eventuale 1 alla colonna successiva — per esempio `01100101 + 10110110 = 100011011`. La macchina lavorerà su numeri di **8 bit** (un byte, da `00h` a `FFh`, cioè 0-255): la somma di due valori a 8 bit può arrivare fino a **510** (`1FEh`, nove cifre binarie), quindi serve prevedere anche una nona lampadina per il riporto finale.

## La somma è una XOR, il riporto è una AND

Il bello è che quelle due tabelle **coincidono esattamente** con due porte logiche già note. La tabella della somma (`0, 1, 1, 0`) è quella della porta **XOR** (*OR esclusivo*): l'uscita è 1 quando gli ingressi sono **diversi**, cioè "A oppure B, ma non entrambi". La tabella del riporto (1 solo quando `1 + 1`) è invece quella della porta **AND**. La XOR, a sua volta, si costruisce con le porte del capitolo 8 (una OR e una NAND che entrano in una AND), ma una volta riconosciuta la si usa come un mattone unico.

Per sommare due singoli bit `A` e `B`, dunque, bastano **due porte**: una XOR che produce la somma e una AND che produce il riporto.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 380 150" role="img" aria-label="Half adder: porta XOR per la somma, porta AND per il riporto" style="width:100%;max-width:420px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(210,18)"><path d="M0 0 Q14 22 0 44 Q40 44 62 22 Q40 0 0 0 Z"/><path d="M-9 2 Q5 22 -9 42"/><path d="M62 22 H90"/></g>
    <g transform="translate(212,86)"><path d="M0 0 H30 A22 22 0 0 1 30 44 H0 Z"/><path d="M52 22 H88"/></g>
    <path d="M30 30 H120 M120 30 V98 M120 30 H205 M120 98 H212"/>
    <path d="M30 50 H138 M138 50 V118 M138 50 H205 M138 118 H212"/>
  </g>
  <g fill="currentColor" stroke="none"><circle cx="120" cy="30" r="2.6"/><circle cx="138" cy="50" r="2.6"/></g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13">
    <text x="4" y="34">A</text><text x="4" y="54">B</text>
    <text x="304" y="44" font-weight="700">Somma</text>
    <text x="304" y="112" font-weight="700">Riporto</text>
    <text x="238" y="46" font-size="11" text-anchor="middle" opacity=".7">XOR</text>
    <text x="240" y="114" font-size="11" text-anchor="middle" opacity=".7">AND</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli stessi due ingressi <code>A</code> e <code>B</code> entrano in una <strong>XOR</strong> (che dà il bit di somma) e in una <strong>AND</strong> (che dà il bit di riporto).</figcaption>
</figure>

## Il half adder

Questa coppia di porte è così utile che la si **incapsula** in un unico blocco, chiamato **half adder** (semi-sommatore): due ingressi `A` e `B`, due uscite `S` (Sum, la somma) e `CO` (Carry Out, il riporto). *Incapsulare* significa nascondere un insieme complesso dietro una scatola più semplice — una **scatola nera** di cui, all'occorrenza, si può sempre riaprire il coperchio per vedere le porte (e i relè) all'interno.

Perché *half* (metà)? Perché il half adder somma sì due bit, ma **non sa tenere conto di un riporto in arrivo** dalla colonna precedente. Ha solo due ingressi, mentre a partire dalla seconda colonna se ne sommano **tre**: le due cifre *più* il riporto che arriva da destra. Il half adder va quindi bene solo per la **colonna meno significativa**; per tutte le altre serve qualcosa di più.

## Il full adder

Per sommare **tre** bit (`A`, `B` e un **Carry In**) si mettono insieme **due half adder e una porta OR**. Il primo half adder somma `A` e `B`; il secondo somma quel risultato con il Carry In, producendo la somma definitiva; i due riporti prodotti dai due half adder entrano infine in una OR, che dà il riporto in uscita (i due riporti non valgono mai 1 contemporaneamente, perciò la OR basta). Il tutto si incapsula in un blocco chiamato **full adder**:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 210" role="img" aria-label="Full adder costruito con due half adder e una porta OR" style="width:100%;max-width:500px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="1.8">
    <rect x="120" y="128" width="96" height="60" rx="4"/>
    <rect x="250" y="40" width="96" height="60" rx="4"/>
    <rect x="372" y="140" width="52" height="42" rx="4"/>
    <path d="M60 56 H250"/>
    <path d="M60 148 H120"/><path d="M60 176 H120"/>
    <path d="M216 148 H234 V70 H250"/>
    <path d="M346 56 H452"/>
    <path d="M216 176 H360 V170 H372"/>
    <path d="M346 84 H358 V152 H372"/>
    <path d="M424 161 H452"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <text x="168" y="154" font-size="12" font-weight="700">Half</text><text x="168" y="170" font-size="12" font-weight="700">Adder</text>
    <text x="298" y="66" font-size="12" font-weight="700">Half</text><text x="298" y="82" font-size="12" font-weight="700">Adder</text>
    <text x="398" y="166" font-size="12" font-weight="700">OR</text>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12">
    <text x="8" y="60">Carry In</text><text x="34" y="152">A</text><text x="34" y="180">B</text>
    <text x="456" y="60" font-weight="700">Somma</text><text x="456" y="165" font-weight="700">Riporto</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un <strong>full adder</strong>: due half adder in cascata (per sommare A, B e il Carry In) più una OR che unisce i due riporti in un unico Carry Out.</figcaption>
</figure>

Il full adder ha quindi **tre** ingressi (`A`, `B`, `Carry In`) e **due** uscite (`Somma`, `Carry Out`), riassunti dalla sua tabella di verità:

| A | B | Carry In | Somma | Carry Out |
|:--:|:--:|:--:|:--:|:--:|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

> [!tip]
> La logica è ricorsiva e pulita: due porte fanno un **half adder**, due half adder più una OR fanno un **full adder**, e, come si vedrà tra poco, più full adder in fila fanno un sommatore di qualunque ampiezza. Ogni livello è una **scatola** costruita con le scatole del livello sotto.

## Quanti relè servono (i famosi 144)

Vale la pena contare i relè, ricordando che ogni porta AND, OR e NAND è fatta di **due** relè:

- una **XOR** = OR + NAND + AND = **6 relè**;
- un **half adder** = XOR + AND = **8 relè**;
- un **full adder** = due half adder + OR = 2×8 + 2 = **18 relè**;
- l'intero **sommatore a 8 bit** = otto full adder = 8×18 = **144 relè**.

## Da 1 bit a 8 bit: la catena del riporto

Un full adder somma una sola colonna. Per sommare numeri di **8 bit** se ne mettono **otto in fila**, uno per colonna, e si **incatenano i riporti**: il `Carry Out` di ogni full adder diventa il `Carry In` di quello immediatamente più significativo (a sinistra). Il primo full adder, quello del bit meno significativo, non ha un riporto in arrivo, quindi il suo `Carry In` è collegato a massa (vale 0); il `Carry Out` dell'ultimo, il più significativo, accende la **nona** lampadina.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="-52 0 545 150" role="img" aria-label="Adder a 8 bit: otto full adder in catena con il riporto che si propaga da destra a sinistra" style="width:100%;max-width:600px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="34" y="64" width="40" height="46" rx="4"/><rect x="88" y="64" width="40" height="46" rx="4"/><rect x="142" y="64" width="40" height="46" rx="4"/><rect x="196" y="64" width="40" height="46" rx="4"/><rect x="250" y="64" width="40" height="46" rx="4"/><rect x="304" y="64" width="40" height="46" rx="4"/><rect x="358" y="64" width="40" height="46" rx="4"/><rect x="412" y="64" width="40" height="46" rx="4"/><path d="M46 48 V64"/><path d="M62 48 V64"/><path d="M54 110 V126"/><path d="M100 48 V64"/><path d="M116 48 V64"/><path d="M108 110 V126"/><path d="M154 48 V64"/><path d="M170 48 V64"/><path d="M162 110 V126"/><path d="M208 48 V64"/><path d="M224 48 V64"/><path d="M216 110 V126"/><path d="M262 48 V64"/><path d="M278 48 V64"/><path d="M270 110 V126"/><path d="M316 48 V64"/><path d="M332 48 V64"/><path d="M324 110 V126"/><path d="M370 48 V64"/><path d="M386 48 V64"/><path d="M378 110 V126"/><path d="M424 48 V64"/><path d="M440 48 V64"/><path d="M432 110 V126"/><path d="M88 87.0 H74"/><path d="M142 87.0 H128"/><path d="M196 87.0 H182"/><path d="M250 87.0 H236"/><path d="M304 87.0 H290"/><path d="M358 87.0 H344"/><path d="M412 87.0 H398"/><path d="M452 87.0 h18"/><path d="M470 81.0 v12 M474 83.0 v8 M478 85.0 v4"/><path d="M34 87.0 h-20"/></g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif"><text x="54" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="54" y="44" font-size="9" text-anchor="middle" opacity=".7">A7 B7</text><text x="54" y="137" font-size="9" text-anchor="middle" opacity=".7">S7</text><text x="108" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="108" y="44" font-size="9" text-anchor="middle" opacity=".7">A6 B6</text><text x="108" y="137" font-size="9" text-anchor="middle" opacity=".7">S6</text><text x="162" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="162" y="44" font-size="9" text-anchor="middle" opacity=".7">A5 B5</text><text x="162" y="137" font-size="9" text-anchor="middle" opacity=".7">S5</text><text x="216" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="216" y="44" font-size="9" text-anchor="middle" opacity=".7">A4 B4</text><text x="216" y="137" font-size="9" text-anchor="middle" opacity=".7">S4</text><text x="270" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="270" y="44" font-size="9" text-anchor="middle" opacity=".7">A3 B3</text><text x="270" y="137" font-size="9" text-anchor="middle" opacity=".7">S3</text><text x="324" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="324" y="44" font-size="9" text-anchor="middle" opacity=".7">A2 B2</text><text x="324" y="137" font-size="9" text-anchor="middle" opacity=".7">S2</text><text x="378" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="378" y="44" font-size="9" text-anchor="middle" opacity=".7">A1 B1</text><text x="378" y="137" font-size="9" text-anchor="middle" opacity=".7">S1</text><text x="432" y="92" font-size="12" font-weight="700" text-anchor="middle">FA</text><text x="432" y="44" font-size="9" text-anchor="middle" opacity=".7">A0 B0</text><text x="432" y="137" font-size="9" text-anchor="middle" opacity=".7">S0</text>
    <text x="482" y="91" font-size="9" opacity=".7">0</text>
    <text x="12" y="81" font-size="9" text-anchor="end" opacity=".7">riporto</text>
    <text x="12" y="93" font-size="9" text-anchor="end" opacity=".7">finale</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Otto full adder in catena. Il bit meno significativo è a destra (Carry In a massa = 0); il riporto si propaga verso sinistra, e il riporto finale è il nono bit del risultato.</figcaption>
</figure>

Anche questa catena si incapsula in un'unica scatola: il **sommatore a 8 bit**, con gli ingressi `A₀`-`A₇` e `B₀`-`B₇`, l'uscita `S₀`-`S₇` e i due riporti `CI`/`CO`. I pedici partono da 0 e crescono verso le cifre più significative perché corrispondono agli **esponenti delle potenze di due**: il numero `01101001`, per esempio, vale `2⁶ + 2⁵ + 2³ + 2⁰ = 64 + 32 + 8 + 1 = 105`.

## Cascata: da 8 a 16 bit

Una volta scatolato, il sommatore a 8 bit diventa a sua volta un mattone. Per sommare numeri di **16 bit** se ne mettono **due in cascata**: si spezza ogni numero in **byte basso** (*low byte*) e **byte alto** (*high byte*), il sommatore di destra somma i byte bassi, e il suo `Carry Out` viene collegato al `Carry In` del sommatore di sinistra, che somma i byte alti. Nei diagrammi, le frecce a **doppia linea** con dentro un "8" indicano un percorso dati di un intero byte (*data path*). Con lo stesso trucco si arriva a 32, 64 bit e oltre.

> [!warning]
> Il riporto di questa architettura si propaga **da destra a sinistra**, un full adder alla volta (*ripple carry*): il full adder più a sinistra deve attendere che il riporto abbia attraversato tutti quelli a destra. È corretto, ma non è il modo più veloce di sommare — un limite che si sente quando si punta alla velocità.

E qui sorge la domanda giusta: *«Ma è davvero così che i computer sommano i numeri?»*. Ottima domanda — è il filo del prossimo capitolo.

## Ripasso lampo

<details>
<summary>Perché sommare due bit produce <em>due</em> bit di risultato?</summary>

Perché `1 + 1` in binario fa `10`: non entra in una cifra sola. Ogni somma di una coppia di bit dà quindi un **bit di somma** e un **bit di riporto** (*carry*) — proprio come "1 più 1 fa 0, riporto 1". Per questo la macchina calcola somma e riporto con due circuiti separati.

</details>

<details>
<summary>Quali porte logiche realizzano il bit di somma e il bit di riporto?</summary>

Il **bit di somma** è dato da una porta **XOR** (uscita 1 quando gli ingressi sono diversi: `0,1,1,0`); il **bit di riporto** da una porta **AND** (uscita 1 solo quando entrambi valgono 1). Le due porte insieme sono un **half adder**.

</details>

<details>
<summary>Che differenza c'è tra half adder e full adder?</summary>

Il **half adder** somma due bit (`A`, `B`) e produce somma e riporto, ma **non** accetta un riporto in arrivo: va bene solo per la colonna meno significativa. Il **full adder** somma **tre** bit (`A`, `B` e un `Carry In`) ed è fatto di **due half adder più una OR**: è ciò che serve per tutte le colonne dalla seconda in poi.

</details>

<details>
<summary>Da dove viene il numero di 144 relè?</summary>

Ogni porta AND/OR/NAND è fatta di 2 relè. Quindi: una **XOR** = 6 relè; un **half adder** (XOR + AND) = 8; un **full adder** (due half adder + OR) = 18; e un **sommatore a 8 bit** = otto full adder = 8 × 18 = **144 relè**.

</details>

<details>
<summary>Come si sommano numeri più larghi di 8 bit?</summary>

Si **incatenano** più sommatori: il `Carry Out` di ogni stadio diventa il `Carry In` dello stadio più significativo. Così due sommatori a 8 bit in cascata (byte basso + byte alto) formano un sommatore a **16 bit**, e lo stesso schema scala a 32, 64 bit e oltre.

</details>

**In sintesi:**

- Sommare in binario dà, per ogni coppia di bit, un **bit di somma** e un **bit di riporto**; la somma è una porta **XOR**, il riporto una **AND**.
- Le due porte formano un **half adder** (`A`, `B` → Somma, Carry Out); due half adder più una **OR** formano un **full adder**, che accetta anche un **Carry In** (tre ingressi).
- Otto full adder in catena, con il riporto che si propaga (*ripple carry*), fanno un **sommatore a 8 bit** (`144` relè); i pedici `A₀…A₇` sono le potenze di due (`01101001` = 105).
- Incapsulando e mettendo in **cascata** i sommatori si arriva a 16, 32, 64 bit — ma il ripple carry non è il modo più **veloce** di sommare, spunto per il prossimo capitolo.
