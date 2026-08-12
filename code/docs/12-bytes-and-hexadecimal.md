# 12 · Byte ed esadecimale
> cap. 12 di «Code» (Petzold, 2ª ed.) — orig. *Bytes and Hexadecimal*

Un singolo bit sa dire poco — sì o no, vero o falso — ma è raggruppando **più bit** che si rappresentano numeri e, da lì, ogni sorta di dato: testo, suoni, immagini, filmati. Questo capitolo dà un nome ai due raggruppamenti che contano davvero nei computer, il **word** e soprattutto il **byte**, e introduce l'**esadecimale**, il sistema di numerazione che rende maneggevoli i byte. È la scorciatoia di notazione che accompagnerà tutto il resto del libro.

## Dal bit al word

Per spostare e manipolare i bit con comodità, un computer li raggruppa in una quantità chiamata **word** (parola). La **lunghezza del word** — quanti bit lo compongono — è una scelta architetturale fondamentale, perché tutti i dati della macchina viaggiano in gruppi di uno o più word. I primi calcolatori usavano spesso word multipli di **sei** bit (12, 18, 24), e non a caso: sei bit si rappresentano con esattamente **due cifre ottali**. L'ottale (base otto, [cap. 10](10-alternative-10s.md)) sta a tre bit come una cifra sta a un gruppetto, secondo questa corrispondenza fissa:

| binario | ottale | binario | ottale |
|:--:|:--:|:--:|:--:|
| 000 | 0 | 100 | 4 |
| 001 | 1 | 101 | 5 |
| 010 | 2 | 110 | 6 |
| 011 | 3 | 111 | 7 |

Ma l'industria prese un'altra strada. Riconosciuta l'importanza dei numeri binari, apparve quasi innaturale lavorare con dimensioni come 6, 12, 18 o 24 — che **non** sono potenze di due, ma multipli di tre. Ed entra in scena il byte.

## Il byte: otto bit

La parola **byte** nacque all'IBM intorno al **1956**, come variante di *bite* ("boccone"): fu scritta con la *y* perché nessuno la confondesse con *bit*. All'inizio indicava semplicemente il numero di bit di un certo percorso dati, ma verso la metà degli anni '60, con il grande complesso di elaboratori aziendali **System/360**, si fissò sul significato che ha ancora oggi: un byte è un gruppo di **otto bit**. È diventata l'unità di misura universale del dato digitale.

Otto bit sono una misura felice: come quantità a 8 bit un byte assume i valori da `00000000` a `11111111`, cioè da **0 a 255** in decimale — **2⁸ = 256** possibilità. Non troppo piccolo, non troppo grande. Un byte basta per un carattere di testo nella maggior parte delle lingue scritte (meno di 256 simboli); dove non basta — gli ideogrammi di cinese, giapponese e coreano — ne servono **due** (2¹⁶ = 65.536 possibilità), che di solito abbondano. Un byte descrive bene anche le 256 sfumature di grigio che l'occhio distingue in una foto in bianco e nero, e con **tre** byte si dà il colore di un pixel (rosso, verde, blu). Non stupisce che la rivoluzione del personal computer, tra fine anni '70 e primi '80, sia partita da macchine a 8 bit, poi raddoppiate a 16, 32 e 64 (cioè 2, 4 e 8 byte). Mezzo byte — quattro bit — ha pure un nome, **nibble** (o *nybble*), ma si sente molto meno spesso.

## Perché non l'ottale: otto non si divide per tre

