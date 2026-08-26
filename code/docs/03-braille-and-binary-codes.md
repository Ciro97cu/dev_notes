# 03 · Braille e codici binari
> cap. 3 di «Code» (Petzold, 2ª ed.) — orig. *Braille and Binary Codes*

Samuel Morse non fu il primo a tradurre la lingua scritta in un codice interpretabile, né il primo a essere ricordato più per il nome del suo codice che per sé stesso. Quell'onore spetta a un adolescente cieco francese, **Louis Braille**, nato diciotto anni dopo Morse ma precocissimo. In questo capitolo si "disseziona" il Braille — non per impararlo, ma per capire meglio la natura dei codici. E la scoperta centrale è che il Braille, molto prima dei computer, è già a tutti gli effetti un **codice binario**, governato dalle stesse potenze di due del capitolo precedente.

## Una storia di puntini in rilievo

Louis Braille nacque nel **1809** a Coupvray, in Francia, venticinque miglia a est di Parigi; suo padre era un sellaio. A tre anni, giocando nel laboratorio del padre, si conficcò un punteruolo in un occhio: l'infezione si estese all'altro e lo lasciò completamente cieco. La sua intelligenza fu però notata presto e, a dieci anni, fu mandato alla Royal Institution for Blind Youth di Parigi.

Il grande ostacolo nell'istruzione dei bambini ciechi era la mancanza di materiale di lettura accessibile. **Valentin Haüy** (1745–1822), fondatore della scuola parigina, aveva inventato un sistema per imprimere in rilievo sulla carta le lettere in un grande font arrotondato, leggibile al tatto. Ma era difficile da usare e pochi libri furono prodotti così. Haüy era prigioniero di un preconcetto: per lui una A doveva *avere la forma* di una A. Non aveva colto che, per chi non vede, poteva essere più adatto un tipo di codice del tutto diverso dalle lettere in rilievo.

L'idea alternativa arrivò da una fonte inattesa. **Charles Barbier**, capitano dell'esercito francese, aveva ideato entro il 1815 un sistema detto *écriture nocturne* ("scrittura notturna"): un motivo di **punti in rilievo** su carta spessa, pensato perché i soldati si passassero messaggi al buio, in silenzio. I punti si imprimevano dal retro del foglio con uno stilo a punta e si leggevano con le dita. Louis Braille conobbe il sistema di Barbier a dodici anni. Gli piacquero i punti in rilievo, non solo perché comodi da **leggere** con le dita, ma anche perché facili da **scrivere**: uno studente con carta e stilo poteva finalmente prendere appunti e rileggerli. Braille lo perfezionò e in tre anni, a quindici, arrivò al proprio sistema, le cui basi si usano ancora oggi. Nel 1835 contrasse la tubercolosi, che lo uccise poco dopo il quarantatreesimo compleanno, nel 1852.

## La cella a sei punti

In Braille ogni simbolo (lettere, numeri, punteggiatura) è codificato come uno o più punti in rilievo dentro una **cella di due colonne per tre righe**. I sei punti si numerano così:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 150 160" role="img" aria-label="La cella Braille a sei punti, numerati da 1 a 6" style="width:100%;max-width:170px;height:auto;color:inherit">
  <g fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="50" cy="35" r="15"/><circle cx="50" cy="80" r="15"/><circle cx="50" cy="125" r="15"/>
    <circle cx="100" cy="35" r="15"/><circle cx="100" cy="80" r="15"/><circle cx="100" cy="125" r="15"/>
  </g>
  <g fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="15" text-anchor="middle" dominant-baseline="central">
    <text x="50" y="35">1</text><text x="50" y="80">2</text><text x="50" y="125">3</text>
    <text x="100" y="35">4</text><text x="100" y="80">5</text><text x="100" y="125">6</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I sei punti della cella: 1-2-3 nella colonna sinistra, 4-5-6 nella destra.</figcaption>
</figure>

Sulla carta ogni punto è **in rilievo** oppure **piatto**. Per mostrare il Braille sulla pagina stampata si disegnano tutti e sei i punti: **grandi** quelli in rilievo, **piccoli** quelli piatti. Nel carattere qui sotto, per esempio, sono in rilievo i punti 1, 3 e 5, mentre 2, 4 e 6 restano piatti:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 150 160" role="img" aria-label="Esempio: punti 1, 3 e 5 in rilievo, gli altri piatti" style="width:100%;max-width:170px;height:auto;color:inherit">
  <g fill="currentColor">
    <circle cx="50" cy="35" r="14"/><circle cx="50" cy="125" r="14"/><circle cx="100" cy="80" r="14"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4">
    <circle cx="50" cy="80" r="5"/><circle cx="100" cy="35" r="5"/><circle cx="100" cy="125" r="5"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Punti grandi = in rilievo (1, 3, 5); punti piccoli = piatti (2, 4, 6).</figcaption>
