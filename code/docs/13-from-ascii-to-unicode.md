# 13 · Da ASCII a Unicode
> cap. 13 di «Code» (Petzold, 2ª ed.) — orig. *From ASCII to Unicode*

Ogni volta che si tocca uno schermo o si digita su una tastiera si maneggia **testo**, e niente di tutto ciò sarebbe possibile senza un modo **standardizzato** di rappresentare i caratteri con bit e byte. La codifica dei caratteri è forse lo standard più vitale dell'informatica: è ciò che permette a sistemi, programmi e produttori diversi — e a nazioni diverse — di scambiarsi testo. Eppure a volte fallisce, in modi bizzarri. Nel 2021 l'autore ricevette un'email il cui oggetto diceva *«Weâ€™ve received your payment, thanks.»*: al posto dell'apostrofo di *We've*, tre caratteri assurdi. Alla fine del capitolo si capirà **esattamente** perché succede.

## Codici a lunghezza fissa e variabile: da Morse e Braille a Baudot

Il libro era partito da due codici binari: il **Morse** e il **Braille**. Il Morse è un codice a **lunghezza variabile** — ogni carattere usa un numero diverso di elementi (punti e linee) — mentre il **Braille** è a **lunghezza fissa**, sei bit per carattere. Il Braille, però, ha bisogno di uno **shift code**: un carattere speciale che cambia il significato di quelli successivi (per esempio per passare alle cifre o alle maiuscole). Lo stesso trucco compare in un terzo codice, il **Baudot**, ideato negli anni 1870 da **Émile Baudot** del servizio telegrafico francese e usato fino agli anni '60 per i **telegrammi** (Western Union). Il Baudot girava su una **telescrivente** (*teletypewriter*): una macchina simile a una macchina da scrivere, i cui tasti sono interruttori che generano un codice binario, un bit dopo l'altro, e la cui stampante reagisce ai codici in arrivo. È da qui che viene la parola **baud**: la velocità di trasmissione dei bit.

Il Baudot è un codice a **5 bit**, quindi con soli **32** codici possibili (`00h`-`1Fh`) — troppo pochi per 26 lettere *più* le cifre e la punteggiatura. La soluzione furono due shift code: **Letter Shift** (`1Fh`) e **Figure Shift** (`1Bh`). Dopo un Figure Shift, i codici seguenti vengono letti come **numeri e simboli**; dopo un Letter Shift, tornano a essere **lettere**. Lo stesso codice `01h`, per dire, vale `T` in modalità lettere e `5` in modalità figure.

> [!warning]
> Gli shift code sono fragili: il significato di un byte dipende da uno stato deciso *prima*. Se si trasmette due volte di fila `I SPENT $25 TODAY.` e l'ultimo shift rimasto attivo era il Figure Shift, la seconda riga viene interpretata a partire dai numeri e si stampa un'accozzaglia come `8 '03,5 $25 TODAY.`. Proprio questa fragilità spinse a cercare un codice **senza** shift, con posti separati per maiuscole e minuscole.

## ASCII: sette bit, un solo standard

Quanti bit servono per un codice senza shift? Per l'inglese: 26 maiuscole + 26 minuscole + 10 cifre fanno 62, più la punteggiatura si supera 64 (il limite di 6 bit) ma si resta sotto **128** (il limite di 7). La risposta è quindi **7 bit**. È la scelta dell'**ASCII** (*American Standard Code for Information Interchange*), formalizzato nel **1967** e da allora lo standard più importante dell'informatica — con un'unica grande eccezione, Unicode, di cui si dirà tra poco.

