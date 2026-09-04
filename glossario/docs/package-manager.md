# Package manager e pacchetti

Gli strumenti che installano, eseguono e distribuiscono i pacchetti dell'ecosistema Node, e il formato in cui un pacchetto viaggia.

## NPM

NPM (*Node Package Manager*) è lo strumento per gestire i **pacchetti** in Node.js. Installa pacchetti da un registro online (npm registry), li aggiunge come dipendenze del progetto e li mantiene aggiornati. Viene installato insieme a Node.js.

```bash
npm install lodash            # aggiunge lodash a "dependencies" e lo scarica in node_modules
npm install --save-dev vitest # dipendenza di solo sviluppo → "devDependencies"
npm run build                 # esegue lo script "build" dichiarato in package.json
```

Dipendenze e script vivono in `package.json`, mentre le versioni **esatte** installate sono bloccate nel lockfile `package-lock.json`, così ogni macchina ricostruisce lo stesso albero di dipendenze; il rapporto tra i due file è approfondito in [Anatomia di un progetto](anatomia-progetto.md).

Molti pacchetti hanno un nome **con scope**: un prefisso `@qualcosa/` che li raggruppa sotto un'organizzazione, come `@angular/core` o `@types/node`. Lo scope evita le collisioni di nomi (chiunque può pubblicare un pacchetto chiamato `core`, ma `@angular/core` appartiene solo ad Angular) e torna utile con i registry privati, dove un'azienda pubblica i propri pacchetti sotto uno scope suo (`@azienda/…`).

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

## pnpm

pnpm (*performant npm*) è un terzo gestore di pacchetti, alternativo a NPM e Yarn, che pesca dallo stesso registry npm ma cambia in modo radicale **come** i pacchetti finiscono sul disco. Il problema che affronta è lo spreco del modello classico: con NPM ogni progetto ha la sua `node_modules` piena di copie, così la stessa versione di una libreria vive duplicata in decine di cartelle, occupando spazio e allungando le installazioni.

La soluzione di pnpm è un **archivio unico** (*content-addressable store*): una sola cartella sul disco, di norma sotto la home dell'utente, dove ogni versione di ogni pacchetto è salvata **una volta sola**. Nella `node_modules` del singolo progetto non ci sono copie ma **hard link** a quell'archivio (un hard link è una seconda voce di cartella che punta agli stessi byte su disco: lo stesso file compare in più posti pur esistendo fisicamente una volta). Ne segue un risparmio doppio: installare un pacchetto già presente nell'archivio è quasi istantaneo, perché si creano link invece di scaricare e copiare, e dieci progetti che usano la stessa libreria la tengono su disco una volta sola invece di dieci.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 250" role="img" aria-label="pnpm mantiene un archivio unico sul disco dove ogni versione di ogni pacchetto è salvata una sola volta; le cartelle node_modules dei vari progetti (apps/web, apps/admin, packages/ui) non contengono copie ma hard link che puntano a quell'archivio." style="width:100%;max-width:680px;height:auto;color:inherit">
<g font-family="system-ui,Arial,sans-serif" fill="currentColor">
<rect x="24" y="50" width="196" height="152" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/>
<text x="122" y="72" font-size="11" text-anchor="middle" font-weight="700">archivio unico</text>
<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="11" text-anchor="middle">
<text x="122" y="104">react@19.1.0</text>
<text x="122" y="130">lodash@4.17.21</text>
<text x="122" y="156">vite@7.0.0</text>
</g>
<text x="122" y="186" font-size="9" text-anchor="middle" fill-opacity="0.6">ogni versione, una volta sola</text>
<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="10.5" text-anchor="middle">
<rect x="476" y="46" width="200" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="576" y="72">apps/web · node_modules</text>
<rect x="476" y="116" width="200" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="576" y="142">apps/admin · node_modules</text>
<rect x="476" y="186" width="200" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="576" y="212">packages/ui · node_modules</text>
</g>
<path d="M476 68 L226 98" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M220 99 L228 100 L227 92 Z" fill="currentColor"/>
<path d="M476 138 L226 130" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M220 130 L228 133 L228 126 Z" fill="currentColor"/>
<path d="M476 208 L226 162" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M220 160 L228 164 L229 156 Z" fill="currentColor"/>
<text x="352" y="118" font-size="9" text-anchor="middle" fill-opacity="0.7">hard link</text>
</g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I <code>node_modules</code> dei progetti non copiano i pacchetti: li <strong>collegano</strong> all'archivio comune. Più progetti condividono gli stessi byte su disco.</figcaption>
</figure>