</figure>

Ed ecco il punto che conta: quei punti sono **binari**. Ogni punto è o piatto o in rilievo — due soli stati, esattamente come il punto e la linea del Morse o come l'acceso/spento di un interruttore. Possiamo quindi applicare ciò che sappiamo dal capitolo 2: con **sei** elementi binari il numero di combinazioni è

> **2 × 2 × 2 × 2 × 2 × 2 = 2⁶ = 64.**

Il sistema Braille può perciò rappresentare **64 codici** distinti, e non uno di più: 64 è il tetto imposto dalla cella a sei punti. Non è necessario che siano usati tutti, ma è il limite.

## L'alfabeto e il suo schema

Le lettere minuscole non sono assegnate a caso: seguono uno schema regolare, che si vede meglio dividendole in tre righe. La **prima riga** (a-j) usa solo i quattro punti in alto — 1, 2, 4, 5. La **seconda riga** (k-t) ripete esattamente la prima **aggiungendo il punto 3**. La **terza riga** (u-z) ripete la prima **aggiungendo i punti 3 e 6**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 170" role="img" aria-label="Come la a diventa k aggiungendo il punto 3, e u aggiungendo i punti 3 e 6" style="width:100%;max-width:460px;height:auto;color:inherit">
  <!-- a: punto 1 -->
  <g transform="translate(40,20)">
    <circle cx="20" cy="15" r="12" fill="currentColor"/>
    <g fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35"><circle cx="20" cy="55" r="5"/><circle cx="20" cy="95" r="5"/><circle cx="60" cy="15" r="5"/><circle cx="60" cy="55" r="5"/><circle cx="60" cy="95" r="5"/></g>
    <text x="40" y="140" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="15" font-weight="700" text-anchor="middle">a</text>
    <text x="40" y="160" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7" text-anchor="middle">punto 1</text>
  </g>
  <text x="185" y="70" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="22" text-anchor="middle" opacity=".6">+3</text>
  <!-- k: punti 1,3 -->
  <g transform="translate(210,20)">
    <circle cx="20" cy="15" r="12" fill="currentColor"/><circle cx="20" cy="95" r="12" fill="currentColor"/>
    <g fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35"><circle cx="20" cy="55" r="5"/><circle cx="60" cy="15" r="5"/><circle cx="60" cy="55" r="5"/><circle cx="60" cy="95" r="5"/></g>
    <text x="40" y="140" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="15" font-weight="700" text-anchor="middle">k</text>
    <text x="40" y="160" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7" text-anchor="middle">punti 1,3</text>
  </g>
  <text x="355" y="70" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="22" text-anchor="middle" opacity=".6">+6</text>
  <!-- u: punti 1,3,6 -->
  <g transform="translate(380,20)">
    <circle cx="20" cy="15" r="12" fill="currentColor"/><circle cx="20" cy="95" r="12" fill="currentColor"/><circle cx="60" cy="95" r="12" fill="currentColor"/>
    <g fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35"><circle cx="20" cy="55" r="5"/><circle cx="60" cy="15" r="5"/><circle cx="60" cy="55" r="5"/></g>
    <text x="40" y="140" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="15" font-weight="700" text-anchor="middle">u</text>
    <text x="40" y="160" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="11" opacity=".7" text-anchor="middle">punti 1,3,6</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso "guscio" (la a) genera k aggiungendo il punto 3, e u aggiungendo i punti 3 e 6.</figcaption>
</figure>

Ecco le tre righe per intero (il glifo mostra i punti in rilievo; la colonna *Punti* li elenca):

**Riga 1 — solo punti 1, 2, 4, 5**

| a | b | c | d | e | f | g | h | i | j |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| ⠁ | ⠃ | ⠉ | ⠙ | ⠑ | ⠋ | ⠛ | ⠓ | ⠊ | ⠚ |
| 1 | 12 | 14 | 145 | 15 | 124 | 1245 | 125 | 24 | 245 |

**Riga 2 — come la riga 1 + punto 3**

| k | l | m | n | o | p | q | r | s | t |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| ⠅ | ⠇ | ⠍ | ⠝ | ⠕ | ⠏ | ⠟ | ⠗ | ⠎ | ⠞ |
| 13 | 123 | 134 | 1345 | 135 | 1234 | 12345 | 1235 | 234 | 2345 |

**Riga 3 — come la riga 1 + punti 3 e 6** (la w manca: non esisteva nel francese classico di Braille)

| u | v | x | y | z |
|:--:|:--:|:--:|:--:|:--:|
| ⠥ | ⠧ | ⠭ | ⠽ | ⠵ |
| 136 | 1236 | 1346 | 13456 | 1356 |

