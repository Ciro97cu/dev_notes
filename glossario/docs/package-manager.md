# Package manager e pacchetti

Gli strumenti che installano, eseguono e distribuiscono i pacchetti dell'ecosistema Node, e il formato in cui un pacchetto viaggia.

## NPM

NPM (*Node Package Manager*) è lo strumento per gestire i **pacchetti** in Node.js. Installa pacchetti da un registro online (npm registry), li aggiunge come dipendenze del progetto e li mantiene aggiornati. Viene installato insieme a Node.js.

```bash
npm install lodash            # aggiunge lodash a "dependencies" e lo scarica in node_modules
npm install --save-dev vitest # dipendenza di solo sviluppo → "devDependencies"
npm run build                 # esegue lo script "build" dichiarato in package.json
```

Dipendenze e script vivono in `package.json`; le versioni **esatte** installate sono bloccate in `package-lock.json`, così ogni macchina ricostruisce lo stesso albero di dipendenze.

## NPX

NPX è uno strumento fornito con NPM (dalla versione 5.2.0) per **eseguire** pacchetti. La differenza rispetto a NPM: può eseguire un pacchetto **senza installarlo prima**, utile per strumenti usati una tantum.

```bash
npx create-react-app my-app   # scarica ed esegue create-react-app senza installarlo globalmente
```

Può anche eseguire binari di pacchetti locali del progetto (quelli in `node_modules/.bin`).

## Yarn

Yarn è un gestore di pacchetti JavaScript, alternativa a NPM, che consuma anch'esso il registro npm. Nato in Facebook (con Google, Exponent, Tilde) per risolvere problemi storici di NPM su velocità e determinismo:
- **Cache locale** dei pacchetti già scaricati, per installazioni più rapide.
- **Lockfile** (`yarn.lock`): tutti gli sviluppatori installano le **stesse** versioni.
- **Compatibilità** con il registro npm.

> [!note]
> Le versioni moderne di NPM hanno colmato gran parte del divario (cache, `package-lock.json`), quindi oggi la scelta è spesso questione di preferenza o di ecosistema del progetto.

## NVM

**nvm** (*Node Version Manager*) è uno strumento per installare e gestire **più versioni di Node.js** sulla stessa macchina, passando dall'una all'altra secondo il progetto. Il problema che risolve è concreto: Node evolve con major version che portano breaking change (Node 18, 20, 22 hanno API diverse) e un progetto avviato anni fa può essere incompatibile con le versioni più recenti, mentre i progetti nuovi vogliono le ultime funzionalità. Con nvm si installa ciascuna versione in modo isolato e si sceglie quale è attiva, senza che le versioni si calpestino tra loro.

A differenza di un programma normale, nvm **non è un eseguibile**: è una **funzione di shell** caricata nel profilo (`.zshrc` o `.bashrc`) che, quando invocata, modifica `$PATH` nella shell corrente per puntare alla cartella `~/.nvm/versions/node/<versione>/bin` della versione scelta. Questo ha una conseguenza pratica: `nvm use` vale **solo per la shell in cui lo si invoca**; aprire un nuovo terminale riporta alla versione di *default*. Inoltre, siccome Node è installato nella home dell'utente e non in una cartella di sistema, `npm install -g` funziona **senza `sudo`**, ed è una delle ragioni per cui nvm è raccomandato come setup di base.

| Comando | Cosa fa |
|---------|---------|
| `nvm install 22` | scarica e installa Node 22 |
| `nvm install --lts` | installa l'ultimo rilascio LTS disponibile |
| `nvm use 22` | attiva Node 22 nella shell corrente |
| `nvm alias default 22` | imposta Node 22 come versione di default per ogni nuova shell |
| `nvm ls` | elenca le versioni installate localmente |
| `nvm ls-remote` | elenca tutte le versioni scaricabili |
| `nvm current` | mostra la versione di Node attiva |

Per fissare la versione di Node di un singolo progetto si aggiunge un file **`.nvmrc`** alla radice del repo, contenente solo il numero di versione:

```
22
```

A quel punto `nvm use` senza argomenti, eseguito nella cartella del progetto, legge `.nvmrc` e attiva quella versione automaticamente. Aggiungendo al profilo di shell un hook apposito (documentato nel repo di nvm), l'attivazione avviene da sola ogni volta che si entra in una cartella che contiene un `.nvmrc`, senza doverlo invocare a mano.

> [!tip|label:.nvmrc non è «eseguito», è letto]
> Capita di sentir dire che `.nvmrc` «funziona solo su sistemi Unix-like». Il file però non è uno script: è un semplice testo con dentro un numero di versione, e a **leggerlo** è il version manager. È una convenzione di **nvm**, che è una funzione di shell e gira su sistemi **Unix-like** (macOS, Linux, e WSL su Windows), non sul Windows nativo. Là si usa di solito **nvm-windows**, un progetto diverso con lo stesso nome che **non** legge `.nvmrc`, così il file resta ignorato. Non è quindi il file a essere «Unix-only»: dipende dal manager. Quelli cross-platform come **fnm** (qui sotto) leggono `.nvmrc` anche su Windows.

