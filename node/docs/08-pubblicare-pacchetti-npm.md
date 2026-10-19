# 08 · Pubblicare pacchetti npm

**Pubblicare** un pacchetto significa caricare sul registry npm un archivio compresso, il *tarball*, che contiene i file di una sua versione precisa, così che chiunque possa installarlo per nome con `npm install`. Per chi fa frontend non è un'attività riservata agli autori delle librerie famose: una libreria di componenti condivisa fra più progetti, una raccolta di funzioni di utilità, la configurazione comune di ESLint o i *design token* di un'azienda (i valori di colori, spaziature e caratteri del suo design system) viaggiano tutti come pacchetti. Pubblicare bene richiede tre cose: decidere che cosa entra nel pacchetto e da dove lo si importa, scegliere il numero di versione giusto, e farlo in modo sicuro, perché una versione compromessa finisce nei progetti di chiunque la installi. Il capitolo segue questo percorso nell'ordine, dal `package.json` fino alla pubblicazione automatica dalla CI.

## Che cosa succede quando si pubblica

Il comando `npm publish` impacchetta la cartella del progetto in un file `.tgz` (il formato è descritto nel <a href="../glossario/#/docs/package-manager?id=tarball-tgz" target="_blank" rel="noopener">glossario alla voce Tarball</a>) e lo carica sul **registry**, il magazzino online da cui tutti i gestori di pacchetti scaricano ciò che installano (<a href="../glossario/#/docs/package-manager?id=il-registry" target="_blank" rel="noopener">glossario alla voce Registry</a>). Da quel momento chi esegue `npm install mia-libreria` riceve proprio quel tarball, scompattato nella propria cartella `node_modules`. Il registry non conserva il repository git né la storia del codice: conserva soltanto i tarball, uno per versione, insieme ai metadati letti dal `package.json`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 760 270" role="img" aria-label="Il viaggio di un pacchetto: dalla cartella del progetto, dove ci sono dist, src, test, node_modules, .env, package.json, README.md e LICENSE, npm pack tiene solo dist, package.json, README.md e LICENSE nel tarball; npm publish lo carica sul registry npm come nuova versione immutabile accanto alle precedenti; npm install lo scompatta nel node_modules di chi installa" style="width:100%;max-width:740px;height:auto;color:inherit"><defs><marker id="n08-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="100" y="38" font-size="10.5" text-anchor="middle" font-weight="700" opacity=".75">chi pubblica</text><rect x="20" y="50" width="160" height="200" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="100" y="72" font-size="11.5" text-anchor="middle" font-weight="700">cartella del progetto</text><rect x="30" y="90" width="8" height="8" fill="var(--link,#5fa04e)" fill-opacity=".8"/><text x="44" y="98" font-size="10.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">dist/</text><text x="44" y="116" font-size="10.5" opacity=".4" font-family="ui-monospace,Menlo,monospace">src/</text><text x="44" y="134" font-size="10.5" opacity=".4" font-family="ui-monospace,Menlo,monospace">test/</text><text x="44" y="152" font-size="10.5" opacity=".4" font-family="ui-monospace,Menlo,monospace">node_modules/</text><text x="44" y="170" font-size="10.5" opacity=".4" font-family="ui-monospace,Menlo,monospace">.env</text><rect x="30" y="180" width="8" height="8" fill="var(--link,#5fa04e)" fill-opacity=".8"/><text x="44" y="188" font-size="10.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">package.json</text><rect x="30" y="198" width="8" height="8" fill="var(--link,#5fa04e)" fill-opacity=".8"/><text x="44" y="206" font-size="10.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">README.md</text><rect x="30" y="216" width="8" height="8" fill="var(--link,#5fa04e)" fill-opacity=".8"/><text x="44" y="224" font-size="10.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">LICENSE</text><line x1="182" y1="150" x2="232" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#n08-a)"/><text x="207" y="141" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">pack</text><text x="207" y="167" font-size="9.5" text-anchor="middle" opacity=".7" font-family="ui-monospace,Menlo,monospace">files</text><rect x="235" y="80" width="150" height="140" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".12" stroke="currentColor" stroke-width="1.8"/><text x="310" y="102" font-size="12" text-anchor="middle" font-weight="700">tarball</text><text x="310" y="118" font-size="9.5" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">mia-libreria-1.0.0.tgz</text><text x="256" y="142" font-size="10.5" font-family="ui-monospace,Menlo,monospace">dist/</text><text x="256" y="160" font-size="10.5" font-family="ui-monospace,Menlo,monospace">package.json</text><text x="256" y="178" font-size="10.5" font-family="ui-monospace,Menlo,monospace">README.md</text><text x="256" y="196" font-size="10.5" font-family="ui-monospace,Menlo,monospace">LICENSE</text><line x1="387" y1="150" x2="442" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#n08-a)"/><text x="415" y="141" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">publish</text><rect x="445" y="60" width="120" height="180" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="505" y="84" font-size="12" text-anchor="middle" font-weight="700">registry npm</text><rect x="465" y="102" width="80" height="24" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="505" y="118" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">0.9.0</text><rect x="465" y="134" width="80" height="24" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="505" y="150" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">0.9.1</text><rect x="465" y="166" width="80" height="24" rx="5" fill="var(--link,#5fa04e)" fill-opacity=".3" stroke="currentColor" stroke-width="1.4"/><text x="505" y="182" font-size="10.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">1.0.0</text><text x="505" y="220" font-size="9.5" text-anchor="middle" opacity=".7">versioni immutabili</text><line x1="567" y1="150" x2="617" y2="150" stroke="currentColor" stroke-width="1.5" marker-end="url(#n08-a)"/><text x="592" y="141" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">install</text><text x="680" y="68" font-size="10.5" text-anchor="middle" font-weight="700" opacity=".75">chi installa</text><rect x="620" y="80" width="120" height="140" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="680" y="102" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">node_modules/</text><text x="634" y="126" font-size="10" font-family="ui-monospace,Menlo,monospace">mia-libreria/</text><text x="646" y="146" font-size="10" opacity=".8" font-family="ui-monospace,Menlo,monospace">dist/</text><text x="646" y="164" font-size="10" opacity=".8" font-family="ui-monospace,Menlo,monospace">package.json</text><text x="646" y="182" font-size="10" opacity=".8" font-family="ui-monospace,Menlo,monospace">README.md</text><text x="646" y="200" font-size="10" opacity=".8" font-family="ui-monospace,Menlo,monospace">LICENSE</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il viaggio di una versione. Al momento di impacchettare, il campo <code>files</code> decide che cosa entra nel tarball: qui solo il codice compilato in <code>dist/</code>, più i file che npm include sempre; sorgenti, test, dipendenze e segreti restano a casa. Sul registry ogni versione è un tarball a sé che non si può più modificare, ed è quello che chi installa ritrova, identico, nel proprio <code>node_modules</code>.</figcaption>
</figure>