Con queste 25 lettere si scrive già. La frase "you and me", per esempio, si dispone così: le celle di una stessa parola sono separate da un piccolo spazio, le parole da uno spazio più ampio (in pratica una cella vuota).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 336 82" role="img" aria-label="you and me in Braille" style="width:100%;max-width:336px;height:auto;color:inherit"><circle cx="14" cy="12" r="5.5" fill="currentColor"/><circle cx="14" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="14" cy="56" r="5.5" fill="currentColor"/><circle cx="30" cy="12" r="5.5" fill="currentColor"/><circle cx="30" cy="34" r="5.5" fill="currentColor"/><circle cx="30" cy="56" r="5.5" fill="currentColor"/><circle cx="48" cy="12" r="5.5" fill="currentColor"/><circle cx="48" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="48" cy="56" r="5.5" fill="currentColor"/><circle cx="64" cy="12" r="2.4" fill="currentColor" opacity=".35"/><circle cx="64" cy="34" r="5.5" fill="currentColor"/><circle cx="64" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="82" cy="12" r="5.5" fill="currentColor"/><circle cx="82" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="82" cy="56" r="5.5" fill="currentColor"/><circle cx="98" cy="12" r="2.4" fill="currentColor" opacity=".35"/><circle cx="98" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="98" cy="56" r="5.5" fill="currentColor"/><circle cx="142" cy="12" r="5.5" fill="currentColor"/><circle cx="142" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="142" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="158" cy="12" r="2.4" fill="currentColor" opacity=".35"/><circle cx="158" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="158" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="176" cy="12" r="5.5" fill="currentColor"/><circle cx="176" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="176" cy="56" r="5.5" fill="currentColor"/><circle cx="192" cy="12" r="5.5" fill="currentColor"/><circle cx="192" cy="34" r="5.5" fill="currentColor"/><circle cx="192" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="210" cy="12" r="5.5" fill="currentColor"/><circle cx="210" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="210" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="226" cy="12" r="5.5" fill="currentColor"/><circle cx="226" cy="34" r="5.5" fill="currentColor"/><circle cx="226" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="270" cy="12" r="5.5" fill="currentColor"/><circle cx="270" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="270" cy="56" r="5.5" fill="currentColor"/><circle cx="286" cy="12" r="5.5" fill="currentColor"/><circle cx="286" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="286" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="304" cy="12" r="5.5" fill="currentColor"/><circle cx="304" cy="34" r="2.4" fill="currentColor" opacity=".35"/><circle cx="304" cy="56" r="2.4" fill="currentColor" opacity=".35"/><circle cx="320" cy="12" r="2.4" fill="currentColor" opacity=".35"/><circle cx="320" cy="34" r="5.5" fill="currentColor"/><circle cx="320" cy="56" r="2.4" fill="currentColor" opacity=".35"/></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">«you and me» in Braille (punti grandi = in rilievo). Tre parole (<em>you</em>, <em>and</em>, <em>me</em>) separate da uno spazio più ampio.</figcaption>
</figure>

Restano coperti solo 25 dei 64 codici possibili.

C'è un motivo di fondo dietro questa regolarità. Il Braille nasce per essere **punzonato a mano**, operazione poco precisa; per questo le lettere sono definite come **forme uniche** che, anche spostate un po' sulla pagina, mantengono il significato: la a è "un punto", la b "due punti in verticale", la c "due punti in orizzontale". È **ridondanza** che tollera l'imprecisione, e quindi una forma di **correzione d'errore** — utile perché un codice è soggetto a errori di *scrittura* (encoding), di *lettura* (decoding) e di *trasmissione* (una pagina rovinata).

## Riusare i 64 codici: indicatori, shift ed escape

Venticinque lettere sono ben poche rispetto a 64 codici, e il sistema usato oggi per l'inglese (il **Grade 2 Braille**) non spreca nulla: introduce contrazioni (un codice-lettera isolato vale una parola comune) e riusa gli stessi 64 codici facendoli **cambiare significato a seconda del contesto**. È qui che il Braille anticipa due idee fondamentali dell'informatica.

La prima è l'**indicatore di numero**. Esiste un codice (i punti 3-4-5-6, ⠼) che, posto davanti, dichiara: "*i codici che seguono vanno letti come numeri*". Le cifre 1-0 riusano esattamente i codici delle lettere a-j. Così la sequenza ⠼⠃⠑⠋ significa **256** (indicatore di numero, poi b→2, e→5, f→6). Questo indicatore non riguarda un solo codice: cambia il senso di **tutti** quelli successivi finché un altro indicatore (quello di lettera) non lo annulla. Un codice che altera il significato di tutto ciò che segue, finché non viene disfatto, si chiama **codice di precedenza** o **shift**: è esattamente ciò che fa il tasto **Shift** di una tastiera.

