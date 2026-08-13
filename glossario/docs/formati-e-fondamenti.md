# Formati dati e fondamenti

Formati per scambiare dati e le unità con cui i computer li rappresentano.

## CSV (Comma-Separated Values)

Un file CSV memorizza dati **tabulari** in testo semplice: ogni riga è un record, i campi sono separati da una virgola (da cui il nome). La prima riga è spesso l'intestazione con i nomi delle colonne.

```csv
Nome,Cognome,Email
Mario,Rossi,mario@example.com
Luca,Bianchi,luca@example.com
```

È il formato più diffuso per importare/esportare dati da fogli di calcolo e database, grazie a semplicità e compatibilità. Limite: non rappresenta dati **annidati** o complessi (per quelli servono JSON o XML).

## XML (eXtensible Markup Language)

XML è un linguaggio di markup che struttura i dati con **tag** di apertura e chiusura, in un formato leggibile sia dall'uomo sia dalla macchina.

```xml
<persona>
  <nome>Mario</nome>
  <cognome>Rossi</cognome>
  <email>mario@example.com</email>
</persona>
```

A differenza del CSV, gestisce dati annidati e complessi (un `<libro>` può contenere `<capitolo>`, che contiene `<paragrafo>`). È usato per scambio dati tra sistemi (es. SOAP) e per configurazioni. Per la sua verbosità, in molti casi è stato soppiantato da **JSON**.

## Bit e Byte

Alla base di ogni operazione di un computer c'è il **sistema binario**: due soli simboli, `0` e `1`.

- **Bit** — l'unità di informazione più piccola. Assume due stati (`0`/`1`, spento/acceso, falso/vero). Analogia: un singolo interruttore.
- **Byte** — un gruppo di **8 bit**. È l'unità con cui si misurano dimensioni dei file e capacità di memoria (kilobyte, megabyte, …). Analogia: una fila di 8 interruttori indipendenti.

**Combinazioni — la regola 2ⁿ.** Con `n` bit si ottengono `2ⁿ` combinazioni distinte:

| Bit | Combinazioni (2ⁿ) |
|---|---|
| 1 | 2 → `0`, `1` |
| 2 | 4 → `00`, `01`, `10`, `11` |
| 8 (1 byte) | 256 |

Con 256 combinazioni un byte rappresenta tutti i caratteri di uno standard come ASCII.

**Valore massimo — la regola (2ⁿ) − 1.** Rappresentando numeri interi da zero, una combinazione è occupata dallo `0`, quindi il valore più alto è il numero di combinazioni **meno uno**:

- Con 3 bit si hanno 2³ = 8 combinazioni, quindi il valore massimo è `7` (da 0 a 7).
- Con 8 bit si hanno 2⁸ = 256 combinazioni, quindi il valore massimo è `255` (da 0 a 255).

> [!tip]
> **Dai byte ai caratteri.** ASCII usa 1 byte per carattere (128 caratteri base, 256 con le estensioni): sufficiente per l'alfabeto latino. Per alfabeti non latini ed emoji serve **Unicode**, tipicamente con codifica **UTF-8**, che usa da 1 a 4 byte per carattere restando compatibile con ASCII sui primi 128 codici.

## Base64 (`btoa` / `atob`)

Base64 è una codifica che rappresenta dati **binari come testo ASCII**, con un alfabeto di 64 caratteri (`A–Z`, `a–z`, `0–9`, `+`, `/`, più `=` di padding). Serve a trasportare byte dove è ammesso solo testo: data URL, parti di un **JWT**, header `Authorization: Basic`, allegati email. **Non è cifratura**: è reversibile da chiunque, non nasconde nulla.

Nel browser due funzioni globali fanno la conversione:

```js
btoa('Ciao');       // "Q2lhbw==" — string → Base64  ("binary to ASCII")
atob('Q2lhbw==');   // "Ciao"     — Base64 → string  ("ASCII to binary")
```

I nomi sono controintuitivi: `btoa` **codifica**, `atob` **decodifica**.

