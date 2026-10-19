# 09 · Monorepo

Un **monorepo** è un unico repository, cioè un unico archivio di codice versionato con Git, che ospita **più progetti distinti**: diverse applicazioni e le librerie che si scambiano, ciascuna con il proprio `package.json`, sviluppate e rilasciate dallo stesso albero di cartelle. Il caso tipico di chi fa frontend è un sito pubblico, un pannello di amministrazione e una libreria di componenti usata da entrambi: invece di tre repository separati, uno solo. Tenere tutto insieme è semplice finché i pacchetti sono pochi; quando crescono servono strumenti precisi, e questo capitolo li presenta nell'ordine in cui entrano in gioco. Prima vengono i **workspace** del package manager, che installano e collegano i pacchetti locali; poi i **task runner** come Turborepo e Nx, che decidono che cosa ricostruire e in quale ordine; infine gli strumenti di **versionamento** come Changesets, per quando i pacchetti vanno anche pubblicati.

## Monorepo e polyrepo

L'alternativa al monorepo si chiama **polyrepo**: un repository per ogni progetto, ciascuno con la propria storia, la propria pipeline e i propri rilasci. È il modello che nasce spontaneamente, e funziona bene finché i progetti non si toccano. Il problema emerge quando una libreria serve a più applicazioni. In un polyrepo la libreria va **pubblicata** su un registry, pubblico o aziendale (vedi il <a href="../glossario/#/docs/package-manager?id=il-registry" target="_blank" rel="noopener">glossario alla voce registry</a>), e ogni applicazione la installa come qualunque altro pacchetto. Una modifica percorre quindi una catena lunga: si cambia la libreria, se ne pubblica una nuova versione, si aggiorna la dipendenza in ciascuna applicazione, ognuna con la propria pull request. Se la modifica rompe la compatibilità, per un periodo le applicazioni convivono su versioni diverse della stessa libreria, e qualcuno deve ricordarsi di riallinearle.

In un monorepo la libreria e le applicazioni che la usano stanno nello stesso albero, e il package manager le **collega** direttamente, senza passare dal registry. La stessa modifica diventa un unico commit che cambia la libreria e adatta insieme tutti i punti che la usano: una **modifica atomica**, che entra per intero o non entra affatto. La pipeline di integrazione continua (la *CI*, il server che a ogni modifica installa, compila e testa il progetto) la verifica in un colpo solo, applicazioni comprese.

Monorepo non vuol dire **monolito**, anche se i due termini si confondono spesso. Un monolito è un'unica applicazione in cui tutto il codice è intrecciato; in un monorepo i pacchetti restano unità separate, ciascuna con il proprio `package.json`, i propri punti d'ingresso e le proprie dipendenze dichiarate. Ciò che si condivide è il repository, non il codice: un pacchetto vede un altro solo se lo dichiara come dipendenza. Lo stesso tema, raccontato con gli strumenti di Angular (la CLI e Nx), è nel <a href="../angular/#/capitoli/14-monorepos-libraries" target="_blank" rel="noopener">capitolo 14 del vault Angular</a>.

## Vantaggi e costi