> [!warning]
> I pacchetti installati globalmente con `npm install -g` sono **legati alla versione di Node attiva al momento dell'installazione**. Dopo un `nvm use 20`, il `$PATH` punta al `bin` di Node 20, dove quei pacchetti non sono stati installati: sembrano sparire. Non sono persi (vivono ancora sotto `~/.nvm/versions/node/<versione>/bin`), ma per usarli sulla nuova versione vanno reinstallati lì. Il motivo (PATH e npm prefix globale) è spiegato nel vault Terminale, [cap. 07 · Node, npm e il frontend](../terminale/#/docs/07-node-npm-frontend?id=le-versioni-di-node-nvm).

**Alternative:** **fnm** (*Fast Node Manager*, scritto in Rust) offre le stesse funzionalità di nvm con tempi di avvio sensibilmente più rapidi e supporto nativo a Windows, macOS e Linux. È considerato oggi una valida alternativa moderna; la scelta tra i due è spesso una questione di ecosistema e preferenza personale.

## Tarball (`.tgz`)

Un **tarball** è un file `.tar.gz` (spesso abbreviato **`.tgz`**): una **cartella impacchettata e compressa in un unico file**. Nasce da due strumenti della tradizione **Unix** (la famiglia di sistemi operativi da cui discendono Linux e macOS, dove nascono molti degli strumenti da riga di comando che si usano ancora oggi) messi in fila: **`tar`**, che unisce tanti file in un solo archivio (senza comprimere), e **`gzip`**, che poi lo comprime. È l'equivalente Unix di uno `.zip`, e si incontra ovunque, non solo con npm.

Nell'ecosistema JavaScript conta perché **un pacchetto npm *è* un tarball**: il registry non è che un magazzino di `.tgz`. Lo stesso file passa per tre verbi:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 158" role="img" aria-label="Flusso di un pacchetto npm: i tuoi file con npm pack diventano un .tgz, che raggiunge node_modules o direttamente (install del file) o via registry (publish poi install per nome)" style="width:100%;max-width:700px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="18" y="96" width="104" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="70" y="124" font-size="11" text-anchor="middle">i tuoi file</text><rect x="176" y="96" width="92" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="222" y="117" font-size="12.5" text-anchor="middle" font-weight="700">.tgz</text><text x="222" y="132" font-size="8.5" text-anchor="middle" opacity=".65">pacchetto</text><rect x="344" y="22" width="120" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="404" y="49" font-size="11" text-anchor="middle">registry npm</text><rect x="566" y="96" width="134" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="633" y="124" font-size="11" text-anchor="middle">node_modules</text><path d="M122 120 L170 120" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M176 120 L168 115 L168 125 Z" fill="currentColor"/><text x="148" y="112" font-size="9.5" text-anchor="middle">npm pack</text><path d="M255 96 L352 68" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M358 66 L349 64 L352 73 Z" fill="currentColor"/><text x="292" y="76" font-size="9.5" text-anchor="middle">publish</text><path d="M462 68 L560 97" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M566 99 L557 98 L560 89 Z" fill="currentColor"/><text x="524" y="72" font-size="9.5" text-anchor="middle">install &lt;nome&gt;</text><path d="M268 126 L560 126" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M566 126 L558 121 L558 131 Z" fill="currentColor"/><text x="416" y="143" font-size="9.5" text-anchor="middle">install ./file.tgz  (a mano)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso <code>.tgz</code> raggiunge <code>node_modules</code> in due modi: <strong>a mano</strong> (installando il file) o <strong>via registry</strong> (<code>publish</code> e poi <code>install &lt;nome&gt;</code>). Il registry è solo un magazzino di questi file.</figcaption>
</figure>

- **`npm pack`** crea il `.tgz` in locale (eseguendo prima l'eventuale build);
- **`npm publish`** carica quello stesso `.tgz` sul registry;
- **`npm install`** scarica un `.tgz`, dal registry (`install <nome>`) o da un file locale, e lo scompatta in `node_modules`.

Per questo, quando **non si può pubblicare sul registry** (libreria interna o ad-hoc, ambiente isolato), si distribuisce il pacchetto **a mano** come `.tgz` e lo si installa direttamente:

```bash
npm install ./util-auth-1.0.0.tgz
# oppure in package.json:  "util-auth": "file:./libs/util-auth-1.0.0.tgz"
```

> [!tip]
> Cosa c'è **dentro** (`tar -tzf file.tgz` per sbirciare senza estrarre): l'**output di build** (JavaScript già transpilato, spesso *bundlato*, con i tipi `.d.ts`), **non** il sorgente originale del developer. E di norma **non** è minificato: la minificazione è compito del bundler dell'*applicazione* finale (vedi [Minificazione e ottimizzazione](docs/react.md?id=minificazione-e-ottimizzazione)), non della libreria. A volte un pacchetto include anche i *source map* per risalire al sorgente, a volte no.

