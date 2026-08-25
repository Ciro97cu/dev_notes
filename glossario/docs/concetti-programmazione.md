# Concetti di programmazione

Concetti trasversali, non legati a un linguaggio o framework specifico.

## Costrutto

Un **costrutto** (in inglese *construct*) è un **elemento di base che un linguaggio di programmazione mette a disposizione** per scrivere codice: una variabile, una funzione, una classe, un'interfaccia, un ciclo, una condizione, una keyword, un tipo. È, in sostanza, un "mattone" del linguaggio — un pezzo del suo vocabolario e della sua grammatica con cui si costruisce un programma. Quando in questi appunti si parla dei "costrutti pubblici" di un modulo, si intendono le funzioni, le classi, le costanti e i tipi che quel modulo espone.

> [!tip]
> Da non confondere con il **costruttore** (*constructor*): quello è il metodo speciale che inizializza una nuova istanza di una classe — un costrutto *particolare*, non il termine generico.

## Interoperabilità

L'interoperabilità è la capacità di sistemi, dispositivi o programmi diversi di **lavorare insieme** scambiando dati o servizi, tipicamente appoggiandosi a standard o protocolli comuni. Componenti interoperabili comunicano e collaborano senza attriti anche se sviluppati da parti diverse o con tecnologie diverse (es. un client JavaScript e un backend Java che dialogano via JSON su HTTP).

## API

**API** (*Application Programming Interface*) — la parola che conta è **interface**: un'API è il **contratto** con cui si usa un pezzo di software senza sapere com'è fatto dentro. In concreto è l'insieme di "maniglie" (funzioni, oggetti, metodi, proprietà) che quel software **espone** perché altro codice lo possa usare, tenendo nascosta l'implementazione.

Chi arriva dal frontend tende a identificare "API" con il solo caso *web/HTTP*, l'intermediario tra frontend e backend. È però soltanto **una** delle sue forme: si usano decine di API ogni giorno senza chiamarle così — `document.querySelector()`, `[1, 2, 3].map()` e `localStorage.setItem()` sono API esattamente come `fetch()`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 590 224" role="img" aria-label="API a scale diverse: in alto un'API locale (in-processo, come Temporal o Array) chiamata con un metodo; in basso un'API remota di rete (FE verso BE, come REST) chiamata con una richiesta HTTP" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="295" y="18" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">API: lo stesso contratto, a scale diverse</text><text x="104" y="44" font-size="10" text-anchor="middle" font-weight="700" opacity=".9" fill="currentColor">API locale (in-processo)</text><rect x="40.0" y="56.0" width="128" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="104" y="82" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">il tuo codice</text><rect x="360.0" y="56.0" width="196" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="458" y="76" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">linguaggio o libreria</text><text x="458" y="91" font-size="9" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">stessa macchina</text><path d="M168.0 78 L352.0 78" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M360.0 78 L352.0 73 L352.0 83 Z" fill="currentColor"/><text x="264.0" y="69" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">chiami un metodo</text><text x="458" y="116" font-size="9" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">es. Temporal · Array.map · JSON.parse</text><text x="104" y="132" font-size="10" text-anchor="middle" font-weight="700" opacity=".9" fill="currentColor">API remota (di rete) — es. FE ↔ BE</text><rect x="40.0" y="144.0" width="128" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="104" y="170" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">il tuo codice</text><rect x="360.0" y="144.0" width="196" height="44" rx="7" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="458" y="164" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">server</text><text x="458" y="179" font-size="9" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">altra macchina</text><path d="M168.0 166 L352.0 166" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M360.0 166 L352.0 161 L352.0 171 Z" fill="currentColor"/><text x="264.0" y="157" font-size="9.5" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor">mandi una richiesta (HTTP)</text><text x="458" y="204" font-size="9" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">es. REST · GraphQL · gRPC</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La stessa idea, un <strong>contratto</strong> per usare qualcosa senza conoscerne l'interno, vale a scale diverse. Il modello "API = frontend ↔ backend" è la riga in basso; ma la riga in alto (una libreria o il linguaggio, come <code>Temporal</code>) è un'API <em>esattamente allo stesso titolo</em>.</figcaption>
</figure>

Il senso di fondo resta sempre lo stesso, un contratto per usare qualcosa nascondendone l'interno; a cambiare sono la **scala** e il **mezzo**:

| Tipo di API | Dove vive | Esempi |
|---|---|---|
| **built-in / del linguaggio** | nel tuo stesso programma | `Temporal`, `Array.map`, `JSON`, `Math` |
| **di piattaforma / runtime** | te la offre l'ambiente | Web API (`fetch`, DOM, `localStorage`), Node |
| **di libreria** | codice di terzi che importi | React (`useState`), lodash, axios |
| **remota / di rete** | *un altro* programma, via rete | REST, GraphQL, gRPC (il modello FE ↔ BE) |

Le prime tre sono **in-processo** (una chiamata di funzione nella stessa macchina); l'ultima passa **per la rete** (una richiesta a un server lontano).

> [!tip]
> **API e namespace** non sono in contraddizione: descrivono aspetti diversi. Il **namespace** è il *contenitore di nomi* (`Temporal.*` fa da "cartella" che raggruppa i nomi correlati); l'**API** è l'*insieme di operazioni usabili* (i metodi con il loro contratto). `Temporal` è quindi un namespace che **espone** un'API — come una REST API vive a un URL base (il contenitore) ed espone degli *endpoint* (le operazioni).
> Questo tipo di *namespace* (un oggetto globale che fa da contenitore) è descritto in <a href="../javascript/#/docs/libro2/03-funzioni-blocchi" target="_blank" rel="noopener">Global namespaces</a> nel vault JS. Da non confondere con la keyword `namespace` di **TypeScript**, che è un costrutto (ormai legacy) del linguaggio, non un oggetto.

L'API web (con same-origin e CORS) è approfondita in [Web, browser e rete](docs/web-browser.md); `Temporal` come API del linguaggio è in <a href="../javascript/#/docs/moderno/es2026" target="_blank" rel="noopener">ES2026</a>. In TypeScript, inoltre, la keyword `interface` è la stessa idea di contratto, applicata però ai **tipi**.

## Funzione pura

Una funzione pura rispetta due condizioni:
1. **Stesso input, stesso output**: dato lo stesso argomento restituisce sempre lo stesso risultato.
2. **Nessun [side effect](docs/concetti-programmazione.md?id=side-effect)**: non modifica stato esterno e non dipende da stato esterno mutabile.

```js
// pura: dipende solo dagli argomenti, non tocca nulla fuori
const somma = (a, b) => a + b;

// impura: dipende da stato esterno e lo modifica
let totale = 0;
const aggiungi = (x) => { totale += x; };
```

La purezza rende il codice **prevedibile** e facile da testare (nessun contesto da simulare). È un pilastro della programmazione funzionale ed è alla base, ad esempio, dei *reducer* di Redux/NgRx.

