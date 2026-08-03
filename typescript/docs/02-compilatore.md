# Il compilatore (tsc)

Il compilatore di TypeScript, invocato con il comando `tsc`, ha il compito di tradurre il codice TypeScript in JavaScript eseguibile in un browser o in Node.js. Durante questa traduzione il compilatore esegue anche il type checking, segnalando gli errori di tipo prima che il codice venga effettivamente eseguito. Il comportamento del compilatore si controlla tramite numerose opzioni, raccolte di norma in un file `tsconfig.json` alla radice del progetto.

Si installa `tsc` come dipendenza di sviluppo del progetto, così che la versione del compilatore resti vincolata e condivisa con il resto del team:

```bash
npm install --save-dev typescript
```

A questo punto il compilatore è disponibile attraverso `npx tsc` (oppure tramite uno script di npm), senza bisogno di un'installazione globale.

## Il compilatore nativo

A partire da TypeScript 7.0 il compilatore è stato riscritto in Go: `tsc` non è più un programma JavaScript eseguito da Node, ma un binario nativo. La riscrittura non tocca il linguaggio né le regole di type checking, quindi il codice che compilava sulla versione precedente continua a compilare esattamente allo stesso modo; ciò che cambia sono le prestazioni, con una compilazione e un caricamento nell'editor circa dieci volte più rapidi e un consumo di memoria dimezzato. Il comando resta invariato: si installa il pacchetto `typescript` e si invoca `npx tsc` come sempre. Durante la fase di anteprima il binario nativo veniva distribuito separatamente con il nome `tsgo`, mentre nella versione stabile è di nuovo semplicemente `tsc`.

Vale la pena tenere presente una sola avvertenza pratica: la 7.0 non espone ancora un'API programmatica del compilatore, prevista per la 7.1. Gli strumenti che invocano `tsc` come libreria, ad esempio alcuni transformer personalizzati, possono quindi richiedere temporaneamente la versione precedente, che resta installabile affiancata.

## Compilare un singolo file

La forma più diretta consiste nel passare a `tsc` il percorso del file da compilare. Il compilatore produce un file JavaScript con lo stesso nome ed estensione `.js` nella stessa cartella del sorgente:

```bash
npx tsc indice.ts
```

Dato un file `indice.ts` come il seguente:

```ts
function saluta(nome: string): string {
  return `Ciao, ${nome}!`;
}

console.log(saluta("Ada"));
```

l'esecuzione di `npx tsc indice.ts` genera un `indice.js` accanto al sorgente. Va però tenuto presente un aspetto del comportamento moderno di `tsc`: quando nel progetto è presente un `tsconfig.json`, passare esplicitamente un file sulla riga di comando produce un errore, perché indicare al tempo stesso una configurazione di progetto e un singolo file viene considerato ambiguo. Per compilare deliberatamente un solo file ignorando la configurazione si usa il flag `--ignoreConfig`:

```bash
npx tsc indice.ts --ignoreConfig
```

In questo caso `tsc` compila soltanto ciò che gli viene passato, applicando le opzioni predefinite del compilatore.

Se il sorgente contiene un errore di tipo, il compilatore lo riporta sul terminale indicando file, posizione e messaggio:

```ts
function saluta(nome: string): string {
  return `Ciao, ${nome}!`;
}

// Errore: Argument of type 'number' is not assignable to parameter of type 'string'.
console.log(saluta(42));
```

## Compilare un intero progetto con tsconfig.json

Quando si lavora su più file, indicarli uno per uno sulla riga di comando diventa scomodo. La soluzione è descrivere il progetto in un `tsconfig.json`: in presenza di questo file basta lanciare `tsc` senza argomenti perché il compilatore individui automaticamente tutti i file sorgente del progetto e li compili rispettando le opzioni configurate.

```bash
npx tsc
```

Il modo più rapido per generare un `tsconfig.json` di partenza è il comando di inizializzazione, che crea un file ampiamente commentato pronto da personalizzare:

```bash
npx tsc --init
```

Un `tsconfig.json` minimale e adatto a TypeScript 7.0 può apparire così:

```json
{
  "compilerOptions": {
    "target": "es2025",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
```

In questo esempio non compare `strict`, perché in TypeScript 7.0 il controllo rigoroso è attivo per impostazione predefinita: l'intera famiglia di controlli `strict` viene applicata anche senza dichiararla. Analogamente, il `target` predefinito è allineato a una versione moderna di ECMAScript (attualmente `es2025`) e il sistema di moduli predefinito è basato sugli ES module. Le opzioni mostrate qui servono quindi a rendere esplicite alcune scelte e a definire la struttura delle cartelle, non a forzare un comportamento che il compilatore non avrebbe già.

