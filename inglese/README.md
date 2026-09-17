# Vault inglese (docsify cifrato)

Vault docsify **privato e cifrato lato client** per lo studio dell'inglese (grammatica, dubbi comuni, falsi amici, verbi irregolari, esercizi). Stessa architettura di `civica/`: sul repo e su GitHub c'è un solo file **illeggibile senza la passphrase** (`content.enc`); il testo in chiaro vive in `_plain/` (escluso da git) e viene decifrato **solo nel browser**.

Il vault è **fuori dall'hub** per scelta: nessuna card in `index.html`, nessuna voce in `assets/hub.js`, nessun risultato nella ricerca dell'hub.

## Come funziona

- `_plain/**.md` — le pagine docsify in **chiaro** (`README.md`, `_sidebar.md`, `_coverpage.md`, le note). Gitignored.
- `encrypt.mjs` — impacchetta tutto `_plain/` in **un solo** blob cifrato `content.enc` (AES-256-GCM, chiave da passphrase via PBKDF2-SHA-256, 300k iterazioni). Da eseguire in locale.
- `content.enc` + `crypto.json` (salt/iterazioni + verificatore, pubblici) — i **cifrati**: questi si committano.
- `index.html` + `assets/gate.js` — il cancello: chiede la passphrase, decifra `content.enc` in memoria e avvia docsify.

## Passphrase (importante)

Si accede anche dall'hub con l'iconcina lucchetto nel footer, dove **la password sceglie il vault**: per questo la passphrase di `inglese` dev'essere **diversa** da quella di `civica`. Il verificatore per-vault è `inglese-ok` (civica usa `civica-ok`), derivato dal nome della cartella.

## Aggiungere / aggiornare una nota

1. Scrivi o modifica un file in `_plain/`; aggiorna `_plain/_sidebar.md` e l'indice in `_plain/README.md`.
2. Cifra (chiede la passphrase, non viene salvata):
   ```bash
   node inglese/encrypt.mjs
   ```
3. Committa i cifrati:
   ```bash
   git add inglese && git commit -m "inglese: aggiorna note (cifrate)"
   ```

## Leggere

Apri `inglese/` nel browser **su `http://localhost` o `https://`** (la cifratura non funziona da `file://`), inserisci la passphrase. Oppure dall'hub: lucchetto → passphrase di inglese → entri già sbloccato.

## Avvertenze di sicurezza

- **La sicurezza è tutta nella passphrase.** Non committarla mai.
- **Se la perdi, le note sono irrecuperabili.**
- Su GitHub resta visibile il *fatto* che il vault esista, ma non il **contenuto**.
- Il testo in chiaro non entra mai in un commit: ci pensa `.gitignore` (`_plain/`).