## Side effect

Un **side effect** (*effetto collaterale*) è tutto ciò che una funzione fa **oltre** a calcolare e restituire un valore a partire dai suoi argomenti: una qualsiasi interazione **osservabile col mondo fuori** dalla funzione. È il complemento esatto della [funzione pura](docs/concetti-programmazione.md?id=funzione-pura): la funzione pura è una **scatola sigillata** — argomenti dentro, valore fuori, nient'altro — mentre un side effect è un «filo» che esce da quella scatola e tocca qualcosa all'esterno (lo schermo, la console, un file, la rete, un'altra variabile).

Il modo più utile per fissare il concetto è tenere separati i due movimenti. Una funzione ha un side effect se **scrive** verso l'esterno (cambia qualcosa fuori da sé: stampa, disegna, salva, invia, muta una variabile condivisa); ed è comunque impura se **legge** da uno stato esterno che può cambiare (l'ora, un numero casuale, una variabile globale), perché allora con gli stessi argomenti può dare risultati diversi. In sintesi: *toccare* o *dipendere da* qualcosa che sta fuori dalla coppia «argomenti → valore».

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 280" role="img" aria-label="Una funzione pura trasforma solo argomenti in valore (frecce orizzontali); ogni collegamento verticale col mondo esterno — console, DOM, canvas, rete, storage, librerie — è un side effect" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="240" y="120" width="120" height="48" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="300" y="149" font-size="13" text-anchor="middle" font-weight="700">funzione</text><path d="M40 144 L232 144" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M240 144 L230 139 L230 149 Z" fill="currentColor"/><text x="120" y="136" font-size="10" text-anchor="middle" opacity=".8">argomenti</text><path d="M360 144 L552 144" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M560 144 L550 139 L550 149 Z" fill="currentColor"/><text x="468" y="136" font-size="10" text-anchor="middle" opacity=".8">valore restituito</text><g stroke="var(--link,#78716c)" stroke-width="1.4" stroke-dasharray="4 3" fill="none"><path d="M262 120 L150 60"/><path d="M300 120 L300 60"/><path d="M338 120 L450 60"/><path d="M262 168 L150 220"/><path d="M300 168 L300 220"/><path d="M338 168 L450 220"/></g><g font-size="10.5" text-anchor="middle"><rect x="106" y="34" width="88" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="150" y="51">console</text><rect x="272" y="34" width="56" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="51">DOM</text><rect x="406" y="34" width="88" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="450" y="51">canvas</text><rect x="104" y="220" width="92" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="150" y="237">rete</text><rect x="248" y="220" width="104" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="237">localStorage</text><rect x="402" y="220" width="96" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="450" y="237">libreria</text></g><text x="300" y="264" font-size="9.5" text-anchor="middle" opacity=".6">i collegamenti tratteggiati verso l'esterno = side effect</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Una funzione <strong>pura</strong> vive sulle sole frecce orizzontali: <em>argomenti → valore</em>. Ogni collegamento <strong>verticale</strong> col mondo esterno — scrivere in <code>console</code>, toccare il <code>DOM</code>, disegnare su <code>canvas</code>, la rete, lo storage, una libreria — è un <strong>side effect</strong>.</figcaption>
</figure>

### I tipi di side effect

Sotto, i side effect che si incontrano più spesso, ciascuno con un esempio. Sono tutti «fili verso l'esterno»: cambia solo *cosa* toccano.

- **Logging / console** — scrivere messaggi diagnostici. `console.log(x)` non cambia il risultato, ma produce output osservabile.
- **DOM** — leggere o modificare la pagina: `el.textContent = "ciao"`, `document.title = "…"`, `element.addEventListener(...)`. Il caso più comune nel frontend.
- **Canvas / disegno** — dipingere su una superficie grafica: `ctx.fillRect(0, 0, 100, 100)`.
- **Rete / I/O** — parlare con l'esterno: `fetch("/api/dati")`, una richiesta HTTP, la lettura di un file.
- **Storage / persistenza** — salvare fuori dalla memoria volatile: `localStorage.setItem("tema", "scuro")`, un cookie, la scrittura su disco.
- **Librerie di terze parti** — chiamare codice che a sua volta fa effetti: `toast.success("Salvato")`, `analytics.track("click")`, una mappa o un SDK di pagamento.
- **Timer / scheduling** — programmare lavoro futuro: `setTimeout(fn, 1000)`, `setInterval(...)`.
- **Mutare stato esterno o condiviso** — cambiare qualcosa che vive **fuori** dalla funzione: una variabile del modulo, oppure — insidia classica — **mutare l'oggetto ricevuto come argomento** (che è condiviso col chiamante, per via del [riferimento](docs/concetti-programmazione.md?id=referenza-e-puntatore)).
- **Tempo e casualità** — `Date.now()`, `Math.random()`: qui l'effetto è in *lettura*. La funzione non cambia nulla fuori, ma **dipende** da una sorgente esterna che varia, quindi con gli stessi argomenti restituisce valori diversi (non è più pura).

I due casi più subdoli meritano il codice affiancato, perché sembrano innocui:

```js
// Mutare l'argomento: sembra "solo calcolare il totale", ma tocca l'oggetto del chiamante
function aggiungiIva(ordine) {
  ordine.totale *= 1.22;      // ⚠️ side effect: muta l'oggetto ricevuto (condiviso)
  return ordine.totale;
}
// puro: non tocca l'input, restituisce un valore nuovo
const conIva = (totale) => totale * 1.22;

// Dipendere dal tempo/random: stesso input, output diverso → impura
const scontoImpuro = (p) => p * (Math.random() < .5 ? 0.9 : 1);   // imprevedibile
const sconto = (p, applica) => applica ? p * 0.9 : p;             // il "caso" entra come argomento
```

### Non eliminarli: isolarli ai bordi

Qui sta il punto che rovescia l'intuizione: **un programma senza side effect non fa nulla di osservabile** — non potrebbe mostrare niente sullo schermo, salvare, o rispondere in rete. Gli effetti non sono il male da estirpare, sono *lo scopo*. La strategia buona non è evitarli ma **isolarli ai bordi**: tenere al centro un **nucleo puro** (la logica, i calcoli — prevedibile e facile da testare) e confinare gli effetti in un **guscio** sottile che parla col mondo.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 210" role="img" aria-label="Funzione core / imperative shell: un nucleo puro al centro fa solo calcoli, un guscio esterno esegue i side effect; i dati entrano, gli effetti escono" style="width:100%;max-width:540px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="92" y="46" width="356" height="120" rx="14" fill="var(--link,#78716c)" fill-opacity=".07" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="270" y="66" font-size="10.5" text-anchor="middle" opacity=".8">guscio: i side effect (DOM · rete · storage · console)</text><rect x="196" y="82" width="148" height="66" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="270" y="112" font-size="12.5" text-anchor="middle" font-weight="700">nucleo puro</text><text x="270" y="130" font-size="9.5" text-anchor="middle" opacity=".7">solo calcoli · testabile</text><path d="M20 106 L84 106" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M92 106 L82 101 L82 111 Z" fill="currentColor"/><text x="52" y="98" font-size="9.5" text-anchor="middle" opacity=".8">dati</text><path d="M456 106 L516 106" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M524 106 L514 101 L514 111 Z" fill="currentColor"/><text x="490" y="98" font-size="9.5" text-anchor="middle" opacity=".8">effetti</text><path d="M150 116 L192 116" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M196 116 L188 112 L188 120 Z" fill="currentColor"/><path d="M348 116 L390 116" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M394 116 L386 112 L386 120 Z" fill="currentColor"/><text x="270" y="180" font-size="9.5" text-anchor="middle" opacity=".6">i dati grezzi entrano · il nucleo calcola · il guscio esegue gli effetti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il pattern «<em>functional core, imperative shell</em>»: la logica pura al centro, gli effetti spinti sul bordo. È l'idea dietro l'«ultimo miglio» (il punto dove i dati escono verso la UI, la console o lo storage), gli <strong>Effects</strong> di NgRx e l'<code>effect()</code> di Angular, tutti pensati per <em>tenere gli effetti separati</em> dalla logica.</figcaption>
</figure>

> [!tip]
> Per riconoscere un side effect, due domande. **In scrittura**: «se cancello questa riga, cambia qualcosa di *osservabile* oltre al valore restituito — uno schermo, un file, la console, un'altra variabile?». **In lettura**: «l'output dipende da qualcosa che può cambiare *fuori* dagli argomenti — l'ora, un random, una variabile globale?». Un «sì» a una delle due significa che c'è un effetto.

Questo tema ritorna in tutto il monorepo: gli [Effects di NgRx](docs/approcci-classici.md) isolano gli effetti async dai reducer puri, l'`effect()` di <a href="../angular/#/concetti/effect" target="_blank" rel="noopener">Angular</a> serve solo per i side effect in reazione ai signal, e il [tree-shaking](docs/tooling-javascript.md?id=tree-shaking) può scartare un modulo inutilizzato **solo se** è privo di side effect all'import.

## Immutabilità

L'immutabilità è il principio per cui un oggetto, una volta creato, **non viene modificato**: invece di alterarlo, si crea un **nuovo** oggetto con le modifiche desiderate.

```js
// invece di mutare:  stato.nome = 'nuovo'
const nuovoStato = { ...stato, nome: 'nuovo' }; // nuovo riferimento
```

Rende lo stato prevedibile e abilita confronti veloci per **riferimento** (*shallow comparison*): se il riferimento è cambiato, lo stato è cambiato — senza ispezionare ogni proprietà. È il motivo per cui librerie come Redux/NgRx richiedono un nuovo oggetto a ogni aggiornamento.

> [!tip]
> Nel contesto Angular/signals questo tema è approfondito nel concetto <a href="../angular/#/concetti/equality-immutability" target="_blank" rel="noopener">equality-immutability</a>.

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
> Quando ogni chiamata ne fa **più di una**, le chiamate formano un *albero* che si allarga: è il caso del Fibonacci ingenuo (`fib(n-1) + fib(n-2)`), la cui ricorsione ramificata costa **O(2ⁿ)** — vedi [Big O notation](docs/concetti-programmazione.md?id=big-o-notation). Molte ricorsioni si possono riscrivere in forma **iterativa** (con un ciclo) quando lo stack o le prestazioni diventano un problema.

## Memoria: stack e heap

Quando un programma è in esecuzione, i suoi dati vivono nella memoria di lavoro (la RAM). Non è però un magazzino indistinto: il runtime la organizza in due zone con regole di gestione opposte, lo **stack** e lo **heap**. Capire la differenza è il presupposto per capire davvero cosa succede quando si copia una variabile, si passa un argomento a una funzione o si crea un oggetto — il tema delle due voci che seguono.

Lo **stack** (letteralmente «pila») è la zona veloce e ordinata. Funziona in modo **LIFO** (*last in, first out*, l'ultimo che entra è il primo a uscire), come una pila di piatti da cui si aggiunge e si toglie solo dalla cima. A ogni chiamata di funzione il runtime vi impila un **frame** (o *record di attivazione*): un blocchetto che raccoglie i parametri, le variabili locali e l'indirizzo a cui tornare quando la funzione finisce. Appena la funzione restituisce, il suo frame viene tolto dalla cima e lo spazio è subito riutilizzabile. È per questo che lo stack è velocissimo — allocare significa solo spostare in avanti un indicatore — ma anche **piccolo e prefissato**: una ricorsione troppo profonda lo esaurisce, ed è lo *stack overflow* visto in [Ricorsione](docs/concetti-programmazione.md?id=ricorsione).

Lo **heap** (letteralmente «mucchio») è la zona ampia e disordinata dove vivono i dati la cui dimensione o durata non è nota in anticipo: gli **oggetti**, gli array, tutto ciò che può crescere o sopravvivere alla funzione che l'ha creato. Qui l'allocazione è flessibile ma più costosa, e la memoria non si libera da sola all'uscita da una funzione: va restituita in modo esplicito (in C con `free`) oppure da un raccoglitore automatico, la [garbage collection](docs/concetti-programmazione.md?id=garbage-collection) dei linguaggi gestiti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 580 236" role="img" aria-label="La memoria di un programma: a sinistra lo stack con il frame di una funzione (variabili primitive inline e un riferimento), a destra lo heap con l'oggetto puntato dal riferimento" style="width:100%;max-width:580px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="140" y="40" font-size="11.5" text-anchor="middle" font-weight="700">STACK</text><text x="140" y="55" font-size="8.5" text-anchor="middle" opacity=".7">veloce · LIFO · piccolo</text><text x="446" y="40" font-size="11.5" text-anchor="middle" font-weight="700">HEAP</text><text x="446" y="55" font-size="8.5" text-anchor="middle" opacity=".7">grande · allocazione dinamica</text><rect x="44" y="66" width="192" height="152" rx="8" fill="var(--link,#78716c)" fill-opacity=".06" stroke="currentColor" stroke-width="1" stroke-opacity=".35"/><text x="140" y="82" font-size="8.5" text-anchor="middle" opacity=".6">frame della funzione</text><rect x="60" y="90" width="160" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="72" y="109" font-size="10.5">eta</text><text x="208" y="109" font-size="11" text-anchor="end" font-weight="700">42</text><rect x="60" y="128" width="160" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="72" y="147" font-size="10.5">attivo</text><text x="208" y="147" font-size="11" text-anchor="end" font-weight="700">true</text><rect x="60" y="166" width="160" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="72" y="185" font-size="10.5">utente</text><circle cx="204" cy="181" r="4" fill="currentColor"/><path d="M204 181 L352 181" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M360 181 L350 176 L350 186 Z" fill="currentColor"/><text x="288" y="173" font-size="9" text-anchor="middle" opacity=".8">riferimento</text><rect x="360" y="152" width="176" height="58" rx="8" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="448" y="177" font-size="10.5" text-anchor="middle" font-weight="700">{ nome: "Ada",</text><text x="448" y="194" font-size="10" text-anchor="middle">eta: 42 }</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Ogni variabile vive nel <strong>frame</strong> della sua funzione, sullo <strong>stack</strong>. I valori <strong>primitivi</strong> (<code>eta</code>, <code>attivo</code>) stanno lì direttamente; una variabile che nomina un <strong>oggetto</strong> (<code>utente</code>) custodisce invece un <strong>riferimento</strong>, l'indirizzo dell'oggetto che vive nello <strong>heap</strong>.</figcaption>
</figure>

Il legame tra le due zone è il punto chiave. Una variabile vive sullo stack, dentro il frame della sua funzione; ma **cosa** contiene dipende dal tipo del valore. Un valore **primitivo** e di dimensione fissa (un numero, un booleano) sta direttamente nello slot sullo stack. Un **oggetto** sta invece nello heap, e sullo stack la variabile ne custodisce soltanto il **riferimento** — l'indirizzo dove ritrovarlo. È esattamente questa differenza a spiegare perché copiare un numero e copiare un oggetto danno risultati diversi.

> [!tip]
> Quella «stack per i primitivi, heap per gli oggetti» è la mappa concettuale corretta e utilissima, ma resta un **modello**: lo standard di JavaScript non impone dove metta le cose, e i motori reali ottimizzano (per esempio collocano sullo stack un oggetto che non «sfugge» a una funzione, o rappresentano i piccoli interi senza allocarli). La sostanza — primitivo copiato per valore, oggetto raggiunto per riferimento — vale comunque.

## Referenza e puntatore

Referenza e puntatore rispondono alla stessa esigenza: permettere a una variabile di **rimandare** a un valore che vive altrove nella memoria (tipicamente nello heap), invece di contenerlo direttamente. La differenza sta in **quanto** il linguaggio lascia vedere e manipolare quel rimando.

Un **puntatore** (*pointer*) è una variabile che contiene, in modo esplicito, un **indirizzo di memoria**: il «numero civico» della cella dove il valore si trova. È un concetto di basso livello, tipico di C e C++, dove l'indirizzo è un valore come un altro — lo si può leggere, stampare e persino usarci l'aritmetica (`p + 1` per spostarsi alla cella successiva). Per leggere o scrivere il valore puntato lo si **dereferenzia**.

```c
int eta = 42;    // una variabile normale
int *p = &eta;   // p contiene l'INDIRIZZO di eta  (& = "indirizzo di")
*p = 7;          // dereferenzia: scrive 7 nella cella puntata → ora eta vale 7
```

Il potere dei puntatori è anche il loro pericolo: un indirizzo sbagliato, un puntatore a memoria già liberata (*dangling pointer*) o mai inizializzata sono fonti classiche di crash e di falle di sicurezza.

Una **referenza** (o riferimento) è la stessa idea a un livello più alto e più sicuro: un **alias**, una «maniglia» verso un valore, in cui però l'indirizzo vero e proprio resta **nascosto**. Il linguaggio lo gestisce per conto del programmatore, che usa la variabile come se fosse il valore stesso e non può — di norma — né leggerne l'indirizzo né farci aritmetica. È il modello dei linguaggi **gestiti** come Java, C#, Python e JavaScript: quando in JS si dice che «gli oggetti si passano per riferimento» si intende proprio questo, ed è anche il motivo per cui in JS «non esistono puntatori» manipolabili.

La conseguenza pratica emerge quando si **copia** una variabile o la si **passa** a una funzione, ed è la radice di gran parte della confusione. Con un valore primitivo si copia **il valore**, e le due variabili diventano indipendenti. Con un oggetto si copia **il riferimento**, e le due variabili restano due nomi per lo **stesso** oggetto nello heap (fenomeno detto *aliasing*): una modifica fatta attraverso l'una è visibile attraverso l'altra.

```js
// primitivi → si copia il VALORE: b è indipendente da a
let a = 10;
let b = a;      // copia del valore
b = 99;
a;              // 10 — a non è cambiato

// oggetti → si copia il RIFERIMENTO: stesso oggetto, due nomi
const x = { n: 1 };
const y = x;    // copia del riferimento (aliasing)
y.n = 99;
x.n;            // 99 — x e y sono lo stesso oggetto
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 200" role="img" aria-label="A sinistra due primitivi copiati come valori indipendenti; a destra due variabili oggetto che copiano il riferimento e puntano allo stesso oggetto nello heap (aliasing)" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="150" y="28" font-size="11" text-anchor="middle" font-weight="700">Primitivi — copia del valore</text><text x="72" y="64" font-size="9" opacity=".7">a</text><rect x="66" y="70" width="80" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="106" y="98" font-size="14" text-anchor="middle" font-weight="700">10</text><text x="172" y="64" font-size="9" opacity=".7">b</text><rect x="166" y="70" width="80" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="206" y="98" font-size="14" text-anchor="middle" font-weight="700">99</text><text x="150" y="140" font-size="8.5" text-anchor="middle" opacity=".7">due caselle indipendenti</text><line x1="300" y1="34" x2="300" y2="176" stroke="currentColor" stroke-width="1" stroke-opacity=".25"/><text x="452" y="28" font-size="11" text-anchor="middle" font-weight="700">Oggetti — copia del riferimento</text><rect x="336" y="60" width="72" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="348" y="79" font-size="10.5">x</text><circle cx="392" cy="75" r="3.5" fill="currentColor"/><rect x="336" y="104" width="72" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="348" y="123" font-size="10.5">y</text><circle cx="392" cy="119" r="3.5" fill="currentColor"/><path d="M392 75 L482 97" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M392 119 L482 97" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M490 97 L480 91 L480 103 Z" fill="currentColor"/><rect x="490" y="74" width="96" height="46" rx="8" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="538" y="101" font-size="11.5" text-anchor="middle" font-weight="700">{ n: 99 }</text><text x="452" y="152" font-size="8.5" text-anchor="middle" opacity=".7">un solo oggetto, due nomi (aliasing)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">A sinistra, <code>b = a</code> copia il <strong>valore</strong>: cambiare <code>b</code> non tocca <code>a</code>. A destra, <code>y = x</code> copia il <strong>riferimento</strong>: <code>x</code> e <code>y</code> puntano allo stesso oggetto, quindi <code>y.n = 99</code> si vede anche da <code>x</code>.</figcaption>
</figure>

> [!tip]
> Si sente spesso dire che «in JavaScript gli oggetti si passano per riferimento». A rigore ciò che viene copiato è **il riferimento stesso** (un valore-indirizzo), non l'oggetto: i due nomi finiscono sullo stesso oggetto, ma **riassegnare** uno dei due (`y = { n: 0 }`) lo fa puntare altrove e non tocca l'altro. Alcuni chiamano questo modello *call by sharing*. Per JavaScript il tema è approfondito in <a href="../javascript/#/docs/libro4/02-valori" target="_blank" rel="noopener">Value vs Reference</a>.

L'idea di «puntatore» ritorna, con lo stesso spirito ma in tutt'altro dominio, in **Git**: `HEAD`, i branch e i tag sono nomi che **puntano** a un commit, e un commit a sua volta punta al proprio genitore e al proprio *tree*. È indirezione allo stato puro — un nome che rimanda a qualcos'altro — come si vede in <a href="../git/#/12-interni-git" target="_blank" rel="noopener">Gli interni di Git</a>.

## Garbage collection

La **garbage collection** (GC, «raccolta dei rifiuti») è la gestione **automatica** della memoria: il runtime individua gli oggetti nello heap che il programma non può più usare e ne libera lo spazio, senza che il programmatore debba farlo a mano. È la norma nei linguaggi **gestiti** (JavaScript, Java, C#, Go, Python), in contrapposizione alla gestione **manuale** di C/C++ (`malloc`/`free`), dove dimenticare di liberare la memoria produce un *memory leak* e liberarla due volte o troppo presto manda in crash il programma.

Il criterio con cui il collector decide cosa è «spazzatura» è la **raggiungibilità** (*reachability*). Esiste un insieme di **radici** (*roots*) — le variabili globali e tutto ciò che è raggiungibile dallo stack delle chiamate in corso — vive per definizione. Un oggetto è vivo se, partendo dalle radici e seguendo i riferimenti, lo si può **raggiungere**; se nessun cammino di riferimenti conduce a esso, è irraggiungibile, il programma non ha più modo di nominarlo, e il suo spazio si può recuperare.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 250" role="img" aria-label="Raggiungibilità: dalle radici si raggiungono gli oggetti vivi A, B, C (tratto pieno); gli oggetti D ed E formano un ciclo irraggiungibile dalle radici e vengono raccolti (tratteggiati)" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="196" y="22" width="128" height="38" rx="8" fill="var(--link,#78716c)" fill-opacity=".14" stroke="currentColor" stroke-width="1.6"/><text x="260" y="40" font-size="11" text-anchor="middle" font-weight="700">radici</text><text x="260" y="53" font-size="8" text-anchor="middle" opacity=".7">globali · stack</text><rect x="96" y="112" width="60" height="40" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="126" y="137" font-size="12" text-anchor="middle" font-weight="700">A</text><rect x="96" y="188" width="60" height="40" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="126" y="213" font-size="12" text-anchor="middle" font-weight="700">B</text><rect x="230" y="120" width="60" height="40" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="260" y="145" font-size="12" text-anchor="middle" font-weight="700">C</text><path d="M226 62 L146 108" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M140 111 L151 110 L147 100 Z" fill="currentColor"/><path d="M126 152 L126 184" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M126 190 L121 180 L131 180 Z" fill="currentColor"/><path d="M260 60 L260 116" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M260 122 L255 112 L265 112 Z" fill="currentColor"/><text x="150" y="248" font-size="9" text-anchor="middle" opacity=".75">vivi (raggiungibili)</text><rect x="392" y="112" width="60" height="40" rx="7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity=".55"/><text x="422" y="137" font-size="12" text-anchor="middle" font-weight="700" opacity=".55">D</text><rect x="392" y="188" width="60" height="40" rx="7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity=".55"/><text x="422" y="213" font-size="12" text-anchor="middle" font-weight="700" opacity=".55">E</text><path d="M414 152 L414 186" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity=".55"/><path d="M414 190 L409 180 L419 180 Z" fill="currentColor" opacity=".55"/><path d="M430 186 L430 154" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity=".55"/><path d="M430 150 L425 160 L435 160 Z" fill="currentColor" opacity=".55"/><text x="422" y="248" font-size="9" text-anchor="middle" opacity=".55">spazzatura (irraggiungibile)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un oggetto è <strong>vivo</strong> se lo si raggiunge dalle <strong>radici</strong> seguendo i riferimenti (<code>A</code>, <code>B</code>, <code>C</code>). <code>D</code> ed <code>E</code> si riferiscono a vicenda ma nessuna radice li raggiunge: il loro <strong>ciclo</strong> tiene ciascun contatore a uno, perciò sfugge al <em>reference counting</em>, mentre il <em>mark-and-sweep</em> li riconosce irraggiungibili e li raccoglie.</figcaption>
</figure>

Due famiglie di algoritmi realizzano questa idea. Il **conteggio dei riferimenti** (*reference counting*) tiene per ogni oggetto un contatore di quanti riferimenti puntano a esso e lo libera appena scende a zero; è semplice e immediato, ma da solo **non libera i cicli** — due oggetti che si riferiscono a vicenda si tengono il contatore a uno anche quando nessuno li raggiunge più dall'esterno. Il **mark-and-sweep** (GC *tracing*) evita il problema: periodicamente parte dalle radici, **marca** tutto ciò che raggiunge e poi **spazza via** tutto il resto, cicli irraggiungibili inclusi. È l'approccio dei motori JavaScript moderni, che lo affinano con una strategia **generazionale** (*generational*): poiché la maggior parte degli oggetti «muore giovane», si ispeziona molto spesso la generazione dei nuovi e di rado quella dei sopravvissuti.

Due implicazioni pratiche. La prima: la GC è **non deterministica**, non si sa **quando** scatterà, quindi non ci si può affidare al suo tempismo per rilasciare risorse esterne come file o connessioni — per quelle servono meccanismi espliciti. La seconda: la GC **non elimina i memory leak**, ne cambia la forma. In un linguaggio gestito un leak è un riferimento **involontario** che tiene vivo un oggetto ormai inutile — un listener mai rimosso, una cache che cresce senza limite, una closure che cattura più del dovuto. Proprio per questi casi JavaScript offre i **riferimenti deboli** (`WeakMap`, `WeakSet`, `WeakRef`), che rimandano a un oggetto **senza** impedirne la raccolta, approfonditi in <a href="../javascript/#/docs/moderno/es2021" target="_blank" rel="noopener">ES2021</a>.

> [!tip]
> Non tutti i linguaggi scelgono tra gestione manuale e garbage collector. **Rust** introduce un terzo modello, l'*ownership* con verifica a tempo di **compilazione**: la memoria viene liberata in modo deterministico quando il suo proprietario esce di scope, senza né `free` a mano né un collector a runtime.

## SOLID

Cinque principi di design per il codice **object-oriented** (raccolti da Robert C. Martin) per renderlo più manutenibile, estensibile e testabile:

- **S — Single Responsibility**: una classe ha **una sola responsabilità**, cioè un solo motivo per cambiare. Invece di accorpare tutto in `class User { save() {} sendEmail() {} }`, si separano le responsabilità in `User`, `UserRepository` (persistenza) e `Mailer` (invio).
- **O — Open/Closed**: aperta all'**estensione**, chiusa alla **modifica**, cioè si aggiunge comportamento senza riscrivere quello esistente. Invece di uno switch come `if (s.tipo === 'cerchio') … else if (s.tipo === 'quadrato') …`, conviene che ogni forma implementi `area()`, così una forma nuova si aggiunge senza toccare il codice esistente.
- **L — Liskov Substitution**: un sottotipo deve poter **sostituire** il tipo base senza rompere la correttezza del programma. Un `class Penguin extends Bird { fly() { throw } }` viola il principio, perché conviene non ereditare `fly()` quando il pinguino non vola.
- **I — Interface Segregation**: meglio interfacce **piccole e mirate** che una grande e generica, perché un client non deve dipendere da metodi che non usa. Invece di un'unica `interface Machine { print(); scan(); fax(); }`, si separano `Printer`, `Scanner` e `Fax`.
- **D — Dependency Inversion**: dipendere da **astrazioni**, non da implementazioni concrete, con alto e basso livello che dipendono entrambi da un'interfaccia. È il principio dietro la **dependency injection**: invece di istanziare `new EmailSender()` dentro la classe, si inietta il servizio con un `constructor(sender: MessageSender)`.

Sono linee guida, non dogmi: si applicano dove riducono davvero la complessità.

## DRY (Don't Repeat Yourself)

Ogni pezzo di **conoscenza** (una regola di business, una formula, una decisione) dovrebbe avere **una sola rappresentazione autorevole** nel sistema (Hunt & Thomas, *The Pragmatic Programmer*). In pratica niente logica duplicata copia-incollata: la si estrae in una funzione o in un modulo, così una modifica si fa in **un punto solo**.

```js
// prima ❌ — l'aliquota "1.22" ripetuta: per cambiarla va rincorsa ovunque
const totaleCarrello = prezzo * 1.22;
const totaleFattura  = imponibile * 1.22;

// dopo ✅ — una sola fonte di verità: la si cambia in un punto solo
const IVA = 0.22;
const conIva = (n) => n * (1 + IVA);
const totaleCarrello = conIva(prezzo);
const totaleFattura  = conIva(imponibile);
```

> [!warning]
> DRY riguarda la duplicazione di **conoscenza**, non di semplice testo. Unificare a forza due frammenti che *sembrano* uguali ma cambiano per ragioni diverse crea accoppiamento dannoso: a volte "un po' di duplicazione costa meno dell'astrazione sbagliata". Utile la **rule of three**: si astrae alla terza ripetizione, non alla prima.

## KISS (Keep It Simple, Stupid)

La soluzione più semplice che risolve il problema è quasi sempre la migliore: meno parti, meno astrazioni premature, meno "intelligenza" nascosta. Il codice semplice si legge, si corregge e si cambia con meno fatica. Complicare in previsione di scenari ipotetici è tra le cause più comuni di codice fragile: prima si fa funzionare la cosa semplice, poi la si evolve solo se serve.

## YAGNI (You Aren't Gonna Need It)

Non si costruisce una funzionalità finché non serve davvero. Aggiungere opzioni di configurazione, generalizzazioni o livelli di astrazione "perché un giorno potrebbero servire" produce codice non usato che va comunque mantenuto, testato e compreso. Si implementa ciò che il requisito attuale richiede; l'estensione arriva quando il bisogno è concreto. È il complemento di KISS applicato alle *feature*.

## Separation of Concerns (SoC)

Ogni parte del sistema si occupa di **una** preoccupazione ben delimitata, il più possibile indipendente dalle altre: presentazione, logica di business e accesso ai dati separati; nel web, la struttura (HTML), l'aspetto (CSS) e il comportamento (JS). Separare permette di capire e modificare ogni parte in isolamento e riduce l'effetto domino di una modifica. È il principio dietro l'architettura a livelli e, alla scala della singola classe, coincide con la **Single Responsibility** di SOLID.

## Composition over Inheritance

Per riusare comportamento, comporre oggetti piccoli e focalizzati è di norma preferibile a ereditare da una gerarchia di classi. L'ereditarietà lega rigidamente il figlio al genitore (relazione "è un") e diventa fragile quando la gerarchia cresce o quando servono combinazioni di capacità. La composizione assembla invece capacità indipendenti (relazione "ha un" / "sa fare") che si combinano liberamente.

```js
// ereditarietà: rigida, e le combinazioni esplodono in sottoclassi
class AnatraCheNuotaEVola extends Animale { /* … */ }

// composizione: capacità indipendenti, assemblate al bisogno
const anatra = { ...saNuotare(), ...saVolare() };
```

È lo spirito di diversi design pattern (Strategy, Decorator) e il motivo per cui i framework moderni preferiscono comporre (hook, funzioni, servizi iniettati) invece di gerarchie di classi profonde.

## Design pattern

Un **design pattern** è una soluzione collaudata a un problema **ricorrente** di progettazione del software: non un pezzo di codice da copiare, ma uno *schema* riutilizzabile che descrive come organizzare classi e oggetti per risolvere quel problema. Il riferimento storico è il libro della **Gang of Four** (GoF, 1994), che ne cataloga 23 in tre famiglie:

- **Creazionali** — riguardano *come si creano* gli oggetti (Singleton, Factory Method, Builder…).
- **Strutturali** — *come si compongono* in strutture più grandi (Adapter, Decorator, Facade…).
- **Comportamentali** — *come collaborano e si distribuiscono le responsabilità* (Observer, Strategy…).

> [!tip]
> Molti pattern GoF oggi sono "invisibili" perché **incorporati** nel linguaggio o nel framework: l'Iterator è il `for...of`, l'Observer sono gli event listener e i signal, la Strategy è spesso solo una funzione passata come argomento. Conoscerli serve comunque a **dare un nome** a soluzioni che già si usano — e a comunicarle con una parola sola.

Di seguito i pattern più comuni. Per ciascuno: l'idea in breve, un'analogia, il **problema** concreto che affronta (con il codice *prima*) e la **soluzione** che il pattern introduce (il codice *dopo*). Per il catalogo completo, con diagrammi ed esempi in più linguaggi, il riferimento è [refactoring.guru](https://refactoring.guru/design-patterns/catalog).

### Singleton *(creazionale)*

Garantisce che di una classe esista **una sola istanza** condivisa in tutta l'applicazione, con un punto di accesso unico a essa.

**Analogia**: il governo di uno Stato — ce n'è uno solo, e tutti sanno come raggiungerlo.

❗ **Il problema**: serve una singola configurazione condivisa, ma se ogni modulo fa `new Config()` si ottengono **copie scollegate**: una modifica su una non si riflette sulle altre.

```ts
// prima ❌ — ogni modulo crea la propria Config: copie divergenti
const a = new Config(); a.tema = "scuro";
const b = new Config();  // b non sa nulla di a → b.tema è ancora "chiaro"
```

**La soluzione**: è la classe stessa a custodire l'unica istanza e a restituirla sempre; il costruttore non si usa dall'esterno.

```ts
class Config {
  static #istanza: Config;        // l'unica istanza, privata
  tema = "chiaro";
  private constructor() {}        // vietato il `new` dall'esterno
  static get(): Config {
    return (Config.#istanza ??= new Config()); // creata una volta, poi riusata
  }
}

Config.get().tema = "scuro";
Config.get().tema; // "scuro" — è sempre lo stesso identico oggetto
```

⚠️ Oggi è spesso considerato un **anti-pattern**: è stato globale mascherato, accoppia tutto a `Config.get()` e complica i test (non si può sostituire con una versione finta). I framework moderni preferiscono la **dependency injection** — un servizio registrato una volta sola e **iniettato** dove serve (cioè la *Dependency Inversion* di SOLID). Esempio completo nel vault TypeScript: <a href="../typescript/#/docs/16-oop" target="_blank" rel="noopener">Programmazione a oggetti</a>.

### Factory Method *(creazionale)*

Sposta la **creazione** di un oggetto in un punto dedicato (una funzione o un metodo), così che il resto del codice (il **cliente**, cioè chi usa l'oggetto) lavori con un tipo astratto senza sapere quale classe concreta viene istanziata.

**Analogia**: si ordina "una pizza"; è la cucina a decidere come prepararla. Chi ordina non maneggia forni e impasti.

❗ **Il problema**: la scelta del tipo concreto è sparsa nel codice, ripetuta con `new` e `if` ovunque serva. Aggiungere un nuovo tipo obbliga a ritrovare e modificare tutti quei punti.

```ts
// prima ❌ — la stessa logica di scelta duplicata in ogni punto che crea un logger
if (cfg === "file") logger = new FileLogger();
else                logger = new ConsoleLogger();
// …più avanti, un altro punto ripete lo stesso if…
```

**La soluzione**: una sola fabbrica decide; il cliente chiede l'astrazione `Logger` e non sa (né gli importa) quale classe sia. Un tipo nuovo si aggiunge in un punto solo (rispetta *Open/Closed*).

```ts
interface Logger { log(m: string): void; }

function creaLogger(dove: "file" | "console"): Logger {
  return dove === "file" ? new FileLogger() : new ConsoleLogger();
}

const logger = creaLogger(cfg);
logger.log("avvio"); // il cliente parla solo con l'interfaccia Logger
```

Nella forma GoF piena la scelta è affidata a **sottoclassi** che ridefiniscono il metodo-fabbrica; la funzione qui sopra è la versione quotidiana (*simple factory*).

### Builder *(creazionale)*

Costruisce un oggetto complesso **un pezzo alla volta**, con metodi che si concatenano, invece di passare tutto a un unico costruttore.

**Analogia**: comporre un panino da asporto scegliendo un ingrediente per volta, invece di elencarli tutti in un'unica ordinazione.

❗ **Il problema**: un costruttore con molti parametri (spesso facoltativi) diventa illeggibile e fragile — non si capisce cosa sia cosa, e i valori "vuoti" vanno passati comunque, nell'ordine giusto.

```ts
// prima ❌ — cosa sono null, true, 30? e per saltarne uno bisogna comunque metterlo
new Query("utenti", ["nome"], "eta > 18", null, true, 30);
```

**La soluzione**: ogni opzione ha un metodo dal nome parlante; si impostano solo quelle che servono, in qualsiasi ordine, e si chiude con `build()`.

```ts
const query = new QueryBuilder()
  .from("utenti")
  .select("nome")
  .where("eta > 18")
  .build();            // le opzioni non impostate restano ai loro default
```

**Quando**: un oggetto ha molte parti facoltative o va assemblato in fasi.

### Adapter *(strutturale)*

Fa da **traduttore** tra due interfacce incompatibili: avvolge un oggetto ed espone i metodi che il **cliente** si aspetta, convertendo le chiamate verso quelli reali dell'oggetto avvolto.

**Analogia**: l'adattatore di viaggio tra la spina italiana e la presa inglese.

❗ **Il problema**: il proprio codice vorrebbe chiamare `paga(euro)`, ma la libreria di pagamento esterna espone `fai_pagamento(centesimi)`. Le firme non combaciano, e legarsi ovunque a quella della libreria significa dover cambiare tutto il codice se un domani si cambia fornitore.

```ts
// prima ❌ — il codice è "sposato" alla firma della libreria esterna, ovunque paga
gatewayEsterno.fai_pagamento(euro * 100);
```

**La soluzione**: un adapter incapsula la libreria ed espone l'interfaccia comoda `Pagamenti`; il resto del codice parla solo con l'adapter.

```ts
interface Pagamenti { paga(euro: number): void; }

class StripeAdapter implements Pagamenti {
  constructor(private esterno: VecchioGateway) {}
  paga(euro: number) {
    this.esterno.fai_pagamento(euro * 100); // traduce euro → centesimi
  }
}

const pagamenti: Pagamenti = new StripeAdapter(gateway);
pagamenti.paga(19.9); // per cambiare fornitore basta scrivere un altro adapter
```

### Decorator *(strutturale)*

Aggiunge funzionalità a un oggetto **avvolgendolo** in un altro che espone la **stessa interfaccia**: ogni strato aggiunge qualcosa e delega il resto all'oggetto che avvolge.

**Analogia**: vestirsi a strati — maglietta, poi maglione, poi giacca: ognuno aggiunge qualcosa e si può togliere in modo indipendente.

❗ **Il problema**: servono combinazioni di funzionalità opzionali — un flusso di dati che può essere compresso, cifrato, entrambi, in qualunque ordine. Con la sola ereditarietà servirebbe una sottoclasse per ogni combinazione: un'esplosione.

```ts
// prima ❌ — una sottoclasse per ogni combinazione possibile, ingestibile
class FlussoCompresso extends FileStream {}
class FlussoCifrato extends FileStream {}
class FlussoCompressoECifrato extends FileStream {} // …e tutte le altre
```

**La soluzione**: ogni funzionalità è un decoratore che avvolge un flusso ed è a sua volta un flusso (stessa interfaccia). Si impilano liberamente, in qualsiasi ordine.

```ts
let flusso: Flusso = new FileStream(file);
flusso = new Compressione(flusso); // strato 1
flusso = new Cifratura(flusso);    // strato 2 — sempre di tipo Flusso
flusso.scrivi(dati);               // cifra → comprime → scrive su file
```

È *composition over inheritance* in azione: capacità assemblate a strati invece di gerarchie rigide.

> [!warning]
> Da non confondere con i **decorator del linguaggio** (`@log`) di TypeScript/JavaScript: sono ispirati a questa idea ma sono una feature sintattica a sé. Vedi <a href="../typescript/#/docs/29-decorators" target="_blank" rel="noopener">Decorators</a> nel vault TypeScript.

### Facade *(strutturale)*

Offre un'**interfaccia unica e semplice** verso un sottosistema complesso, nascondendone le parti interne al **cliente**.

**Analogia**: il pulsante "avvia" di un'automobile — dietro c'è un sistema complicato, ma si preme un solo bottone.

❗ **Il problema**: per convertire un video il cliente dovrebbe conoscere e coordinare a mano decine di classi (codec, tracce audio, bitrate…), nell'ordine esatto. Troppa complessità esposta, e ogni cliente la ripete.

```ts
// prima ❌ — il cliente deve orchestrare tutto il sottosistema, passo per passo
const codec = CodecFactory.estrai(file);
const audio = new AudioMixer().sistema(file, codec);
const bitrate = new BitrateReader().leggi(file, codec);
// …altri dieci passaggi, in ordine preciso…
```

**La soluzione**: una facciata espone un solo metodo e orchestra il sottosistema al posto del cliente.

```ts
class VideoConverter {
  converti(file: File, formato: string): File {
    /* dietro le quinte: codec, audio, bitrate… nell'ordine giusto */
    return risultato;
  }
}

new VideoConverter().converti(file, "mp4"); // il cliente vede soltanto questo
```

### Observer *(comportamentale)*

Prima il gergo: il **subject** (il "soggetto osservato") è l'oggetto il cui stato cambia; gli **observer** (osservatori) sono gli oggetti interessati a quei cambiamenti. Il pattern: il subject tiene una lista di observer e, quando cambia, li **notifica** tutti — senza sapere chi siano né cosa faranno.

**Analogia**: un canale YouTube (il *subject*) e i suoi iscritti (gli *observer*). A ogni nuovo video tutti gli iscritti ricevono la notifica; il canale non conosce i singoli iscritti, si limita a "pubblicare".

❗ **Il problema**: quando un dato cambia, più parti dell'app devono aggiornarsi (un grafico, un contatore, un log). Se è il dato stesso a chiamarle una per una, resta **accoppiato** a tutte, e aggiungere un nuovo interessato costringe a modificarlo.

```ts
// prima ❌ — lo store conosce e chiama esplicitamente ogni interessato
class Store {
  set(v) {
    this.v = v;
    grafico.aggiorna(v);   // ← accoppiato al grafico
    contatore.aggiorna(v); // ← e al contatore
    logger.scrivi(v);      // ← e al logger… e a ogni nuovo arrivato
  }
}
```

**La soluzione**: gli interessati si **iscrivono** (subscribe) al subject; il subject li notifica in blocco senza conoscerli. Aggiungerne uno non tocca lo store.

```ts
class Store {
  #observers: ((v: number) => void)[] = [];        // la lista di osservatori
  subscribe(fn: (v: number) => void) { this.#observers.push(fn); }
  set(v: number) {
    this.v = v;
    this.#observers.forEach((notifica) => notifica(v)); // avvisa tutti
  }
}

const store = new Store();
store.subscribe((v) => grafico.aggiorna(v));   // ognuno si iscrive per conto suo
store.subscribe((v) => contatore.aggiorna(v));
store.set(42); // grafico e contatore si aggiornano da soli, lo store non li conosce
```

💡 È il modello dietro gli **event listener** del DOM (`addEventListener` = "iscrivi un observer a un evento"), gli **Observable** di RxJS e i **signal**/`effect` di Angular.

### Strategy *(comportamentale)*

Raccoglie **algoritmi intercambiabili** dietro una stessa interfaccia, così da poterli scegliere o sostituire a runtime, senza catene di `if/else` sparse.

**Analogia**: un navigatore che calcola il percorso "in auto", "a piedi" o "in bici": stessa richiesta, strategie diverse selezionabili.

❗ **Il problema**: una funzione decide il comportamento con un `if/else` che cresce a ogni nuovo caso; ogni aggiunta la ingrossa e rischia di romperla.

```ts
// prima ❌ — un ramo per ogni metodo di spedizione, tutti nella stessa funzione
function costo(peso, metodo) {
  if (metodo === "standard") return peso * 1.5;
  if (metodo === "express")  return peso * 3 + 5;
  if (metodo === "ritiro")   return 0;
  // …e la funzione si allarga a ogni novità
}
```

**La soluzione**: ogni algoritmo è una strategia a sé; si sceglie quella giusta e la si applica. Aggiungerne una non tocca le altre.

```ts
const strategie = {
  standard: (peso: number) => peso * 1.5,
  express:  (peso: number) => peso * 3 + 5,
  ritiro:   () => 0,
};
const costo = strategie[metodo](peso); // la strategia si sceglie a runtime
```

💡 In JavaScript/TypeScript una Strategy è spesso semplicemente una **funzione passata come argomento** (per esempio il comparatore di `Array.prototype.sort`).

### Gli altri pattern GoF

Per completare il catalogo, una riga a testa (dettaglio e diagrammi su [refactoring.guru](https://refactoring.guru/design-patterns/catalog)):

| Categoria | Pattern | In una riga |
|---|---|---|
| Creazionale | **Abstract Factory** | crea **famiglie** di oggetti correlati senza fissarne le classi concrete |
| Creazionale | **Prototype** | crea nuovi oggetti **clonando** un esemplare esistente |
| Strutturale | **Bridge** | separa un'astrazione dalla sua implementazione, così che varino in modo indipendente |
| Strutturale | **Composite** | tratta oggetti singoli e gruppi (strutture ad albero) in modo **uniforme** |
| Strutturale | **Flyweight** | condivide lo stato comune tra molti oggetti per **risparmiare memoria** |
| Strutturale | **Proxy** | un sostituto che controlla l'accesso a un oggetto (lazy loading, cache, permessi) |
| Comportamentale | **Chain of Responsibility** | passa una richiesta lungo una **catena** di gestori finché uno la gestisce |
| Comportamentale | **Command** | incapsula una richiesta come **oggetto** (abilita undo/redo, code, log) |
| Comportamentale | **Interpreter** | definisce una grammatica e come interpretarla, per piccoli linguaggi o espressioni |
| Comportamentale | **Iterator** | scorre gli elementi di una collezione senza esporne la struttura interna (→ `for...of`) |
| Comportamentale | **Mediator** | centralizza la comunicazione tra più oggetti in un unico **mediatore** |
| Comportamentale | **Memento** | cattura e ripristina lo **stato** interno di un oggetto (snapshot per l'undo) |
| Comportamentale | **State** | l'oggetto cambia comportamento al variare del suo **stato interno** |
| Comportamentale | **Template Method** | definisce lo **scheletro** di un algoritmo, lasciando alcuni passi alle sottoclassi |
| Comportamentale | **Visitor** | aggiunge operazioni a una struttura di oggetti **senza modificarne** le classi |