Poiché i byte compaiono di continuo nelle viscere di un computer, conviene poterli scrivere in modo più compatto di otto cifre binarie. L'ottale sembrerebbe pronto all'uso — `10110110` diventa `266` — ma nasconde un'**incompatibilità di fondo con il byte**: otto non è divisibile per tre. Raggruppando i bit a tre a tre non si rispettano i confini fra un byte e l'altro, così la scrittura ottale di un numero di 16 bit **non** coincide con l'accostamento delle scritture ottali dei due byte che lo compongono. Se invece si raggruppano i bit **a quattro a quattro**, ogni gruppo sta esattamente dentro un byte (due gruppi per byte) e l'allineamento è perfetto:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 372 116" role="img" aria-label="Gruppi da 4 bit (hex) si allineano ai byte, gruppi da 3 (ottale) no" style="width:100%;max-width:440px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <line x1="185" y1="24" x2="185" y2="106" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity=".55"/>
    <g fill="currentColor" font-size="10" opacity=".6"><text x="59" y="16">byte 1</text><text x="269" y="16">byte 2</text></g>
    <g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="18" y="46" width="19" height="30" rx="3"/><rect x="39" y="46" width="19" height="30" rx="3"/><rect x="60" y="46" width="19" height="30" rx="3"/><rect x="81" y="46" width="19" height="30" rx="3"/><rect x="102" y="46" width="19" height="30" rx="3"/><rect x="123" y="46" width="19" height="30" rx="3"/><rect x="144" y="46" width="19" height="30" rx="3"/><rect x="165" y="46" width="19" height="30" rx="3"/><rect x="186" y="46" width="19" height="30" rx="3"/><rect x="207" y="46" width="19" height="30" rx="3"/><rect x="228" y="46" width="19" height="30" rx="3"/><rect x="249" y="46" width="19" height="30" rx="3"/><rect x="270" y="46" width="19" height="30" rx="3"/><rect x="291" y="46" width="19" height="30" rx="3"/><rect x="312" y="46" width="19" height="30" rx="3"/><rect x="333" y="46" width="19" height="30" rx="3"/></g>
    <g fill="currentColor" font-size="14" font-weight="700"><text x="28" y="66">1</text><text x="48" y="66">0</text><text x="70" y="66">1</text><text x="90" y="66">1</text><text x="112" y="66">0</text><text x="132" y="66">0</text><text x="154" y="66">1</text><text x="174" y="66">1</text><text x="196" y="66">1</text><text x="216" y="66">1</text><text x="238" y="66">0</text><text x="258" y="66">0</text><text x="280" y="66">0</text><text x="300" y="66">1</text><text x="322" y="66">0</text><text x="342" y="66">1</text></g>
    <g font-size="13"><path d="M18 44 V40 H100 V44" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="59" y="32" fill="currentColor" font-weight="700">B</text><path d="M102 44 V40 H184 V44" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="143" y="32" fill="currentColor" font-weight="700">3</text><path d="M186 44 V40 H268 V44" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="227" y="32" fill="currentColor" font-weight="700">C</text><path d="M270 44 V40 H352 V44" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="311" y="32" fill="currentColor" font-weight="700">5</text></g>
    <g font-size="13"><path d="M18 80 V84 H37 V80" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="28" y="100" fill="currentColor" font-weight="700">1</text><path d="M39 80 V84 H100 V80" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="70" y="100" fill="currentColor" font-weight="700">3</text><path d="M102 80 V84 H163 V80" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="132" y="100" fill="currentColor" font-weight="700">1</text><path d="M165 80 V84 H226 V80" fill="none" stroke="var(--link,#059669)" stroke-width="2.4"/><text x="196" y="100" fill="var(--link,#059669)" font-weight="700">7</text><path d="M228 80 V84 H289 V80" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="258" y="100" fill="currentColor" font-weight="700">0</text><path d="M291 80 V84 H352 V80" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="322" y="100" fill="currentColor" font-weight="700">5</text></g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso numero di 16 bit. In alto i gruppi da <strong>4</strong> (esadecimale <code>B3C5</code>) restano dentro i due byte; in basso i gruppi da <strong>3</strong> (ottale <code>131705</code>) scavalcano il confine — il gruppo evidenziato prende un bit dal byte 1 e due dal byte 2.</figcaption>
</figure>

Dividere ogni byte in due valori di quattro bit richiede la base **sedici**. Ed è l'esadecimale.

## Esadecimale: la base sedici

L'**esadecimale** (spesso abbreviato *hex*, benché lo stile Microsoft lo sconsigli) è la base sedici. Il nome stesso è ibrido: il prefisso *hexa-* significa "sei", ma qui vale *sedici, cioè sei più dieci*. La sua stranezza vera, però, è un'altra: mentre l'ottale usa **meno** cifre del decimale (spariscono l'8 e il 9), l'esadecimale ne richiede **di più**. Servono simboli per le quantità dieci, undici, dodici, tredici, quattordici e quindici, che in decimale occupano due cifre. Non essendocene di tradizionali, si sono presi in prestito le prime sei **lettere** dell'alfabeto:

| binario | hex | dec | binario | hex | dec |
|:--:|:--:|:--:|:--:|:--:|:--:|
| 0000 | 0 | 0 | 1000 | 8 | 8 |
| 0001 | 1 | 1 | 1001 | 9 | 9 |
| 0010 | 2 | 2 | 1010 | **A** | 10 |
| 0011 | 3 | 3 | 1011 | **B** | 11 |
| 0100 | 4 | 4 | 1100 | **C** | 12 |
| 0101 | 5 | 5 | 1101 | **D** | 13 |
| 0110 | 6 | 6 | 1110 | **E** | 14 |
| 0111 | 7 | 7 | 1111 | **F** | 15 |

Usare lettere per i numeri non è piacevolissimo (e la confusione aumenta quando poi si useranno i numeri per rappresentare le lettere), ma l'esadecimale esiste per **un solo scopo**: scrivere il valore dei byte nel modo più compatto ragionevolmente possibile. E in questo riesce benissimo.

## Un byte = due cifre esadecimali

Ogni byte, essendo di otto bit, è esattamente **due cifre esadecimali**, da `00` a `FF`. La ricetta è immediata: si spezza il byte nei suoi due **nibble** da quattro bit e si traduce ciascuno con la tabella qui sopra.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 400 150" role="img" aria-label="Un byte diviso in due nibble e due cifre esadecimali" style="width:100%;max-width:420px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="30" y="20" width="34" height="44" rx="4"/><rect x="67" y="20" width="34" height="44" rx="4"/><rect x="104" y="20" width="34" height="44" rx="4"/><rect x="141" y="20" width="34" height="44" rx="4"/><rect x="199" y="20" width="34" height="44" rx="4"/><rect x="236" y="20" width="34" height="44" rx="4"/><rect x="273" y="20" width="34" height="44" rx="4"/><rect x="310" y="20" width="34" height="44" rx="4"/>
    <path d="M30 72 V80 H175 V72"/><path d="M199 72 V80 H344 V72"/></g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" text-anchor="middle">
    <text x="47.0" y="49" font-size="22" font-weight="700">1</text><text x="84.0" y="49" font-size="22" font-weight="700">0</text><text x="121.0" y="49" font-size="22" font-weight="700">1</text><text x="158.0" y="49" font-size="22" font-weight="700">1</text><text x="216.0" y="49" font-size="22" font-weight="700">0</text><text x="253.0" y="49" font-size="22" font-weight="700">1</text><text x="290.0" y="49" font-size="22" font-weight="700">1</text><text x="327.0" y="49" font-size="22" font-weight="700">0</text>
    <text x="102" y="104" font-size="12" opacity=".7">nibble alto</text>
    <text x="272" y="104" font-size="12" opacity=".7">nibble basso</text>
    <text x="102" y="132" font-size="22" font-weight="700" fill="var(--link,#059669)">B</text>
    <text x="272" y="132" font-size="22" font-weight="700" fill="var(--link,#059669)">6</text>
    <text x="372" y="132" font-size="16" font-weight="700">= B6h</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>1011</code> vale B, <code>0110</code> vale 6: il byte <code>10110110</code> è <strong>B6h</strong>. Allo stesso modo <code>01010111</code> è <strong>57h</strong>.</figcaption>
</figure>

Resta un problema di ambiguità: `B6` si riconosce subito come esadecimale per via della lettera, ma `57` potrebbe essere decimale. Servono dunque dei segni per distinguere le basi — e ne esistono una ventina, secondo il linguaggio o l'ambiente. In questo libro (e in queste note) si usa una **`h` minuscola in coda** al numero: `B6h`, `57h`. Come per i binari, anche gli esadecimali si scrivono spesso con **zeri iniziali** per rendere chiaro quante cifre — e quindi quanti byte — si stanno maneggiando: un valore a 16 bit è `2` byte e `4` cifre hex, uno a 32 bit è `4` byte e `8` cifre hex.

## La notazione posizionale in base sedici

