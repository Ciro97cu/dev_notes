# 05 · Linter e formatter

Un **linter** è uno strumento che legge il codice sorgente **senza eseguirlo** e segnala ciò che con buona probabilità è un errore, come una variabile calcolata e mai usata o un confronto che converte i tipi di nascosto, oppure ciò che viola le convenzioni scelte dal team. Un **formatter** fa un lavoro più umile e insieme più radicale: non giudica il codice, ne riscrive la **forma** (rientri, spazi, a capo, virgolette, punti e virgola) secondo regole fisse, senza cambiarne il significato. Per chi fa frontend sono compagni quotidiani anche quando lavorano in silenzio: sottolineano i problemi nell'editor mentre si scrive, sistemano il file a ogni salvataggio, fermano un commit o una pipeline quando qualcosa non va. Per la maggior parte sono programmi Node come il dev server e il bundler, installati fra le `devDependencies` del progetto. Questo capitolo spiega come ragionano, come si configurano oggi e dove conviene farli girare.

## Due mestieri diversi

Si consideri questa funzione, scritta di fretta:

```js
export function totale(prezzi){
    let somma = 0
    for (const p of prezzi) { somma += p }
    const iva = somma * 0.22
    if (somma == "0") console.log("carrello vuoto")
    return somma }
```

Contiene due famiglie di difetti molto diverse. Alcuni sono di **forma**: rientri a quattro spazi, punti e virgola mancanti, un ciclo compresso su una riga sola, la graffa di chiusura appesa in fondo all'ultima istruzione. Altri sono di **sostanza**: la costante `iva` viene calcolata e poi mai usata (forse ci si è dimenticati di sommarla al totale), e il confronto `somma == "0"` usa l'uguaglianza debole, che converte i tipi prima di confrontare e considera uguali il numero `0` e la stringa `"0"`.

Il formatter si occupa soltanto della prima famiglia. Passata a **Prettier**, la funzione diventa:

```js
export function totale(prezzi) {
  let somma = 0;
  for (const p of prezzi) {
    somma += p;
  }
  const iva = somma * 0.22;
  if (somma == "0") console.log("carrello vuoto");
  return somma;
}
```