C'è una seconda differenza, sulla **struttura** di `node_modules`. NPM la costruisce «piatta»: tutte le dipendenze, dirette e indirette, finiscono allo stesso livello, e questo consente per sbaglio di importare un pacchetto mai dichiarato (una *phantom dependency*, arrivata come dipendenza di una dipendenza). pnpm mette invece al primo livello solo le dipendenze **dichiarate** nel `package.json`, tenendo tutto il resto in una sottocartella `.pnpm`: se un import non è tra le dipendenze dichiarate, semplicemente non si risolve. È più rigoroso, e intercetta in anticipo un errore che con NPM passerebbe silenzioso.

### Monorepo: workspaces e catalogs

Un **monorepo** è un unico repository che ospita più pacchetti insieme: più applicazioni e librerie che condividono codice. pnpm lo gestisce nativamente con i **workspace**: un file `pnpm-workspace.yaml` alla radice elenca dove stanno i pacchetti.

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Da qui pnpm tratta ogni cartella sotto `apps/` e `packages/` come un pacchetto del workspace, li installa insieme e lascia che si riferiscano l'un l'altro senza passare dal registry.

Su un monorepo grande nasce però il problema dell'**allineamento delle versioni**: se dieci pacchetti dipendono tutti da React, è facile che scivolino su versioni leggermente diverse, con bug sottili e difficili da spiegare. La risposta di pnpm (dalla versione 10) sono i **catalogs**: le versioni si dichiarano in **un punto solo**, sempre nella `pnpm-workspace.yaml`, e i singoli `package.json` non scrivono più il numero ma un rimando.

```yaml
# pnpm-workspace.yaml — le versioni, in un posto solo
catalog:                       # il catalogo "default", senza nome
  react: ^19.1.0

catalogs:                      # cataloghi con un nome
  ng18:
    '@angular/core': ^18.2.13
    '@angular/router': ^18.2.13
```

```json
// package.json di un pacchetto: nessun numero, solo il rimando
{
  "dependencies": {
    "react": "catalog:",              // pesca dal catalogo default
    "@angular/core": "catalog:ng18"   // pesca dal catalogo "ng18"
  }
}
```

Aggiornare React per tutto il monorepo diventa così **una riga sola** da cambiare nella `pnpm-workspace.yaml`, invece di una caccia dentro decine di `package.json`. Il `catalog:` senza nome pesca dal catalogo di default; `catalog:ng18` da quello nominato.

Nella stessa `pnpm-workspace.yaml` compaiono spesso altre due voci:

- **`overrides`** — forza una versione precisa in **tutto** l'albero, comprese le dipendenze indirette. Serve quando una libreria annidata trascina una versione che si vuole scavalcare, per esempio per chiudere una falla di sicurezza. La sintassi `genitore>figlio` mira in profondità:
  ```yaml
  overrides:
    'sonarqube-scanner>axios': '1.11.0'   # axios, ma solo dentro sonarqube-scanner, forzato a 1.11.0
  ```
- **`allowBuilds`** — decide **quali pacchetti possono eseguire script durante l'installazione**. Alcuni pacchetti hanno script (`postinstall`) che partono appena installati, ad esempio per compilare parti native: comodi, ma anche una porta per codice ostile, perché un pacchetto compromesso potrebbe far girare qualsiasi cosa sulla macchina. Per questo, dalla versione 10, pnpm di default **non li esegue** e pretende una lista esplicita di chi è autorizzato:
  ```yaml
  allowBuilds:
    esbuild: true
    '@parcel/watcher': true
  ```
  È una difesa contro gli attacchi alla *supply chain* (la catena di fornitura del software): il default sicuro è «nessuno esegue script all'installazione», e si apre la porta solo ai pacchetti di cui ci si fida.