L'esadecimale è un normale sistema **posizionale** ([cap. 9](09-our-ten-digits.md)): cambia solo la base, quindi ogni posizione vale una **potenza di sedici** (uno, sedici, duecentocinquantasei, quattromilanovantasei…). Leggere un esadecimale in decimale significa sommare ogni cifra moltiplicata per la potenza di sedici della sua posizione:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 410 140" role="img" aria-label="Scomposizione del numero esadecimale 9A48C in potenze di sedici" style="width:100%;max-width:430px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" text-anchor="middle" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="16" y="14" width="64" height="50" rx="4"/><rect x="92" y="14" width="64" height="50" rx="4"/><rect x="168" y="14" width="64" height="50" rx="4"/><rect x="244" y="14" width="64" height="50" rx="4"/><rect x="320" y="14" width="64" height="50" rx="4"/></g>
    <g font-size="26" font-weight="700"><text x="48.0" y="49">9</text><text x="124.0" y="49">A</text><text x="200.0" y="49">4</text><text x="276.0" y="49">8</text><text x="352.0" y="49">C</text></g>
    <g font-size="13"><text x="48.0" y="86">× 16⁴</text><text x="124.0" y="86">× 16³</text><text x="200.0" y="86">× 16²</text><text x="276.0" y="86">× 16¹</text><text x="352.0" y="86">× 16⁰</text></g>
    <g font-size="12" opacity=".78"><text x="48.0" y="106">= 589 824</text><text x="124.0" y="106">= 40 960</text><text x="200.0" y="106">= 1 024</text><text x="276.0" y="106">= 128</text><text x="352.0" y="106">= 12</text></g>
    <g font-size="10" opacity=".55"><text x="124.0" y="124">= 10</text><text x="352.0" y="124">= 12</text></g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">9A48Ch = 9×16⁴ + A×16³ + 4×16² + 8×16¹ + C×16⁰ = 589.824 + 40.960 + 1.024 + 128 + 12 = <strong>631.948</strong> (ricordando A = 10 e C = 12). Stesso meccanismo del decimale, con potenze di sedici.</figcaption>
</figure>

Il verso opposto — da decimale a esadecimale — si fa con le **divisioni**. Se il numero sta in un byte (fino a 255) basta dividerlo per 16: quoziente e resto sono le due cifre. Per esempio `182 ÷ 16 = 11` con resto `6`, cioè `B6h`. Per numeri fino a 65.535 si procede allo stesso modo dividendo via via per le potenze di sedici (4096, 256, 16): così `31.148` diventa `79ACh`, e il grazioso `51.966` diventa **`CAFE`** — un numero che sembra una parola.

## Esadecimale nel mondo reale: i colori RGB

L'uso più familiare dell'esadecimale, per chi ha smanettato con l'HTML, sono i **colori**. Ogni pixel dello schermo è una combinazione di tre luci primarie additive — **rosso, verde, blu** (*RGB*) — e l'intensità di ciascuna è un byte (0-255). Servono quindi **tre byte**, sei cifre esadecimali, spesso precedute da un cancelletto:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 380 96" role="img" aria-label="Il colore #E74536 scomposto nei suoi tre byte RGB" style="width:100%;max-width:420px;height:auto;color:inherit">
  <rect x="14" y="14" width="68" height="68" rx="8" fill="#E74536" stroke="currentColor" stroke-width="1.4"/>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif">
    <text x="100" y="36" font-size="20" font-weight="700">#E74536</text>
    <text x="100" y="60" font-size="12.5">R = E7h = 231 · G = 45h = 69 · B = 36h = 54</text>
    <text x="100" y="78" font-size="12.5" opacity=".7">= rgb(231, 69, 54)</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il rosso usato nelle illustrazioni del libro: <code>#E74536</code>. Le tre coppie di cifre sono i tre byte delle componenti rossa, verde e blu.</figcaption>
</figure>

Con un po' di aritmetica si intuisce quanto contano i byte: uno schermo Full HD di 1920×1080 pixel a 3 byte l'uno richiede **6.220.800 byte** per una sola immagine, e le combinazioni possibili di colore sono 256×256×256 = **16.777.216** (in esadecimale, `1000000h`).