La regola che governa tutto il resto è l'**immutabilità**. Il nome e la versione, insieme, identificano un pacchetto in modo univoco, e la [policy di npm](https://docs.npmjs.com/policies/unpublish) è netta: una volta usata, una coppia `nome@versione` **non si può più riutilizzare**, nemmeno dopo averla ritirata. Una `1.0.0` uscita con un errore non si corregge sovrascrivendola: si pubblica una `1.0.1`. È una garanzia per chi installa, perché un lockfile che registra la `1.0.0` otterrà sempre gli stessi identici byte; in cambio, chi pubblica deve controllare **prima** che cosa sta per caricare.

> [!warning]
> La pubblicazione su npmjs.com è **pubblica e permanente**: pochi minuti dopo, il tarball può essere già stato scaricato, copiato nelle cache dei registry aziendali e analizzato da chiunque. Un file finito nel pacchetto per sbaglio (un `.env`, una chiave, un token) va considerato compromesso anche se la versione viene ritirata subito: l'unico rimedio è revocare quella credenziale e generarne una nuova.

## Preparare il `package.json`

Il `package.json` di una libreria fa insieme da documento d'identità e da istruzioni d'uso. I campi di base, come dipendenze e script, sono descritti nel <a href="../glossario/#/docs/anatomia-progetto" target="_blank" rel="noopener">glossario alla voce sull'anatomia di un progetto</a>, e i campi `"type"`, `"exports"` e `"imports"` nel [[02-moduli-e-pacchetti#dal-modulo-al-pacchetto-packagejson|capitolo 02]]. Qui interessano quelli che contano nel momento della pubblicazione. Il file seguente è quello di una piccola libreria scritta in TypeScript e compilata nella cartella `dist/` (con `typescript` fra le `devDependencies`):

```json
{
  "name": "@mio-utente/mia-libreria",
  "version": "1.0.0",
  "description": "Funzioni di utilità per le stringhe",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "engines": { "node": ">=22" },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mio-utente/mia-libreria.git"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "tsc",
    "prepack": "npm run build"
  }
}
```

### Nome e scope