Con 7 bit l'ASCII copre i codici da `00h` a `7Fh` (128 in tutto), che si leggono comodamente in quattro gruppi da 32. I 95 codici "visibili" sono i **caratteri grafici**: lo **spazio** (`20h`), la punteggiatura e le cifre (`20h`-`3Fh`, con le cifre `0`-`9` a `30h`-`39h`), le **maiuscole** (`41h`-`5Ah`) e le **minuscole** (`61h`-`7Ah`). Una simmetria elegante lega maiuscole e minuscole:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 400 138" role="img" aria-label="A e a in ASCII differiscono di un solo bit, quello del valore 32" style="width:100%;max-width:440px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif">
    <rect x="64" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="98" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="132" y="22" width="30" height="30" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="166" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="200" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="234" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="268" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="302" y="22" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="79.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="113.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="147.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="181.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="215.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="249.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="283.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="317.0" y="42.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><rect x="64" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="98" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="132" y="74" width="30" height="30" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="166" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="200" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="234" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="268" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="302" y="74" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="79.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="113.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="147.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="181.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="215.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="249.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="283.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="317.0" y="94.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text>
    <g fill="currentColor" text-anchor="middle">
      <text x="34" y="43" font-size="22" font-weight="700">A</text>
      <text x="34" y="95" font-size="22" font-weight="700">a</text>
      <text x="356" y="43" font-size="15" font-weight="700">41h</text>
      <text x="356" y="95" font-size="15" font-weight="700">61h</text>
    </g>
    <text x="200" y="128" font-size="11.5" text-anchor="middle" fill="currentColor" opacity=".72">Stesso schema di bit: cambia solo il bit del valore 32 (20h) — maiuscola/minuscola.</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Una lettera minuscola dista <code>20h</code> (32) dalla sua maiuscola: <code>A</code> è <code>41h</code>, <code>a</code> è <code>61h</code>. Basta ribaltare un bit per cambiare caso — un solo bit di differenza.</figcaption>
</figure>

Codificare una frase è quindi diretto: `Hello, you!` diventa `48 65 6C 6C 6F 2C 20 79 6F 75 21`. Va notato un punto sottile: dentro un testo, il *numero* 12 della frase `I am 12 years old.` **non** è il byte `0Ch`, ma i due caratteri `1` e `2`, cioè `31h 32h`.

I restanti 33 codici (`00h`-`1Fh` e `7Fh`) sono i **caratteri di controllo**: non hanno una forma visibile ma comandano un'azione, eredità dell'epoca delle telescriventi. I più importanti sono ancora oggi in uso:

| Hex | Sigla | Funzione |
|:--:|:--:|:--|
| `07h` | BEL | suona un campanello |
| `08h` | BS | backspace (utile per i caratteri composti: `è` = `65 08 60`, cioè `e` + backspace + accento) |
| `09h` | HT | tabulazione orizzontale (Tab: porta alla colonna multipla di 8) |
| `0Ah` | LF | line feed (sposta di una riga verso il basso) |
| `0Ch` | FF | form feed (espelle la pagina, ne comincia una nuova) |
| `0Dh` | CR | carriage return (torna a inizio riga) |
| `1Bh` | ESC | escape |
| `7Fh` | DEL | delete |

L'ASCII descrive **testo semplice** (*plain text*), senza corsivo, grassetto, font o dimensioni: quella roba è il **testo formattato** (*rich text*). L'**HTML** è il formato rich-text più diffuso, e la cosa curiosa è che resta comunque plain text: aggiunge la formattazione con **tag** fatti di normali caratteri ASCII (`<` e `>` sono `3Ch` e `3Eh`). Così `This is <b>bold</b> text` è testo ASCII puro che il browser *interpreta* rendendo **bold** in grassetto.

> [!warning]
> Non esiste ancora uno standard universale per marcare la **fine riga** nel testo semplice: premendo Invio, Windows (Notepad) inserisce **due** codici, `0Dh 0Ah` (CR+LF); macOS (TextEdit) solo `0Ah`; il vecchio Mac OS classico solo `0Dh`. È una delle incongruenze che rendono fastidioso leggere su un sistema un file creato su un altro.

## Oltre l'inglese: EBCDIC, ASCII estesa, code page

