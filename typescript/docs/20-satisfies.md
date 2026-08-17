# L'operatore satisfies

L'operatore `satisfies` verifica che un valore sia conforme a un determinato tipo senza però modificarne il tipo inferito. Nasce per risolvere una tensione ricorrente: da un lato si desidera controllare che un valore rispetti un contratto, dall'altro si vuole conservare l'informazione precisa che il compilatore ha dedotto dal valore stesso. L'annotazione di tipo esplicita e la type assertion, gli strumenti disponibili in precedenza, sacrificano l'una o l'altra di queste due esigenze; `satisfies` le tiene insieme.

## Il problema: annotazione contro inferenza

Quando si annota una variabile con un tipo, il compilatore tratta il valore come appartenente esattamente a quel tipo, dimenticando i dettagli più specifici che avrebbe altrimenti dedotto. Questo fenomeno si chiama widening, cioè allargamento del tipo.

```ts
type Colore = "rosso" | "verde" | "blu";

// Con annotazione esplicita, ogni proprietà assume il tipo dichiarato nell'union
const palette: Record<Colore, string | number[]> = {
  rosso: [255, 0, 0],
  verde: "#00ff00",
  blu: [0, 0, 255],
};

// Il tipo di palette.verde è `string | number[]`, non `string`:
// l'informazione che si tratta di una stringa è andata persa
palette.verde.toUpperCase();
// Errore: Property 'toUpperCase' does not exist on type 'string | number[]'.
```

L'annotazione ha un pregio importante — verifica che tutte le chiavi di `Colore` siano presenti e che ogni valore sia del tipo giusto — ma appiattisce ogni proprietà sull'union `string | number[]`, rendendo impossibile usare i metodi propri di `string` o di `number[]` senza un ulteriore narrowing.

## La soluzione: verificare senza allargare

Posponendo `satisfies Tipo` a un'espressione, si chiede al compilatore di controllare che il valore sia assegnabile a quel tipo, mantenendo però il tipo inferito dal valore, più preciso.

```ts
type Colore = "rosso" | "verde" | "blu";

const palette = {
  rosso: [255, 0, 0],
  verde: "#00ff00",
  blu: [0, 0, 255],
} satisfies Record<Colore, string | number[]>;

// Il tipo di ogni proprietà è quello inferito dal valore concreto:
palette.verde.toUpperCase();   // OK: `verde` è inferito come string
palette.rosso.map((n) => n);   // OK: `rosso` è inferito come number[]
```

Il controllo resta rigoroso in entrambe le direzioni. Se manca una chiave di `Colore`, o se ne compare una in più, oppure se un valore non è assegnabile a `string | number[]`, il compilatore segnala l'errore esattamente come farebbe con un'annotazione.

```ts
const paletteErrata = {
  rosso: [255, 0, 0],
  verde: "#00ff00",
  // Errore: Property 'blu' is missing ...
} satisfies Record<Colore, string | number[]>;

const paletteExtra = {
  rosso: [255, 0, 0],
  verde: "#00ff00",
  blu: [0, 0, 255],
  giallo: "#ffff00",
  // Errore: Object literal may only specify known properties ...
} satisfies Record<Colore, string | number[]>;
```

## Differenza rispetto alla type assertion

La type assertion con `as` afferma che un valore è di un certo tipo, ma non esegue un vero controllo di assegnabilità nei due sensi e non segnala le proprietà mancanti. È quindi uno strumento che può nascondere errori, mentre `satisfies` è sempre sicuro.

```ts
type Config = {
  porta: number;
  host: string;
};

// Con `as`: nessun errore, ma la proprietà `host` manca davvero
const config = {
  porta: 8080,
} as Config;

config.host.trim(); // supera il compilatore, ma a runtime `host` è undefined

// Con `satisfies`: l'assenza di `host` viene segnalata subito
const configSicura = {
  porta: 8080,
  // Errore: Property 'host' is missing in type '{ porta: number; }'.
} satisfies Config;
```