## Fare i conti in esadecimale

Come ogni base, anche l'esadecimale ha la sua **tavola dell'addizione**, e si somma con le normali regole del riporto: per esempio `8h + 9h = 11h`, perché otto più nove fa diciassette, cioè un sedici più uno. Farlo a mano richiede un po' di pratica; nella pratica quotidiana conviene la **modalità Programmatore** delle calcolatrici di Windows e macOS, che opera e converte tra binario, ottale, esadecimale e decimale. E per capire davvero cosa succede dentro, il **capitolo 14** costruirà un sommatore a 8 bit fatto di porte logiche.

> [!tip]
> L'esadecimale non è un sistema "nuovo": è il decimale con quattro cifre in più (A-F). Serve a **una cosa sola**, scrivere i byte in modo compatto: **1 byte = 2 cifre hex** (da `00h` a `FFh`), **2 byte = 4 cifre**, e così via. Ogni gruppo di **4 bit** ↔ **1 cifra hex**.

> [!warning]
> Occhio all'ambiguità delle basi: `57` da solo può essere decimale (cinquantasette) o esadecimale (`57h` = 87 in decimale). Per questo serve un marcatore — qui la `h` finale (`57h`). Le singole cifre no: un `9` vale 9 in ogni base, e una `A` è per forza esadecimale.

## Ripasso lampo

<details>
<summary>Cos'è un byte e perché proprio otto bit?</summary>

Un **byte** è un gruppo di **otto bit** (termine nato all'IBM verso il 1956, fissato a 8 con il System/360). Otto bit assumono 2⁸ = **256** valori (0-255): abbastanza per un carattere di testo o una sfumatura di grigio, e componibili (2 byte = 65.536 valori, 3 byte = un colore RGB). È diventato l'unità universale del dato digitale.

</details>

<details>
<summary>Perché per i byte si usa l'esadecimale e non l'ottale?</summary>

Perché otto **non** è divisibile per tre: i gruppi da 3 bit dell'ottale scavalcano i confini fra byte, così la scrittura ottale di più byte non coincide con quella dei singoli byte. I gruppi da **4 bit** dell'esadecimale invece stanno esattamente dentro un byte (due per byte), quindi **1 byte = 2 cifre hex** senza disallineamenti.

</details>

<details>
<summary>Quali sono le cifre dell'esadecimale?</summary>

Sedici: `0 1 2 3 4 5 6 7 8 9` più le lettere `A B C D E F` per le quantità da dieci a quindici. A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.

</details>

<details>
<summary>Come si converte 9A48Ch in decimale?</summary>

Con la notazione posizionale in base 16: `9×16⁴ + A×16³ + 4×16² + 8×16¹ + C×16⁰`, cioè `9×65.536 + 10×4.096 + 4×256 + 8×16 + 12×1` = **631.948**. Al contrario, da decimale a hex si divide ripetutamente per le potenze di sedici prendendo quozienti e resti.

</details>

<details>
<summary>Cosa rappresenta un colore come <code>#E74536</code>?</summary>

Tre byte, cioè le intensità (0-255) delle tre componenti **rosso, verde, blu**: E7h = 231 di rosso, 45h = 69 di verde, 36h = 54 di blu — equivalente a `rgb(231, 69, 54)`. Ogni pixel dello schermo è una di queste 256³ ≈ 16,8 milioni di combinazioni.

</details>

**In sintesi:**

- I bit si raggruppano in **word**; il raggruppamento universale è il **byte** = **8 bit**, con valori da 0 a 255 (2⁸ = 256).
- L'**ottale** non si sposa col byte (8 non è multiplo di 3); l'**esadecimale** (base 16) sì, perché **4 bit = 1 cifra hex** e quindi **1 byte = 2 cifre hex** (`00h`–`FFh`).
- Le cifre hex sono `0-9` più `A-F` (10-15); si distingue la base con un marcatore (qui la `h` finale). È notazione posizionale a potenze di **sedici**.
- Uso tipico: i **colori RGB** a tre byte (`#E74536` = rgb(231, 69, 54)). Per i conti c'è la tavola dell'addizione, la calcolatrice in modalità Programmatore, o il sommatore del **capitolo 14**.
