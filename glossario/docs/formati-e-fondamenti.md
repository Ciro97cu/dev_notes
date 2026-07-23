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

- 3 bit → 2³ = 8 combinazioni → valore massimo `7` (da 0 a 7).
- 8 bit → 2⁸ = 256 combinazioni → valore massimo `255` (da 0 a 255).

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
