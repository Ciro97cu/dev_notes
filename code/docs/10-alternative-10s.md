# 10 · Dieci alternativi
> cap. 10 di «Code» (Petzold, 2ª ed.) — orig. *Alternative 10s*

Il capitolo 9 ha lasciato un'idea: il **dieci non ha nulla di speciale**, è solo il numero delle nostre dita. Qui si tira la conseguenza, esplorando i numeri in **basi diverse** — fino a quella che conta davvero per i circuiti, la **base due**. C'è un'osservazione che fa da bussola per tutto il capitolo: in **qualunque base**, il numero `10` rappresenta sempre **la base stessa**.

## Se avessimo un altro numero di dita

Quando vediamo `10` pensiamo subito a *dieci* anatre — ma solo perché abbiamo dieci dita. Con un numero diverso di dita, lo stesso `10` significherebbe una quantità diversa: otto, quattro, o persino due. Appena finiscono le cifre singole, infatti, il **primo numero a due cifre è sempre `10`**, qualunque sia la base. Quando arriveremo al punto in cui `10` vale solo *due* anatre, saremo pronti a far rappresentare i numeri da interruttori, lampadine e porte logiche.

## Ottale (base otto) e quaternario (base quattro)

Se avessimo **quattro dita per mano** (otto in tutto), come i personaggi dei cartoni animati, avremmo trovato "naturale" basare i numeri sull'**otto**: è il sistema **ottale**. In ottale non servono i simboli `8` e `9`: si conta `0, 1, 2, 3, 4, 5, 6, 7` e poi… si è a corto di cifre, quindi viene `10` — che in ottale vale **otto**. Allo stesso modo, avendo quattro "dita" (come le dita di una zampa di gatto) si conta in **quaternario** (base quattro): cifre `0, 1, 2, 3`, poi `10` che vale **quattro**. In entrambi i casi il meccanismo è quello posizionale del capitolo 9, solo con potenze di 8 o di 4 al posto di quelle di 10.

## Binario (base due): soltanto 0 e 1

Scendendo fino a **due** dita si arriva al **binario**, con due sole cifre: `0` e `1` — le stesse che nell'algebra di Boole erano *falso*/*vero*, *no*/*sì*. In binario il numero dopo `1` è **`10`** (che vale *due*): sorprende, ma è la solita regola. Si conta così:

> `0, 1, 10, 11, 100, 101, 110, 111, 1000, 1001, 1010, …`

I numeri binari non diventano *grandi*, diventano **lunghi**, e in fretta. Ecco lo stesso valore in quattro basi:

| Decimale | Binario | Ottale | Quaternario |
|:--:|:--:|:--:|:--:|
| 0 | 0 | 0 | 0 |
| 1 | 1 | 1 | 1 |
| 2 | 10 | 2 | 2 |
| 3 | 11 | 3 | 3 |
| 4 | 100 | 4 | 10 |
| 5 | 101 | 5 | 11 |
| 6 | 110 | 6 | 12 |
| 7 | 111 | 7 | 13 |
| 8 | 1000 | 10 | 20 |

(Si notino i punti in cui compare `10`: in binario a *due*, in quaternario a *quattro*, in ottale a *otto* — sempre alla base.)

Come in decimale ogni posizione valeva una potenza di dieci, in binario ogni posizione vale una **potenza di due** (uno, due, quattro, otto, sedici, trentadue…). Leggere un numero binario in decimale significa sommare le cifre moltiplicate per la potenza di due della loro posizione:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 384 150" role="img" aria-label="Scomposizione del numero binario 1101 in potenze di due" style="width:100%;max-width:400px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" text-anchor="middle" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="20" y="14" width="64" height="50" rx="4"/><rect x="114" y="14" width="64" height="50" rx="4"/><rect x="208" y="14" width="64" height="50" rx="4"/><rect x="302" y="14" width="64" height="50" rx="4"/></g>
    <g font-size="30" font-weight="700"><text x="52" y="49">1</text><text x="146" y="49">1</text><text x="240" y="49">0</text><text x="334" y="49">1</text></g>
    <g font-size="14"><text x="52" y="88">× 2³</text><text x="146" y="88">× 2²</text><text x="240" y="88">× 2¹</text><text x="334" y="88">× 2⁰</text></g>
    <g font-size="12" opacity=".75"><text x="52" y="108">= 8</text><text x="146" y="108">= 4</text><text x="240" y="108">= 0</text><text x="334" y="108">= 1</text></g>
    <g font-size="10" opacity=".5"><text x="52" y="126">otto</text><text x="146" y="126">quattro</text><text x="240" y="126">due</text><text x="334" y="126">uno</text></g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = <strong>13</strong>. Stesso identico meccanismo del decimale, con potenze di due.</figcaption>
</figure>

