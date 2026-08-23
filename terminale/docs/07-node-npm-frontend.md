# 07 · Node, npm e il frontend

Per chi lavora nel frontend, il terminale è soprattutto **questo**: **Node** e **npm**. La stragrande maggioranza dei comandi che si digitano ogni giorno — installare le dipendenze, avviare il server di sviluppo, fare la build — passa da qui. Questo capitolo raccoglie quel flusso di lavoro: cosa succede quando si installa un pacchetto, come si lanciano gli script del progetto, e come si tengono in ordine le versioni di Node. Per la definizione dei singoli termini (npm, npx, nvm, yarn…) il riferimento resta il [glossario](../glossario/#/docs/tooling-javascript); qui interessa il loro **uso da terminale**.

Un chiarimento di base: **Node** è l'ambiente che esegue JavaScript fuori dal browser (è ciò che fa girare gli strumenti di sviluppo), e **npm** (*Node Package Manager*) è il suo gestore di pacchetti, quello che scarica le librerie e lancia gli script. Installando Node si ottiene automaticamente anche npm.

## Le dipendenze del progetto (installazione locale)

Un progetto frontend dichiara le librerie che usa in un file **`package.json`**, il suo «manifesto». Il comando **`npm install`** (senza argomenti) legge quel file e scarica tutto ciò che serve nella cartella **`node_modules`** del progetto: è un'installazione **locale**, valida solo lì dentro. Aggiungere una nuova libreria si fa con `npm install <nome>`, che la scarica *e* la registra in `package.json`.

| Comando | Cosa fa |
|---------|---------|
| `npm install` | installa in `node_modules/` tutte le dipendenze elencate in `package.json` |
| `npm install <pkg>` | aggiunge una dipendenza (di runtime) e l'aggiorna in `package.json` |
| `npm install -D <pkg>` | aggiunge una dipendenza di **sviluppo** (`devDependencies`: build, test, linter) |
| `npm uninstall <pkg>` | rimuove una dipendenza |

Il `package.json` distingue le **`dependencies`** (servono al codice quando gira) dalle **`devDependencies`** (servono solo in sviluppo o in build: bundler, linter, framework di test). La cartella `node_modules` può diventare enorme e **non si mette sotto versione**: la si ignora nel `.gitignore` (vedi il vault [Git](../git/#/05-gitignore)), perché è ricostruibile in ogni momento con `npm install` a partire da `package.json`.

## Gli script: il pane quotidiano

Nel `package.json` c'è una sezione **`scripts`** che dà un nome a comandi lunghi, così invece di ricordare l'invocazione completa di un tool si lancia una parola. Li si esegue con **`npm run <nome>`**. Sono i comandi che un frontendista digita decine di volte al giorno:

| Comando | Fa (tipicamente) |
|---------|------------------|
| `npm run dev` | avvia il **server di sviluppo** (sotto) |
| `npm run build` | crea la build di produzione (i file ottimizzati da pubblicare) |
| `npm start` | avvia l'app (spesso alias di `dev` o del server) |
| `npm test` | esegue i test |

```bash
npm run dev       # avvia il dev server del progetto
npm run build     # genera la cartella di build (es. dist/)
```

> [!tip]
> `start` e `test` sono speciali: hanno una scorciatoia e si possono lanciare senza `run` (`npm start`, `npm test`). Tutti gli altri script vogliono `run`: `npm dev` **non** funziona, va `npm run dev`. Per vedere quali script esistono in un progetto basta aprire il `package.json` alla voce `scripts`.

## Eseguire senza installare: `npx`

A volte serve uno strumento **una volta sola** — creare un nuovo progetto, lanciare un generatore — e installarlo stabilmente sarebbe uno spreco. **`npx`** esegue il binario di un pacchetto scaricandolo al volo, senza lasciarlo installato. È il modo standard di fare *scaffolding*, cioè generare l'ossatura di un progetto nuovo:

```bash
npm create vite@latest      # crea un nuovo progetto Vite (usa npx dietro le quinte)
npx serve dist              # serve una cartella statica al volo, senza installare "serve"
```

## Locale contro globale: dove finiscono i pacchetti

Accanto all'installazione locale ne esiste una **globale** (`npm install -g <pkg>`), che non serve a un singolo progetto ma a mettere a disposizione uno **strumento da riga di comando** utilizzabile ovunque (come `tsc`, il compilatore TypeScript). La regola pratica: le **librerie** che il codice importa vanno **locali**; gli **strumenti** che si lanciano dal terminale vanno **globali** — o, meglio ancora, si eseguono con `npx` senza installare nulla.

L'installazione globale deposita **due cose in due posti**: i **file** del pacchetto in una cartella `node_modules` globale, e l'**eseguibile** in una cartella `bin`. Entrambe sotto una radice comune che npm chiama **prefix** (`npm prefix -g`).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 262" role="img" aria-label="npm install -g typescript deposita i file del pacchetto in prefix/lib/node_modules e l'eseguibile tsc in prefix/bin; poiché prefix/bin è nel PATH, tsc diventa eseguibile ovunque" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="150" y="14" width="240" height="30" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="270" y="33" font-size="12.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">npm install -g typescript</text><path d="M215 44 L120 68" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M114 70 L125 69 L121 60 Z" fill="currentColor"/><path d="M325 44 L420 68" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M426 70 L415 60 L419 69 Z" fill="currentColor"/><rect x="20" y="72" width="215" height="46" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="127" y="90" font-size="10" text-anchor="middle" opacity=".7">i file del pacchetto</text><text x="127" y="107" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">…/lib/node_modules/</text><rect x="305" y="72" width="215" height="46" rx="7" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.7"/><text x="412" y="90" font-size="10" text-anchor="middle" opacity=".7">l'eseguibile</text><text x="412" y="107" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">…/bin/tsc</text><path d="M412 118 L412 150" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M412 156 L407 146 L417 146 Z" fill="currentColor"/><rect x="250" y="158" width="270" height="30" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="385" y="177" font-size="10.5" text-anchor="middle"><tspan font-family="ui-monospace,Menlo,monospace">…/bin</tspan> è nel PATH</text><path d="M385 188 L385 208" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M385 214 L380 204 L390 204 Z" fill="currentColor"/><rect x="250" y="216" width="270" height="30" rx="7" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="385" y="235" font-size="11" text-anchor="middle" font-weight="700"><tspan font-family="ui-monospace,Menlo,monospace">tsc</tspan> eseguibile da ovunque ✓</text><text x="127" y="145" font-size="9.5" text-anchor="middle" opacity=".6">prefix = <tspan font-family="ui-monospace,Menlo,monospace">npm prefix -g</tspan></text><text x="127" y="160" font-size="9.5" text-anchor="middle" opacity=".6">(con nvm: la cartella del</text><text x="127" y="173" font-size="9.5" text-anchor="middle" opacity=".6">node attivo)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'install globale mette i <strong>file</strong> in <code>&lt;prefix&gt;/lib/node_modules</code> e l'<strong>eseguibile</strong> in <code>&lt;prefix&gt;/bin</code>. Quel comando diventa lanciabile da qualsiasi cartella per una sola ragione: <code>&lt;prefix&gt;/bin</code> è nel <strong>PATH</strong> (vedi <a href="05-variabili-ambiente-path.md">capitolo 5</a>).</figcaption>
</figure>

Il punto chiave è l'ultimo: `tsc` si esegue da qualsiasi cartella **non per magia, ma perché** `<prefix>/bin` è nel PATH — esattamente il meccanismo del [capitolo 5](05-variabili-ambiente-path.md). Fuori dall'ecosistema npm, su macOS lo stesso ruolo lo ha **Homebrew**, che installa i programmi di sistema (`wget`, `ffmpeg`, una `bash` moderna) sotto il suo prefix — `/opt/homebrew` su Apple Silicon, `/usr/local` su Intel — collegandone gli eseguibili in `<prefix>/bin`, di nuovo sul PATH.

> [!warning]
> Evitare `sudo npm install -g`. Il `sudo` serve solo se il prefix è una cartella **di sistema** di proprietà di `root`: installare lì crea file che l'utente non può gestire, problemi di permessi e codice di terzi eseguito da amministratore. Usando un *version manager* come **nvm** (sotto), il prefix sta nella home ed è tuo, così `npm install -g` funziona **senza** `sudo`.

## Le versioni di Node: nvm

Progetti diversi possono richiedere versioni diverse di Node. **nvm** (*Node Version Manager*) permette di installarne più d'una e passare dall'una all'altra al volo. È anche la ragione per cui, sulla maggior parte dei setup, `npm install -g` non ha bisogno di `sudo`: nvm mette Node (e i pacchetti globali) dentro `~/.nvm`, nella home.

| Comando | Cosa fa |
|---------|---------|
| `nvm install 22` | installa Node 22 |
| `nvm use 22` | usa Node 22 nella shell corrente |
| `nvm ls` | elenca le versioni installate |
| `node -v` · `npm -v` | mostra la versione attiva di Node · npm |

Con nvm i pacchetti **globali** sono legati alla **versione di Node** attiva: installati sotto la 22, non si trovano più dopo un `nvm use 20` (il PATH punta al `bin` di un'altra versione). Non sono persi, semplicemente non sono nel PATH attivo. Un file `.nvmrc` nel progetto può fissare la versione da usare.

## Il server di sviluppo

Il comando che si lancia più spesso è `npm run dev`: avvia un **server di sviluppo locale** (con strumenti moderni come **Vite**) che serve l'app all'indirizzo `http://localhost:5173` (la porta varia da tool a tool) e la **ricarica da solo** a ogni salvataggio (*hot reload*). Il terminale resta «occupato» a farlo girare, mostrando l'URL e i log; per **fermarlo** si preme `Ctrl-C`.

```bash
npm run dev
#   VITE v5.x  ready in 312 ms
#   ➜  Local:   http://localhost:5173/
#   (Ctrl-C per fermare il server)
```

> [!tip]
> Se `npm run dev` risponde che la porta è già in uso, di solito c'è un altro dev server ancora attivo in un'altra finestra: o lo si ferma con `Ctrl-C` lì, oppure il tool proporrà da solo una porta diversa (`5174`, `5175`…).

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>npm install</code> (senza argomenti) e <code>npm install -g typescript</code>?</summary>

`npm install` senza argomenti installa **in locale**, nella cartella `node_modules/` del progetto, tutte le dipendenze elencate nel `package.json`: servono a *quel* progetto. `npm install -g typescript` installa **globalmente** uno strumento da riga di comando (`tsc`) utilizzabile da qualsiasi cartella. Regola: librerie del codice → locali; strumenti da terminale → globali (o `npx`).

</details>

<details>
<summary>Perché <code>npm dev</code> non funziona mentre <code>npm start</code> sì?</summary>

Perché `start` (come `test`) è uno script «speciale» con una scorciatoia: si può lanciare senza `run`. Tutti gli altri script definiti in `package.json`, incluso `dev`, vanno invocati con `npm run <nome>` — quindi `npm run dev`. `npm dev` non trova nessun comando con quel nome.

</details>

<details>
<summary>A cosa serve <code>npx</code> e quando conviene rispetto a un'installazione globale?</summary>

`npx` esegue il binario di un pacchetto scaricandolo **al volo**, senza lasciarlo installato. Conviene per strumenti usati una volta sola — tipicamente lo *scaffolding* di un progetto nuovo (`npm create vite@latest`) — perché tiene pulita la lista dei pacchetti globali evitando di installare cose che non servono in modo permanente.

</details>

<details>
<summary>Dopo <code>npm install -g</code>, perché il comando è eseguibile da ovunque? E perché con nvm a volte «sparisce»?</summary>

Perché l'install globale mette l'eseguibile in `<prefix>/bin`, cartella che è nel **PATH**: la shell lo trova lì (capitolo 5). Con **nvm** il prefix è la cartella della **versione di Node attiva**; cambiando versione (`nvm use 20`) il PATH punta a un altro `bin`, dove quel pacchetto non è installato — quindi «sparisce» finché non lo si reinstalla per la nuova versione.

</details>

<details>
<summary>Cosa fa <code>npm run dev</code> e come si ferma?</summary>

Avvia un **server di sviluppo** locale (es. Vite su `http://localhost:5173`) che serve l'app e la ricarica a ogni salvataggio (*hot reload*). Il terminale resta occupato a farlo girare; per fermarlo si preme **`Ctrl-C`**. Se la porta è occupata, di solito c'è un altro dev server già attivo altrove.

</details>