> [!warning]
> `btoa` lavora byte per byte e lancia `InvalidCharacterError` sui caratteri fuori da Latin1 (emoji, molte lettere accentate): per una stringa Unicode va prima convertita in UTF-8 (es. con `TextEncoder`). In **Node.js** l'idioma è invece `Buffer.from(str).toString('base64')` / `Buffer.from(b64, 'base64').toString()`.

## Font sul web: TTF, OTF, WOFF, WOFF2

Un **font** è l'insieme delle forme di lettere, cifre e simboli di un carattere tipografico; un **file di font** le contiene, così il computer o il browser sa come disegnarle. I formati principali sono nati uno dopo l'altro, e conoscerne la piccola storia aiuta a orientarsi.

All'inizio c'erano i formati "da scrivania": **TrueType** (`.ttf`, ideato da Apple e Microsoft) e **OpenType** (`.otf`, arrivato dopo grazie a Microsoft e Adobe). Sono quelli che si installano sul sistema operativo e che usano programmi come Word o Photoshop. OpenType è in pratica un'estensione di TrueType — stessa idea di base, ma con in più funzioni tipografiche avanzate (legature, varianti stilistiche, set di caratteri più ricchi). Entrambi, però, nascono per il **desktop**, non per la rete: **non sono compressi**, quindi come file da scaricare a ogni visita di una pagina risultano pesanti. Per dare un'idea concreta: un singolo peso (per esempio il *regular*) di un tipico font latino sta sui **150–250 KB** circa in TTF/OTF; le controparti compresse scendono a circa **80–120 KB** in WOFF e **50–80 KB** in WOFF2, a parità di identico disegno — cambia solo la compressione. (Le cifre variano molto con il font: un carattere ricchissimo di glifi, come quelli per cinese/giapponese/coreano, pesa svariati MB.)

Per il web è nato **WOFF** (*Web Open Font Format*): non è un nuovo disegno di carattere, ma semplicemente un `.ttf`/`.otf` **incartato e compresso** — dove "comprimere" vuol dire rendere il file più piccolo (come si fa con uno zip), così si scarica prima. Poi è arrivato **WOFF2**, la sua seconda versione: usa una compressione ancora più efficiente, un algoritmo chiamato **Brotli**, e ottiene file più leggeri (circa il 30% in meno di un WOFF). Oggi **WOFF2 è lo standard**: lo supportano tutti i browser moderni ed è il formato che servizi come Google Fonts distribuiscono. Un WOFF si tiene al più come **ripiego** (*fallback*, cioè l'alternativa usata quando il preferito non è disponibile) per browser molto datati, mentre TTF e OTF restano per l'uso sul computer.

Il riepilogo, a colpo d'occhio:

| Formato | Cos'è | Peso sul web |
| --- | --- | --- |
| **TTF / OTF** | i font "da scrivania", installati sul sistema | non compressi → pesanti |
| **WOFF** | un TTF/OTF compresso per il web (versione 1) | leggero |
| **WOFF2** | come WOFF, ma con compressione **Brotli** (versione 2) | il più leggero, **standard di oggi** |

### Come si usa un font in CSS
Lo si dichiara con una regola `@font-face`, che dà un nome alla famiglia e indica dove trovare il file:

```css
@font-face {
  font-family: 'Hanken Grotesk';       /* il nome con cui lo si richiama */
  src: url('fonts/hanken.woff2') format('woff2');
  font-weight: 400;                    /* il "peso": 400 = normale, 700 = grassetto */
  font-display: swap;                  /* mostra subito un font di sistema, poi lo sostituisce quando arriva */
}
```

Da lì in poi un `font-family: 'Hanken Grotesk'` nel resto del CSS usa quel carattere. Un font di solito è spezzato in più file: uno per ogni **peso** (normale, grassetto…) e per ogni **subset**, cioè una fetta di alfabeto (solo latino, solo cirillico…). Con la proprietà `unicode-range` ogni file dichiara **quali caratteri copre**, così il browser scarica soltanto i pezzi che servono davvero alla pagina, senza sprecare dati. In questo hub i font sono self-hosted esattamente così, come `.woff2` in `assets/vendor/fonts/`.
