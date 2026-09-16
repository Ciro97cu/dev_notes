# Vault civica (docsify cifrato)

Vault docsify **privato e cifrato lato client**: identico agli altri vault dell'hub (sidebar, ricerca, callout, strumenti di studio) ma i contenuti in chiaro **non entrano mai** nel repository. Sul commit e su GitHub c'è un solo file **illeggibile senza la passphrase** (`content.enc`); il testo in chiaro vive in `_plain/` (escluso da git) e viene decifrato **solo nel browser**, dopo aver inserito la passphrase.

Il vault è **fuori dall'hub** per scelta: nessuna card in `index.html`, nessuna voce in `assets/hub.js`, nessun risultato nella ricerca dell'hub. Ci si arriva solo aprendo `civica/` a mano.

## Come funziona

- `_plain/**.md` — le pagine docsify in **chiaro** (`README.md`, `_sidebar.md`, `_coverpage.md`, le note). Gitignored: restano solo sul tuo computer.
- `encrypt.mjs` — impacchetta tutto `_plain/` in **un solo** blob cifrato `content.enc` (AES-256-GCM, chiave da passphrase via PBKDF2-SHA-256, 300k iterazioni). Da eseguire in locale.
- `content.enc` + `crypto.json` (salt/iterazioni + verificatore, pubblici) — i **cifrati**: questi sì si committano.
- `index.html` + `assets/gate.js` — il cancello: chiede la passphrase, decifra `content.enc` in memoria e avvia docsify dirottando le sue richieste sui contenuti decifrati (via blob URL). Niente Service Worker: docsify è una SPA, un solo contesto JS.

Un unico blob cifrato ha un vantaggio di riservatezza: su GitHub non trapela nemmeno **quante** note ci sono né i loro nomi.

## Aggiungere / aggiornare una nota

1. Scrivi o modifica un file in `_plain/` (per esempio `_plain/iva.md`); aggiorna `_plain/_sidebar.md` e l'indice in `_plain/README.md` se aggiungi una pagina.
2. Cifra (chiede la passphrase, non viene salvata):
   ```bash
   node civica/encrypt.mjs
   ```
3. Committa i cifrati:
   ```bash
   git add civica && git commit -m "civica: aggiorna note (cifrate)"
   ```
   (`_plain/` è escluso da git: nel repo finisce solo `content.enc`.)

## Leggere

Apri `civica/` nel browser **su `http://localhost` o `https://`** (la cifratura del browser non funziona da `file://`), inserisci la passphrase: il cancello decifra i contenuti **in memoria** e apre il vault, senza mandare nulla in rete.

In alternativa si entra **dall'hub**: l'iconcina lucchetto nel footer chiede la passphrase (verificata contro `crypto.json`) e, se giusta, porta **diritti nel vault**, che si apre già sbloccato — nessuna card resta nell'hub, tornando indietro non si vede nulla. L'hub salva la chiave derivata (non la passphrase) in `sessionStorage`, così il vault non richiede di nuovo la passphrase; se la sessione è già sbloccata, il lucchetto entra diretto senza chiedere nulla. La chiave in sessione dura finché non si chiude la scheda del browser (allora si ri-blocca).

## Avvertenze di sicurezza

- **La sicurezza è tutta nella passphrase.** Scegline una forte e non committarla mai.
- **Se la perdi, le note sono irrecuperabili**: è il prezzo della cifratura vera (nessun reset).
- Resta visibile su GitHub il *fatto* che il vault esista, ma non il **contenuto** né quante note ci sono.
- Il testo in chiaro non deve mai entrare in un commit: ci pensa il `.gitignore` (`_plain/`).
- L'indice di ricerca di docsify si costruisce in chiaro in `localStorage` del tuo browser: `gate.js` lo cancella alla chiusura della pagina, ma resta un dettaglio da tenere presente sul dispositivo locale.
