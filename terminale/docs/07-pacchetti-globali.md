# 07 · Installare pacchetti globali

Installare un pacchetto «globalmente» è una di quelle operazioni che si fanno seguendo le istruzioni di un README senza capire davvero cosa succede: *dove* finiscono i file? Perché dopo posso lanciare quel comando da qualunque cartella? E perché a volte non funziona? Questo capitolo scioglie il dubbio, ed è il punto in cui tutto ciò che si è visto sul [PATH](05-variabili-ambiente-path.md) diventa concreto. I gestori di pacchetti sono due, con la stessa logica di fondo: **npm** (per gli strumenti dell'ecosistema Node/JavaScript) e **Homebrew** (per i programmi di sistema su macOS).

## Locale contro globale

Con npm la stessa parola «installare» copre due cose diverse. Un'installazione **locale** — `npm install lodash` dentro un progetto — scarica il pacchetto nella cartella `node_modules/` **di quel progetto** e serve solo lì: è una dipendenza del codice. Un'installazione **globale** — `npm install -g <pacchetto>` — serve invece a mettere a disposizione uno **strumento da riga di comando** utilizzabile ovunque, come `tsc` (il compilatore TypeScript) o un server statico. La regola pratica: le **librerie** che il codice importa vanno locali; gli **strumenti** che si lanciano dal terminale vanno globali (o, meglio ancora, si eseguono al volo con `npx`, più avanti).

## Dove finisce un pacchetto globale (npm)

Un'installazione globale con npm deposita **due cose in due posti diversi**, ed è qui che si chiarisce tutto. I **file del pacchetto** vanno in una cartella `node_modules` globale; l'**eseguibile** (il comando che poi si digita) va in una cartella `bin`. Entrambe stanno sotto una radice comune che npm chiama **prefix**. Si possono interrogare direttamente:

| Comando | Stampa |
|---------|--------|
| `npm prefix -g` | il **prefix**: la radice sotto cui npm installa i pacchetti globali |
| `npm root -g` | dove vanno i **file** dei pacchetti (`<prefix>/lib/node_modules`) |
| `npm ls -g --depth=0` | l'elenco dei pacchetti installati globalmente |

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 262" role="img" aria-label="npm install -g typescript deposita i file del pacchetto in prefix/lib/node_modules e l'eseguibile tsc in prefix/bin; poiché prefix/bin è nel PATH, tsc diventa eseguibile ovunque" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="150" y="14" width="240" height="30" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="270" y="33" font-size="12.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">npm install -g typescript</text><path d="M215 44 L120 68" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M114 70 L125 69 L121 60 Z" fill="currentColor"/><path d="M325 44 L420 68" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M426 70 L415 60 L419 69 Z" fill="currentColor"/><rect x="20" y="72" width="215" height="46" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="127" y="90" font-size="10" text-anchor="middle" opacity=".7">i file del pacchetto</text><text x="127" y="107" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">…/lib/node_modules/</text><rect x="305" y="72" width="215" height="46" rx="7" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.7"/><text x="412" y="90" font-size="10" text-anchor="middle" opacity=".7">l'eseguibile</text><text x="412" y="107" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700">…/bin/tsc</text><path d="M412 118 L412 150" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M412 156 L407 146 L417 146 Z" fill="currentColor"/><rect x="250" y="158" width="270" height="30" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="385" y="177" font-size="10.5" text-anchor="middle"><tspan font-family="ui-monospace,Menlo,monospace">…/bin</tspan> è nel PATH</text><path d="M385 188 L385 208" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M385 214 L380 204 L390 204 Z" fill="currentColor"/><rect x="250" y="216" width="270" height="30" rx="7" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="385" y="235" font-size="11" text-anchor="middle" font-weight="700"><tspan font-family="ui-monospace,Menlo,monospace">tsc</tspan> eseguibile da ovunque ✓</text><text x="127" y="145" font-size="9.5" text-anchor="middle" opacity=".6">prefix = <tspan font-family="ui-monospace,Menlo,monospace">npm prefix -g</tspan></text><text x="127" y="160" font-size="9.5" text-anchor="middle" opacity=".6">(con nvm: la cartella del</text><text x="127" y="173" font-size="9.5" text-anchor="middle" opacity=".6">node attivo)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'install globale mette i <strong>file</strong> in <code>&lt;prefix&gt;/lib/node_modules</code> e l'<strong>eseguibile</strong> in <code>&lt;prefix&gt;/bin</code>. Quel comando diventa lanciabile da qualsiasi cartella per una sola ragione: <code>&lt;prefix&gt;/bin</code> è nel <strong>PATH</strong>. Tutto qui.</figcaption>
</figure>

Il punto chiave è l'ultimo: `tsc` si può eseguire da qualsiasi cartella **non per magia, ma perché** `<prefix>/bin` è una delle cartelle elencate nel PATH. È esattamente il meccanismo del capitolo 5, applicato agli strumenti installati.

## Il caso nvm (probabilmente il tuo)

Se Node è gestito da **nvm** — un *version manager* che permette di tenere più versioni di Node e passare dall'una all'altra — il prefix non è una cartella di sistema ma la cartella **della versione di Node attiva**, dentro la home. Su una macchina con nvm i valori reali sono di questo tipo:

```bash
npm prefix -g
# /Users/ciro/.nvm/versions/node/v22.22.0

npm root -g
# /Users/ciro/.nvm/versions/node/v22.22.0/lib/node_modules

which tsc
# /Users/ciro/.nvm/versions/node/v22.22.0/bin/tsc   → sta nel bin di quella versione
```

Da qui discende una conseguenza che spiazza spesso: con nvm i pacchetti globali sono **legati alla versione di Node** con cui li si è installati. Passando a un'altra versione (`nvm use 20`), gli strumenti installati globalmente sotto la 22 **non ci sono più**, perché il PATH ora punta al `bin` di un'altra versione. Non sono spariti: vivono ancora nella cartella della 22, semplicemente non sono nel PATH attivo. È il comportamento voluto, ma va saputo.

## Homebrew: i programmi di sistema

**Homebrew** è il gestore di pacchetti *de facto* di macOS per i programmi che non passano da npm (`wget`, `git` aggiornato, `ffmpeg`, una `bash` moderna…). Installa tutto sotto il suo **prefix**, che dipende dall'architettura del Mac:

| Mac | Prefix di Homebrew |
|-----|--------------------|
| **Apple Silicon** (M1/M2/M3…) | `/opt/homebrew` |
| **Intel** | `/usr/local` |

`brew install wget` mette il programma sotto il prefix e ne collega l'eseguibile in `<prefix>/bin` — cartella che la riga `eval "$(brew shellenv)"` nel `~/.zshrc` (vedi [capitolo 6](06-file-configurazione-shell.md)) ha già aggiunto al PATH. Di nuovo la stessa storia: il comando diventa disponibile perché il suo `bin` è nel PATH.

```bash
brew --prefix          # /opt/homebrew        → la radice di Homebrew (Apple Silicon)
brew install wget      # installa wget e lo collega in /opt/homebrew/bin
which wget             # /opt/homebrew/bin/wget
```

## Perché evitare `sudo npm install -g`

Capita di trovare istruzioni che suggeriscono `sudo npm install -g …`. È quasi sempre una cattiva idea. Serve il `sudo` (i privilegi di amministratore) solo quando il prefix è una cartella **di sistema**, di proprietà di `root`: installare lì con `sudo` crea file che poi l'utente normale non può più gestire, genera continui problemi di permessi e apre a rischi di sicurezza (si esegue codice di terzi come amministratore). La soluzione moderna è **non avere quel problema**: usare un *version manager* come **nvm** (o `fnm`), che mette il prefix **nella home**, di proprietà dell'utente. Così `npm install -g` funziona **senza** `sudo`, ed è esattamente perché nvm è la strada consigliata.

> [!tip]
> Spesso uno strumento serve una volta sola (creare un progetto, lanciare un generatore): in quei casi non conviene installarlo globalmente ma eseguirlo al volo con **`npx`**, che scarica il pacchetto in modo temporaneo, lo esegue e non lascia niente installato — per esempio `npx create-vite@latest`. Tiene pulita la lista dei pacchetti globali. I termini `npm`, `npx` e `nvm` sono definiti anche nel [glossario](../glossario/#/docs/tooling-javascript).

> [!warning]
> Se dopo `npm install -g qualcosa` il terminale risponde `command not found`, è di nuovo un problema di PATH (capitolo 5): la cartella `bin` del prefix non è nel PATH, oppure — con nvm — si è cambiata versione di Node dopo l'installazione. `npm prefix -g` e `which <comando>` dicono subito dov'è finita la cosa e perché non si trova.

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>npm install lodash</code> e <code>npm install -g typescript</code>?</summary>

Il primo è un'installazione **locale**: mette `lodash` nella cartella `node_modules/` del progetto corrente, come dipendenza del codice, e vale solo lì. Il secondo è **globale** (`-g`): installa uno **strumento da riga di comando** (`tsc`) utilizzabile da qualsiasi cartella. Regola pratica: le librerie che il codice importa vanno locali, gli strumenti che si lanciano dal terminale vanno globali (o si usano con `npx`).

</details>

<details>
<summary>Dopo <code>npm install -g typescript</code>, perché posso lanciare <code>tsc</code> da qualsiasi cartella?</summary>

Perché l'install globale mette l'eseguibile `tsc` nella cartella `<prefix>/bin`, e quella cartella è elencata nel **PATH**. Quando si digita `tsc`, la shell lo trova lì scorrendo il PATH (capitolo 5). Non c'è nient'altro: è lo stesso meccanismo di risoluzione dei comandi, applicato agli strumenti installati.

</details>

<details>
<summary>Con nvm, perché dopo <code>nvm use 20</code> un tool installato globalmente «sparisce»?</summary>

Perché con nvm il prefix dei pacchetti globali è la cartella **della versione di Node attiva**. I pacchetti installati sotto la v22 stanno nel `bin` della v22; passando alla v20 il PATH punta al `bin` della v20, dove quel tool non è installato. Non è perso — vive ancora nella cartella della v22 — semplicemente non è nel PATH attivo. Va reinstallato per la nuova versione, se serve anche lì.

</details>

<details>
<summary>Perché è sconsigliato <code>sudo npm install -g</code>?</summary>

Perché il `sudo` serve solo se il prefix è una cartella **di sistema** di proprietà di `root`: installare lì crea file che l'utente normale non può gestire, provoca problemi di permessi e fa girare codice di terzi con privilegi di amministratore (rischio di sicurezza). Usando un version manager come **nvm**, il prefix sta nella home ed è dell'utente, così `npm install -g` funziona senza `sudo`: è il motivo principale per cui nvm è consigliato.

</details>