La seconda è l'**indicatore di maiuscola** (il solo punto 6, ⠠), che rende maiuscola **soltanto la lettera immediatamente successiva**. Un codice che cambia l'interpretazione del *prossimo* codice, e solo di quello, si chiama **codice di escape**: "esci" un istante dall'interpretazione normale per leggere il codice seguente in modo diverso. Così il nome ⠠⠇⠕⠥⠊⠎ si legge *Louis* (indicatore di maiuscola, poi l, o, u, i, s).

> [!warning]
> Shift ed escape rendono la decodifica **dipendente dal contesto**: un singolo codice non si può più interpretare da solo, bisogna sapere quali codici l'hanno preceduto. È potente (permette di dire tanto con pochi simboli) ma è anche la radice di parecchia complessità nei codici che rappresentano il linguaggio scritto in binario.

## Otto punti, 256 codici

Già dal 1855 alcuni proposero di espandere la cella con una quarta riga di due punti. Il **Braille a otto punti** serve a scopi speciali (musica, stenografia, kanji giapponesi) e porta i codici a **2⁸ = 256**. È un numero abbastanza grande da dare un codice **proprio** a minuscole, maiuscole, cifre e punteggiatura, senza più bisogno di shift ed escape. Quel 256, cioè 2⁸, tornerà presto: è il numero di valori di un **byte**, l'unità con cui i computer misurano l'informazione.

> [!tip]
> Il filo dei primi tre capitoli è sempre lo stesso: due soli stati, combinati, rappresentano tutto. Morse (punto/linea), Braille (piatto/rilievo), interruttore (spento/acceso) sono lo stesso codice binario visto da angolazioni diverse. E il conto delle combinazioni è sempre 2ⁿ: 6 punti → 64, 8 punti → 256.

## Ripasso lampo

<details>
<summary>Perché il Braille è un codice binario, e quanti codici permette una cella a sei punti?</summary>

Perché ogni punto ha **due soli stati**, piatto o in rilievo. Con sei punti indipendenti le combinazioni sono `2⁶ = 64`: è il numero massimo di codici rappresentabili da una cella (non tutti necessariamente usati).

</details>

<details>
<summary>Qual è lo schema delle tre righe dell'alfabeto Braille?</summary>

La **riga 1** (a-j) usa solo i punti **1, 2, 4, 5**. La **riga 2** (k-t) ripete la riga 1 **aggiungendo il punto 3**. La **riga 3** (u-z) ripete la riga 1 **aggiungendo i punti 3 e 6**. La stessa "forma" di base si sposta in basso e a destra.

</details>

<details>
<summary>Perché Louis Braille definì le lettere come "forme uniche"?</summary>

Perché il sistema si punzona a mano, in modo poco preciso: definire ogni lettera come una forma distinta e riconoscibile (un punto, due punti verticali, due orizzontali…) introduce **ridondanza**, così una piccola imprecisione non cambia il significato. È una forma di **tolleranza/correzione degli errori** di scrittura, lettura o trasmissione.

</details>

<details>
<summary>Che differenza c'è tra un codice <em>shift</em> (di precedenza) e uno <em>escape</em>, con esempi in Braille?</summary>

Un codice **shift** cambia il significato di **tutti** i codici successivi finché non viene annullato: l'**indicatore di numero** (⠼) fa leggere come cifre tutto ciò che segue, come il tasto Shift della tastiera. Un codice **escape** cambia l'interpretazione del **solo codice seguente**: l'**indicatore di maiuscola** (⠠, punto 6) rende maiuscola solo la lettera immediatamente dopo.

</details>

<details>
<summary>Perché il Braille a otto punti è comodo per i computer?</summary>

Perché offre `2⁸ = 256` codici: abbastanza per dare un codice **proprio** a minuscole, maiuscole, cifre e punteggiatura, eliminando la necessità di shift ed escape. E 256 è proprio il numero di valori di un **byte**.

</details>

**In sintesi:**

- Il **Braille è un codice binario**: ogni punto è piatto o in rilievo, e una cella a 6 punti dà `2⁶ = 64` codici (richiamo diretto alle potenze di due del capitolo 2).
- L'alfabeto ha uno **schema sistematico** a tre righe (base 1,2,4,5; poi +3; poi +3,6), pensato anche per **tollerare l'imprecisione** della punzonatura.
- Riusare 64 codici richiede **codici shift** (cambiano tutto ciò che segue, come l'indicatore di numero) e **codici escape** (cambiano solo il codice successivo, come l'indicatore di maiuscola): la decodifica diventa **dipendente dal contesto**.
- Il **Braille a otto punti** porta a `2⁸ = 256`, lo stesso numero di valori di un **byte**: un ponte verso i capitoli sui numeri.
