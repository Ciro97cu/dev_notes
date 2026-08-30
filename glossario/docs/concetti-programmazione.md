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

Il tratto che lo definisce è il **verso**: un side effect *agisce verso l'esterno* — la funzione cambia o aziona qualcosa oltre al valore che restituisce (stampa, disegna, salva, invia, muta uno stato condiviso). Non basta «usare» qualcosa di esterno: contano le azioni che lasciano una **traccia** fuori, tracce che due chiamate identiche accumulano invece di ripetere. È questo agire sul mondo a rendere il codice meno prevedibile e più difficile da testare.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 280" role="img" aria-label="Una funzione pura trasforma solo argomenti in valore (frecce orizzontali); ogni collegamento verticale col mondo esterno — console, DOM, canvas, rete, storage, librerie — è un side effect" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="240" y="120" width="120" height="48" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="300" y="149" font-size="13" text-anchor="middle" font-weight="700">funzione</text><path d="M40 144 L232 144" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M240 144 L230 139 L230 149 Z" fill="currentColor"/><text x="120" y="136" font-size="10" text-anchor="middle" opacity=".8">argomenti</text><path d="M360 144 L552 144" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M560 144 L550 139 L550 149 Z" fill="currentColor"/><text x="468" y="136" font-size="10" text-anchor="middle" opacity=".8">valore restituito</text><g stroke="var(--link,#78716c)" stroke-width="1.4" stroke-dasharray="4 3" fill="none"><path d="M262 120 L150 60"/><path d="M300 120 L300 60"/><path d="M338 120 L450 60"/><path d="M262 168 L150 220"/><path d="M300 168 L300 220"/><path d="M338 168 L450 220"/></g><g font-size="10.5" text-anchor="middle"><rect x="106" y="34" width="88" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="150" y="51">console</text><rect x="272" y="34" width="56" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="51">DOM</text><rect x="406" y="34" width="88" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="450" y="51">canvas</text><rect x="104" y="220" width="92" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="150" y="237">rete</text><rect x="248" y="220" width="104" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="237">localStorage</text><rect x="402" y="220" width="96" height="26" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="450" y="237">libreria</text></g><text x="300" y="264" font-size="9.5" text-anchor="middle" opacity=".6">i collegamenti tratteggiati verso l'esterno = side effect</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Una funzione <strong>pura</strong> vive sulle sole frecce orizzontali: <em>argomenti → valore</em>. Ogni collegamento <strong>verticale</strong> col mondo esterno — scrivere in <code>console</code>, toccare il <code>DOM</code>, disegnare su <code>canvas</code>, la rete, lo storage, una libreria — è un <strong>side effect</strong>.</figcaption>
</figure>

### I tipi di side effect

I side effect più comuni, ciascuno con un esempio. Sono tutti azioni verso l'esterno: cambia solo *che cosa* toccano.

- **Logging / console** — scrivere messaggi diagnostici. `console.log(x)` non cambia il risultato, ma produce output osservabile.
- **DOM** — leggere o modificare la pagina: `el.textContent = "ciao"`, `document.title = "…"`, `element.addEventListener(...)`. Il caso più comune nel frontend.
- **Canvas / disegno** — dipingere su una superficie grafica: `ctx.fillRect(0, 0, 100, 100)`.
- **Rete / I/O** — parlare con l'esterno: `fetch("/api/dati")`, una richiesta HTTP, la lettura di un file.
- **Storage / persistenza** — salvare fuori dalla memoria volatile: `localStorage.setItem("tema", "scuro")`, un cookie, la scrittura su disco.
- **Librerie di terze parti** — chiamare codice che a sua volta fa effetti: `toast.success("Salvato")`, `analytics.track("click")`, una mappa o un SDK di pagamento.
- **Timer / scheduling** — programmare lavoro futuro: `setTimeout(fn, 1000)`, `setInterval(...)`.
- **Mutare stato esterno o condiviso** — cambiare qualcosa che vive **fuori** dalla funzione: una variabile del modulo, un campo di un oggetto globale, o l'oggetto ricevuto come argomento.

Quest'ultimo è il caso più insidioso: l'oggetto passato come argomento è **condiviso** col chiamante (per via del [riferimento](docs/memoria.md?id=referenza-e-puntatore)), così modificarlo cambia qualcosa fuori dalla funzione anche quando sembra solo un calcolo locale.

```js
// muta l'argomento: l'oggetto è del chiamante, la modifica "esce" dalla funzione
function aggiungiIva(ordine) {
  ordine.totale *= 1.22;      // ⚠️ side effect: cambia l'oggetto ricevuto (condiviso)
  return ordine.totale;
}
// puro: non tocca l'input, restituisce un valore nuovo
const conIva = (totale) => totale * 1.22;
```

### Leggere stato esterno non è un side effect

Dipendere da uno stato esterno che cambia — l'orologio (`Date.now()`, `new Date()`), un numero casuale (`Math.random()`), una variabile globale — rende la funzione **impura**, ma non è un side effect. Non c'è nessuna azione *verso l'esterno*: è una **lettura** non deterministica, che viola l'altra condizione della [funzione pura](docs/concetti-programmazione.md?id=funzione-pura) (stesso input, stesso output).