Un `1` seguito da soli zeri è sempre una **potenza di due**, e l'esponente è pari al numero di zeri:

| n | 2ⁿ (decimale) | in binario |
|:--:|:--:|:--|
| 0 | 1 | 1 |
| 1 | 2 | 10 |
| 2 | 4 | 100 |
| 3 | 8 | 1000 |
| 4 | 16 | 10000 |
| 8 | 256 | 100000000 |
| 10 | 1024 | 10000000000 |

## Il bit

Una cifra binaria — un `0` o un `1` — è l'unità d'informazione più piccola possibile: due soli stati. Attorno al **1947** il matematico americano **John Wilder Tukey** (1915-2000) coniò una parola più corta al posto di *binary digit*: **bit**. Un bit è esattamente questo: una scelta tra due possibilità, la stessa dualità che abbiamo visto in punto/linea, rilievo/piatto, acceso/spento, vero/falso.

## Dal binario ai circuiti

Ed ecco perché il binario è *la* base dei computer: le due cifre `0` e `1` corrispondono perfettamente a **spento/acceso**, assenza/presenza di corrente. Con gli interruttori, le lampadine e le porte logiche del capitolo 8 si possono già costruire circuiti che *maneggiano* numeri binari. Petzold ne mostra due, fatti di AND, OR e inverter: un **decoder 3-a-8**, che prende un numero binario di 3 cifre (tre interruttori) e accende **una sola** di 8 lampadine (per esempio `100` accende la lampadina 4); e il suo opposto, un **encoder 8-a-3**, che scegliendo una tra 8 posizioni produce le 3 cifre binarie corrispondenti (scegliendo l'ottale 6 si ottiene `110`). È il ponte tra i **numeri** e i **circuiti**: da qui in poi il libro costruisce con i bit.

> [!tip]
> Due idee da fissare: (1) in **ogni** base, `10` è la base; (2) un numero binario si legge come in decimale, ma con **potenze di due** (`1101₂ = 8+4+0+1 = 13`). Il binario è "naturale" per i circuiti perché ha due cifre come l'interruttore ha due stati.

> [!warning]
> Attenzione a "leggere" i binari come decimali: `100` **non** è cento, è `4`; `1000` non è mille, è `8`. Senza indicare la base, `10` è ambiguo — per questo a volte si scrive il pedice: `10₂` (due), `10₈` (otto), `10₁₀` (dieci).

## Ripasso lampo

<details>
<summary>Perché in ogni base il numero "10" rappresenta la base stessa?</summary>

Perché appena si esauriscono le cifre singole, il primo numero a **due cifre** è `10`. In binario le cifre singole sono 0 e 1, quindi dopo `1` viene `10` = **due**; in ottale dopo `7` viene `10` = **otto**; in decimale dopo `9` viene `10` = **dieci**.

</details>

<details>
<summary>Quante cifre hanno ottale, quaternario e binario, e da cosa "nascono"?</summary>

**Ottale** (base 8): otto cifre 0-7, come se avessimo 8 dita (i personaggi dei cartoni). **Quaternario** (base 4): quattro cifre 0-3. **Binario** (base 2): due cifre 0-1. In ogni caso la base è il numero di "dita" con cui si conta.

</details>

<details>
<summary>Cosa significa che i numeri binari "diventano lunghi, non grandi"?</summary>

Che con due sole cifre servono **molte posizioni** anche per numeri piccoli: 8 si scrive `1000`, 13 si scrive `1101`. Non rappresentano quantità enormi, ma occupano tante cifre — la lunghezza cresce in fretta.

</details>

<details>
<summary>Come si converte un numero binario in decimale?</summary>

Sommando ogni cifra **moltiplicata per la potenza di due** della sua posizione. Per esempio `1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13`. È lo stesso metodo del decimale, con base 2.

</details>

<details>
<summary>Cos'è un bit e chi ne coniò il nome?</summary>

Un **bit** è una cifra binaria (0 o 1), l'unità d'informazione più piccola: due soli stati. Il termine — contrazione di *binary digit* — fu coniato dal matematico **John W. Tukey** intorno al **1947**.

</details>

**In sintesi:**

- Il **dieci è arbitrario**: si può contare in **ottale** (8 cifre), **quaternario** (4) o **binario** (2), sempre col meccanismo posizionale. In ogni base, `10` = la base.
- Il **binario** usa solo `0` e `1`; i numeri diventano **lunghi** (non grandi), e ogni posizione vale una **potenza di due** (`1101₂ = 13`).
- Una cifra binaria è un **bit** (Tukey, 1947): due stati, come punto/linea o acceso/spento.
- Il binario combacia con i **circuiti** (0/1 = spento/acceso): con le porte del cap.8 si costruiscono già **decoder** ed **encoder** — il ponte verso il calcolo con i bit.
