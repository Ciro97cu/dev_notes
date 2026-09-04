# Anatomia di un progetto

Aprendo la cartella principale di un progetto JavaScript si trova molto più del codice: file e cartelle che non contengono funzionalità, ma **istruzioni su come il progetto va installato, controllato e aperto**. Sono il contorno che fa funzionare tutto il resto, e conoscerli toglie alla root il suo aspetto di disordine. Il primo criterio per orientarsi è una distinzione netta: cosa **viaggia con il repository** (i file versionati in git, identici per chiunque cloni il progetto) e cosa invece **si ricrea in locale** su ogni macchina e non va versionato.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 340" role="img" aria-label="La root di un progetto divisa in due colonne: a sinistra ciò che viaggia col repository ed è committato (package.json, il lockfile, .gitignore, le cartelle di configurazione .husky .vscode .github, il codice sorgente); a destra ciò che si ricrea in locale ed è elencato in .gitignore (node_modules, l'output di build dist, il file .env dei segreti)" style="width:100%;max-width:680px;height:auto;color:inherit">
<g font-family="system-ui,Arial,sans-serif" fill="currentColor">
<text x="350" y="26" font-size="13" text-anchor="middle" font-weight="700">la root del progetto</text>
<rect x="18" y="46" width="326" height="278" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/>
<text x="181" y="70" font-size="11" text-anchor="middle" font-weight="700">viaggia con il repo · committato</text>
<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="12.5">
<text x="40" y="104">package.json</text>
<text x="40" y="134">pnpm-lock.yaml</text>
<text x="40" y="164">.gitignore</text>
<text x="40" y="194">.husky/</text>
<text x="40" y="224">.vscode/</text>
<text x="40" y="254">.github/</text>
<text x="40" y="284">src/</text>
</g>
<g font-size="9" fill-opacity="0.55" text-anchor="end">
<text x="324" y="104">identità</text>
<text x="324" y="134">versioni esatte</text>
<text x="324" y="164">cosa ignorare</text>
<text x="324" y="194">git hook</text>
<text x="324" y="224">editor</text>
<text x="324" y="254">CI</text>
<text x="324" y="284">codice</text>
</g>
<rect x="356" y="46" width="326" height="278" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4"/>
<text x="519" y="70" font-size="11" text-anchor="middle" font-weight="700">ricreato in locale · in .gitignore</text>
<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="12.5">
<text x="380" y="116">node_modules/</text>
<text x="380" y="188">dist/</text>
<text x="380" y="260">.env</text>
</g>
<g font-size="9" fill-opacity="0.6">
<text x="380" y="133">i pacchetti scaricati (pesante)</text>
<text x="380" y="205">l'output di build</text>
<text x="380" y="277">segreti · mai committato</text>
</g>
</g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Si versiona la <strong>fonte</strong> (le poche righe che dicono cosa serve), non il <strong>risultato</strong> (le migliaia di file che da quella fonte si rigenerano). La colonna destra è esattamente ciò che <code>.gitignore</code> tiene fuori da git.</figcaption>
</figure>

La regola dietro la divisione è di economia: `node_modules/` può pesare centinaia di megabyte ed è interamente ricostruibile con un comando, quindi non entra in git; le due righe che dichiarano *quali* pacchetti installare, sì. Le voci che seguono sono quelle della colonna di sinistra, dove vive la vera identità del progetto.

## `package.json`: l'identità del progetto

Il file `package.json` è il documento d'identità del progetto: un file JSON, nella root, che ne dichiara nome, versione, comandi e dipendenze. È il primo file che ogni strumento dell'ecosistema Node legge.

```json
{
  "name": "dev-notes",
  "version": "1.0.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "vitest": "^2.0.0"
  }
}
```

Le parti che contano di più sono quattro. Le **`dependencies`** servono all'applicazione *quando gira* (un framework, una libreria di date); le **`devDependencies`** servono solo *mentre si sviluppa* (il compilatore, gli strumenti di test) e non finiscono nel prodotto costruito: installando il progetto in modalità produzione le seconde si saltano, alleggerendo il tutto. Gli **`scripts`** sono scorciatoie a comandi lunghi, il pannello di controllo del progetto: `npm run build` esegue ciò che sta scritto alla voce `build` (li approfondisce il vault Terminale, in <a href="../terminale/#/docs/07-node-npm-frontend?id=gli-script-il-pane-quotidiano" target="_blank" rel="noopener">Gli script</a>). Il campo **`engines`**, infine, dichiara la versione di Node su cui il progetto è pensato per girare: è una dichiarazione d'intenti che annota «qui serve Node 22» e che alcuni strumenti fanno rispettare con un avviso o un blocco, ma che di per sé non installa nulla (a montare quella versione di Node ci pensano nvm in locale e la pipeline in remoto).

Le versioni delle dipendenze non sono numeri fissi ma **intervalli** (i *range* semver): `^3.5.0` significa «la 3.5.0 o qualunque versione successiva che non cambi il primo numero», quindi fino alla 3.x ma mai la 4.0. Il `^` (caret) accetta aggiornamenti minori e patch; il `~` (tilde) solo le patch, così `~3.5.0` arriva fino alla 3.5.x. Questa elasticità è comoda (si ricevono le correzioni senza toccare il file), ma lascia aperta una domanda: se il range ammette molte versioni, *quale* viene installata di preciso? La risposta la dà il lockfile.

## Il lockfile: dal range voluto alla versione esatta

Il **lockfile** è il file che registra le versioni **esatte** effettivamente installate, l'intero albero delle dipendenze risolto fino all'ultimo livello. Cambia nome a seconda del gestore (`package-lock.json` per npm, `pnpm-lock.yaml` per pnpm, `yarn.lock` per Yarn), ma il ruolo è sempre lo stesso, ed è il complemento di `package.json`:

| | `package.json` | lockfile |
|---|---|---|
| lo scrive | una persona | il gestore, in automatico |
| contiene | i range **voluti** (`^3.5.0`) | le versioni **esatte** risolte (`3.5.14`) |
| copre | le dipendenze **dirette** | **tutto** l'albero, anche le indirette |
| serve a | dichiarare cosa serve | ricostruire **lo stesso** albero ovunque |

Il meccanismo si legge in due tempi. Alla prima installazione, `npm install` legge i range in `package.json`, sceglie per ciascuno la versione più alta compatibile disponibile sul registry in quel momento, e **scrive** il risultato nel lockfile. Da lì in avanti chiunque installi il progetto ottiene quelle **identiche** versioni, perché l'installazione legge il lock e non ricalcola i range. Senza lockfile, due persone che installano a settimane di distanza potrebbero ritrovarsi una con la `3.5.14` e una con la `3.5.20`: abbastanza per il classico «sul mio computer funziona». Ecco perché **il lockfile si versiona in git** accanto a `package.json`: è ciò che rende le installazioni riproducibili.

> [!tip|label:install contro ci]
> `npm install` può **aggiornare** il lockfile: se nel frattempo un range ammette una versione più recente, la coglie e riscrive il lock. Nelle installazioni automatiche, dove si vuole l'albero identico e nessuna sorpresa, si usa invece `npm ci` (*clean install*): legge **solo** il lockfile, fallisce se non combacia con `package.json`, e non lo modifica mai. È il comando che gira nelle pipeline.

## I file e le cartelle col punto davanti

Molte voci della root iniziano con un punto: `.gitignore`, `.husky`, `.vscode`. Il punto non è decorativo: sui sistemi Unix un nome che comincia per `.` è **nascosto** dagli elenchi normali (il vault Terminale lo spiega tra i <a href="../terminale/#/docs/03-navigare-filesystem" target="_blank" rel="noopener">file nascosti</a>), e per convenzione lì si mette la **configurazione**: file che si vogliono presenti ma fuori dai piedi. I più ricorrenti in un progetto front-end:

- **`.gitignore`** — l'elenco di ciò che git deve **ignorare**: `node_modules/`, le cartelle di build (`dist/`), i file `.env`. È il file che *realizza* la colonna destra del disegno qui sopra.
- **`.husky/`** — contiene i **git hook** del progetto: script che partono in automatico a un evento di git, tipicamente un controllo *prima* di ogni commit (far girare il linter o i test) per fermare codice non conforme prima ancora che entri nella storia. Husky è lo strumento che rende questi hook parte del repository, e quindi condivisi da tutto il team. L'idea di *hook* è la stessa vista nel vault Terminale per la shell (<a href="../terminale/#/docs/06-file-configurazione-shell?id=hook-far-girare-codice-in-automatico" target="_blank" rel="noopener">Hook</a>): codice agganciato a un evento; qui l'evento è di git anziché di shell.
- **`.vscode/`** — impostazioni dell'editor **VS Code** valide per questo progetto e condivise nel repo: estensioni consigliate, formattazione al salvataggio, configurazioni di debug. Fa sì che chiunque apra il progetto lavori con le stesse regole senza doverle reimpostare a mano.
- **`.github/`** — la cartella che GitHub legge per convenzione: dentro `.github/workflows/` stanno le **pipeline di CI** in formato YAML, più i template per issue e pull request. È il ponte tra il repository e l'automazione descritta in [CI/CD e pipeline](ci-cd-pipeline.md).
- **`.editorconfig`** — poche regole di stile *indipendenti dall'editor* (indentazione a spazi o tab, tipo di fine riga), lette da quasi tutti gli editor per uniformare i file a prescindere da chi li scrive.
- **`.env`** — le variabili d'ambiente locali: indirizzi di servizi, chiavi, **segreti**. Proprio perché contiene segreti **non si committa mai** (sta in `.gitignore`); al più si versiona un `.env.example` con i nomi delle chiavi ma senza i valori. La nozione di variabile d'ambiente è nel vault Terminale (<a href="../terminale/#/docs/05-variabili-ambiente-path" target="_blank" rel="noopener">Variabili d'ambiente</a>).
- **`.npmrc` / `.nvmrc`** — configurazione del gestore di pacchetti (`.npmrc`: quale registry usare, eventuali credenziali) e versione di Node del progetto (`.nvmrc`, letto da nvm; vedi [Package manager](package-manager.md?id=nvm)).

Resta `node_modules/`, che non ha il punto ma appartiene alla stessa storia: è la cartella dove il gestore **scarica materialmente** i pacchetti risolti dal lockfile. Cresce a dismisura, si ricrea con un comando, e per entrambe le ragioni vive fuori da git.
