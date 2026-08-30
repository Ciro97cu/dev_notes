# Complessità e algoritmi

Come si misura il **costo** di un algoritmo al crescere dei dati, e la forma di calcolo che più spesso lo fa esplodere: la ricorsione.

## Big O notation

La **Big O notation** è il modo standard per descrivere **come cresce** il costo di un algoritmo (il tempo di esecuzione o la memoria) al crescere della dimensione dell'input *n*. Non misura i secondi (che dipendono dalla macchina), ma l'**ordine di grandezza** con cui il lavoro aumenta: risponde alla domanda "**come scala** quando i dati diventano tanti?".

Per farlo ignora i dettagli che non contano sui grandi numeri — le costanti moltiplicative e i termini di ordine inferiore. Un algoritmo che compie `3n + 10` passi è semplicemente **O(n)**: per *n* grande, il `3` e il `+ 10` non ne cambiano la sostanza. Di norma la notazione esprime il **caso peggiore**, cioè un limite superiore garantito.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 480 290" role="img" aria-label="Curve di crescita delle classi di complessità Big O, dalla costante O(1) all'esponenziale O(2 alla n)" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><path d="M56 250 L56 40" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M56 37 L52 47 L60 47 Z" fill="currentColor"/><path d="M56 250 L398 250" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M401 250 L393 245 L393 255 Z" fill="currentColor"/><text x="46" y="32" font-size="9.5" opacity=".7">operazioni</text><text x="226" y="276" font-size="9.5" text-anchor="middle" opacity=".7">n (dimensione dell'input)</text><path d="M56 240 L392 240" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="243" font-size="10">O(1)</text><path d="M56 250 C 110 205, 240 180, 392 170" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="173" font-size="10">O(log n)</text><path d="M56 250 L392 132" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="135" font-size="10">O(n)</text><path d="M56 250 C 190 195, 300 145, 392 100" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="103" font-size="10">O(n log n)</text><path d="M56 250 C 230 245, 330 155, 392 66" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="400" y="69" font-size="10">O(n²)</text><path d="M56 250 C 95 250, 122 130, 150 46" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="150" y="40" font-size="10" text-anchor="middle">O(2ⁿ)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Come cresce il numero di operazioni al crescere di <em>n</em>: più la curva sale ripida, peggio "scala" l'algoritmo. <strong>O(1)</strong> resta piatta, mentre <strong>O(n²)</strong> e soprattutto <strong>O(2ⁿ)</strong> esplodono. Contano la <em>forma</em> della crescita, non le costanti.</figcaption>
</figure>

Le classi che si incontrano più spesso, dalla più efficiente alla peggiore — e che aspetto hanno nel codice:

```js
// O(1) — costante: il costo non dipende da n
const primo = arr[0];                     // accesso per indice

// O(log n) — logaritmica: a ogni passo lo spazio da esaminare si dimezza
while (lo <= hi) { const mid = (lo + hi) >> 1; /* ricerca binaria */ }

// O(n) — lineare: un solo giro su tutti gli elementi
for (const x of arr) { /* … */ }

// O(n log n) — n elementi per log n livelli di divisione
arr.sort();                               // i "buoni" ordinamenti (merge/quick sort)

// O(n²) — quadratica: due cicli annidati sugli stessi dati
for (const a of arr)
  for (const b of arr) { /* confronto a coppie: bubble sort */ }

// O(2ⁿ) — esponenziale: una ricorsione che a ogni passo si biforca
const fib = (n) => n < 2 ? n : fib(n - 1) + fib(n - 2);
```

La differenza è enorme: con *n* = 1000, un algoritmo O(n) fa mille passi, uno O(n²) un milione, uno O(2ⁿ) un numero più grande degli atomi dell'universo osservabile. Per questo scegliere l'ordine di crescita giusto conta molto più che ottimizzare le costanti.

### Nel frontend

Non è teoria astratta: la differenza tra O(n) e O(n²) è quella tra una lista che scorre liscia e una che "impunta". Il caso più comune è cercare dati correlati *dentro* un ciclo — un `find` (o `includes`) annidato in un `map`:

```js
// O(n²): per ogni item ri-scorre TUTTI gli utenti
items.map(i => users.find(u => u.id === i.userId));

// O(n): costruisci una volta una Map (O(n)), poi fai lookup diretti O(1)
const byId = new Map(users.map(u => [u.id, u]));
items.map(i => byId.get(i.userId));
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 640 224" role="img" aria-label="Confronto: map+find fa n per n confronti (O di n quadro); con una Map ogni item fa un accesso diretto (O di n)" style="width:100%;max-width:620px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="164" y="26" font-size="12" text-anchor="middle" font-weight="700">map + find → O(n²)</text><text x="486" y="26" font-size="12" text-anchor="middle" font-weight="700">Map + get → O(n)</text><g stroke="currentColor" stroke-width="0.9" opacity="0.42"><line x1="104" y1="74" x2="224" y2="74"/><line x1="104" y1="74" x2="224" y2="116"/><line x1="104" y1="74" x2="224" y2="158"/><line x1="104" y1="116" x2="224" y2="74"/><line x1="104" y1="116" x2="224" y2="116"/><line x1="104" y1="116" x2="224" y2="158"/><line x1="104" y1="158" x2="224" y2="74"/><line x1="104" y1="158" x2="224" y2="116"/><line x1="104" y1="158" x2="224" y2="158"/></g><rect x="36" y="60" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="70" y="78" font-size="11" text-anchor="middle">item</text><rect x="36" y="102" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="70" y="120" font-size="11" text-anchor="middle">item</text><rect x="36" y="144" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="70" y="162" font-size="11" text-anchor="middle">item</text><rect x="224" y="60" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="258" y="78" font-size="11" text-anchor="middle">utente</text><rect x="224" y="102" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="258" y="120" font-size="11" text-anchor="middle">utente</text><rect x="224" y="144" width="68" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="258" y="162" font-size="11" text-anchor="middle">utente</text><text x="164" y="196" font-size="10" text-anchor="middle" opacity=".7">9 confronti (3 × 3)</text><g stroke="currentColor" stroke-width="1.3"><line x1="416" y1="74" x2="536" y2="97"/><line x1="416" y1="116" x2="536" y2="109"/><line x1="416" y1="158" x2="536" y2="121"/></g><path d="M540 97 L532 93 L532 101 Z" fill="currentColor"/><path d="M540 109 L532 105 L532 113 Z" fill="currentColor"/><path d="M540 121 L532 117 L532 125 Z" fill="currentColor"/><rect x="352" y="60" width="64" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="384" y="78" font-size="11" text-anchor="middle">item</text><rect x="352" y="102" width="64" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="384" y="120" font-size="11" text-anchor="middle">item</text><rect x="352" y="144" width="64" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="384" y="162" font-size="11" text-anchor="middle">item</text><rect x="540" y="73" width="84" height="72" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="582" y="105" font-size="11" text-anchor="middle" font-weight="700">Map</text><text x="582" y="121" font-size="8.5" text-anchor="middle" opacity=".7">id → utente</text><text x="486" y="196" font-size="10" text-anchor="middle" opacity=".7">3 accessi diretti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">A sinistra, cercare ogni item tra <em>tutti</em> gli utenti: <em>n</em> × <em>n</em> confronti (O(n²)). A destra, una <code>Map</code> costruita una volta sola permette un accesso diretto per item: <em>n</em> operazioni (O(n)).</figcaption>
</figure>

Due altri punti dove Big O guida le scelte del frontend:

- **I framework confrontano il DOM in O(n), non alla lettera.** Un confronto esatto tra due alberi sarebbe O(n³); React e Angular usano euristiche **O(n)**, e le `key` nelle liste servono proprio a rendere lineare quel confronto.
- **Liste molto lunghe → virtualizzazione.** Rendere *N* nodi nel DOM costa O(n) in tempo e memoria: oltre un certo *N* si rende solo la porzione visibile (*windowing*), tenendo il costo quasi costante a schermo.

### O, Ω e Θ: la famiglia completa

Big O non è però sola: fa parte di una famiglia di tre notazioni asintotiche, che limitano la crescita da lati diversi.

| Notazione | Limita | In parole |
|---|---|---|
| **O** (Big O) | **dall'alto** | "non cresce più di…" — il caso peggiore |
| **Ω** (Big Omega) | **dal basso** | "non cresce meno di…" — il caso migliore |
| **Θ** (Big Theta) | **da entrambi** | "cresce esattamente come…" — quando O e Ω coincidono |

Nella pratica si cita quasi sempre solo **Big O**, perché di un algoritmo interessa soprattutto la garanzia sul **caso peggiore**.

> [!tip]
> Piccolo abuso diffuso: spesso si scrive "O(n)" intendendo che l'algoritmo cresce *esattamente* come *n* — che formalmente è **Θ(n)**. Big O è solo il tetto (per dire, `n log n` è comunque O(n²), pur crescendo molto meno); ma nell'uso quotidiano "Big O" ha finito per significare, più liberamente, "l'ordine di crescita" e basta.

## Ricorsione

Una funzione **ricorsiva** è una funzione che, per risolvere un problema, **chiama sé stessa** su una versione più piccola dello stesso problema, fino ad arrivare a un caso abbastanza semplice da risolvere direttamente. Ogni funzione ricorsiva ha perciò due parti obbligatorie:

- il **caso base** — la condizione che ferma la ricorsione (senza, la funzione si richiamerebbe all'infinito fino a esaurire la memoria: *stack overflow*);
- il **caso ricorsivo** — la chiamata a sé stessa su un input ridotto, che avvicina al caso base.

```js
const fact = (n) => n <= 1 ? 1 : n * fact(n - 1);
//                   └ caso base   └ caso ricorsivo
fact(3); // 3 * fact(2) → 3 * 2 * fact(1) → 3 * 2 * 1 = 6
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 460 220" role="img" aria-label="Stack delle chiamate di fact(3): le chiamate scendono fino al caso base fact(1), poi risalgono restituendo 1, 2, 6" style="width:100%;max-width:460px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="80" y="16" font-size="9.5" text-anchor="middle" opacity=".7">chiama (n−1)</text><text x="360" y="16" font-size="9.5" text-anchor="middle" opacity=".7">restituisce</text><path d="M80 32 L80 186" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M80 192 L75 183 L85 183 Z" fill="currentColor"/><path d="M360 188 L360 34" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M360 28 L355 37 L365 37 Z" fill="currentColor"/><rect x="115" y="26" width="130" height="42" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="180" y="52" font-size="12" text-anchor="middle" font-weight="700">fact(3)</text><text x="252" y="51" font-size="11" opacity=".85">→ 6</text><rect x="115" y="90" width="130" height="42" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="180" y="116" font-size="12" text-anchor="middle" font-weight="700">fact(2)</text><text x="252" y="115" font-size="11" opacity=".85">→ 2</text><rect x="115" y="154" width="130" height="42" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="180" y="180" font-size="12" text-anchor="middle" font-weight="700">fact(1)</text><text x="252" y="179" font-size="11" opacity=".85">→ 1</text><text x="180" y="212" font-size="9.5" text-anchor="middle" opacity=".7">caso base</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Ogni chiamata resta in attesa sullo <strong>stack</strong> finché la sotto-chiamata non le restituisce un risultato: le chiamate <em>scendono</em> fino al caso base <code>fact(1)</code>, poi <em>risalgono</em> srotolandosi (1, poi 2, poi 6).</figcaption>
</figure>

La ricorsione è spesso il modo più naturale di descrivere problemi e strutture *auto-simili* (alberi, file system, algoritmi divide-et-impera). Non è però gratis: ogni chiamata occupa spazio sullo stack, e se una chiamata ne genera più d'una il costo può esplodere.

> [!tip]
> Quando ogni chiamata ne fa **più di una**, le chiamate formano un *albero* che si allarga: è il caso del Fibonacci ingenuo (`fib(n-1) + fib(n-2)`), la cui ricorsione ramificata costa **O(2ⁿ)** — vedi [Big O notation](docs/complessita-algoritmi.md?id=big-o-notation). Molte ricorsioni si possono riscrivere in forma **iterativa** (con un ciclo) quando lo stack o le prestazioni diventano un problema.