Il discrimine è la **sorgente** del dato. Leggere una proprietà e ramificare su di essa resta puro calcolo *se il dato arriva come argomento*; diventa non deterministico solo quando è la funzione stessa a procurarselo da una sorgente che varia:

```js
// PURA: la data arriva come argomento → stesso input, stesso output
function tariffa(prezzo, data) {
  return data.getDay() === 0 ? prezzo * 1.2 : prezzo;        // domenica +20%: solo un calcolo
}

// IMPURA (non deterministica): è la funzione a leggere l'orologio
function tariffaOggi(prezzo) {
  return new Date().getDay() === 0 ? prezzo * 1.2 : prezzo;  // dipende dal giorno in cui gira
}
```

La cura è la stessa dei side effect: far **entrare** il dato variabile (la data, il numero casuale) come argomento, così il nucleo resta puro e la lettura dell'orologio vive al bordo.

### Non eliminarli: isolarli ai bordi

Un programma del tutto privo di side effect non farebbe nulla di osservabile: non mostrerebbe niente sullo schermo, non salverebbe, non risponderebbe in rete. Gli effetti non sono un difetto da eliminare, sono *lo scopo*. La strada non è evitarli ma **isolarli ai bordi**: al centro un **nucleo puro** (logica e calcoli, prevedibile e testabile), attorno un **guscio** sottile che parla col mondo.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 540 210" role="img" aria-label="Funzione core / imperative shell: un nucleo puro al centro fa solo calcoli, un guscio esterno esegue i side effect; i dati entrano, gli effetti escono" style="width:100%;max-width:540px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="92" y="46" width="356" height="120" rx="14" fill="var(--link,#78716c)" fill-opacity=".07" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="270" y="66" font-size="10.5" text-anchor="middle" opacity=".8">guscio: i side effect (DOM · rete · storage · console)</text><rect x="196" y="82" width="148" height="66" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="270" y="112" font-size="12.5" text-anchor="middle" font-weight="700">nucleo puro</text><text x="270" y="130" font-size="9.5" text-anchor="middle" opacity=".7">solo calcoli · testabile</text><path d="M20 106 L84 106" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M92 106 L82 101 L82 111 Z" fill="currentColor"/><text x="52" y="98" font-size="9.5" text-anchor="middle" opacity=".8">dati</text><path d="M456 106 L516 106" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M524 106 L514 101 L514 111 Z" fill="currentColor"/><text x="490" y="98" font-size="9.5" text-anchor="middle" opacity=".8">effetti</text><path d="M150 116 L192 116" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M196 116 L188 112 L188 120 Z" fill="currentColor"/><path d="M348 116 L390 116" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M394 116 L386 112 L386 120 Z" fill="currentColor"/><text x="270" y="180" font-size="9.5" text-anchor="middle" opacity=".6">i dati grezzi entrano · il nucleo calcola · il guscio esegue gli effetti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il pattern «<em>functional core, imperative shell</em>»: la logica pura al centro, gli effetti spinti sul bordo. È l'idea dietro l'«ultimo miglio» (il punto dove i dati escono verso la UI, la console o lo storage), gli <strong>Effects</strong> di NgRx e l'<code>effect()</code> di Angular, tutti pensati per <em>tenere gli effetti separati</em> dalla logica.</figcaption>
</figure>

> [!tip]
> Per riconoscere un side effect: «se cancello questa riga, cambia qualcosa di *osservabile* oltre al valore restituito — uno schermo, un file, la console, un'altra variabile?». Se sì, è un effetto. Domanda diversa, per la purezza: «l'output dipende da qualcosa che può cambiare *fuori* dagli argomenti — l'ora, un random, una globale?». Se sì la funzione è impura, ma per **non-determinismo** (una lettura), non per un side effect (una scrittura).

Questo tema ritorna in tutto il monorepo: gli [Effects di NgRx](docs/ngrx-classico.md) isolano gli effetti async dai reducer puri, l'`effect()` di <a href="../angular/#/concetti/effect" target="_blank" rel="noopener">Angular</a> serve solo per i side effect in reazione ai signal, e il [tree-shaking](docs/moduli-e-bundling.md?id=tree-shaking) può scartare un modulo inutilizzato **solo se** è privo di side effect all'import.

## Immutabilità

L'immutabilità è il principio per cui un oggetto, una volta creato, **non viene modificato**: invece di alterarlo, si crea un **nuovo** oggetto con le modifiche desiderate.

```js
// invece di mutare:  stato.nome = 'nuovo'
const nuovoStato = { ...stato, nome: 'nuovo' }; // nuovo riferimento
```

Rende lo stato prevedibile e abilita confronti veloci per **riferimento** (*shallow comparison*): se il riferimento è cambiato, lo stato è cambiato — senza ispezionare ogni proprietà. È il motivo per cui librerie come Redux/NgRx richiedono un nuovo oggetto a ogni aggiornamento.

> [!tip]
> Nel contesto Angular/signals questo tema è approfondito nel concetto <a href="../angular/#/concetti/equality-immutability" target="_blank" rel="noopener">equality-immutability</a>.