Vale la pena soffermarsi su `types`: in TypeScript 7.0 questa opzione vale `[]` per impostazione predefinita, ovvero non vengono più inclusi automaticamente tutti i pacchetti presenti in `node_modules/@types`. Per disporre dei tipi globali di Node (come `process` o `Buffer`) occorre quindi indicarli esplicitamente con `"types": ["node"]`, dopo aver installato il relativo pacchetto:

```bash
npm install --save-dev @types/node
```

Con la configurazione precedente, i sorgenti collocati sotto `src` vengono compilati e il JavaScript risultante viene scritto sotto `dist`, preservando la struttura delle sottocartelle. Si lancia semplicemente:

```bash
npx tsc
```

## La modalità watch

Durante lo sviluppo è raro voler invocare il compilatore manualmente dopo ogni modifica. L'opzione `--watch` mantiene `tsc` in esecuzione, osserva i file del progetto e ricompila automaticamente ogni volta che un sorgente cambia, riportando immediatamente eventuali errori di tipo.

La modalità watch funziona sia indicando un singolo file:

```bash
npx tsc indice.ts --watch
```

sia, più comunemente, affidandosi al `tsconfig.json` per monitorare l'intero progetto:

```bash
npx tsc --watch
```

In quest'ultima forma il compilatore resta in ascolto e, a ogni salvataggio, esegue una ricompilazione incrementale dei soli file interessati, mostrando un riepilogo del numero di errori rilevati. Si interrompe il processo con `Ctrl+C`. L'opzione dispone anche della forma abbreviata `-w`, equivalente a `--watch`.

Per ottenere un ciclo di sviluppo ancora più immediato è frequente affiancare a `tsc --watch` un server di sviluppo moderno come Vite, oppure eseguire direttamente i sorgenti TypeScript senza un passaggio di compilazione separato tramite `tsx`:

```bash
npx tsx indice.ts
```

Resta comunque `tsc` lo strumento di riferimento per la verifica dei tipi e per la generazione del JavaScript di produzione.

## Domande

<details>
<summary>Qual è la differenza tra eseguire `tsc indice.ts` e `tsc` senza argomenti?</summary>

In presenza di un `tsconfig.json`, passare esplicitamente un file (`tsc indice.ts`) produce un errore, perché combinare la configurazione di progetto e un singolo file è considerato ambiguo: per farlo di proposito si aggiunge il flag `--ignoreConfig`, e in tal caso `tsc` compila solo quel file applicando le opzioni predefinite. Lanciando invece `tsc` senza argomenti, il compilatore individua il `tsconfig.json`, raccoglie tutti i file inclusi nel progetto e li compila rispettando le opzioni configurate.

</details>

<details>
<summary>Perché in un `tsconfig.json` per TypeScript 7.0 non è necessario impostare `strict: true`?</summary>

Perché in TypeScript 7.0 `strict` è attivo per impostazione predefinita. L'intera famiglia di controlli rigorosi (tra cui `noImplicitAny`, `strictNullChecks` e `strictPropertyInitialization`) viene quindi applicata anche senza dichiarare l'opzione. La si indica solo se la si vuole disattivare esplicitamente.

</details>

<details>
<summary>A cosa serve l'opzione `--watch` e qual è la sua forma abbreviata?</summary>

`--watch` mantiene il compilatore in esecuzione, osserva i file del progetto e ricompila automaticamente a ogni modifica, riportando subito gli errori di tipo. Evita di dover invocare `tsc` manualmente dopo ogni salvataggio durante lo sviluppo. La forma abbreviata è `-w`.

</details>

<details>
<summary>Come si genera rapidamente un `tsconfig.json` iniziale?</summary>

Con il comando `npx tsc --init`, che crea un `tsconfig.json` ampiamente commentato e pronto da personalizzare nella cartella corrente.

</details>

<details>
<summary>Perché in TypeScript 7.0 può essere necessario aggiungere `"types": ["node"]` al `tsconfig.json`?</summary>

Perché in TypeScript 7.0 l'opzione `types` vale `[]` per impostazione predefinita: i pacchetti presenti in `node_modules/@types` non vengono più inclusi automaticamente. Per rendere disponibili i tipi globali di Node, dopo aver installato `@types/node`, occorre indicarli esplicitamente con `"types": ["node"]`.

</details>