## Il registry

Il **registry** è il magazzino online da cui i gestori scaricano i pacchetti e su cui li pubblicano: un archivio di tarball (`.tgz`, vedi sotto) interrogabile per nome e versione. Dietro `npm install react` c'è proprio questo: il gestore chiede al registry il pacchetto `react`, riceve il `.tgz` della versione risolta e lo scompatta in `node_modules`.

Il punto che spesso sfugge è che **il registry è un servizio a sé, separato dal gestore**. Quello pubblico e predefinito è il **registry npm** (`registry.npmjs.org`), che però non «appartiene» al comando npm: è l'infrastruttura condivisa da cui attingono **tutti** i gestori dell'ecosistema. NPM, Yarn e pnpm sono tre programmi diversi che, di default, scaricano dallo **stesso** magazzino; cambiare gestore non cambia la fonte dei pacchetti. Da qui due strade che nella pratica si incontrano spesso: i registry privati e le alternative al registry pubblico.

### Registry privati e repository manager

Un'azienda ospita di norma un **registry interno** per due bisogni distinti: tenere in casa i pacchetti che non devono circolare all'esterno (pubblicati sotto uno scope proprio, `@azienda/*`) e non dipendere in tutto e per tutto dal registry pubblico. A indirizzare il gestore verso quel registry è il file **`.npmrc`**, e il meccanismo è **automatico**: npm rilegge `.npmrc` a ogni esecuzione (prima quello del progetto, poi quello dell'utente nella home, poi quello globale) e instrada le richieste di conseguenza, senza comandi in più.

```ini
# .npmrc — nella root del progetto (o nella home dell'utente)
@azienda:registry=https://nexus.azienda.it/repository/npm-privato/   # i pacchetti @azienda/* → registry privato
//nexus.azienda.it/repository/npm-privato/:_authToken=${NPM_TOKEN}   # token di accesso al privato
```

Qui la scelta è **mirata per scope**: solo i pacchetti `@azienda/*` vanno al registry privato, tutto il resto continua a scaricare da `npmjs.org` come prima. Scrivere invece una riga secca `registry=https://…` cambierebbe la destinazione di **default per ogni** pacchetto, mandando l'intero traffico al privato (che a quel punto fa da unico varco verso l'esterno). Poiché il privato richiede identità, si aggiunge un **token di autenticazione**, anch'esso in `.npmrc` e di solito letto da una variabile d'ambiente per non finire committato in chiaro.