La forma ora è uniforme, ma `iva` inutilizzata e il `==` sono ancora al loro posto: il formatter non ha opinioni sul significato, e il suo [primo requisito](https://prettier.io/docs/rationale) è produrre codice che si comporti **esattamente** come prima. A trovarli è il linter. ESLint, configurato come si vedrà più avanti, sullo stesso file riporta:

```
src/totale.js
  6:9   error    'iva' is assigned a value but never used  no-unused-vars
  7:13  error    Expected '===' and instead saw '=='       eqeqeq
  7:21  warning  Unexpected console statement              no-console
```

Ogni riga indica la posizione (riga e colonna), la gravità, un messaggio e il nome della **regola** che ha trovato il problema.

Per anni i linter hanno fatto anche il lavoro del formatter, con regole dedicate a rientri, virgolette e punti e virgola. L'esperienza ha mostrato che non era una buona idea: quelle regole si contraddicevano fra loro ed erano costose da mantenere, tanto che ESLint le ha [deprecate nella versione 8.53](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) (novembre 2023) raccomandando di affidare la formattazione a un formatter; oggi vivono in un pacchetto separato, `@stylistic/eslint-plugin`, e saranno rimosse da ESLint nella versione 11. Stylelint, il linter dei CSS, ha fatto lo stesso percorso, [deprecando 76 regole stilistiche](https://stylelint.io/migration-guide/to-15) nella versione 15 e rimuovendole nella 16. La ragione di fondo è che un formatter **ristampa l'intero file** in modo coerente, mentre un linter ragiona regola per regola, e cento regole indipendenti sulla forma finiscono per pestarsi i piedi. La documentazione di Prettier lo riassume in una frase: [Prettier per la formattazione, i linter per scovare i bug](https://prettier.io/docs/comparison).

| | Linter | Formatter |
|---|---|---|
| Che cosa guarda | il significato: probabili bug, convenzioni | la forma: spazi, rientri, a capo, virgolette |
| Che cosa produce | un elenco di problemi, con posizione e gravità | il file riscritto |
| Cambia il comportamento? | no: le correzioni automatiche sono pensate per non alterare la logica | mai |
| Configurazione | molte regole, ciascuna attivabile e regolabile | poche opzioni, per scelta |
| Esempi | ESLint, Stylelint, Oxlint | Prettier, Oxfmt |

## Come ragiona un linter: l'AST

Un linter non scorre il testo cercando stringhe sospette: prima lo trasforma in una struttura. Il primo passo è il **parsing**: un programma chiamato *parser* scompone il testo nei suoi pezzi elementari (parole chiave, nomi, operatori, valori) e li organizza in un **AST** (*Abstract Syntax Tree*, albero sintattico astratto). È un albero in cui ogni nodo rappresenta un costrutto del linguaggio, come un'istruzione `if`, un confronto o un nome di variabile, e i figli di un nodo sono le sue parti. È «astratto» perché dall'albero spariscono i dettagli che non cambiano il significato: spazi, a capo, parentesi superflue. La stessa idea, vista dal lato del motore JavaScript che compila il codice, è raccontata nel <a href="../javascript/#/docs/libro2/01-scope?id=compiler-theory" target="_blank" rel="noopener">vault JavaScript</a>.

La riga `if (somma == "0") console.log("carrello vuoto");` diventa un nodo `IfStatement` con due figli: la condizione, un nodo `BinaryExpression` con operatore `==` e due operandi (un `Identifier` di nome `somma` e un `Literal` di valore `"0"`), e il ramo da eseguire, un `ExpressionStatement` che contiene la chiamata `CallExpression`. Questi nomi non sono un'invenzione di un singolo strumento: seguono **ESTree**, la specifica comune degli AST di JavaScript su cui [lavorano le regole di ESLint](https://eslint.org/docs/latest/extend/custom-rules).

ESLint usa come parser predefinito **Espree**. Ottenuto l'albero, lo [percorre dall'alto verso il basso](https://eslint.org/docs/latest/contribute/architecture/) e, a ogni nodo, emette un evento con il nome del suo tipo. Ogni regola è un piccolo programma che dichiara quali tipi di nodo le interessano e li esamina quando passano: `eqeqeq` si iscrive ai nodi `BinaryExpression` e, se l'operatore è `==` o `!=`, segnala il problema, ricavando riga e colonna dalla posizione del nodo. Proprio perché lavora sull'albero, una regola è immune alla formattazione: `somma=="0"` e `somma  ==  "0"` producono lo stesso nodo e la stessa segnalazione.

Una regola può anche proporre un rimedio, in due forme. Una **correzione** (*fix*) è una modifica del testo che ESLint applica da solo con l'opzione `--fix`, e la documentazione la definisce come qualcosa che [corregge la violazione senza cambiare la logica](https://eslint.org/docs/latest/use/core-concepts/) del programma. Quando invece la modifica potrebbe alterare il comportamento, la regola offre solo un **suggerimento** (*suggestion*), che si applica a mano dall'editor e mai dalla riga di comando. `eqeqeq` è il caso da manuale: sostituire `==` con `===` viene fatto in automatico [solo se uno dei due operandi è un'espressione `typeof`](https://eslint.org/docs/latest/rules/eqeqeq), dove il risultato non cambia; in `somma == "0"` cambierebbe eccome, perché con `===` il numero `0` smette di essere uguale alla stringa `"0"`, quindi ESLint si limita a suggerire.

Anche Prettier parte da un AST, costruito con i propri parser, ma lo usa in modo opposto: [scarta la forma originale e ristampa l'albero da zero](https://prettier.io/docs/) con le sue regole, tenendo conto della lunghezza massima della riga.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 400" role="img" aria-label="Dal testo all'AST: il codice sorgente if (somma == &quot;0&quot;) console.log(…) passa dal parser, che produce un albero con un nodo IfStatement, i figli BinaryExpression con operatore == ed ExpressionStatement, e sotto Identifier somma, Literal &quot;0&quot; e CallExpression; dall'albero partono due strade: il linter, le cui regole visitano i nodi e segnalano il problema eqeqeq, e il formatter, che ristampa l'albero da zero" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n05-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="105" y="104" font-size="11" text-anchor="middle" font-weight="700" opacity=".75">codice sorgente</text><rect x="20" y="114" width="170" height="64" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="32" y="140" font-size="10.5" font-family="ui-monospace,Menlo,monospace">if (somma == "0")</text><text x="46" y="160" font-size="10.5" font-family="ui-monospace,Menlo,monospace">console.log(…);</text><line x1="192" y1="146" x2="226" y2="146" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-a)"/><rect x="230" y="124" width="90" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="275" y="143" font-size="12" text-anchor="middle" font-weight="700">parser</text><text x="275" y="159" font-size="9.5" text-anchor="middle" opacity=".75">testo in albero</text><line x1="322" y1="146" x2="346" y2="146" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-a)"/><rect x="350" y="20" width="350" height="210" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".06" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4"/><text x="366" y="42" font-size="12.5" font-weight="700">AST</text><line x1="525" y1="66" x2="456" y2="100" stroke="currentColor" stroke-width="1.3"/><line x1="525" y1="66" x2="614" y2="100" stroke="currentColor" stroke-width="1.3"/><line x1="456" y1="126" x2="410" y2="160" stroke="currentColor" stroke-width="1.3"/><line x1="456" y1="126" x2="504" y2="160" stroke="currentColor" stroke-width="1.3"/><line x1="614" y1="126" x2="614" y2="160" stroke="currentColor" stroke-width="1.3"/><rect x="473" y="40" width="104" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="525" y="57" font-size="10.5" text-anchor="middle">IfStatement</text><rect x="388" y="100" width="136" height="26" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".25" stroke="currentColor" stroke-width="1.8"/><text x="456" y="117" font-size="10.5" text-anchor="middle" font-weight="700">BinaryExpression ==</text><rect x="550" y="100" width="128" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="614" y="117" font-size="10.5" text-anchor="middle">ExpressionStatement</text><rect x="366" y="160" width="88" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="410" y="175" font-size="10" text-anchor="middle">Identifier</text><text x="410" y="189" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">somma</text><rect x="464" y="160" width="80" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="504" y="175" font-size="10" text-anchor="middle">Literal</text><text x="504" y="189" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">"0"</text><rect x="560" y="160" width="108" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="614" y="175" font-size="10" text-anchor="middle">CallExpression</text><text x="614" y="189" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">console.log(…)</text><line x1="440" y1="232" x2="340" y2="286" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-a)"/><line x1="600" y1="232" x2="600" y2="286" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-a)"/><rect x="170" y="290" width="290" height="92" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".14" stroke="currentColor" stroke-width="1.7"/><text x="315" y="314" font-size="12.5" text-anchor="middle" font-weight="700">linter</text><text x="315" y="334" font-size="10.5" text-anchor="middle">le regole visitano i nodi e segnalano</text><text x="315" y="360" font-size="9.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">eqeqeq: Expected '===' and instead saw '=='</text><rect x="490" y="290" width="210" height="92" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="595" y="314" font-size="12.5" text-anchor="middle" font-weight="700">formatter</text><text x="595" y="334" font-size="10.5" text-anchor="middle">scarta la forma originale</text><text x="595" y="352" font-size="10.5" text-anchor="middle">e ristampa l'albero da zero</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il parser trasforma il testo in un albero in cui spazi e a capo non esistono più. Il <strong>linter</strong> lo percorre e lascia che ogni regola esamini i nodi che le interessano: <code>eqeqeq</code> guarda i <code>BinaryExpression</code>, qui evidenziato. Il <strong>formatter</strong> usa l'albero per ristampare il codice con la propria forma. ESLint usa il parser Espree, Prettier i propri: lo schema è lo stesso, l'uso dell'albero è opposto.</figcaption>
</figure>

## ESLint e la flat config

**ESLint** è il linter di riferimento dell'ecosistema JavaScript. La versione attuale è la **10** (la 10.0 è uscita il 2026-02-06, a ottobre 2026 si è alla 10.12) e [richiede Node](https://eslint.org/docs/latest/use/getting-started) `^20.19.0`, `^22.13.0` oppure `>=24`. Il modo più rapido per aggiungerlo a un progetto è `npm init @eslint/config@latest`, una procedura guidata che fa qualche domanda (browser o Node, TypeScript o no, quale framework), installa i pacchetti e scrive la configurazione. In alternativa li si installa a mano con `npm install --save-dev eslint@latest @eslint/js@latest`.

La configurazione vive in un file **`eslint.config.js`** nella radice del progetto (sono ammessi anche `.mjs`, `.cjs` e, con qualche accorgimento, `.ts`). Si chiama **flat config**, configurazione «piatta», perché è una semplice lista: il file esporta un array di oggetti di configurazione, e ciascuno dice *a quali file* si applica e *che cosa* applicare. Per ogni file da analizzare ESLint seleziona gli oggetti che lo riguardano e li [fonde nell'ordine](https://eslint.org/docs/latest/use/configure/configuration-files) in cui compaiono: se due oggetti impostano la stessa cosa, vince quello che viene dopo.

```js
// eslint.config.js
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist/']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
    },
  },
]);
```

È la configurazione che ha prodotto le segnalazioni viste all'inizio del capitolo. Si legge dall'alto. `defineConfig()` è una funzione di comodo importata da `eslint/config`: [appiattisce](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/) eventuali array annidati, abilita la chiave `extends` e dà all'editor i tipi per l'autocompletamento. `globalIgnores()` esclude la cartella `dist/` da tutto il resto. Il secondo oggetto vale per i file `.js`: eredita da `js.configs.recommended` il set di regole che ESLint raccomanda a tutti per evitare errori probabili, dichiara le variabili globali del browser (`window`, `document` e così via, elencate dal pacchetto `globals`, da installare a parte) così che la regola `no-undef` non le scambi per variabili mai dichiarate, e infine aggiunge due regole proprie. Il file usa `import`, quindi dev'essere un ES module: serve `"type": "module"` nel `package.json`, oppure il nome `eslint.config.mjs` (le regole sono nel [[02-moduli-e-pacchetti#come-node-sceglie-fra-i-due|capitolo 02]]).

| Chiave | A che cosa serve |
|---|---|
| `files` | i pattern dei file a cui l'oggetto si applica |
| `ignores` | i file da escludere; in un oggetto che non contiene altro (o con `globalIgnores()`) vale per l'intero progetto |
| `extends` | eredita altre configurazioni: oggetti, array o stringhe come `"js/recommended"` |
| `languageOptions` | come leggere il codice: `ecmaVersion`, `sourceType`, `globals`, `parser`, `parserOptions` |
| `plugins` | registra i plugin, ciascuno sotto un nome |
| `rules` | accende, spegne e configura le singole regole |
| `linterOptions` | il comportamento del linter stesso, per esempio `reportUnusedDisableDirectives` |

Senza indicazioni, ESLint analizza i file che corrispondono a `**/*.js`, `**/*.cjs` e `**/*.mjs` e ignora sempre `node_modules/` e `.git/`; ogni altra estensione, come `.ts` o `.vue`, va nominata in `files`. Da ESLint 10, inoltre, il file di configurazione [si cerca a partire dalla cartella di ciascun file analizzato](https://eslint.org/docs/latest/use/migrate-to-10.0.0) e non più dalla cartella da cui si lancia il comando: in un progetto con più sottocartelle, come un monorepo ([[09-monorepo|capitolo 09]]), ognuna può avere il proprio `eslint.config.js`. Quando non è chiaro quali oggetti si applichino a un certo file, `npx eslint --inspect-config` apre il *config inspector*, una pagina che lo mostra oggetto per oggetto.

| Comando | Effetto |
|---|---|
| `npx eslint .` | analizza il progetto e stampa i problemi trovati |
| `npx eslint . --fix` | applica le correzioni automatiche, riscrive i file e stampa ciò che resta |
| `npx eslint . --max-warnings 0` | fallisce anche se ci sono soltanto avvisi |
| `npx eslint . --cache` | ricorda i file già analizzati e ricontrolla solo quelli cambiati |
| `npx eslint --inspect-config` | apre il *config inspector* |

> [!info|label:Legacy]
> Fino a ESLint 8 la configurazione stava nei file **`.eslintrc`** (`.eslintrc.json`, `.eslintrc.js`, `.eslintrc.yml`…), che si sommavano a cascata cartella per cartella, con le esclusioni in un file `.eslintignore` e plugin e configurazioni condivise indicati per nome, come stringhe (`"extends": ["eslint:recommended", "plugin:react/recommended"]`). ESLint 9 (aprile 2024) ha [reso la flat config il default](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/) ed ESLint 10 (febbraio 2026) ha [rimosso del tutto](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/) il vecchio sistema: un `.eslintrc.json` oggi viene semplicemente ignorato, e i commenti `/* eslint-env */` sono segnalati come errori. Per convertire una configurazione esistente c'è `npx @eslint/migrate-config .eslintrc.json`, che produce un `eslint.config.mjs` da rivedere a mano; le configurazioni condivise rimaste nel vecchio formato si adattano con `FlatCompat` del pacchetto `@eslint/eslintrc` ([guida alla migrazione](https://eslint.org/docs/latest/use/configure/migration-guide)). Il ramo 9 è [fuori supporto dal 2026-08-06](https://eslint.org/version-support/).

## Regole e severità

Una **regola** è un singolo controllo, identificato da un nome (`no-unused-vars`, `eqeqeq`, `no-console`), e nella configurazione le si assegna una **severità**:

| Valore | Equivalente numerico | Effetto |
|---|---|---|
| `"off"` | `0` | regola spenta |
| `"warn"` | `1` | avviso: viene segnalato, ma non cambia il codice di uscita |
| `"error"` | `2` | errore: ESLint termina con codice di uscita `1` |

Il **codice di uscita** è il numero che un programma restituisce alla shell quando termina: `0` significa successo, qualunque altro valore un fallimento, ed è proprio questo numero che un hook di git o una pipeline guardano per decidere se fermarsi. La [distinzione](https://eslint.org/docs/latest/use/configure/rules) fra avvisi ed errori conta quindi in pratica: un avviso compare nell'output ma lascia passare tutto, un errore blocca. Chi vuole che in CI anche gli avvisi blocchino aggiunge `--max-warnings 0`. Molte regole accettano opzioni, e allora il valore diventa un array in cui il primo elemento è sempre la severità: `eqeqeq: ['error', 'always']`.

Quando un caso particolare giustifica un'eccezione, la si dichiara con un commento proprio sopra la riga interessata, nominando la regola:

```js
// eslint-disable-next-line no-console
console.log('avvio in modalità sviluppo');
```

Nominare la regola evita di spegnere per sbaglio anche tutte le altre. ESLint, inoltre, segnala per impostazione predefinita come avviso i commenti di disattivazione [diventati inutili](https://eslint.org/docs/latest/use/configure/configuration-files) (l'opzione `linterOptions.reportUnusedDisableDirectives` vale `"warn"`), così le eccezioni dimenticate non si accumulano. Secondo la [politica di versionamento](https://github.com/eslint/eslint#semantic-versioning-policy) di ESLint, nuove regole entrano nel set `recommended` solo con una versione maggiore: ESLint 10 vi ha aggiunto `no-unassigned-vars`, `no-useless-assignment` e `preserve-caught-error`, ed è la prima cosa da guardare quando un aggiornamento fa comparire segnalazioni nuove.

## Plugin e configurazioni condivise

Le regole di base di ESLint coprono il JavaScript in generale; tutto il resto arriva dai **plugin**. Un plugin è un pacchetto npm che [può contenere](https://eslint.org/docs/latest/use/core-concepts/) regole, configurazioni pronte, *processori* (che estraggono il JavaScript da altri tipi di file) e perfino il supporto a linguaggi diversi da JavaScript. Per convenzione si chiama `eslint-plugin-…` oppure `@scope/eslint-plugin`; nella configurazione lo si registra sotto `plugins` con un nome breve, che diventa il prefisso delle sue regole (`nome/regola`). Nei progetti frontend se ne incontrano spesso alcuni: `eslint-plugin-react-hooks` per le regole degli hook di React, `eslint-plugin-vue` per i componenti Vue, `angular-eslint` per Angular (è quello che la CLI configura con <a href="../angular/#/capitoli/01-getting-started?id=initializing-the-linter" target="_blank" rel="noopener"><code>ng lint</code></a>), `eslint-plugin-jsx-a11y` per gli errori di accessibilità nel JSX, citato fra gli <a href="../html/#/docs/07-accessibilita-aria?id=come-si-verifica-gli-strumenti" target="_blank" rel="noopener">strumenti di verifica del vault HTML</a>.

Il team di ESLint pubblica anche plugin ufficiali per altri linguaggi, `@eslint/json`, `@eslint/markdown` e `@eslint/css`, che si attivano con la chiave `language`. L'esempio, una configurazione completa per i soli file CSS, mostra insieme il nome breve del plugin, il linguaggio e una configurazione pronta richiamata come stringa; in un progetto reale l'oggetto si aggiunge accanto a quelli per il JavaScript.

```js
// eslint.config.js
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);
```

Su una dichiarazione come `colr: red` riporta `Unknown property 'colr' found` con la regola `css/no-invalid-properties`: il nome della regola porta il prefisso del plugin.

Una **configurazione condivisa** (*shareable config*) è invece un pacchetto npm, chiamato per convenzione `eslint-config-…`, che esporta una configurazione già pronta: un'azienda ci raccoglie le proprie regole, un framework ci mette quelle consigliate. Si [importa](https://eslint.org/docs/latest/extend/shareable-configs) nel file e la si mette in `extends`, esattamente come `js.configs.recommended`.

## TypeScript con typescript-eslint

Espree conosce soltanto il JavaScript standard: davanti a un'annotazione di tipo come `nome: string` o a un'`interface` si fermerebbe con un errore di sintassi. **typescript-eslint** colma il vuoto con un parser che legge TypeScript e produce un albero compatibile con ESTree, più un plugin di regole specifiche; il pacchetto unico `typescript-eslint` (versione 8.71 a ottobre 2026) li raccoglie entrambi insieme alle configurazioni pronte. L'installazione [ufficiale](https://typescript-eslint.io/getting-started/) è `npm install --save-dev eslint @eslint/js typescript typescript-eslint`, e la configurazione vista sopra si estende così:

```js
// eslint.config.js
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/']),
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
    },
  },
]);
```

Accanto a `recommended` ci sono `strict`, che aggiunge regole più severe e può scovare altri bug, e `stylistic`, che uniforma lo stile del codice TypeScript senza cambiarne la logica. Il salto di qualità vero è il **linting con informazioni di tipo** (*typed linting*): con la configurazione `recommendedTypeChecked` e l'opzione `languageOptions.parserOptions.projectService: true`, le regole possono [interrogare il compilatore TypeScript](https://typescript-eslint.io/getting-started/typed-linting) sui tipi. Diventano così possibili controlli che sul solo testo sarebbero impossibili, come `@typescript-eslint/no-floating-promises`, che segnala una Promise né attesa con `await` né gestita: il classico `await` dimenticato. Il prezzo è il tempo, trascurabile in un progetto piccolo ma sensibile in uno grande.

Resta una divisione di compiti da tenere presente: typescript-eslint [non riproduce gli errori di tipo](https://typescript-eslint.io/troubleshooting/faqs/typescript/) del compilatore, per non rallentare l'analisi. Il controllo dei tipi resta compito di `tsc` (per esempio `tsc --noEmit`, che controlla senza generare file), da lanciare come passo a sé, come spiega anche il [[04-varianti-di-javascript#il-controllo-dei-tipi-resta-a-parte|capitolo 04]].

> [!warning]
> typescript-eslint usa l'API programmatica del compilatore, che TypeScript 7.0, riscritto in Go, non espone ancora (è attesa con la 7.1, come racconta il <a href="../typescript/#/docs/02-compilatore?id=il-compilatore-nativo" target="_blank" rel="noopener">vault TypeScript</a>). A ottobre 2026 typescript-eslint 8.71 [dichiara compatibili](https://typescript-eslint.io/users/dependency-versions) le versioni di TypeScript `>=4.8.4 <6.1.0`: in un progetto che usa `tsc` 7 per compilare, il linting richiede di tenere installato TypeScript 6 accanto.

## Prettier

**Prettier** è il formatter più diffuso dell'ecosistema: la versione stabile è la **3** (3.9 a ottobre 2026), mentre la 4 è ancora in alpha. Formatta [molti linguaggi](https://prettier.io/docs/) con lo stesso motore: JavaScript, TypeScript, JSX, CSS, SCSS e Less, HTML, i template di Vue e Angular, JSON, Markdown, YAML, GraphQL.

La sua caratteristica più importante è una scelta di filosofia: Prettier è [dichiaratamente *opinionated*](https://prettier.io/docs/option-philosophy), cioè ha già deciso quasi tutto, e offre poche opzioni. Quelle che esistono ci sono «soprattutto per ragioni storiche», e il progetto ha annunciato che non ne aggiungerà altre. Il motivo è che lo scopo principale di Prettier è chiudere le discussioni sullo stile all'interno dei team; ogni opzione in più riaprirebbe la stessa discussione sotto un'altra forma, quella su quali opzioni scegliere.

Si installa fissando la versione esatta, con `npm install --save-dev --save-exact prettier`: secondo la [documentazione](https://prettier.io/docs/install) anche una release *patch* può cambiare leggermente la formattazione, e due persone con versioni diverse finirebbero per riformattarsi a vicenda gli stessi file. Le poche opzioni stanno in un file **`.prettierrc`** (JSON o YAML) nella radice, oppure in `prettier.config.js` o sotto la chiave `"prettier"` del `package.json` ([elenco completo](https://prettier.io/docs/configuration)):

```json
{
  "singleQuote": true,
  "printWidth": 100
}
```

| Opzione | Default | Che cosa decide |
|---|---|---|
| `printWidth` | `80` | la lunghezza di riga oltre la quale Prettier va a capo |
| `tabWidth` / `useTabs` | `2` / `false` | il rientro: due spazi, niente tabulazioni |
| `semi` | `true` | il punto e virgola a fine istruzione |
| `singleQuote` | `false` | virgolette doppie per le stringhe |
| `trailingComma` | `"all"` | la virgola dopo l'ultimo elemento ovunque sia possibile (default da Prettier 3.0; prima era `"es5"`) |
| `endOfLine` | `"lf"` | il carattere di fine riga |

I file da non toccare si elencano in un `.prettierignore`; oltre a quelli, Prettier [ignora già](https://prettier.io/docs/ignore) `node_modules` e rispetta il `.gitignore`. Per un singolo frammento che deve restare com'è c'è il commento `// prettier-ignore`, che esclude dalla formattazione il nodo successivo dell'AST.

| Comando | Effetto |
|---|---|
| `npx prettier . --write` | formatta e riscrive tutti i file supportati |
| `npx prettier . --check` | controlla senza modificare; esce con codice `1` se qualche file non è formattato |
| `npx prettier . --list-different` | elenca solo i file che cambierebbero |
| `npx prettier src/app.ts` | stampa a schermo la versione formattata, senza toccare il file |

## Prettier ed ESLint insieme

Usati insieme, i due strumenti devono dividersi il territorio senza sovrapposizioni. Il rischio concreto è che qualche regola stilistica, arrivata da un plugin o da una configurazione condivisa, contraddica Prettier: il formatter scrive la riga in un modo, il linter la segnala, la correzione automatica la riscrive nell'altro, e così via all'infinito. La soluzione è il pacchetto **`eslint-config-prettier`**, che [spegne tutte le regole di ESLint inutili o in conflitto con Prettier](https://github.com/prettier/eslint-config-prettier). Siccome si limita a spegnere, va messo **in fondo** all'array: per la regola della fusione in ordine, l'ultimo oggetto vince su tutto ciò che è stato acceso prima. La configurazione completa di un progetto TypeScript con Prettier diventa così:

```js
// eslint.config.js
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['dist/']),
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
    },
  },
  eslintConfigPrettier,
]);
```

L'import da `eslint-config-prettier/flat` aggiunge all'oggetto un nome, utile nel config inspector. Per verificare che non resti alcun conflitto, `npx eslint-config-prettier src/main.js` esamina la configurazione che si applica a quel file ed elenca le regole problematiche.

Esiste anche la strada opposta, cioè far girare Prettier *dentro* ESLint come se fosse una regola, con `eslint-plugin-prettier`. La documentazione di Prettier la [sconsiglia in generale](https://prettier.io/docs/integrating-with-linters): l'editor si riempie di sottolineature rosse per semplici questioni di spazi, tutto diventa più lento che lanciare Prettier direttamente, e si aggiunge un livello intermedio in cui qualcosa può rompersi. La divisione pulita resta la più semplice: Prettier formatta, ESLint analizza, e i due girano come comandi separati.

## Stylelint per i fogli di stile

**Stylelint** è il linter dedicato ai CSS e, con una [*custom syntax*](https://stylelint.io/user-guide/configure) (un parser alternativo, come `postcss-scss`), anche alle varianti come SCSS. Il modello è lo stesso di ESLint: regole, configurazioni condivise, correzioni con `--fix`. La versione attuale è la 17 (17.16 a ottobre 2026), che [richiede Node 20.19 o successivo](https://stylelint.io/migration-guide/to-17). Lo si aggiunge con la procedura guidata `npm create stylelint@latest`, oppure [a mano](https://stylelint.io/user-guide/get-started) installando `stylelint` e `stylelint-config-standard` e scrivendo un `stylelint.config.mjs`:

```js
/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
};
```

Si lancia con `npx stylelint "**/*.css"`, con le virgolette perché sia Stylelint, e non la shell, a interpretare il pattern, come raccomanda la [documentazione della CLI](https://stylelint.io/user-guide/cli). Il valore di un linter CSS si vede nei difetti che il browser perdona in silenzio: una proprietà scritta male come `colr: red` viene [semplicemente scartata](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_syntax/Error_handling), la pagina non mostra errori e il colore non c'è; Stylelint la segnala con la regola `property-no-unknown`. Dalla versione 16 Stylelint non ha più regole sulla forma, quindi la formattazione dei CSS si lascia a Prettier, come per il JavaScript. Per i progetti che vogliono un solo strumento, anche ESLint offre oggi `@eslint/css`, visto sopra.

## Biome e Oxc: la nuova generazione in Rust

ESLint, Prettier e Stylelint sono scritti in JavaScript e girano su Node; su progetti grandi, analizzare migliaia di file a ogni salvataggio, commit e push diventa un costo sensibile. Negli ultimi anni è nata una generazione di strumenti scritti in **Rust**, un linguaggio compilato in codice macchina nativo, che sfruttano più core del processore in parallelo. Si installano comunque da npm e si lanciano dagli script del `package.json`, ma il lavoro lo fa un eseguibile nativo, non il JavaScript. La stessa idea guida i runtime alternativi come Deno, che porta linter e formatter già integrati nel proprio eseguibile ([[11-runtime-alternativi|capitolo 11]]).

### Biome

**Biome** riunisce linter e formatter in un solo programma, con un solo file di configurazione, **`biome.json`**, più le *assist action*, trasformazioni come l'ordinamento degli import. La versione attuale è la 2.5 (ottobre 2026). Sulla [pagina del progetto](https://biomejs.dev/) Biome dichiara una compatibilità del 97% con l'output di Prettier e 568 regole di lint riprese da ESLint, typescript-eslint e altre fonti; il formatter copre JavaScript, TypeScript, JSX, JSON, HTML, CSS e GraphQL, il linter JavaScript, TypeScript, JSX, CSS e GraphQL. La versione 2 (giugno 2025) ha introdotto [regole che usano i tipi senza ricorrere al compilatore TypeScript](https://biomejs.dev/blog/biome-v2/), l'analisi che attraversa più file e un primo sistema di plugin, ancora limitato.

Si installa con `npm i -D -E @biomejs/biome` e si inizializza con `npx biome init`, che crea il file di configurazione con le impostazioni raccomandate ([guida](https://biomejs.dev/guides/getting-started/)). Una configurazione minima, con il linter attivo di default:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "indentStyle": "space"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

Il blocco `vcs` fa leggere a Biome il `.gitignore`. L'opzione `indentStyle` merita attenzione: il default di Biome è il rientro con tabulazioni, mentre quello di Prettier sono gli spazi, e chi migra da Prettier se ne accorge al primo `--write` ([riferimento della configurazione](https://biomejs.dev/reference/configuration/)).

| Comando | Effetto |
|---|---|
| `npx biome check --write` | formatta, applica le correzioni sicure del linter e le *assist action* |
| `npx biome lint` | solo il linter |
| `npx biome format --write` | solo il formatter |
| `npx biome ci` | formatter, linter e assist in sola verifica, senza modificare i file: il comando per la CI |
| `npx biome migrate eslint --write` | importa in `biome.json` le impostazioni di una configurazione ESLint esistente |
| `npx biome migrate prettier --write` | fa lo stesso con la configurazione di Prettier |

Anche Biome distingue le correzioni sicure da quelle che potrebbero cambiare il comportamento, dette *unsafe*: queste ultime si applicano solo aggiungendo `--unsafe` ([riferimento della CLI](https://biomejs.dev/reference/cli/)).

### Oxlint e Oxfmt

**Oxc** (*The JavaScript Oxidation Compiler*) è una raccolta di strumenti in Rust (parser, linter, formatter, transformer, resolver, minifier) sviluppata da [VoidZero](https://voidzero.dev/), la stessa società di Vite, Vitest e Rolldown. Per questo capitolo contano due pezzi.

**Oxlint** è il linter: stabile dalla [versione 1.0](https://oxc.rs/blog/2025-06-10-oxlint-stable) (giugno 2025) e arrivato alla 1.87, si dichiara [da 50 a 100 volte più veloce di ESLint](https://oxc.rs/docs/guide/usage/linter.html) secondo i benchmark del progetto, con oltre 870 regole che riprendono quelle di ESLint, di typescript-eslint e di plugin diffusi come quelli per React, Vue, jsx-a11y e i test. La configurazione sta in un [`.oxlintrc.json`](https://oxc.rs/docs/guide/usage/linter/config.html) (o in `oxlint.config.ts`), generabile con `oxlint --init`; si lancia con `oxlint` e `oxlint --fix`. Il linting con informazioni di tipo passa dal pacchetto `oxlint-tsgolint` e dall'opzione `--type-aware`: è [stabile da luglio 2026](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable), copre 59 delle 61 regole di typescript-eslint che usano i tipi e, all'opposto di typescript-eslint, richiede TypeScript 7. Il supporto ai plugin JavaScript compatibili con quelli di ESLint è invece ancora in alpha.

Il modo d'adozione suggerito dal progetto è affiancare Oxlint a ESLint invece di sostituirlo subito: si lancia `oxlint && eslint`, così i problemi più comuni emergono in una frazione del tempo, e il plugin `eslint-plugin-oxlint` spegne in ESLint le regole già coperte da Oxlint, per non contarle due volte. È la strategia, chiamata *dual linting*, che anche la [documentazione di typescript-eslint](https://typescript-eslint.io/troubleshooting/faqs/general) raccomanda con i linter nativi: a loro ciò che sanno fare, a ESLint le regole che usano i tipi. Il pacchetto `@oxlint/migrate` genera il `.oxlintrc.json` a partire da una flat config esistente.

**Oxfmt** è il formatter: è in [beta da febbraio 2026](https://oxc.rs/blog/2026-02-24-oxfmt-beta) (versione 0.72 a ottobre 2026), passa tutti i test di conformità di Prettier per JavaScript e TypeScript e si dichiara oltre 30 volte più veloce di Prettier. Si lancia con `oxfmt` (o `oxfmt --check` per la sola verifica), e `oxfmt --migrate prettier` ne converte la configurazione.

## EditorConfig

**EditorConfig** agisce ancora prima del formatter: è un file `.editorconfig` nella radice del progetto, già incontrato fra i <a href="../glossario/#/docs/anatomia-progetto?id=i-file-e-le-cartelle-col-punto-davanti" target="_blank" rel="noopener">file col punto davanti del glossario</a>, che l'editor legge per sapere come scrivere *mentre si digita*: rientro a spazi o a tabulazioni e di quanto, carattere di fine riga, codifica, riga vuota finale, spazi in coda da eliminare. Vale per qualunque file di testo, anche per quelli che nessun formatter tocca.

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[Makefile]
indent_style = tab
```

Molti editor lo leggono [senza bisogno di nulla](https://editorconfig.org/) (WebStorm, Vim, Neovim, Xcode), mentre VS Code richiede l'estensione EditorConfig. Prettier [lo legge a sua volta](https://prettier.io/docs/configuration) e ne converte le proprietà di rientro e fine riga, lasciando che il `.prettierrc` abbia l'ultima parola; Biome lo fa solo se si attiva `formatter.useEditorconfig`. Così il rientro deciso una volta vale sia per l'editor sia per il formatter.

## Dove girano i controlli

Un controllo serve soltanto se gira, e in un progetto ben organizzato gira in tre momenti diversi, ciascuno con un compromesso proprio fra rapidità e completezza.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 266" role="img" aria-label="Tre momenti in cui girano linter e formatter: nell'editor mentre si scrive, sul solo file aperto; nell'hook pre-commit con husky e lint-staged, sui soli file in stage; nella CI dopo il push, su tutto il repository. Un arco tratteggiato indica che git commit --no-verify salta l'hook. Sotto, una scala va dal feedback immediato al controllo completo e non aggirabile" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n05-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><path d="M115 82 C 210 18, 490 18, 585 82" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4" opacity=".7" marker-end="url(#n05-b)"/><text x="350" y="24" font-size="10.5" text-anchor="middle" opacity=".85"><tspan font-family="ui-monospace,Menlo,monospace">git commit --no-verify</tspan> salta l'hook</text><rect x="20" y="86" width="190" height="112" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="115" y="106" font-size="10" text-anchor="middle" opacity=".7">mentre si scrive</text><text x="115" y="130" font-size="13" text-anchor="middle" font-weight="700">editor</text><text x="115" y="152" font-size="10.5" text-anchor="middle">estensioni ESLint e Prettier</text><text x="115" y="174" font-size="10.5" text-anchor="middle" opacity=".75">solo il file aperto</text><rect x="255" y="86" width="190" height="112" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="350" y="106" font-size="10" text-anchor="middle" opacity=".7">prima del commit</text><text x="350" y="130" font-size="13" text-anchor="middle" font-weight="700">hook pre-commit</text><text x="350" y="152" font-size="10.5" text-anchor="middle">husky + lint-staged</text><text x="350" y="174" font-size="10.5" text-anchor="middle" opacity=".75">solo i file in stage</text><rect x="490" y="86" width="190" height="112" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".16" stroke="currentColor" stroke-width="1.8"/><text x="585" y="106" font-size="10" text-anchor="middle" opacity=".7">dopo il push</text><text x="585" y="130" font-size="13" text-anchor="middle" font-weight="700">CI</text><text x="585" y="152" font-size="10.5" text-anchor="middle">pipeline su una macchina pulita</text><text x="585" y="174" font-size="10.5" text-anchor="middle" opacity=".75">tutto il repository</text><line x1="212" y1="142" x2="251" y2="142" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-b)"/><line x1="447" y1="142" x2="486" y2="142" stroke="currentColor" stroke-width="1.4" marker-end="url(#n05-b)"/><line x1="36" y1="224" x2="664" y2="224" stroke="currentColor" stroke-width="1.2" opacity=".6"/><path d="M28 224 L38 219 L38 229 Z" fill="currentColor" opacity=".6"/><path d="M672 224 L662 219 L662 229 Z" fill="currentColor" opacity=".6"/><text x="30" y="246" font-size="10.5" opacity=".8">feedback immediato</text><text x="670" y="246" font-size="10.5" text-anchor="end" opacity=".8">controllo completo e non aggirabile</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli stessi strumenti in tre punti. L'<strong>editor</strong> dà la risposta più rapida ma vede un file alla volta; l'<strong>hook</strong> ferma il commit, ma è locale e si può saltare; la <strong>CI</strong> è la più lenta ma controlla tutto, su una macchina pulita, a ogni push. Per questo i tre livelli si sommano invece di sostituirsi.</figcaption>
</figure>

### Nell'editor

È il punto in cui un problema costa meno, perché lo si vede mentre si sta ancora scrivendo la riga. In VS Code l'estensione **ESLint** sottolinea i problemi in tempo reale e propone correzioni e suggerimenti (questi ultimi, si è visto, sono applicabili *solo* da qui); con ESLint 10 usa la flat config, che [non si può più disattivare](https://github.com/microsoft/vscode-eslint). L'estensione **Prettier - Code formatter** formatta il file. Le impostazioni si condividono con tutto il team in `.vscode/settings.json`, la cartella descritta nel <a href="../glossario/#/docs/anatomia-progetto?id=i-file-e-le-cartelle-col-punto-davanti" target="_blank" rel="noopener">glossario</a>:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

A ogni salvataggio Prettier formatta il file ed ESLint applica le sue correzioni automatiche ([impostazioni di Prettier](https://github.com/prettier/prettier-vscode)).

### Prima del commit: husky e lint-staged

Un **hook** di git è uno script che git esegue da solo in corrispondenza di un evento; il `pre-commit` parte appena prima di registrare un commit e, se termina con un codice di uscita diverso da zero, lo annulla. **Husky** risolve un primo problema, la condivisione: rende questi hook parte del repository, nella cartella `.husky/`, così valgono per tutto il team (l'idea è spiegata nel <a href="../glossario/#/docs/anatomia-progetto?id=i-file-e-le-cartelle-col-punto-davanti" target="_blank" rel="noopener">glossario</a>). **lint-staged** risolve il secondo, la velocità: [esegue i comandi solo sui file nell'area di *stage*](https://github.com/lint-staged/lint-staged), cioè quelli aggiunti con `git add` e pronti per il commit, passando loro i percorsi come argomenti; se i comandi modificano i file, come fanno `--fix` e `--write`, riaggiunge da solo le modifiche al commit, purché non ci siano errori.

1. Installare i due pacchetti: `npm install --save-dev husky lint-staged`.
2. Eseguire `npx husky init`: [crea](https://typicode.github.io/husky/get-started.html) il file `.husky/pre-commit` (con un `npm test` di esempio) e aggiunge al `package.json` lo script `"prepare": "husky"`, che npm esegue dopo ogni `npm install` e che attiva gli hook su ogni nuova copia del progetto.
3. Sostituire il contenuto di `.husky/pre-commit` con la sola riga `npx lint-staged`.
4. Dichiarare nel `package.json` che cosa eseguire per ogni tipo di file:

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.css": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": "prettier --write"
  }
}
```

Un array esegue i comandi **in sequenza**, e il linter viene prima del formatter, come raccomanda la [documentazione di Prettier](https://prettier.io/docs/install). I pattern, poi, non si sovrappongono di proposito: lint-staged avvia in parallelo i comandi di pattern diversi, e il suo README avverte che due strumenti che modificano lo stesso file nello stesso momento si ostacolano a vicenda.

L'hook è una comodità, non una garanzia: si attiva solo dove le dipendenze sono state installate, e `git commit --no-verify` lo [salta esplicitamente](https://git-scm.com/docs/git-commit).

### Nella CI

L'ultima linea di difesa è la pipeline di **integrazione continua**, descritta nel <a href="../glossario/#/docs/ci-cd-pipeline?id=ci-integrazione-continua" target="_blank" rel="noopener">glossario alla voce CI/CD</a>: a ogni push una macchina pulita installa le dipendenze e lancia i controlli su **tutto** il repository, senza che nessuno possa saltarli. Qui i comandi devono **verificare senza modificare**: un file corretto in automatico sulla macchina della CI non tornerebbe mai nel repository, mentre un fallimento con codice di uscita diverso da zero ferma la pipeline e avvisa chi ha fatto il push. Conviene raccogliere i comandi negli script del `package.json`, così in locale e in CI si lanciano gli stessi:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"
  }
}
```

La pipeline esegue `npm run lint` e `npm run format:check` (con Biome, un solo `biome ci`); in locale si usano le varianti che correggono.

## Gli strumenti a confronto

| Strumento | Che cosa fa | Scritto in | Linguaggi | Configurazione | Versione (ott. 2026) |
|---|---|---|---|---|---|
| ESLint | linter | JavaScript | JavaScript; TypeScript con typescript-eslint; CSS, JSON e Markdown con plugin ufficiali | `eslint.config.js` | 10.12 |
| typescript-eslint | parser e regole TypeScript per ESLint | TypeScript | TypeScript | dentro `eslint.config.js` | 8.71 |
| Prettier | formatter | JavaScript | JS, TS, CSS/SCSS/Less, HTML, Vue, Angular, JSON, Markdown, YAML, GraphQL | `.prettierrc` | 3.9 |
| Stylelint | linter | JavaScript | CSS; SCSS e altre varianti con una *custom syntax* | `stylelint.config.mjs` | 17.16 |
| Biome | linter e formatter | Rust | JS, TS, JSX, CSS, GraphQL; JSON e HTML solo formatter | `biome.json` | 2.5 |
| Oxlint | linter | Rust | JS, TS, JSX, con regole per React, Vue e i test | `.oxlintrc.json` | 1.87 |
| Oxfmt | formatter (beta) | Rust | JS, TS, JSON, YAML, HTML, CSS, Markdown e altri | `.oxfmtrc.json` | 0.72 |
| EditorConfig | regole di base per l'editor | — | qualunque file di testo | `.editorconfig` | — |

La scelta dipende da che cosa si chiede agli strumenti. La coppia **ESLint e Prettier**, con typescript-eslint, resta la scelta di riferimento quando contano l'ecosistema dei plugin (le regole di un framework, regole aziendali scritte in casa), le regole che usano i tipi su progetti TypeScript 6 e l'integrazione con strumenti che la presuppongono, come `ng lint` in Angular. **Biome** ha senso quando si preferisce una sola dipendenza e una sola configurazione e le regole incluse bastano, tipicamente in un progetto nuovo; chi dipende da plugin ESLint specifici rischia di non trovarne l'equivalente, perché i plugin di Biome sono ancora agli inizi. **Oxlint** è soprattutto un acceleratore: accanto a ESLint su una base di codice grande, o da solo quando le sue regole coprono ciò che serve; **Oxfmt** è da valutare tenendo conto che è ancora in beta. Tutti e tre i nuovi strumenti sanno importare una configurazione esistente (`biome migrate`, `@oxlint/migrate`, `oxfmt --migrate prettier`), quindi provarli su un ramo costa poco.

> [!tip]
> Il formatter decide la forma, il linter cerca i problemi: due strumenti separati, configurati per non pestarsi i piedi, con `eslint-config-prettier` in fondo alla flat config. ESLint oggi si configura solo con `eslint.config.js`. I controlli girano nell'editor per la rapidità, nel pre-commit per comodità e in CI come garanzia, dove si usano comandi che verificano senza modificare.

## Ripasso lampo

<details>
<summary>Perché si usano due strumenti distinti, un linter e un formatter, invece di uno solo?</summary>

Perché fanno mestieri diversi. Il formatter riscrive solo la forma, senza mai cambiare il comportamento e senza nulla da segnalare; il linter analizza il significato e segnala probabili bug e violazioni delle convenzioni. Le regole di formattazione dentro i linter si sono rivelate conflittuali e costose da mantenere: ESLint le ha deprecate dalla 8.53, Stylelint le ha rimosse nella 16. Anche Biome, che li riunisce in un solo programma, tiene separati i due motori.

</details>

<details>
<summary>Che cos'è un AST, e perché la regola <code>eqeqeq</code> non viene ingannata dagli spazi?</summary>

L'AST (albero sintattico astratto) è la struttura che il parser ricava dal testo: ogni nodo è un costrutto del linguaggio e i figli sono le sue parti, mentre spazi e a capo spariscono. `eqeqeq` esamina i nodi `BinaryExpression` e ne controlla l'operatore, quindi `somma=="0"` e `somma == "0"`, che producono lo stesso nodo, ricevono la stessa segnalazione.

</details>

<details>
<summary>In un progetto con ESLint 10 c'è ancora un file <code>.eslintrc.json</code>: che cosa succede?</summary>

Viene ignorato. ESLint 10 ha rimosso del tutto il vecchio sistema eslintrc, e la configurazione si legge solo da `eslint.config.js` (o `.mjs`, `.cjs`, `.ts`). Per migrare si usa `npx @eslint/migrate-config .eslintrc.json` e si rivede a mano il file prodotto.

</details>

<details>
<summary>A che cosa serve <code>eslint-config-prettier</code>, e perché va messo in fondo alla flat config?</summary>

Spegne le regole di ESLint inutili o in conflitto con Prettier, così i due strumenti non si contraddicono. Va in fondo perché ESLint fonde gli oggetti nell'ordine in cui compaiono e l'ultimo vince: solo lì è sicuro di spegnere anche le regole accese da plugin e configurazioni condivise elencati prima.

</details>

<details>
<summary>Se un hook pre-commit lancia già ESLint e Prettier, perché ripeterli in CI?</summary>

Perché l'hook è locale e aggirabile: non c'è dove le dipendenze non sono installate, `git commit --no-verify` lo salta, e in ogni caso controlla solo i file in stage. La CI gira a ogni push su una macchina pulita e su tutto il repository, con comandi che verificano senza modificare (`eslint . --max-warnings 0`, `prettier . --check`, `biome ci`).

</details>