L'ASCII non fu adottato dentro **IBM**, che usava un proprio codice a 8 bit, l'**EBCDIC** (*Extended BCD Interchange Code*), derivato dalle schede perforate (*punch card*) — 80 caratteri per scheda, introdotte da IBM nel 1928 e usate per oltre cinquant'anni. Nell'EBCDIC le lettere non stanno in sequenza continua ma a gruppi con dei buchi, il che complica l'ordinamento alfabetico; nell'ASCII, invece, maiuscole e minuscole sono contigue e ordinarle è banale.

Il problema più serio è che l'ASCII è *americano*: non ha le lettere accentate delle lingue europee, né gli alfabeti non latini (greco, cirillico, arabo, ebraico, gli alfabeti indiani e del sud-est asiatico), né tantomeno le decine di migliaia di ideogrammi di cinese, giapponese e coreano. Poiché però i byte hanno 8 bit e l'ASCII ne usa 7, restava mezzo alfabeto libero: si potevano definire codici **ASCII estesi**, in cui i primi 128 (`00h`-`7Fh`) sono l'ASCII standard e i secondi 128 (`80h`-`FFh`) contengono quello che serve. Il guaio è che questa estensione fu fatta **molte volte e in modi diversi**. Ogni variante è una **code page** (termine nato in IBM): Windows adottò l'insieme **Windows-1252** (una superset dell'ISO-8859-1, *Latin Alphabet No. 1*), con simboli e lettere accentate europee. Per interpretare bene un testo bisogna sapere *quale* code page l'ha prodotto: sul web questa informazione sta nell'intestazione (**header**) del file HTML. Per gli ideogrammi asiatici nacquero invece i **double-byte character set** (DBCS), come lo **Shift-JIS** giapponese, in cui certi codici introducono un carattere a **2 byte** — ma anche qui, standard multipli e incompatibili.

## Unicode: un codice per tutte le lingue

Per uscire da questo caos, nel **1988** diverse grandi aziende informatiche cominciarono a sviluppare un'alternativa unica e non ambigua, adatta a **tutte** le lingue del mondo: **Unicode**. L'idea originale era un codice a **16 bit** (`0000h`-`FFFFh`), cioè **65.536** caratteri, ciascuno rappresentato da 2 byte. Unicode non riparte da zero: i primi 128 code point (`U+0000`-`U+007F`) coincidono con l'ASCII, e `U+00A0`-`U+00FF` con l'ISO Latin Alphabet No. 1. Un code point si indica con il prefisso **`U+`** seguito dal valore esadecimale:

| Code point | Carattere | Nome |
|:--|:--:|:--|
| `U+0041` | A | Latin Capital Letter A |
| `U+00A3` | £ | Pound Sign |
| `U+03C0` | π | Greek Small Letter Pi |
| `U+0416` | Ж | Cyrillic Capital Letter Zhe |
| `U+05D0` | א | Hebrew Letter Alef |
| `U+20AC` | € | Euro Sign |
| `U+221E` | ∞ | Infinity |
| `U+1F639` | 😹 | Cat Face with Tears of Joy |

Passare da 8 a 16 bit introduce però un problema nuovo: **l'ordine dei byte**. I due byte `20h ACh` valgono `20ACh` (il simbolo dell'Euro) su una macchina **big-endian**, che mette per primo il byte più significativo, ma `AC20h` (un carattere Hangul coreano) su una **little-endian**. Per disambiguare, Unicode definisce un **byte order mark** (BOM), il code point `U+FEFF` posto in testa al file: se i primi byte sono `FEh FFh` il file è big-endian, se `FFh FEh` è little-endian. *(I nomi vengono da* I viaggi di Gulliver*, dove si litiga su quale estremità dell'uovo alla coque rompere.)*

Verso la metà degli anni '90 fu chiaro che 16 bit non bastavano: servivano scritture antiche, simboli nuovi e — perché no — le **emoji**. Unicode fu quindi esteso a un codice a **21 bit**, con valori da `U+0000` fino a **`U+10FFFF`**: oltre **un milione** di caratteri possibili (per esempio `U+1F639`, la faccina di gatto qui sopra).

## UTF-8, UTF-16, UTF-32: come si mettono i code point nei byte

Un conto è il code point (il *numero* del carattere), un altro è **come** lo si scrive in memoria: quest'ultima è la **codifica**, e Unicode ne definisce tre, dette *Unicode Transformation Format* (UTF).

- **UTF-32** — ogni carattere in **4 byte** fissi. Semplice ma sprecone: *Moby-Dick*, che in ASCII pesa ~1,25 milioni di byte, diventerebbe ~5 milioni. Dei 32 bit se ne usano solo 21, 11 sono buttati.
- **UTF-16** — la maggior parte dei caratteri in **2 byte**, quelli oltre `U+FFFF` in 4 (usando l'intervallo `U+D800`-`U+DFFF`, tenuto libero apposta).
- **UTF-8** — il più importante: circa il **97% delle pagine web** lo usa, ed è il default di Notepad e TextEdit. Codifica ogni carattere con **da 1 a 4 byte** secondo il valore.

Il pregio decisivo di UTF-8 è di essere **retrocompatibile con l'ASCII**: un file di soli caratteri ASCII a 7 bit *è già* un file UTF-8 valido. Gli altri caratteri si spalmano su più byte secondo uno schema regolare:

| Intervallo Unicode | Bit utili | Sequenza di byte |
|:--|:--:|:--|
| `U+0000` – `U+007F` | 7 | `0xxxxxxx` |
| `U+0080` – `U+07FF` | 11 | `110xxxxx 10xxxxxx` |
| `U+0800` – `U+FFFF` | 16 | `1110xxxx 10xxxxxx 10xxxxxx` |
| `U+10000` – `U+10FFFF` | 21 | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

I bit fissi in testa a ogni byte (le `x` sono i bit del code point) rendono la decodifica **non ambigua**: un byte che inizia per `0` è un carattere ASCII; uno che inizia per `10` è la *continuazione* di una sequenza; uno che inizia con due o più `1` è il *primo* byte di una sequenza, e il numero di `1` iniziali dice **quanti** byte la compongono. Ecco per esempio come il simbolo della sterlina `£` (`U+00A3`, nell'intervallo a 2 byte) diventa i byte `C2h A3h`:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 190" role="img" aria-label="Codifica UTF-8 del carattere sterlina U+00A3 nei due byte C2 A3" style="width:100%;max-width:470px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <text x="235" y="18" font-size="13" text-anchor="middle">gli 11 bit significativi di U+00A3 (£)</text>
    <rect x="96" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="120" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="144" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="168" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="192" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="107.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="131.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="155.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="179.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="203.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><rect x="232" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="256" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="280" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="304" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="328" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="352" y="34" width="22" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="243.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="267.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="291.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="315.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="339.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="363.0" y="51.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text>
    <g stroke="currentColor" stroke-width="1" opacity=".45">
      <path d="M156.0 60 V80 H150 V96" fill="none"/>
      <path d="M304 60 V80 H366 V96" fill="none"/>
    </g>
    <rect x="40" y="116" width="22" height="26" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="64" y="116" width="22" height="26" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="88" y="116" width="22" height="26" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="112" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="136" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="160" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="184" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="208" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="51.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="75.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="99.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="123.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="147.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="171.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="195.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="219.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><rect x="260" y="116" width="22" height="26" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="284" y="116" width="22" height="26" rx="3" fill="var(--link,#059669)" fill-opacity="0.18" stroke="currentColor" stroke-width="1.3"/><rect x="308" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="332" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="356" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="380" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="404" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="428" y="116" width="22" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><text x="271.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="295.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="319.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="343.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="367.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="391.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">0</text><text x="415.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text><text x="439.0" y="134.2" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">1</text>
    <g text-anchor="middle" font-weight="700">
      <text x="124" y="176" font-size="15">C2h</text>
      <text x="344" y="176" font-size="15">A3h</text>
    </g>
    <text x="235" y="150" font-size="10.5" text-anchor="middle" opacity=".7">i bit colorati (110… e 10…) sono il prefisso fisso; gli altri sono i bit del code point</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli 11 bit di <code>U+00A3</code> vengono spezzati 5 + 6 e incastonati nei prefissi <code>110…</code> e <code>10…</code>: risultano i byte <code>C2h A3h</code>. Allo stesso modo <code>א</code> (<code>U+05D0</code>) diventa <code>D7 90</code>, e la faccina di gatto <code>U+1F639</code>, a 4 byte, diventa <code>F0 9F 98 B9</code>.</figcaption>
</figure>

## Il mistero del «Weâ€™ve»

Ora tutti i pezzi sono al loro posto. In quell'email, l'apostrofo di *We've* non era il vecchio apostrofo ASCII (`U+0027`) ma il più elegante **Right Single Quotation Mark** (`U+2019`), che in UTF-8 occupa **tre** byte: `E2h 80h 99h`. Fin qui nessun problema. Ma l'header del file HTML dichiarava per sbaglio la code page **`windows-1252`** invece di **`utf-8`**: il programma di posta ha quindi letto quei tre byte **uno per uno** con la tabella Windows-1252, dove valgono `â`, `€`, `™`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 460 176" role="img" aria-label="Gli stessi tre byte E2 80 99 letti come UTF-8 o come Windows-1252" style="width:100%;max-width:460px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="150" y="78" width="52" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="215" y="78" width="52" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="280" y="78" width="52" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="176.0" y="101.0" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">E2</text><text x="241.0" y="101.0" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">80</text><text x="306.0" y="101.0" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">99</text>
    <text x="215" y="70" font-size="11" text-anchor="middle" opacity=".7">tre byte: E2h 80h 99h</text>
    <g stroke="currentColor" stroke-width="1.3" fill="none" opacity=".6">
      <path d="M215 78 V40" marker-end="url(#av)"/>
      <path d="M215 112 V150" marker-end="url(#av)"/>
    </g>
    <defs><marker id="av" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor"/></marker></defs>
    <text x="215" y="30" font-size="13" text-anchor="middle">come <tspan font-weight="700">UTF-8</tspan> → ’ (un carattere: U+2019)</text>
    <text x="215" y="168" font-size="13" text-anchor="middle">come <tspan font-weight="700">Windows-1252</tspan> → â € ™ (tre caratteri)</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Stessi byte, due letture diverse: dichiarare la code page sbagliata trasforma un apostrofo in <code>â€™</code>. Mistero risolto.</figcaption>
</figure>

Unicode ha reso l'informatica un'esperienza davvero universale e multiculturale, ed è per questo uno standard importantissimo. Ma, come ogni cosa, funziona **solo se lo si usa correttamente**.

> [!tip]
> La catena da tenere a mente: un **carattere** ha un **code point** Unicode (`U+…`); il code point viene scritto in byte da una **codifica** (UTF-8/16/32); per rileggere quei byte serve conoscere la **stessa** codifica. Sbagliare la codifica dichiarata è la causa numero uno dei caratteri storti (*mojibake*).

## Ripasso lampo

<details>
<summary>Perché gli shift code del Baudot sono fragili?</summary>

Perché il significato di un codice dipende da uno **stato** (modalità lettere o figure) impostato da un carattere precedente. Se quello stato non è quello atteso — per esempio all'inizio di una riga, dopo un Figure Shift rimasto attivo — gli stessi bit vengono interpretati come numeri anziché lettere, e il testo esce sbagliato. Proprio per evitarlo l'ASCII assegna **posti separati** a maiuscole, minuscole e cifre, senza modalità.

</details>

<details>
<summary>Quanti bit usa l'ASCII e come sono organizzati i suoi codici?</summary>

**7 bit**, cioè 128 codici (`00h`-`7Fh`). Di questi, **95 sono grafici** (spazio, punteggiatura, cifre `30h`-`39h`, maiuscole `41h`-`5Ah`, minuscole `61h`-`7Ah`) e **33 sono di controllo** (`00h`-`1Fh` e `7Fh`), che non si vedono ma comandano azioni (CR, LF, Tab, BEL…). Maiuscole e minuscole distano esattamente `20h`.

</details>

<details>
<summary>Cos'è una <code>code page</code> e perché conta sul web?</summary>

È una specifica variante di **ASCII esteso a 8 bit**: i primi 128 codici sono l'ASCII standard, i secondi 128 contengono caratteri aggiuntivi (accentati, simboli) che però **cambiano da variante a variante** (Windows-1252, ISO-8859-1, ecc.). Per interpretare correttamente un testo bisogna sapere quale code page l'ha prodotto; su una pagina web questa informazione sta nell'**header** del file HTML. Dichiararne una sbagliata produce caratteri storti.

</details>

<details>
<summary>Cos'è un code point Unicode e quanti caratteri copre Unicode oggi?</summary>

Un **code point** è il numero assegnato a un carattere, scritto come `U+` seguito dall'esadecimale (per esempio `U+20AC` per l'Euro). Unicode nacque nel 1988 come codice a 16 bit (65.536 caratteri) ed è oggi un codice a **21 bit**, da `U+0000` a `U+10FFFF`: oltre **un milione** di caratteri, comprese scritture storiche ed emoji. I primi 128 code point coincidono con l'ASCII.

</details>

<details>
<summary>Che differenza c'è tra un code point e UTF-8, e perché UTF-8 è così diffuso?</summary>

Il **code point** è il *numero* del carattere; **UTF-8** è una **codifica**, cioè un modo di scriverlo in byte (da 1 a 4). UTF-8 è diffusissimo (~97% del web) perché è **retrocompatibile con l'ASCII** — un testo ASCII è già UTF-8 valido — e perché i bit di prefisso (`0…`, `110…`, `1110…`, `11110…`) rendono la decodifica non ambigua. Gli altri formati sono UTF-16 (2 o 4 byte) e UTF-32 (4 byte fissi, ma sprecone).

</details>

<details>
<summary>Perché l'email mostrava <code>Weâ€™ve</code> invece di <code>We've</code>?</summary>

Perché l'apostrofo era il Right Single Quotation Mark `U+2019`, che in UTF-8 è la sequenza di tre byte `E2h 80h 99h`. L'header HTML dichiarava però erroneamente la code page `windows-1252` invece di `utf-8`, così quei tre byte sono stati letti **singolarmente** come i tre caratteri `â`, `€`, `™`. È un classico caso di codifica dichiarata sbagliata.

</details>

**In sintesi:**

- Prima dell'ASCII: **Morse** (lunghezza variabile) e **Braille**/**Baudot** (lunghezza fissa), questi ultimi con **shift code** fragili — lo stesso bit vale cose diverse secondo la modalità.
- L'**ASCII** (7 bit, 1967) risolve con posti separati: **95 caratteri grafici** + **33 di controllo**; maiuscole e minuscole a distanza `20h`. Descrive **plain text**; l'HTML aggiunge formattazione con tag pur restando testo ASCII.
- L'ASCII è americano: per le altre lingue nacquero **EBCDIC**, gli **ASCII estesi**/**code page** (Windows-1252…) e i **DBCS** asiatici — tanti standard incompatibili.
- **Unicode** (1988) dà a ogni carattere un **code point** (`U+…`), oggi fino a `U+10FFFF` (>1 milione). Le **codifiche** UTF-8/16/32 lo scrivono in byte; **UTF-8** domina (~97% del web) perché è ASCII-compatibile. Sbagliare la codifica dichiarata genera il *mojibake* (`Weâ€™ve`).