Strumenti come **Nexus** (per esteso *Sonatype Nexus*), **Artifactory** (JFrog) e **Azure Artifacts** appartengono a una stessa categoria, il **repository manager**: un server che fa da hub centrale dei pacchetti dell'organizzazione. Ne assolve tre compiti insieme: **ospita** i pacchetti interni che non devono uscire; fa da **proxy con cache** verso il registry pubblico (alla prima richiesta di una libreria la scarica da `npmjs.org` e ne conserva una copia, così le richieste successive partono dalla rete interna, più veloci e ancora disponibili se il pubblico è irraggiungibile o un pacchetto viene ritirato); e copre **più ecosistemi** con lo stesso strumento (non solo npm, ma anche Maven per Java, immagini Docker, pacchetti Python…).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 250" role="img" aria-label="Un registry privato (Nexus) sta tra chi installa e il registry pubblico: riceve le richieste indirizzate dal file .npmrc, serve i pacchetti interni dell'azienda che ospita direttamente, e per tutti gli altri fa da proxy con cache verso il registry npm pubblico." style="width:100%;max-width:680px;height:auto;color:inherit">
<g font-family="system-ui,Arial,sans-serif" fill="currentColor">
<rect x="16" y="100" width="104" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/>
<text x="68" y="129" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace">npm install</text>
<rect x="224" y="88" width="160" height="74" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/>
<text x="304" y="120" font-size="13" text-anchor="middle" font-weight="700">Nexus</text>
<text x="304" y="140" font-size="9.5" text-anchor="middle" fill-opacity="0.6">registry privato</text>
<rect x="480" y="44" width="200" height="52" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/>
<text x="580" y="66" font-size="10.5" text-anchor="middle">pacchetti interni</text>
<text x="580" y="84" font-size="10" text-anchor="middle" fill-opacity="0.75" font-family="ui-monospace,Menlo,Consolas,monospace">@azienda/*</text>
<rect x="480" y="150" width="200" height="52" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/>
<text x="580" y="181" font-size="10.5" text-anchor="middle">registry npm pubblico</text>
<path d="M120 124 L224 124" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M224 124 L216 120 L216 128 Z" fill="currentColor"/>
<text x="171" y="116" font-size="9" text-anchor="middle" fill-opacity="0.7">legge .npmrc</text>
<path d="M384 116 L478 72" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M480 71 L472 70 L475 78 Z" fill="currentColor"/>
<text x="432" y="84" font-size="9" text-anchor="middle" fill-opacity="0.7">ospita</text>
<path d="M384 138 L478 172" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M480 173 L472 168 L474 176 Z" fill="currentColor"/>
<text x="430" y="166" font-size="9" text-anchor="middle" fill-opacity="0.7">proxy · cache</text>
</g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il registry privato sta in mezzo: <strong>ospita</strong> i pacchetti interni (<code>@azienda/*</code>) e, per tutto il resto, fa da <strong>specchio</strong> del registry pubblico, scaricandolo la prima volta e tenendone copia.</figcaption>
</figure>

### Alternative: JSR

Il registry pubblico non è immune da problemi (pacchetti compromessi, versioni ripubblicate a sorpresa). Da qui la nascita di **JSR** (*JavaScript Registry*), un registry più recente costruito con scelte orientate alla sicurezza: le versioni pubblicate sono **immutabili** (una volta uscita, la `1.0.0` non si può più sostituire) e **non esistono script eseguiti all'installazione**, così l'atto di installare non può far girare codice. JSR non rimpiazza npm, che resta di gran lunga il più fornito e con l'inerzia di un intero ecosistema, ma gli si affianca; i gestori moderni (pnpm, Yarn) vi accedono in modo trasparente per i pacchetti nello spazio dei nomi `@jsr`.

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

Il file `.nvmrc` **resta nel progetto** (di norma versionato in git) e ha un solo compito: **dichiarare** la versione di Node che quel progetto richiede. Di per sé non attiva niente. Ad attivarla è `nvm use` senza argomenti, eseguito nella cartella: legge `.nvmrc` e passa a quella versione, un'attivazione che, come ogni `nvm use`, vale **solo per la shell corrente** e va quindi ripetuta a ogni nuova sessione. Per evitare di digitarlo ogni volta si aggiunge al profilo di shell un **hook** che lo esegue da sé appena si entra nella cartella; il concetto di *hook* è spiegato nel vault Terminale, <a href="../terminale/#/docs/06-file-configurazione-shell?id=hook-far-girare-codice-in-automatico" target="_blank" rel="noopener">Hook</a>.

> [!tip|label:.nvmrc e Windows: dipende dal version manager]
> `.nvmrc` è un semplice file di testo con dentro un numero di versione: non viene *eseguito*, viene **letto** dal version manager. È una convenzione di **nvm**, che è una funzione di shell e gira sui sistemi **Unix-like** (macOS, Linux, e WSL su Windows), non sul Windows nativo. Là si usa di solito **nvm-windows**, un progetto diverso con lo stesso nome che **non** legge `.nvmrc`, così il file resta ignorato. Che `.nvmrc` «valga» dipende quindi dal **manager**, non dal file: quelli cross-platform come **fnm** (qui sotto) lo leggono anche su Windows.

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