Il campo `name` è il nome con cui il pacchetto si installa, e le [regole di npm](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#name) discendono dal fatto che quel nome finisce in un URL, in una riga di comando e nel nome di una cartella: al massimo 214 caratteri (scope compreso), niente lettere maiuscole per i pacchetti nuovi, nessun carattere che non sia sicuro in un URL. I nomi semplici, senza prefisso, appartengono a chi li registra per primo, e un nome corto e libero è ormai raro. Per questo molte librerie usano uno **scope**, il prefisso `@nome/` che raggruppa i pacchetti sotto un utente o un'organizzazione (il concetto è descritto nel <a href="../glossario/#/docs/package-manager?id=npm" target="_blank" rel="noopener">glossario alla voce NPM</a>). Ogni account npm e ogni organizzazione riceve [uno scope uguale al proprio nome](https://docs.npmjs.com/about-scopes): l'utente `mio-utente` può pubblicare `@mio-utente/mia-libreria` anche se `mia-libreria` è già occupato da qualcun altro.

Un pacchetto con scope è [privato per impostazione predefinita](https://docs.npmjs.com/about-private-packages), un dettaglio che fa inciampare al primo tentativo, e i pacchetti privati richiedono un account a pagamento. Per pubblicarlo come pubblico, la prima volta si passa l'opzione `--access public` a `npm publish`, oppure la si scrive una volta per tutte nel campo **`publishConfig`**, che raccoglie le [impostazioni da applicare al momento della pubblicazione](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#publishconfig), come nell'esempio sopra. I pacchetti senza scope, invece, sono sempre pubblici.

### Versione

Il campo `version` deve essere un numero valido secondo **SemVer** (*Semantic Versioning*), lo schema `MAJOR.MINOR.PATCH` in cui il numero stesso dice che tipo di cambiamento è avvenuto: correzioni compatibili, nuove funzionalità compatibili, oppure modifiche che rompono il codice di chi usa il pacchetto. Lo schema, con le versioni di sviluppo `0.y.z` e le pre-release come `2.0.0-beta.1`, è spiegato nel <a href="../git/#/15-semver" target="_blank" rel="noopener">vault Git alla voce SemVer</a>. Per chi pubblica, SemVer è una promessa: chi dipende da `^1.0.0` riceverà automaticamente ogni `1.x`, quindi una modifica incompatibile pubblicata come `1.3.0` romperebbe i suoi progetti senza preavviso. Il numero non si cambia a mano ma con `npm version`, descritto più avanti.

### Che cosa entra nel pacchetto: `files` e `.npmignore`

Senza indicazioni, npm mette nel tarball **tutta** la cartella del progetto, tranne alcuni file esclusi d'ufficio. Ci sono due modi per restringere la selezione, con logiche opposte. Il campo **`files`** del `package.json` è una lista di ciò che **entra**: si elencano cartelle, file o pattern (per esempio `["dist"]`) e tutto il resto resta fuori. Il file **`.npmignore`**, con la stessa sintassi di `.gitignore`, è invece una lista di ciò che **resta fuori**. Fra le due conviene la prima: con una lista di esclusione, ogni file nuovo che nessuno ha pensato di escludere (un `.env`, una cartella di appunti, un dump di dati) finisce nel pacchetto; con una lista di inclusione, nel dubbio resta fuori.

Alcuni file seguono comunque regole fisse, elencate nella [documentazione del campo `files`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#files):

| | File |
|---|---|
| Sempre inclusi | `package.json`, `README`, `LICENSE` (o `LICENCE`), il file indicato in `"main"` e quelli indicati in `"bin"` |
| Sempre esclusi | `.git`, `.npmrc`, `node_modules`, i lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) |

Infine, se manca `.npmignore`, npm usa al suo posto il **`.gitignore`**, che in quasi ogni progetto esclude proprio la cartella `dist/` con il codice compilato: senza `files` e senza `.npmignore`, il pacchetto partirebbe con i sorgenti ma **senza** il codice da eseguire. Con il campo `files` il problema sparisce, perché un file di esclusione nella radice del pacchetto [non prevale su `files`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#files).

### Punti d'ingresso e tipi TypeScript

Da dove si importa il pacchetto lo decide il campo `"exports"`, con i suoi punti d'ingresso e le sue condizioni, già spiegato nel [[02-moduli-e-pacchetti#dal-modulo-al-pacchetto-packagejson|capitolo 02]]. Per chi pubblica, `"exports"` è il **contratto pubblico** della libreria: togliere o rinominare un punto d'ingresso rompe il codice di chi lo importa, e la documentazione di Node avverte che persino [introdurre `"exports"`](https://nodejs.org/api/packages.html#package-entry-points) in un pacchetto che non lo aveva è probabilmente una modifica incompatibile, da pubblicare come nuova major.

Il codice si può pubblicare come ES module, come CommonJS o in entrambi i formati (un pacchetto *duale*, con due build distinte). Come visto nel capitolo 02, da Node 22.12 e 20.19 un modulo CommonJS può caricare un ES module con `require()`, purché quest'ultimo non usi il top-level await. Una libreria nuova distribuita **solo come ESM** resta quindi utilizzabile anche da chi scrive CommonJS su una versione di Node supportata, e la doppia build serve soprattutto quando si devono raggiungere ambienti più vecchi.

Se la libreria è scritta in TypeScript, chi la usa si aspetta di ricevere anche i **tipi**: i file di dichiarazione `.d.ts`, che descrivono la forma delle funzioni esportate senza contenerne il codice (sono spiegati nel <a href="../typescript/#/docs/32-librerie-tipi?id=librerie-scritte-in-typescript" target="_blank" rel="noopener">vault TypeScript alla voce sulle librerie scritte in TypeScript</a>). Il compilatore li genera da sé con l'opzione [`declaration`](https://www.typescriptlang.org/tsconfig/#declaration) del `tsconfig.json`, e il `package.json` deve dire dove trovarli. Dentro `"exports"` lo fa la condizione **`"types"`**, che va messa **per prima**: le condizioni si valutano nell'ordine in cui sono scritte e vince la prima che corrisponde, e la documentazione di Node indica che `"types"` [va sempre inclusa per prima](https://nodejs.org/api/packages.html#community-conditions-definitions). Il campo `"types"` al primo livello, come nell'esempio, resta come ripiego per le configurazioni di TypeScript che [non leggono `"exports"`](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports), come la vecchia risoluzione `node10`.

### Licenza, `engines`, `sideEffects` e `repository`

Il campo **`license`** dichiara con quale licenza si concede l'uso del codice, scritta come identificatore SPDX (`MIT`, `Apache-2.0`…); significato delle licenze e formato degli identificatori sono nel <a href="../glossario/#/docs/licenze?id=in-pratica-il-campo-license-e-spdx" target="_blank" rel="noopener">glossario alla voce sulle licenze</a>. Accanto al campo si mette di solito il file `LICENSE` con il testo completo, che npm include sempre nel tarball. Per un pacchetto che non concede alcun diritto d'uso, la documentazione prevede il valore [`"UNLICENSED"`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#license).

Il campo **`engines`** dichiara le versioni di Node su cui la libreria è pensata per girare, per esempio `{ "node": ">=22" }`. Per npm è [solo un'indicazione](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#engines): chi installa il pacchetto come dipendenza su una versione diversa riceve un avviso, non un errore, a meno di aver attivato l'impostazione `engine-strict`.

Il campo **`sideEffects`** non appartiene a npm ma ai bundler: è una convenzione nata con [webpack](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) con cui il pacchetto dichiara se i suoi file fanno qualcosa già al momento dell'import. Il valore `false` permette al bundler dell'applicazione di scartare senza timori i moduli che non vengono usati; il meccanismo, il *tree-shaking*, è spiegato nel <a href="../glossario/#/docs/moduli-e-bundling?id=tree-shaking" target="_blank" rel="noopener">glossario alla voce Tree-shaking</a>. Una libreria di sole funzioni dichiara `false`; una che importa file CSS li elenca, per esempio `["*.css"]`, perché quell'import ha un effetto anche se non restituisce nulla.

Il campo **`repository`**, infine, punta al repository del codice sorgente. Per molto tempo è stato solo un collegamento comodo sulla pagina del pacchetto; oggi è anche un requisito di sicurezza, perché sia le attestazioni di provenienza sia la pubblicazione dalla CI, descritte più avanti, lo confrontano **carattere per carattere** con il repository in cui gira la build.

## Controllare prima di pubblicare

Siccome una versione pubblicata non si può più correggere, il passo più utile di tutto il processo è guardare il tarball **prima** di caricarlo. Il comando `npm pack --dry-run` elenca i file che finirebbero nel pacchetto, con le dimensioni, senza creare nulla. Per la piccola libreria della ricetta in fondo al capitolo, l'elenco (accorciato) è questo:

```text
npm notice 📦  @mio-utente/mia-libreria@1.0.0
npm notice Tarball Contents
npm notice 1.1kB LICENSE
npm notice 72B README.md
npm notice 423B package.json
npm notice 535B src/index.js
npm notice Tarball Details
npm notice filename: mio-utente-mia-libreria-1.0.0.tgz
npm notice package size: 1.4 kB
npm notice total files: 4
```

Se nell'elenco compare qualcosa che non dovrebbe esserci, o manca la cartella del codice compilato, il problema si corregge qui. Per una prova più completa, `npm pack` senza opzioni crea davvero il file `.tgz`, che si può installare in un progetto di prova come se arrivasse dal registry (il procedimento è nel <a href="../glossario/#/docs/package-manager?id=tarball-tgz" target="_blank" rel="noopener">glossario alla voce Tarball</a>): è il modo più affidabile per scoprire un `"exports"` che punta a un file inesistente. Infine `npm publish --dry-run` simula l'intera pubblicazione, controlli compresi, fermandosi un attimo prima dell'invio.

| Comando | Effetto |
|---|---|
| `npm pack --dry-run` | elenca file e dimensioni del tarball, senza crearlo |
| `npm pack` | crea il file `<nome>-<versione>.tgz` nella cartella corrente |
| `npm publish --dry-run` | esegue tutta la pubblicazione tranne l'invio al registry |

Pubblicare un pacchetto vuol dire quasi sempre compilarlo prima, e npm offre alcuni **script del ciclo di vita** (*lifecycle scripts*) che esegue da solo in momenti precisi, se il `package.json` li definisce. Secondo la [documentazione degli script](https://docs.npmjs.com/cli/v12/using-npm/scripts#npm-publish), `npm publish` esegue nell'ordine `prepublishOnly`, `prepack`, `prepare`, `postpack`, `publish` e `postpublish`, mentre `npm pack` esegue solo `prepack`, `prepare` e `postpack`. Lo script `prepack` è il posto naturale per la build, perché parte sia con `npm pack` sia con `npm publish` (e anche con `--dry-run`): così il tarball che si controlla è identico a quello che si pubblicherà. `prepublishOnly`, che parte **solo** con `npm publish`, è adatto ai test che devono passare prima di ogni rilascio.

## Pubblicare e aggiornare

### Il primo `npm publish`

Per pubblicare serve un account su npmjs.com con l'**autenticazione a due fattori** (2FA) attiva: oltre alla password, una seconda prova d'identità, come una *passkey* o una chiave di sicurezza fisica. Per la pubblicazione diretta la [documentazione](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages) chiede la 2FA sull'account (l'unica alternativa è un token apposito, descritto più avanti), e npm [consiglia i metodi WebAuthn](https://github.blog/changelog/2025-09-29-strengthening-npm-security-important-changes-to-authentication-and-token-management/) (passkey e chiavi fisiche), più resistenti al phishing dei codici a sei cifre generati da un'app.

Dal terminale ci si collega all'account con `npm login`, che per impostazione predefinita [apre il browser](https://docs.npmjs.com/cli/v12/commands/npm-login) per completare l'accesso e salva le credenziali nel file `.npmrc` dell'utente. Dal 9 dicembre 2025 quelle credenziali sono un [token di sessione che scade dopo due ore](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/), e durante la sessione la pubblicazione chiede comunque la conferma con il secondo fattore. Poi basta `npm publish` nella cartella del pacchetto: npm esegue gli script, crea il tarball, lo carica e assegna alla versione l'etichetta `latest`.

| Comando | Effetto |
|---|---|
| `npm login` | accede all'account npm (nel browser) e salva un token di sessione di due ore |
| `npm whoami` | mostra con quale utente si è collegati |
| `npm publish` | pubblica la versione indicata in `package.json` |
| `npm publish --access public` | come sopra, rendendo pubblico un pacchetto con scope alla prima pubblicazione |
| `npm view <nome>` | mostra i metadati del pacchetto pubblicato: versioni, etichette, dipendenze |

### Le versioni successive: `npm version`

Il comando **`npm version`** aggiorna il numero di versione secondo SemVer al posto di chi lo scriverebbe a mano: `npm version patch` porta la `1.0.0` alla `1.0.1`, `minor` alla `1.1.0`, `major` alla `2.0.0`. Le varianti `prepatch`, `preminor`, `premajor` e `prerelease`, con l'opzione `--preid`, producono le pre-release: `npm version preminor --preid=beta` porta la `1.0.0` alla `1.1.0-beta.0`, e un successivo `npm version prerelease` alla `1.1.0-beta.1`.

Dentro un repository git il comando fa anche di più: secondo la [documentazione](https://docs.npmjs.com/cli/v12/commands/npm-version) controlla che non ci siano modifiche non salvate, aggiorna `package.json` (e il lockfile), crea un commit e un **tag** con il nuovo numero, preceduto da `v` per impostazione predefinita (`v1.1.0`). Gli script `preversion`, `version` e `postversion`, se definiti, partono rispettivamente prima dell'aggiornamento, prima del commit e dopo: un `preversion` che esegue i test impedisce di numerare una versione rotta.

```bash
npm version minor          # 1.0.1 diventa 1.1.0: package.json aggiornato, commit e tag v1.1.0
git push --follow-tags     # invia il commit e il tag al repository remoto
npm publish
```

> [!info|label:Nel repo]
> Questo progetto non è un pacchetto npm, ma segue la stessa disciplina a mano: a ogni rilascio si aggiorna la costante `DN_VERSION` in `assets/version.js` secondo SemVer e si crea il tag annotato `vX.Y.Z` corrispondente, cioè quello che `npm version` farebbe da solo con un `package.json`.

### I dist-tag: `latest`, `next` e gli altri

Un **dist-tag** è un'etichetta con un nome che punta a una versione precisa del pacchetto, e si sposta quando serve. L'etichetta con un ruolo speciale è **`latest`**: secondo la [documentazione](https://docs.npmjs.com/cli/v12/commands/npm-dist-tag), `npm install mia-libreria` senza versione installa proprio la versione marcata `latest`, e `npm publish` assegna `latest` alla nuova versione a meno di indicare un'altra etichetta con `--tag`. Tutte le altre etichette sono convenzioni dei progetti, e la più diffusa è `next`, per la prossima versione ancora in prova.

È il meccanismo che permette di pubblicare una beta senza imporla a nessuno. Con `npm publish --tag next` la `2.0.0-beta.1` arriva sul registry ma `latest` continua a puntare alla `1.1.0`: chi installa normalmente non si accorge di nulla, chi vuole provare la beta la chiede in modo esplicito con `npm install mia-libreria@next`. Al momento del rilascio vero si sposta `latest` sulla versione stabile.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 230" role="img" aria-label="Dist-tag come etichette mobili: le versioni pubblicate 1.0.0, 1.0.1, 1.1.0, 2.0.0-beta.0 e 2.0.0-beta.1 in fila; l'etichetta latest punta alla 1.1.0 e l'etichetta next alla 2.0.0-beta.1; npm install mia-libreria riceve la 1.1.0, npm install mia-libreria@next riceve la beta" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n08-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="40" y="47" font-size="11" font-weight="700" opacity=".75">dist-tag</text><rect x="262" y="30" width="76" height="26" rx="13" fill="var(--link,#5fa04e)" fill-opacity=".45" stroke="currentColor" stroke-width="1.4"/><text x="300" y="47" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">latest</text><rect x="542" y="30" width="76" height="26" rx="13" fill="var(--link,#5fa04e)" fill-opacity=".45" stroke="currentColor" stroke-width="1.4"/><text x="580" y="47" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">next</text><line x1="300" y1="57" x2="300" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#n08-b)"/><line x1="580" y1="57" x2="580" y2="93" stroke="currentColor" stroke-width="1.4" marker-end="url(#n08-b)"/><rect x="40" y="96" width="80" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="80" y="118" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">1.0.0</text><rect x="150" y="96" width="80" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="190" y="118" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">1.0.1</text><rect x="260" y="96" width="80" height="36" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="300" y="118" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">1.1.0</text><rect x="370" y="96" width="120" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3"/><text x="430" y="118" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">2.0.0-beta.0</text><rect x="520" y="96" width="120" height="36" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8" stroke-dasharray="5 3"/><text x="580" y="118" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">2.0.0-beta.1</text><line x1="121" y1="114" x2="148" y2="114" stroke="currentColor" stroke-width="1.2" opacity=".6" marker-end="url(#n08-b)"/><line x1="231" y1="114" x2="258" y2="114" stroke="currentColor" stroke-width="1.2" opacity=".6" marker-end="url(#n08-b)"/><line x1="341" y1="114" x2="368" y2="114" stroke="currentColor" stroke-width="1.2" opacity=".6" marker-end="url(#n08-b)"/><line x1="491" y1="114" x2="518" y2="114" stroke="currentColor" stroke-width="1.2" opacity=".6" marker-end="url(#n08-b)"/><line x1="300" y1="174" x2="300" y2="135" stroke="currentColor" stroke-width="1.4" marker-end="url(#n08-b)"/><line x1="580" y1="174" x2="580" y2="135" stroke="currentColor" stroke-width="1.4" marker-end="url(#n08-b)"/><text x="40" y="192" font-size="11" font-weight="700" opacity=".75">chi installa</text><text x="300" y="192" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">npm install mia-libreria</text><text x="580" y="192" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">npm install mia-libreria@next</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le versioni pubblicate restano tutte, in fila e immutabili; i dist-tag sono etichette che si spostano. Chi installa senza indicare nulla riceve la versione marcata <code>latest</code>; la beta (bordo tratteggiato), pubblicata con <code>--tag next</code>, arriva solo a chi la chiede per nome.</figcaption>
</figure>

| Comando | Effetto |
|---|---|
| `npm publish --tag next` | pubblica la versione con l'etichetta `next`, lasciando `latest` dov'è |
| `npm install mia-libreria@next` | installa la versione marcata `next` |
| `npm dist-tag add mia-libreria@2.0.0 latest` | sposta (o crea) un'etichetta su una versione |
| `npm dist-tag rm mia-libreria next` | toglie un'etichetta |
| `npm dist-tag ls mia-libreria` | elenca le etichette e le versioni a cui puntano |

Un'etichetta non può avere un nome interpretabile come intervallo SemVer: `v1.4`, per esempio, viene [rifiutata](https://docs.npmjs.com/cli/v12/commands/npm-dist-tag) perché SemVer la leggerebbe come «dalla 1.4.0 in su, fino alla 1.5.0 esclusa». Da npm 11, inoltre, per assegnare `latest` in automatico, `npm publish` [controlla che la nuova versione sia più alta](https://github.com/npm/cli/releases/tag/v11.0.0) di tutte quelle già pubblicate (pre-release escluse): una correzione su un ramo vecchio, come una `1.1.1` uscita quando `latest` è già `2.0.0`, va pubblicata con un'etichetta esplicita, per esempio `--tag legacy`, così non scalza la versione corrente.

### Ritirare una versione: `npm deprecate` e `npm unpublish`

Quando una versione si rivela difettosa, la strada normale non è cancellarla ma **deprecarla**: `npm deprecate` associa alla versione un messaggio che npm mostra come avviso a chiunque la installi, senza toglierla dal registry e quindi senza rompere chi la usa già. Si può deprecare un intervallo di versioni in un colpo solo, e un messaggio vuoto annulla la deprecazione ([documentazione](https://docs.npmjs.com/cli/v12/commands/npm-deprecate)).

Ritirare davvero una versione con `npm unpublish` è possibile solo entro limiti stretti, fissati dalla [policy di npm](https://docs.npmjs.com/policies/unpublish). Nelle prime **72 ore** dalla pubblicazione si può ritirare liberamente, purché nessun altro pacchetto del registry ne dipenda. Dopo le 72 ore servono tre condizioni insieme: nessun pacchetto che ne dipende, meno di 300 download nell'ultima settimana e un solo proprietario. Anche quando riesce, il ritiro non libera il numero di versione, che resta bruciato per sempre; e se si ritira l'**intero** pacchetto, non si possono pubblicare nuove versioni per 24 ore. Il motivo di tanto rigore è che un pacchetto sparito rompe le installazioni di tutti i progetti che lo usano.

| Comando | Effetto |
|---|---|
| `npm deprecate mia-libreria@"<1.2.0" "aggiornare alla 1.2.0"` | segna come deprecate tutte le versioni dell'intervallo, con un messaggio |
| `npm deprecate mia-libreria@1.1.0 ""` | annulla la deprecazione |
| `npm unpublish mia-libreria@1.1.0` | ritira una versione, nei limiti della policy |

## Pubblicare in sicurezza

Chi controlla la pubblicazione di un pacchetto controlla il codice che gira sui computer di tutti quelli che lo installano. Per questo le credenziali di pubblicazione sono un bersaglio prezioso: con un token rubato, un attaccante può pubblicare una versione con codice malevolo che arriva nei progetti altrui al primo aggiornamento, un attacco alla *supply chain*, la catena di fornitura del software (<a href="../glossario/#/docs/package-manager?id=pnpm" target="_blank" rel="noopener">glossario alla voce pnpm</a>). Fra il 2025 e il 2026 npm ha cambiato a fondo le regole: niente più token permanenti, la pubblicazione dalla CI senza segreti, le attestazioni di provenienza e un'approvazione umana facoltativa prima del rilascio.

### Dai token classici ai token granulari

Un **token di accesso** è una stringa segreta che fa le veci di utente e password per un programma, per esempio per una pipeline di CI. Oggi npm supporta [solo i token granulari](https://docs.npmjs.com/about-access-tokens) (*granular access tokens*): ognuno vale solo per i pacchetti, gli scope o le organizzazioni scelti, può essere di sola lettura o di lettura e scrittura, e ha una scadenza. Dal 5 novembre 2025 i token con permesso di scrittura [durano al massimo 90 giorni](https://github.blog/changelog/2025-11-05-npm-security-update-classic-token-creation-disabled-and-granular-token-changes/) e richiedono la 2FA per impostazione predefinita; per l'uso non interattivo in CI esiste l'opzione **Bypass 2FA**, disattivata in partenza. Anche questa scappatoia si sta chiudendo: con l'[aggiornamento annunciato il 31 luglio 2026](https://github.blog/changelog/2026-07-31-restricting-npm-bypass-2fa-granular-access-tokens/) i token con Bypass 2FA non possono più compiere le operazioni sensibili di gestione di account, pacchetti e organizzazioni, e npm ha fissato come obiettivo **gennaio 2027** per togliere loro anche la pubblicazione diretta, lasciando solo la pubblicazione in attesa di approvazione descritta più avanti. Per la CI, la stessa documentazione indica il trusted publishing.

> [!info|label:Legacy]
> I **token classici** di npm erano permanenti e valevano per tutti i pacchetti dell'account; nelle pipeline si salvavano come segreto `NPM_TOKEN` e si scrivevano nel `.npmrc` della CI (`//registry.npmjs.org/:_authToken=${NPM_TOKEN}`). Dal 5 novembre 2025 non se ne possono più creare, e il 9 dicembre 2025 npm li ha [revocati tutti in modo definitivo](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/). Guide e workflow scritti prima di quella data li citano ancora: vanno sostituiti con il trusted publishing.

### Trusted publishing: la CI pubblica senza segreti

Il **trusted publishing** (pubblicazione fidata) permette a una pipeline di CI di pubblicare senza conservare alcun token. Si basa su **OIDC** (*OpenID Connect*), uno standard con cui un servizio rilascia una prova d'identità firmata e di breve durata: il fornitore della CI, per esempio GitHub, emette per il singolo job un token che attesta «questo è il workflow `publish.yml` del repository `mio-utente/mia-libreria`». Sul registry, nelle impostazioni del pacchetto, si dichiara una volta per tutte quale repository e quale workflow sono autorizzati a pubblicare; quando il job presenta il suo token, npm verifica che i dati combacino e accetta la pubblicazione. Non c'è nessun segreto da rubare, perché la prova d'identità vale per quel job soltanto e scade da sola.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 300" role="img" aria-label="Trusted publishing: il provider OIDC della CI rilascia al job di rilascio un token d'identità di breve durata; il job invia token e tarball al registry npm, che confronta repository e workflow con il trusted publisher configurato; in parallelo la provenance firmata viene registrata nel registro pubblico di Sigstore" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n08-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="270" y="20" width="180" height="56" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="360" y="44" font-size="12" text-anchor="middle" font-weight="700">provider OIDC</text><text x="360" y="62" font-size="10.5" text-anchor="middle" opacity=".75">della CI (GitHub)</text><rect x="20" y="112" width="180" height="64" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="110" y="139" font-size="12" text-anchor="middle" font-weight="700">job di rilascio</text><text x="110" y="158" font-size="10.5" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">publish.yml</text><rect x="520" y="106" width="180" height="76" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".14" stroke="currentColor" stroke-width="1.8"/><text x="610" y="130" font-size="12" text-anchor="middle" font-weight="700">registry npm</text><text x="610" y="149" font-size="10" text-anchor="middle" opacity=".8">confronta repository e</text><text x="610" y="164" font-size="10" text-anchor="middle" opacity=".8">workflow con la config</text><rect x="270" y="226" width="180" height="56" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="360" y="250" font-size="12" text-anchor="middle" font-weight="700">Sigstore</text><text x="360" y="268" font-size="10.5" text-anchor="middle" opacity=".75">registro pubblico</text><line x1="290" y1="78" x2="182" y2="110" stroke="currentColor" stroke-width="1.5" marker-end="url(#n08-c)"/><text x="222" y="80" font-size="10.5" text-anchor="end">1 · token OIDC</text><line x1="202" y1="144" x2="517" y2="144" stroke="currentColor" stroke-width="1.5" marker-end="url(#n08-c)"/><text x="360" y="136" font-size="10.5" text-anchor="middle">2 · token + tarball</text><line x1="182" y1="178" x2="288" y2="224" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#n08-c)"/><text x="262" y="244" font-size="10.5" text-anchor="end">3 · provenance firmata</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il job riceve dal provider OIDC una prova d'identità valida solo per sé (serve il permesso <code>id-token: write</code>) e la presenta al registry insieme al tarball; npm pubblica solo se repository e workflow coincidono con il trusted publisher configurato sul pacchetto. Nello stesso passaggio l'attestazione di provenienza viene firmata e registrata in un registro pubblico, e viaggia con il pacchetto fino alla sua pagina su npmjs.com.</figcaption>
</figure>

Il servizio è [generalmente disponibile dal 31 luglio 2025](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/), e la [documentazione](https://docs.npmjs.com/trusted-publishers) ne fissa i requisiti: npm 11.5.1 o successivo e Node 22.14.0 o successivo nel job, e una CI fra quelle supportate, cioè GitHub Actions e GitLab CI/CD sui runner ospitati dai rispettivi servizi e CircleCI nella versione cloud (i runner installati in proprio non sono ancora supportati). Il campo `repository.url` del `package.json` deve coincidere esattamente con il repository GitHub. Il pacchetto, inoltre, deve [già esistere sul registry](https://docs.npmjs.com/cli/v12/commands/npm-trust): la prima versione si pubblica a mano, poi si configura il trusted publisher dalla pagina delle impostazioni su npmjs.com oppure con il comando `npm trust github`. Con GitHub Actions il workflow ha bisogno del permesso `id-token: write`, che autorizza il job a chiedere il token OIDC; lo schema segue l'esempio della documentazione:

```yaml
# .github/workflows/publish.yml
name: Publish
on:
  push:
    tags: ['v*']            # parte quando si invia un tag come v1.2.0

permissions:
  id-token: write           # permette al job di chiedere il token OIDC
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish    # nessun token: l'identità arriva via OIDC
```

Quando il trusted publishing funziona, la documentazione consiglia di chiudere le altre porte: nelle impostazioni del pacchetto si sceglie **Require two-factor authentication and disallow tokens**, così nessun token può più pubblicare, mentre il trusted publisher, che non usa token, continua a farlo.

### Provenance: da dove viene un pacchetto

Un'**attestazione di provenienza** (*provenance statement*) è un documento firmato che lega una versione pubblicata al **commit** sorgente e al **workflow** che l'ha costruita, così che chiunque possa verificare da dove viene prima di installarla. La firma avviene con [Sigstore](https://docs.npmjs.com/generating-provenance-statements), un insieme di strumenti che firmano il software con certificati di breve durata, e l'attestazione viene registrata in un registro pubblico a prova di manomissione. Su npmjs.com una versione con provenienza mostra un [segno di spunta verde](https://docs.npmjs.com/viewing-package-provenance) che apre i dettagli: ambiente di build, commit, file del workflow, voce nel registro pubblico. Dal lato di chi installa, `npm audit signatures` verifica firme e attestazioni delle dipendenze già installate.

Con il trusted publishing l'attestazione si genera **da sola**, senza opzioni, quando il repository e il pacchetto sono entrambi pubblici e la CI è GitHub Actions o GitLab CI/CD ([documentazione](https://docs.npmjs.com/trusted-publishers)). In una pipeline che pubblica ancora con un token la si chiede con `npm publish --provenance`, oppure con `"provenance": true` dentro `publishConfig`, a patto che la build giri su un runner ospitato di una CI supportata (con GitHub Actions serve di nuovo il permesso `id-token: write`). La provenienza dice **dove e come** è stato costruito un pacchetto, non che il suo codice sia innocuo; garantisce però che il tarball corrisponda a un commit preciso di un repository pubblico, e quindi che il codice si possa ispezionare.

> [!info|label:Legacy]
> Fino al 2025 la pubblicazione dalla CI tipica usava un token salvato fra i segreti del repository e nessuna attestazione: dal registry non c'era modo di sapere se un tarball venisse davvero dal repository indicato o dal computer di qualcuno. Pacchetti e guide di quel periodo si riconoscono dall'assenza della spunta di provenienza e dal segreto `NPM_TOKEN` nel workflow.

### Staged publishing: un'approvazione umana prima del rilascio

Lo **staged publishing** (pubblicazione in attesa di approvazione), [disponibile per tutti dal 22 maggio 2026](https://github.blog/changelog/2026-05-22-staged-publishing-and-new-install-time-controls-for-npm), aggiunge un passaggio fra la CI e il pubblico: con `npm stage publish` il tarball non diventa subito installabile ma finisce in una coda, e un maintainer deve approvarlo esplicitamente, superando la verifica 2FA, dal terminale o dalla scheda *Staged Packages* su npmjs.com. Mettere in coda non richiede la 2FA, quindi la CI può farlo da sola; approvare sì, e così, se la pubblicazione diretta è chiusa, un token rubato non basta più a far uscire una versione. Servono npm 11.15.0 o successivo e Node 22.14.0 o successivo ([documentazione](https://docs.npmjs.com/staged-publishing)), e un trusted publisher può essere limitato alla sola pubblicazione in coda, così che da quel workflow un `npm publish` diretto venga rifiutato.

| Comando | Effetto |
|---|---|
| `npm stage publish` | impacchetta e mette la versione in coda, non ancora pubblica |
| `npm stage list [<pacchetto>]` | elenca le versioni in coda |
| `npm stage view <stage-id>` | mostra i dettagli di una versione in coda |
| `npm stage download <stage-id>` | scarica il tarball in coda per ispezionarlo |
| `npm stage approve <stage-id>` | pubblica la versione in coda (richiede la 2FA) |
| `npm stage reject <stage-id>` | scarta la versione in coda (richiede la 2FA) |

## Automatizzare i rilasci

Scegliere a mano patch, minor o major a ogni rilascio, e scrivere il registro delle modifiche (il *changelog*), è un lavoro ripetitivo in cui è facile sbagliare. Due strumenti molto diffusi lo automatizzano partendo da informazioni scritte durante lo sviluppo.

[**Changesets**](https://changesets.dev/guide/getting-started) chiede a chi apre una modifica di aggiungere un piccolo file, il *changeset*, creato con `npx @changesets/cli`, in cui si dichiara il tipo di aumento di versione e si descrive il cambiamento a parole. Al momento del rilascio, `changeset version` consuma tutti i changeset accumulati, calcola le nuove versioni e aggiorna i changelog; `changeset publish` pubblica le versioni non ancora presenti sul registry e crea i tag git ([documentazione](https://changesets.dev/guide/versioning-and-publishing)). È pensato soprattutto per i monorepo, dove più pacchetti si rilasciano insieme (il tema del [[09-monorepo|capitolo 09]]), ma funziona anche con un pacchetto solo.

[**semantic-release**](https://github.com/semantic-release/semantic-release#commit-message-format) fa a meno di file aggiuntivi e ricava tutto dai messaggi di commit, scritti secondo una convenzione come i *Conventional Commits*: un commit `fix:` produce una patch, un `feat:` una minor, un commit con la nota `BREAKING CHANGE:` una major. Gira nella CI dopo ogni build riuscita sul ramo di rilascio e fa tutto da solo: calcola la versione, genera le note di rilascio, crea il tag e pubblica.

## Oltre npmjs.com: altri registry

Il registry pubblico di npm non è l'unica destinazione possibile. **GitHub Packages** offre un registry compatibile con npm all'indirizzo `https://npm.pkg.github.com`, legato ai repository GitHub: accetta [solo pacchetti con scope](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry), si raggiunge configurando lo scope nel file `.npmrc` o il registry in `publishConfig`, e richiede un token di accesso anche per installare i pacchetti pubblici, il che lo rende più adatto alla distribuzione interna che a una libreria aperta. Il meccanismo del `.npmrc` per scope è descritto nel <a href="../glossario/#/docs/package-manager?id=registry-privati-e-repository-manager" target="_blank" rel="noopener">glossario alla voce sui registry privati</a>.

**JSR** (*JavaScript Registry*) è un registry più recente, nato con scelte orientate alla sicurezza e al TypeScript (<a href="../glossario/#/docs/package-manager?id=alternative-jsr" target="_blank" rel="noopener">glossario alla voce JSR</a>). Vi si pubblica con `npx jsr publish`, descrivendo il pacchetto in un file `jsr.json` con nome, versione ed `exports`, e la [documentazione](https://jsr.io/docs/publishing-packages) incoraggia a caricare direttamente i sorgenti TypeScript invece della coppia `.js` più `.d.ts`. Anche JSR supporta la pubblicazione da GitHub Actions via OIDC, senza segreti, con attestazione di provenienza.

Per provare l'intero ciclo senza toccare il registry pubblico, infine, si può avviare in locale un registry privato come Verdaccio, già incontrato nel <a href="../angular/#/capitoli/14-monorepos-libraries?id=building-and-publishing-the-npm-package" target="_blank" rel="noopener">vault Angular, capitolo 14</a>.

## Ricetta: la prima pubblicazione di una libreria ESM

La ricetta pubblica una piccola libreria in JavaScript, distribuita come ES module e senza passaggio di build, sotto lo scope dell'utente. Con TypeScript cambiano solo due cose, viste sopra: lo script di build in `prepack` e la condizione `"types"` in `"exports"`.

1. **Creare il progetto** con lo scope del proprio utente npm:
   ```bash
   mkdir mia-libreria && cd mia-libreria
   npm init --scope=@mio-utente -y
   ```
2. **Scrivere il codice** in `src/index.js`:
   ```js
   /**
    * Trasforma un testo in uno "slug" per gli URL:
    * minuscole, senza accenti, parole unite da trattini.
    * @param {string} testo
    * @returns {string}
    */
   export function slugify(testo) {
     return testo
       .normalize('NFD')                 // separa le lettere dai segni diacritici
       .replace(/[̀-ͯ]/g, '')  // toglie i segni diacritici
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '-')      // ciò che non è lettera o cifra diventa un trattino
       .replace(/^-+|-+$/g, '');         // niente trattini in testa o in coda
   }
   ```
   e provarlo al volo: `node --input-type=module -e "import { slugify } from './src/index.js'; console.log(slugify('Città di Napoli!'))"` stampa `citta-di-napoli`.
3. **Completare il `package.json`**. Le versioni recenti di `npm init` scrivono `"type": "commonjs"` e un campo `"main"`: sostituirli con i campi di una libreria ESM.
   ```json
   {
     "name": "@mio-utente/mia-libreria",
     "version": "1.0.0",
     "description": "Trasforma un testo in uno slug per gli URL",
     "type": "module",
     "exports": "./src/index.js",
     "files": ["src"],
     "sideEffects": false,
     "engines": { "node": ">=22" },
     "license": "MIT",
     "repository": {
       "type": "git",
       "url": "git+https://github.com/mio-utente/mia-libreria.git"
     },
     "publishConfig": { "access": "public" }
   }
   ```
4. **Aggiungere `README.md` e `LICENSE`**: il primo diventa la pagina del pacchetto su npmjs.com, il secondo contiene il testo della licenza dichiarata.
5. **Controllare il contenuto** con `npm pack --dry-run`: devono comparire solo `LICENSE`, `README.md`, `package.json` e `src/index.js`. Per una prova completa, eseguire `npm pack` e installare il `.tgz` in un altro progetto.
6. **Accedere** con `npm login`, dopo aver attivato la 2FA sull'account, e controllare l'utente con `npm whoami`.
7. **Simulare** la pubblicazione con `npm publish --dry-run` e rileggere il riepilogo: nome, versione, etichetta `latest` e accesso pubblico.
8. **Pubblicare** con `npm publish`, confermando con il secondo fattore quando richiesto.
9. **Verificare** il risultato con `npm view @mio-utente/mia-libreria` e sulla pagina del pacchetto su npmjs.com.
10. **Preparare i rilasci successivi**: configurare il trusted publisher del pacchetto per il workflow di rilascio, impostare *Require two-factor authentication and disallow tokens* e, da lì in poi, rilasciare con `npm version patch` (o `minor`, `major`) seguito da `git push --follow-tags`, lasciando che sia la CI a pubblicare.

> [!warning]
> Il passo 8 è quello irreversibile: la versione `1.0.0` resterà associata a quel tarball per sempre, anche ritirandola. Conviene arrivarci solo dopo aver letto con attenzione l'elenco dei file del passo 5.

> [!tip]
> Per pubblicare bene: elencare ciò che entra con `files`, guardare il tarball con `npm pack --dry-run` prima di ogni rilascio, numerare con `npm version` secondo SemVer, usare i dist-tag per le versioni di prova e, per i rilasci dalla CI, il trusted publishing al posto dei token, con la provenienza generata da sola.

## Ripasso lampo

<details>
<summary>Perché, dopo aver ritirato la <code>1.0.0</code> con <code>npm unpublish</code>, non si può ripubblicarla corretta con lo stesso numero?</summary>

Perché sul registry ogni coppia `nome@versione` è immutabile: una volta usata non si può più riutilizzare, nemmeno dopo il ritiro. Chi ha `1.0.0` nel lockfile deve poter contare sempre sugli stessi byte. La correzione si pubblica come `1.0.1`, e la versione difettosa di solito si depreca con `npm deprecate` invece di ritirarla.

</details>

<details>
<summary>Che differenza c'è fra il campo <code>files</code> e il file <code>.npmignore</code>, e perché si preferisce il primo?</summary>

`files` elenca ciò che **entra** nel tarball, `.npmignore` ciò che **resta fuori**. Con una lista di inclusione un file nuovo non previsto, come un `.env`, resta fuori per default; con una lista di esclusione finisce nel pacchetto finché qualcuno non lo esclude. In più, se manca `.npmignore` npm usa il `.gitignore`, che spesso esclude proprio `dist/`.

</details>

<details>
<summary>Che cosa succede pubblicando una beta con <code>npm publish --tag next</code>?</summary>

La versione arriva sul registry con l'etichetta `next`, mentre `latest` resta sulla versione stabile precedente. Siccome `npm install mia-libreria` installa la versione marcata `latest`, chi installa normalmente non riceve la beta; chi vuole provarla la chiede con `npm install mia-libreria@next`.

</details>

<details>
<summary>Che cos'è il trusted publishing e perché sostituisce i token nella CI?</summary>

È la pubblicazione basata su OIDC: il fornitore della CI rilascia al job una prova d'identità firmata e di breve durata, e npm la confronta con il repository e il workflow autorizzati nelle impostazioni del pacchetto. Non esiste un segreto permanente da conservare, quindi non c'è nulla da rubare; in più l'attestazione di provenienza si genera automaticamente. Richiede npm 11.5.1+ e Node 22.14.0+, e il pacchetto deve già esistere sul registry.

</details>

<details>
<summary>Che cosa garantisce, e che cosa no, un'attestazione di provenienza?</summary>

Garantisce che il tarball sia stato costruito da un commit preciso di un repository, con un workflow preciso, ed è firmata e registrata in un registro pubblico, verificabile con `npm audit signatures`. Non garantisce che il codice sia innocuo: rende solo possibile risalire al sorgente e ispezionarlo.

</details>