Si può riassumere così: `: Tipo` fissa il tipo e allarga il valore, `as Tipo` forza il tipo senza controlli completi, `satisfies Tipo` controlla il valore ma lascia intatto il tipo inferito.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 176" role="img" aria-label="satisfies a confronto: annotazione allarga, as forza senza controlli, satisfies controlla senza allargare" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="286" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity=".8" fill="currentColor" font-family="system-ui,Arial,sans-serif">controlla?</text><text x="392" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity=".8" fill="currentColor" font-family="system-ui,Arial,sans-serif">tipo risultante</text><rect x="20" y="48" width="236" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="32" y="68" font-size="11" text-anchor="start" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">: Tipo</text><text x="286" y="68" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">✓</text><text x="392" y="68" font-size="10" text-anchor="middle" font-weight="400" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">allargato</text><rect x="20" y="88" width="236" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="32" y="108" font-size="11" text-anchor="start" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">as Tipo</text><text x="286" y="108" font-size="13" text-anchor="middle" font-weight="700" opacity=".75" fill="currentColor" font-family="system-ui,Arial,sans-serif">✗</text><text x="392" y="108" font-size="10" text-anchor="middle" font-weight="400" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">forzato</text><rect x="20" y="128" width="236" height="30" rx="6" fill="var(--link,#3178c6)" fill-opacity=".14" stroke="var(--link,#3178c6)" stroke-width="1.5" opacity="1"/><text x="32" y="148" font-size="11" text-anchor="start" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">satisfies Tipo</text><text x="286" y="148" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">✓</text><text x="392" y="148" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">inferito (stretto)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I tre approcci: <code>: Tipo</code> controlla ma <strong>allarga</strong> il valore; <code>as Tipo</code> <strong>forza</strong> senza controlli completi (rischioso); <code>satisfies Tipo</code> <strong>controlla</strong> il valore e lascia intatto il tipo <strong>inferito</strong> (stretto).</figcaption>
</figure>

## Combinazione con as const

`satisfies` si combina spesso con `as const`, trattato nel capitolo sul [type casting](19-casting.md). Con `as const` il valore diventa profondamente `readonly` e i suoi tipi si restringono ai literal; aggiungendo `satisfies` si verifica al tempo stesso che quel valore rispetti un contratto, senza perdere la precisione dei literal.

```ts
const rotte = {
  home: "/",
  profilo: "/utente/:id",
} as const satisfies Record<string, string>;

// Le chiavi e i valori restano literal esatti, e il contratto è verificato:
type ChiaveRotta = keyof typeof rotte; // "home" | "profilo"
```

## Domande

<details>
<summary>Che cosa distingue `satisfies Tipo` da un'annotazione `: Tipo`?</summary>

Entrambi verificano che il valore sia assegnabile al tipo indicato, controllando proprietà mancanti e valori non conformi. La differenza sta nel tipo risultante: l'annotazione `: Tipo` fa assumere alla variabile esattamente quel tipo, allargando (widening) i valori e perdendo i dettagli più specifici, mentre `satisfies Tipo` conserva il tipo più preciso inferito dal valore. Così, con `satisfies`, una proprietà il cui valore è una stringa resta di tipo `string` invece di diventare l'intera union dichiarata nel contratto.

</details>

<details>
<summary>Perché `satisfies` è più sicuro di una type assertion con `as`?</summary>

Perché `as` si limita ad affermare un tipo senza eseguire un controllo di assegnabilità completo: non segnala, ad esempio, le proprietà obbligatorie mancanti, e può quindi mascherare errori che emergeranno solo a runtime. `satisfies` esegue invece una verifica piena e bidirezionale — tutte le proprietà richieste devono essere presenti e ogni valore deve essere conforme — senza mai alterare o forzare il tipo. In pratica `satisfies` non introduce mai un rischio, mentre `as` sposta la responsabilità della correttezza sullo sviluppatore.

</details>

<details>
<summary>Cosa si ottiene combinando `as const` e `satisfies`?</summary>

Si ottiene contemporaneamente la massima precisione dei tipi e la verifica di un contratto. `as const` rende il valore profondamente `readonly` e ne restringe i tipi ai literal esatti; `satisfies` controlla che quel valore rispetti la forma richiesta senza allargarne il tipo. Il risultato è un valore i cui literal (chiavi e valori) restano disponibili per operazioni a livello di tipo come `keyof typeof`, ma di cui il compilatore ha comunque garantito la conformità al contratto atteso.

</details>

<details>
<summary>Nel primo esempio, perché `palette.verde.toUpperCase()` falliva con l'annotazione ma funziona con `satisfies`?</summary>

Con l'annotazione `: Record<Colore, string | number[]>` ogni proprietà assume il tipo dichiarato nel contratto, cioè l'union `string | number[]`. Su un'union `toUpperCase` non è disponibile, perché non esiste su `number[]`, quindi il compilatore lo rifiuta. Con `satisfies` la proprietà `verde` conserva il tipo inferito dal suo valore concreto, la stringa `"#00ff00"`, quindi è di tipo `string` e `toUpperCase` è pienamente lecito. Il contratto viene comunque verificato, ma senza appiattire il tipo di ciascuna proprietà.

</details>