I vantaggi discendono quasi tutti dalla vicinanza. Oltre alle modifiche atomiche c'è il **tooling condiviso**: una sola configurazione di ESLint, di Prettier e di TypeScript da cui i pacchetti ereditano, una sola pipeline di CI, un solo lockfile che fissa le versioni di tutto il repository. C'è la **visibilità**: chi lavora su un'applicazione ha sotto mano il codice della libreria che usa, e l'editor può seguire un simbolo da un pacchetto all'altro, cosa che rende molto meno rischiosi i refactoring trasversali. E c'è la possibilità di applicare una **politica della versione unica**, in cui ogni dipendenza esterna (React, per esempio) esiste in una sola versione per tutto il repository. Il libro *Software Engineering at Google* chiama questo principio [One-Version Rule](https://abseil.io/resources/swe-book/html/ch16.html): chi sviluppa non deve mai trovarsi a scegliere quale versione di un componente usare. Gli autori, che descrivono un'azienda con la gran parte del codice in un unico repository, osservano anche che il monorepo non è la risposta giusta per tutti e che ciò che conta è rispettare la versione unica. Nei monorepo JavaScript la si ottiene, per esempio, con i *catalogs* di pnpm, citati più avanti.

I costi crescono con le dimensioni. C'è anzitutto la **scala**: installazione, clonazione e indicizzazione nell'editor riguardano tutto il repository, anche la parte su cui non si lavora. Poi il **tempo di CI**: senza strumenti dedicati ogni modifica, anche una riga in una sola applicazione, fa ricostruire e ritestare tutti i pacchetti; è il problema che risolvono i task runner, con la cache e la selezione dei soli pacchetti toccati. Poi la **proprietà** del codice: in un polyrepo il confine del repository coincide spesso con quello del team, mentre in un monorepo va reso esplicito, per esempio con il file `CODEOWNERS` di GitHub, che assegna ogni percorso a un responsabile e [ne richiede in automatico la revisione](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) quando una pull request lo modifica. Infine l'**accoppiamento**: importare un pacchetto vicino è così facile che, senza regole, le dipendenze fra pacchetti tendono a intrecciarsi. Nx, per esempio, permette di vietare certe direzioni con i *module boundaries*, descritti nel <a href="../angular/#/capitoli/14-monorepos-libraries?id=module-boundaries" target="_blank" rel="noopener">vault Angular</a>.

## La struttura tipica: `apps/` e `packages/`

Non esiste una struttura obbligatoria, ma la più diffusa divide i pacchetti in due cartelle, ed è la convenzione che suggerisce la [documentazione di Turborepo](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository). In `apps/` vanno le applicazioni e i servizi, cioè ciò che si distribuisce (*deploy*) e che nessun altro pacchetto importa; in `packages/` va tutto il resto, cioè le librerie che le applicazioni consumano e i pacchetti che contengono solo configurazione. Nx usa la stessa idea con i nomi `apps/` e `libs/`.

```
mio-monorepo/
├── package.json            la radice: "private": true, elenco dei workspace, script comuni
├── pnpm-workspace.yaml     (solo con pnpm) dove stanno i pacchetti
├── turbo.json              (se si usa Turborepo) la configurazione dei task
├── apps/
│   ├── web/                il sito pubblico
│   └── admin/              il pannello di amministrazione
└── packages/
    ├── ui/                 la libreria di componenti condivisa
    ├── utils/              funzioni di utilità
    └── typescript-config/  i tsconfig di base, che gli altri pacchetti ereditano
```

La radice ha un proprio `package.json`, ma non è un pacchetto da pubblicare: è il contenitore che elenca i workspace e ospita gli script comuni e gli strumenti usati da tutti. Per questo la si marca con `"private": true`, che fa [rifiutare a npm qualunque pubblicazione](https://docs.npmjs.com/cli/v12/configuring-npm/package-json#private). I pacchetti interni ricevono di solito un nome con **scope**, il prefisso `@qualcosa/` spiegato nel <a href="../glossario/#/docs/package-manager?id=npm" target="_blank" rel="noopener">glossario</a>: `@repo/ui`, `@repo/utils`. Gli esempi di Turborepo usano `@repo` perché è uno scope che nessuno può registrare sul registry npm, quindi non si rischia di confonderlo con un pacchetto pubblico; in azienda si usa lo scope dell'organizzazione. Conviene infine tenere ogni pacchetto a un solo livello di profondità (`apps/web`, `packages/ui`): Turborepo, per esempio, non supporta pacchetti annidati come quelli che andrebbe a cercare una glob `packages/**`.

## I workspace dei package manager

Un **workspace** è la funzione del package manager che trasforma un repository con molti `package.json` in un'unica installazione. Si lancia `install` una volta sola, alla radice; si ottiene un solo lockfile per tutto il repository; e i pacchetti locali che dipendono l'uno dall'altro vengono **collegati** fra loro invece di essere scaricati dal registry. npm, pnpm, Yarn e Bun offrono tutti i workspace, con differenze di sintassi e di rigore. Che cosa siano i tre gestori principali è spiegato nel <a href="../glossario/#/docs/package-manager" target="_blank" rel="noopener">glossario</a>, e come costruiscono `node_modules` nel [[03-package-manager|capitolo 03]]; qui interessa come gestiscono più pacchetti insieme.

### npm workspaces

Con npm i workspace si dichiarano nel campo **`"workspaces"`** del `package.json` della radice, un elenco di cartelle o di glob (i pattern con l'asterisco), ciascuna delle quali deve contenere un proprio `package.json` ([documentazione](https://docs.npmjs.com/cli/v12/using-npm/workspaces)).

```json
{
  "name": "mio-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

Da quel momento quasi ogni comando di npm accetta l'opzione **`-w`** (abbreviazione di `--workspace`), che lo esegue nel contesto di un workspace preciso, indicato per nome o per cartella e ripetibile per indicarne più d'uno, e l'opzione **`--workspaces`**, che lo esegue in tutti.

| Comando | Effetto |
|---|---|
| `npm install` (alla radice) | installa le dipendenze di tutti i workspace e collega i pacchetti locali in `node_modules` |
| `npm init -w ./packages/ui` | crea il workspace (cartella e `package.json`) e lo aggiunge a `"workspaces"` se serve |
| `npm install zod -w @repo/ui` | aggiunge una dipendenza dal registry al solo workspace `@repo/ui` |
| `npm install @repo/ui -w web` | fa dipendere `web` dal pacchetto locale `@repo/ui`, che viene collegato e non scaricato |
| `npm run build -w web` | esegue lo script `build` del solo workspace `web` |
| `npm run build --workspaces` | esegue `build` in tutti i workspace, nell'ordine in cui compaiono nel `package.json` della radice |
| `npm run build --workspaces --if-present` | come sopra, ma salta senza errore i workspace che non hanno lo script |
| `npm run build --workspaces --include-workspace-root` | include nell'esecuzione anche la radice |

Quando un workspace dipende da un altro, npm scrive nel suo `package.json` un normale intervallo di versioni, come `"@repo/ui": "^1.0.0"` (oppure `"*"`), e al momento dell'installazione collega la cartella locale. npm non conosce invece il protocollo `workspace:` di pnpm e Yarn descritto qui sotto: un `package.json` che lo usa fa fallire `npm install` con l'errore `EUNSUPPORTEDPROTOCOL` (verificato con npm 11 e 12).

### pnpm workspaces

pnpm ignora il campo `"workspaces"` e legge i pacchetti da un file dedicato alla radice, **`pnpm-workspace.yaml`**, la cui forma di base è già mostrata nel <a href="../glossario/#/docs/package-manager?id=monorepo-workspaces-e-catalogs" target="_blank" rel="noopener">glossario alla voce sui workspace di pnpm</a>. Da pnpm 12.7, se il file manca ma il `package.json` ha il campo `"workspaces"`, `pnpm install` lo [crea da sé](https://pnpm.io/workspaces) con gli stessi pattern, il che semplifica il passaggio da npm. La versione attuale, pnpm 12, è una [riscrittura in Rust](https://pnpm.io/blog/releases/12.0) che mantiene gli stessi comandi e gli stessi file.

La differenza più visibile rispetto a npm è il **protocollo `workspace:`**, con cui un pacchetto dichiara una dipendenza locale: `"@repo/ui": "workspace:*"`. Con questo prefisso pnpm [si rifiuta di risolvere la dipendenza](https://pnpm.io/workspaces#workspace-protocol-workspace) con qualunque cosa che non sia un pacchetto del workspace, così un errore di nome o di versione non porta mai a scaricare per sbaglio un omonimo dal registry. Il prefisso, però, non ha senso fuori dal repository, quindi al momento di `pnpm pack` o `pnpm publish` viene sostituito con una versione vera, quella che il pacchetto locale ha in quel momento:

| Nel `package.json` del monorepo | Nel pacchetto pubblicato (con `@repo/ui` alla 1.5.0) |
|---|---|
| `"@repo/ui": "workspace:*"` | `"@repo/ui": "1.5.0"` |
| `"@repo/ui": "workspace:~"` | `"@repo/ui": "~1.5.0"` |
| `"@repo/ui": "workspace:^"` | `"@repo/ui": "^1.5.0"` |
| `"@repo/ui": "workspace:^1.5.0"` | `"@repo/ui": "^1.5.0"` |

L'altro punto di forza di pnpm è il **filtro**. L'opzione `-r` (*recursive*) esegue un comando in tutti i pacchetti del workspace, mentre **`--filter`** (abbreviato `-F`) ne seleziona solo alcuni, con una piccola sintassi che sa leggere il grafo delle dipendenze ([documentazione](https://pnpm.io/filtering)): i tre puntini **dopo** il nome aggiungono le dipendenze del pacchetto, **prima** del nome i pacchetti che dipendono da lui.

| Comando | Effetto |
|---|---|
| `pnpm -r run build` | esegue `build` in tutti i pacchetti, ciascuno dopo le proprie dipendenze |
| `pnpm --filter web run build` | esegue `build` nel solo pacchetto `web` (equivale a `pnpm -F web run build`) |
| `pnpm --filter "web..." run build` | `web` e tutti i pacchetti da cui dipende |
| `pnpm --filter "...@repo/ui" run test` | `@repo/ui` e tutti i pacchetti che dipendono da lui |
| `pnpm --filter "./packages/**" run lint` | i pacchetti che stanno sotto una cartella |
| `pnpm --filter "...[origin/main]" run test` | i pacchetti cambiati rispetto al ramo `origin/main`, più quelli che ne dipendono |
| `pnpm --filter web add @repo/ui --workspace` | aggiunge a `web` il pacchetto locale `@repo/ui`, salvato con il protocollo `workspace:` |

Nello stesso `pnpm-workspace.yaml` vivono i **catalogs**, introdotti in [pnpm 9.5](https://github.com/pnpm/pnpm/releases/tag/v9.5.0): un elenco centrale di versioni a cui i `package.json` rimandano con `"react": "catalog:"` invece di ripetere il numero. Sono lo strumento con cui pnpm applica la politica della versione unica vista sopra, e sono descritti nel <a href="../glossario/#/docs/package-manager?id=monorepo-workspaces-e-catalogs" target="_blank" rel="noopener">glossario</a>. Come per `workspace:`, alla pubblicazione il rimando `catalog:` viene [sostituito con l'intervallo vero](https://pnpm.io/catalogs).

### Yarn e Bun

**Yarn** (versione 4) dichiara i workspace con lo stesso campo `"workspaces"` di npm e supporta, come pnpm, il protocollo `workspace:`; alla pubblicazione con `yarn npm publish`, `workspace:*` diventa la versione esatta, nella forma `=3.2.1` per un pacchetto alla 3.2.1 ([documentazione](https://yarnpkg.com/features/workspaces)). Un comando si esegue in un solo workspace con `yarn workspace web add react`, e in tutti con `yarn workspaces foreach -A run build`, dove `-t` rispetta l'ordine delle dipendenze, `-p` esegue in parallelo e `--since` limita la selezione ai workspace cambiati ([opzioni](https://yarnpkg.com/cli/workspaces/foreach)). Yarn, inoltre, per impostazione predefinita non crea affatto `node_modules` ma usa *Plug'n'Play*, descritto nel [[03-package-manager|capitolo 03]]. **Bun** segue la stessa strada: campo `"workspaces"`, protocollo `workspace:*` e opzione `--filter` ([documentazione](https://bun.com/docs/pm/workspaces)); il runtime è presentato nel [[11-runtime-alternativi|capitolo 11]].

## Come si collegano i pacchetti locali

Il collegamento fra i pacchetti di un workspace si basa sui **link simbolici** (*symlink*): un link simbolico è un file speciale che contiene soltanto un percorso verso un'altra cartella o un altro file, e chi lo apre viene portato al bersaglio, come una scorciatoia. È diverso dall'*hard link* usato da pnpm per l'archivio dei pacchetti scaricati (descritto nel <a href="../glossario/#/docs/package-manager?id=pnpm" target="_blank" rel="noopener">glossario</a>): l'hard link è una seconda voce che punta agli stessi byte, il link simbolico è un rimando per nome a un'altra posizione.

Quando si installa un workspace, il package manager crea in `node_modules` un link simbolico con il nome del pacchetto locale, che rimanda alla sua cartella vera. npm mette tutti i link nel `node_modules` della radice, per esempio `node_modules/@repo/ui` che punta a `packages/ui`; pnpm, coerente con il suo rigore, mette il link solo nel `node_modules` del pacchetto che dichiara la dipendenza, per esempio `apps/web/node_modules/@repo/ui`. In entrambi i casi l'applicazione scrive `import { Button } from '@repo/ui'` come per qualunque pacchetto, Node lo risolve risalendo le cartelle `node_modules` e, seguendo il link, arriva al codice sorgente della libreria. Non c'è nessuna pubblicazione e nessuna copia: una modifica salvata in `packages/ui` è visibile subito a `apps/web`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 290" role="img" aria-label="Collegamento di un pacchetto locale: apps/web importa @repo/ui; Node lo cerca in node_modules, dove trova node_modules/@repo/ui, un link simbolico che punta alla cartella vera packages/ui, con package.json, src e dist" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n09-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="16" y="16" width="648" height="258" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".06" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/><text x="36" y="40" font-size="11.5" font-weight="700" font-family="ui-monospace,Menlo,monospace">mio-monorepo/</text><rect x="48" y="60" width="230" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="163" y="84" font-size="12.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">apps/web</text><text x="163" y="104" font-size="10.5" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">import … from '@repo/ui'</text><line x1="163" y1="120" x2="163" y2="188" stroke="currentColor" stroke-width="1.5" marker-end="url(#n09-a)"/><text x="176" y="158" font-size="10.5" opacity=".8">Node cerca in node_modules</text><rect x="48" y="192" width="230" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="163" y="216" font-size="11.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">node_modules/@repo/ui</text><text x="163" y="236" font-size="10.5" text-anchor="middle" opacity=".8">link simbolico</text><rect x="420" y="110" width="220" height="90" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".2" stroke="currentColor" stroke-width="1.8"/><text x="530" y="138" font-size="12.5" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">packages/ui</text><text x="530" y="158" font-size="10.5" text-anchor="middle" opacity=".8">la cartella vera</text><text x="530" y="181" font-size="10" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">package.json · src/ · dist/</text><path d="M280 221 C 340 221, 370 180, 416 168" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#n09-a)"/><text x="352" y="222" font-size="10.5" text-anchor="middle" opacity=".8">punta a</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'applicazione importa <code>@repo/ui</code> come un pacchetto qualunque. In <code>node_modules</code> non c'è una copia ma un <strong>link simbolico</strong> che rimanda alla cartella vera <code>packages/ui</code>: con npm il link sta nel <code>node_modules</code> della radice, con pnpm in quello del pacchetto che dichiara la dipendenza.</figcaption>
</figure>

Seguito il link, però, Node legge il `package.json` di `packages/ui` e ne rispetta il campo `"exports"`, come per qualunque pacchetto (vedi [[02-moduli-e-pacchetti#dal-modulo-al-pacchetto-packagejson|capitolo 02]]). Se `"exports"` punta a file compilati in `dist/`, quei file devono **esistere**, quindi la libreria va costruita prima che l'applicazione possa usarla. La documentazione di Turborepo distingue per questo [due strategie per i pacchetti interni](https://turborepo.dev/docs/core-concepts/internal-packages). Un pacchetto **Just-in-Time** punta direttamente ai sorgenti TypeScript e lascia la compilazione al bundler dell'applicazione che lo usa: nessun passo di build, ma funziona solo con strumenti che sanno compilare TypeScript e non ha un build proprio da mettere in cache. Un pacchetto **compilato** si costruisce da sé, di solito con `tsc`, e produce `dist/`: richiede più configurazione, ma il suo build si può mettere in cache. Con la seconda strategia diventa essenziale l'**ordine** in cui si costruiscono i pacchetti.

## Il grafo delle dipendenze

Le dipendenze dichiarate nei `package.json` del workspace formano un **grafo**: ogni pacchetto è un nodo, e ogni dipendenza interna è una freccia che va dal pacchetto che usa a quello usato. Turborepo lo chiama [Package Graph](https://turborepo.dev/docs/core-concepts/package-and-task-graph) e lo ricava esattamente da qui, senza configurazione: basta che i pacchetti si dichiarino l'uno dipendente dall'altro. Perché il grafo sia utilizzabile deve essere **aciclico**, cioè privo di cerchi: se `ui` dipendesse da `utils` e `utils` da `ui`, nessuno dei due potrebbe essere costruito per primo. pnpm, per esempio, interrompe un'esecuzione ricorsiva con un ciclo di task segnalando l'errore `ERR_PNPM_TASK_CYCLE`.

Da un grafo aciclico si ricava l'**ordine topologico**: una sequenza in cui ogni pacchetto viene dopo tutti quelli da cui dipende. Nell'esempio della figura, `utils` non dipende da nessuno e si costruisce per primo; `ui` usa `utils` e viene subito dopo; `web` e `admin` usano `ui` e arrivano per ultimi. Gli ultimi due, però, non dipendono l'uno dall'altro, quindi possono essere costruiti **in parallelo**: l'ordine topologico non è una fila indiana, ma una serie di turni, e dentro ciascun turno il lavoro si divide fra i processori disponibili.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 660 310" role="img" aria-label="Grafo delle dipendenze di un monorepo: apps/web dipende da packages/ui e da packages/utils, apps/admin dipende da packages/ui, packages/ui dipende da packages/utils; i numeri indicano i turni dell'ordine topologico: utils al turno 1, ui al turno 2, web e admin insieme al turno 3" style="width:100%;max-width:660px;height:auto;color:inherit"><defs><marker id="n09-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="70" y="34" width="150" height="40" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="145" y="58" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">apps/web</text><rect x="410" y="34" width="150" height="40" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="485" y="58" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">apps/admin</text><rect x="240" y="134" width="160" height="40" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="320" y="158" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">packages/ui</text><rect x="70" y="234" width="150" height="40" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="145" y="258" font-size="12" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">packages/utils</text><line x1="185" y1="76" x2="272" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n09-b)"/><line x1="445" y1="76" x2="368" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n09-b)"/><line x1="272" y1="176" x2="190" y2="230" stroke="currentColor" stroke-width="1.4" marker-end="url(#n09-b)"/><line x1="110" y1="76" x2="110" y2="230" stroke="currentColor" stroke-width="1.4" marker-end="url(#n09-b)"/><circle cx="240" cy="54" r="12" fill="var(--link,#5fa04e)" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/><text x="240" y="58.5" font-size="12" text-anchor="middle" font-weight="700">3</text><circle cx="580" cy="54" r="12" fill="var(--link,#5fa04e)" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/><text x="580" y="58.5" font-size="12" text-anchor="middle" font-weight="700">3</text><circle cx="420" cy="154" r="12" fill="var(--link,#5fa04e)" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/><text x="420" y="158.5" font-size="12" text-anchor="middle" font-weight="700">2</text><circle cx="240" cy="254" r="12" fill="var(--link,#5fa04e)" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/><text x="240" y="258.5" font-size="12" text-anchor="middle" font-weight="700">1</text><line x1="440" y1="242" x2="482" y2="242" stroke="currentColor" stroke-width="1.4" marker-end="url(#n09-b)"/><text x="494" y="246" font-size="11">dipende da</text><circle cx="461" cy="274" r="10" fill="var(--link,#5fa04e)" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/><text x="461" y="278" font-size="11" text-anchor="middle" font-weight="700">1</text><text x="494" y="278" font-size="11">turno di build</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le frecce vanno da chi usa a chi è usato. I numeri sono i turni dell'<strong>ordine topologico</strong>: prima <code>utils</code>, poi <code>ui</code>, infine <code>web</code> e <code>admin</code>, che non dipendono l'uno dall'altro e si possono quindi costruire in parallelo.</figcaption>
</figure>

## Orchestrare i task

Un **task** è l'esecuzione di uno script in un pacchetto, per esempio il `build` di `@repo/ui`, che Turborepo e pnpm identificano con la forma `pacchetto#script`: `@repo/ui#build` (nella figura più avanti, abbreviato in `ui#build`). Finché i pacchetti sono tre, lanciare gli script del workspace basta; quando diventano decine, emergono tre bisogni che i semplici script non coprono.

Il primo è l'**ordine**. `npm run build --workspaces` esegue gli script nell'ordine in cui le cartelle compaiono nel campo `"workspaces"`, non nell'ordine del grafo: con `"workspaces": ["apps/*", "packages/*"]` il build di `web` parte **prima** di quello di `ui` da cui dipende (lo si è verificato con npm 11 e 12). pnpm e Yarn invece rispettano l'ordine topologico (`pnpm -r run`, `yarn workspaces foreach -t`), e da [pnpm 11.25](https://pnpm.io/blog/releases/11.25) si possono dichiarare anche relazioni fra script diversi con la chiave `tasks` di `pnpm-workspace.yaml` ([documentazione](https://pnpm.io/workspace-task-orchestration)):

```yaml
# pnpm-workspace.yaml (pnpm 11.25+)
packages:
  - 'apps/*'
  - 'packages/*'

tasks:
  build:
    dependsOn:
      - ^build     # prima il build di ogni dipendenza del workspace
  test:
    dependsOn:
      - build      # prima il build dello stesso pacchetto
```

Il secondo bisogno è la **cache**. Se un pacchetto non è cambiato dall'ultimo build, ricostruirlo è tempo perso. Un task runner calcola per ogni task un'**impronta** (un *hash*: un codice breve ricavato dai dati, che cambia appena cambia anche un solo byte) a partire da tutto ciò che può influire sul risultato, cioè i file sorgente, la configurazione, le variabili d'ambiente rilevanti e le impronte delle dipendenze. Se ha già in archivio i file prodotti da un task con la stessa impronta, li ripristina invece di rieseguirlo.

Il terzo è la selezione dei pacchetti **toccati** (*affected*). In CI, su una pull request che modifica solo `apps/web`, non serve testare `admin`: bastano i pacchetti cambiati rispetto al ramo principale più quelli che ne dipendono, perché sono gli unici che la modifica può rompere.

Ordine, cache e selezione dei pacchetti toccati, insieme al parallelismo, sono il mestiere dei **task runner**: i due più diffusi sono Turborepo e Nx.

> [!info|label:pnpm 12.4+ · pnpm pipeline]
> pnpm sta portando la cache anche dentro il package manager: il comando [`pnpm pipeline`](https://pnpm.io/cli/pipeline), da pnpm 12.4, esegue i task dei soli progetti toccati e ripristina dalla cache quelli che dichiarano i propri `outputs` (con cache remota da pnpm 12.12). La documentazione lo dichiara **sperimentale**, con configurazione e output che possono ancora cambiare: per ora la strada consolidata resta un task runner dedicato.

### Turborepo

**Turborepo** è un *build system* per monorepo JavaScript e TypeScript, sviluppato da Vercel: non sostituisce il package manager, ma si appoggia ai suoi workspace, ne legge il grafo e vi aggiunge ordine, parallelismo, cache e selezione dei pacchetti toccati. La versione attuale è la 2.11. Lo si installa come dipendenza di sviluppo della radice (`turbo`) e lo si configura con un file **`turbo.json`**, anch'esso alla radice ([riferimento](https://turborepo.dev/docs/reference/configuration)).

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Ogni chiave di **`tasks`** è il nome di uno script che i pacchetti possono avere. **`dependsOn`** dice che cosa deve finire prima: il prefisso `^` indica lo stesso task nelle **dipendenze** del pacchetto, quindi `"^build"` significa «prima il build di tutto ciò che questo pacchetto usa», cioè l'ordine topologico; un nome senza `^` indica un task dello **stesso** pacchetto, quindi per `test` il proprio `build`. **`outputs`** elenca, con delle glob, i file che il task produce e che vanno salvati in cache: senza questa chiave Turborepo [non mette in cache alcun file](https://turborepo.dev/docs/crafting-your-repository/caching), solo i log. Il task `dev`, infine, è il dev server: un processo che non termina mai, quindi `"persistent": true` impedisce che altri task lo attendano e `"cache": false` evita di mettere in cache qualcosa che non ha un risultato finale.

| Comando | Effetto |
|---|---|
| `turbo run build` | esegue `build` in tutti i pacchetti, rispettando `dependsOn` e in parallelo dove possibile |
| `turbo run build --filter=web...` | solo `web` e i pacchetti da cui dipende |
| `turbo run test --affected` | solo i pacchetti cambiati rispetto a `main` e quelli che ne dipendono (da Turborepo [2.1](https://turborepo.dev/blog/turbo-2-1-0)) |
| `turbo run build --dry` | mostra quali pacchetti e quali task verrebbero eseguiti, senza eseguirli |
| `turbo run build --graph` | stampa il grafo dei task (formato `dot`; con un nome di file anche `svg`, `html`, `mermaid`) |

Il funzionamento della cache è quello descritto sopra. Alla prima esecuzione Turborepo salva i file elencati in `outputs` e il log del task nella cartella locale `.turbo/cache`, indicizzati per impronta; alle esecuzioni successive, se l'impronta coincide, ripristina i file e **ripete il log** nel terminale come se il task fosse stato eseguito, in una frazione del tempo. Quando tutti i task di un comando arrivano dalla cache, Turborepo lo segnala con la scritta «FULL TURBO».

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 270" role="img" aria-label="Esecuzione di turbo run build dopo aver modificato solo apps/web: utils#build, ui#build e admin#build vengono ripristinati dalla cache in poco tempo, web#build viene eseguito davvero; utils precede ui, e web e admin partono insieme dopo ui" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n09-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="160" y="24" font-size="11.5" font-weight="700">modificato solo apps/web</text><text x="148" y="60" font-size="11" text-anchor="end" font-family="ui-monospace,Menlo,monospace">utils#build</text><text x="148" y="104" font-size="11" text-anchor="end" font-family="ui-monospace,Menlo,monospace">ui#build</text><text x="148" y="148" font-size="11" text-anchor="end" font-family="ui-monospace,Menlo,monospace">web#build</text><text x="148" y="192" font-size="11" text-anchor="end" font-family="ui-monospace,Menlo,monospace">admin#build</text><rect x="160" y="42" width="70" height="28" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".28" stroke="currentColor" stroke-width="1.3"/><text x="195" y="60" font-size="10.5" text-anchor="middle">cache</text><rect x="236" y="86" width="70" height="28" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".28" stroke="currentColor" stroke-width="1.3"/><text x="271" y="104" font-size="10.5" text-anchor="middle">cache</text><rect x="312" y="130" width="310" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="467" y="148" font-size="10.5" text-anchor="middle">eseguito: i file sono cambiati</text><rect x="312" y="174" width="70" height="28" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".28" stroke="currentColor" stroke-width="1.3"/><text x="347" y="192" font-size="10.5" text-anchor="middle">cache</text><line x1="160" y1="222" x2="640" y2="222" stroke="currentColor" stroke-width="1.3" marker-end="url(#n09-c)"/><text x="640" y="214" font-size="10.5" text-anchor="end" opacity=".8">tempo</text><rect x="160" y="236" width="14" height="14" rx="3" fill="var(--link,#5fa04e)" fill-opacity=".28" stroke="currentColor" stroke-width="1.2"/><text x="182" y="247" font-size="10.5">ripristinato dalla cache</text><rect x="340" y="236" width="14" height="14" rx="3" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="362" y="247" font-size="10.5">eseguito davvero</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un <code>turbo run build</code> dopo una modifica al solo <code>apps/web</code>. L'ordine topologico resta (<code>utils</code>, poi <code>ui</code>, poi <code>web</code> e <code>admin</code> in parallelo), ma i tre task con l'impronta invariata vengono <strong>ripristinati dalla cache</strong> in pochi istanti; solo <code>web#build</code> viene eseguito davvero.</figcaption>
</figure>

La cache locale aiuta chi lavora su una macchina; la **cache remota** la estende a tutto il team e alla CI. Il principio è lo stesso, ma l'archivio delle impronte sta su un server condiviso: ciò che un collega o la pipeline hanno già costruito, gli altri lo scaricano invece di ricostruirlo. Secondo la [documentazione](https://turborepo.dev/docs/core-concepts/remote-caching) la Vercel Remote Cache è gratuita su tutti i piani, anche senza ospitare le applicazioni su Vercel, e si attiva con `turbo login` e `turbo link`; in alternativa qualunque server HTTP che implementi la specifica pubblica della Remote Caching API può fare da cache. Con `"remoteCache": { "signature": true }` nel `turbo.json` e una chiave segreta nella variabile `TURBO_REMOTE_CACHE_SIGNATURE_KEY`, gli artefatti vengono firmati, e quelli che non superano la verifica sono trattati come assenti. La stessa documentazione ricorda che anche i log finiscono nella cache, quindi un task non deve mai stampare segreti.

> [!info|label:Legacy]
> Fino a Turborepo 1.x la chiave che oggi si chiama `tasks` si chiamava **`pipeline`**, e la si trova ancora in molti tutorial e repository. [Turborepo 2.0](https://turborepo.dev/blog/turbo-2-0) (giugno 2024) l'ha rinominata; il comando `npx @turbo/codemod migrate` aggiorna il file in automatico.

### Nx

**Nx** affronta lo stesso problema con un modello più ricco. Al centro c'è il **project graph**, il grafo dei progetti, che Nx [calcola analizzando il codice sorgente](https://nx.dev/docs/features/explore-graph) e che `nx graph` mostra in una pagina interattiva nel browser. Su quel grafo si appoggiano la cache, l'esecuzione di un task su più progetti (`nx run-many -t build`) e la selezione dei progetti toccati: `nx affected -t test` usa Git per trovare i file cambiati, li assegna ai progetti tramite il grafo e aggiunge i progetti che ne dipendono. Per impostazione predefinita il confronto avviene fra il ramo `main` e lo stato attuale dei file, mentre in CI la [documentazione](https://nx.dev/docs/features/ci-features/affected) raccomanda di indicare `--base` e `--head` esplicitamente. La versione attuale è Nx 23. Nx va oltre il task runner: ha generatori di codice, le regole sui confini fra librerie e la cache distribuita di Nx Cloud, tutti descritti con un esempio completo nel <a href="../angular/#/capitoli/14-monorepos-libraries?id=faster-builds-and-more-convenience-with-nx" target="_blank" rel="noopener">capitolo 14 del vault Angular</a>.

> [!info|label:Legacy]
> **Lerna** è stato a lungo lo strumento di riferimento per i monorepo JavaScript: collegava i pacchetti fra loro, eseguiva gli script nell'ordine giusto e ne gestiva versioni e pubblicazione. Con l'arrivo dei workspace nei package manager e dei task runner moderni il suo ruolo si è ristretto, e nel 2022, quando rischiava di restare senza manutenzione, [ne ha assunto la cura il team di Nx](https://lerna.js.org/docs/lerna-and-nx). Oggi Lerna (versione 10) è mantenuto, ma per eseguire gli script si affida al task runner di Nx; lo si incontra soprattutto per la parte di versionamento e pubblicazione, descritta qui sotto.

## Versionare e pubblicare più pacchetti

Finché i pacchetti del monorepo sono solo interni, la loro versione conta poco: le applicazioni li usano tramite i link, sempre nello stato attuale. Quando invece alcuni pacchetti vanno **pubblicati** sul registry, ognuno ha bisogno di un numero di versione, e il monorepo deve scegliere come assegnarli. Le strategie sono due, e Lerna le chiama per nome ([documentazione](https://lerna.js.org/docs/features/version-and-publish)).

Nella strategia **fixed** tutti i pacchetti condividono un'unica linea di versione: a ogni rilascio salgono insieme allo stesso numero, così chi li usa sa che tutti i `@repo/*` della 3.2.0 vanno d'accordo fra loro. È il comportamento predefinito di Lerna, che tiene il numero comune nel proprio `lerna.json`. Nella strategia **independent** ogni pacchetto ha la propria versione, che sale solo quando il pacchetto cambia; con Lerna la si attiva scrivendo `"version": "independent"` in `lerna.json`. La prima è più semplice da comunicare, la seconda evita di pubblicare versioni nuove di pacchetti rimasti identici.

Lo strumento che la [documentazione di Turborepo](https://turborepo.dev/docs/core-concepts/internal-packages) raccomanda per questa fase è **Changesets** (versione 3.0), già presentato nel [[08-pubblicare-pacchetti-npm#automatizzare-i-rilasci|capitolo 08]] per un pacchetto singolo, ma pensato soprattutto per i monorepo. L'idea è registrare l'**intenzione** di rilascio nel momento in cui si fa la modifica, non a posteriori: insieme al codice, chi apre la pull request aggiunge un *changeset*, un piccolo file Markdown nella cartella `.changeset/` che dice quali pacchetti cambiano, con quale tipo di incremento di versione (*major*, *minor* o *patch*, le tre cifre di SemVer spiegate nel [[08-pubblicare-pacchetti-npm#versione|capitolo 08]]) e con quale descrizione per il changelog ([documentazione](https://changesets.dev/guide/why)).

```markdown
---
"@repo/ui": minor
"@repo/utils": patch
---

Aggiunto il componente Button con la variante "ghost".
```

Al momento del rilascio, `changeset version` raccoglie tutti i changeset in sospeso, calcola per ogni pacchetto un solo incremento (il più alto fra quelli richiesti), aggiorna le versioni, le dipendenze interne dove serve e i changelog; `changeset publish` pubblica le nuove versioni e crea un tag Git per ciascun pacchetto, nella forma `nome@X.Y.Z` ([documentazione](https://changesets.dev/guide/versioning-and-publishing)). Changesets segue di base la strategia independent; un gruppo di pacchetti che deve salire sempre insieme si dichiara con l'opzione [`fixed`](https://changesets.dev/guide/fixed-packages) del file `.changeset/config.json`.

| Comando | Effetto |
|---|---|
| `npx @changesets/cli init` | crea la cartella `.changeset/` con la configurazione |
| `npx @changesets/cli` | registra un nuovo changeset: pacchetti, tipo di incremento, descrizione |
| `npx @changesets/cli version` | consuma i changeset: aggiorna versioni, dipendenze interne e changelog |
| `npx @changesets/cli publish` | pubblica le versioni nuove e crea un tag Git per pacchetto |

Con pnpm gli stessi comandi si scrivono `pnpm changeset`, `pnpm changeset version` e così via. In ogni caso, come visto sopra, i protocolli `workspace:` e `catalog:` vengono sostituiti con versioni vere al momento della pubblicazione, quindi il `package.json` che arriva sul registry non contiene nulla che rimandi al monorepo. Che cosa succede dopo, cioè la pubblicazione in sé con i suoi controlli, è l'argomento del [[08-pubblicare-pacchetti-npm|capitolo 08]].

## TypeScript nei monorepo: le project references

In un monorepo TypeScript ogni pacchetto ha il proprio `tsconfig.json`, e il compilatore offre un meccanismo per legarli fra loro che riproduce, in piccolo, le idee dei task runner: le [**project references**](https://www.typescriptlang.org/docs/handbook/project-references.html), disponibili da TypeScript 3.0. Un pacchetto elenca nel campo `references` i progetti da cui dipende; ogni progetto referenziato deve attivare l'opzione `composite`, che richiede la generazione dei file di dichiarazione `.d.ts` (l'opzione `declaration`, spiegata nel <a href="../typescript/#/docs/03-tsconfig" target="_blank" rel="noopener">vault TypeScript</a>) e che tutti i file del progetto siano inclusi esplicitamente.

```json
// packages/ui/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [{ "path": "../utils" }]
}
```

```json
// tsconfig.json della radice: non compila nulla da sé, elenca solo i progetti
{
  "files": [],
  "references": [
    { "path": "packages/utils" },
    { "path": "packages/ui" }
  ]
}
```

Il comando **`tsc --build`** (abbreviato `tsc -b`), lanciato alla radice, trova tutti i progetti referenziati, individua quelli non aggiornati e li costruisce **nell'ordine delle dipendenze**, saltando quelli già aggiornati: ordine topologico e build incrementale, dentro il compilatore. Quando un pacchetto importa un progetto referenziato, TypeScript ne legge i `.d.ts` già prodotti invece di ricontrollarne i sorgenti, e questo accorcia i tempi di controllo dei tipi nei repository grandi. TypeScript 7.0 (luglio 2026), il compilatore riscritto in Go, [costruisce anche più progetti in parallelo](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), con l'opzione sperimentale `--builders` che ne fissa il numero.

> [!info|label:Nel repo]
> Questo stesso progetto è un monorepo in senso lato: una decina di siti docsify indipendenti vivono nello stesso repository e condividono il codice comune in `assets/shared/` e le librerie in `assets/vendor/`. Ha anche una politica di versione **fixed**: un'unica costante `DN_VERSION` in `assets/version.js` per tutto l'hub, con un tag Git a ogni incremento. Non ha invece né `package.json` né workspace, perché è *zero-build*: non c'è nulla da installare, compilare od orchestrare, e quindi nessun bisogno di un task runner.

> [!tip]
> I **workspace** del package manager bastano per installare e collegare i pacchetti locali. Quando il repository cresce servono **ordine topologico, cache e selezione dei pacchetti toccati**, cioè un task runner come Turborepo o Nx. Se i pacchetti si pubblicano, la scelta fra versioni **fixed** e **independent** e uno strumento come Changesets completano il quadro.

## Ripasso lampo

<details>
<summary>Che cos'è una modifica atomica, e perché un monorepo la rende possibile?</summary>

È una modifica che cambia una libreria e adatta insieme tutti i punti che la usano in un unico commit, che entra per intero o non entra affatto. In un monorepo libreria e applicazioni stanno nello stesso albero e sono collegate dal package manager, quindi non serve pubblicare una nuova versione e aggiornare ogni repository uno per uno come in un polyrepo.

</details>

<details>
<summary>Perché <code>npm run build --workspaces</code> può costruire un'applicazione prima della libreria da cui dipende?</summary>

Perché npm esegue gli script nell'ordine in cui le cartelle compaiono nel campo `"workspaces"` della radice, non nell'ordine del grafo delle dipendenze. Con `["apps/*", "packages/*"]` le applicazioni vengono prima delle librerie. `pnpm -r run`, `yarn workspaces foreach -t` e i task runner rispettano invece l'ordine topologico.

</details>

<details>
<summary>Che cosa significa <code>"@repo/ui": "workspace:*"</code>, e che cosa diventa alla pubblicazione?</summary>

È una dipendenza dal pacchetto locale `@repo/ui` con il protocollo `workspace:` di pnpm (e di Yarn e Bun): il package manager la risolve solo con il pacchetto del workspace e mai con il registry. Alla pubblicazione viene sostituita con la versione che il pacchetto ha in quel momento, per esempio `"1.5.0"`. npm non conosce questo protocollo e usa un normale intervallo, come `"^1.5.0"` o `"*"`.

</details>

<details>
<summary>Nel <code>turbo.json</code>, che differenza c'è fra <code>"dependsOn": ["^build"]</code> e <code>"dependsOn": ["build"]</code>, e a che cosa serve <code>outputs</code>?</summary>

`"^build"` attende il `build` di tutte le **dipendenze** del pacchetto, cioè impone l'ordine topologico; `"build"` senza `^` attende il `build` dello **stesso** pacchetto, come si fa per `test`. `outputs` elenca i file prodotti dal task che Turborepo salva in cache e ripristina quando l'impronta del task non è cambiata: senza, la cache conserva solo i log.

</details>

<details>
<summary>Che differenza c'è fra versionamento fixed e independent?</summary>

Con **fixed** tutti i pacchetti condividono un unico numero di versione e salgono insieme a ogni rilascio (il default di Lerna); con **independent** ogni pacchetto ha la propria versione, che sale solo quando cambia (`"version": "independent"` in Lerna, il comportamento di base di Changesets, che con l'opzione `fixed` permette di legare un gruppo di pacchetti).

</details>
