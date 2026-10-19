# 07 · Strumenti di test

Un **test automatico** è un piccolo programma che mette in funzione un pezzo dell'applicazione in una situazione nota e controlla che il risultato sia quello atteso, segnalando l'errore quando non lo è. A trovare i test, eseguirli e riassumerne l'esito pensa un **test runner** (letteralmente «esecutore di test»), e quasi tutti i test runner dell'ecosistema frontend sono programmi Node: anche quando il codice da verificare è destinato al browser, e perfino quando i test pilotano un browser vero, a dirigere l'operazione c'è Node. Il capitolo parte dal perché dei test e dai loro tipi, scompone un test nelle sue parti e spiega le *controfigure* che prendono il posto delle dipendenze, poi passa in rassegna gli strumenti di oggi: il test runner integrato in Node, Vitest, Jest, Testing Library e Playwright, fino alla copertura del codice e alla scelta fra tutti questi.

## Perché automatizzare i test

Verificare a mano un'applicazione significa aprirla, cliccare, compilare moduli e guardare se tutto funziona. La prima volta va bene, ma il valore di un controllo sta nel ripeterlo **a ogni modifica**: è così che si scopre una **regressione**, cioè una funzionalità che prima andava e che una modifica in un'altra parte del codice ha rotto senza che nessuno se ne accorgesse. Ripetere a mano decine di verifiche a ogni cambiamento non è realistico; un test automatico le ripete tutte in pochi secondi, sempre nello stesso modo.

Ne derivano tre benefici concreti. Il primo è la libertà di **rifattorizzare**, cioè riorganizzare il codice senza cambiarne il comportamento: se i test restano verdi, il comportamento è rimasto quello. Il secondo è una forma di **documentazione** che non invecchia, perché un test descrive con un esempio eseguibile come deve comportarsi una funzione, e se il comportamento cambia il test se ne accorge. Il terzo è l'inserimento nella **pipeline di integrazione continua**, la sequenza di controlli che un server esegue a ogni `git push` (descritta nel <a href="../glossario/#/docs/ci-cd-pipeline" target="_blank" rel="noopener">glossario alla voce CI/CD</a>): un test runner che trova un errore termina con un codice d'uscita diverso da zero, e la pipeline si ferma prima che il codice difettoso arrivi agli utenti.

## Unit, integration, end-to-end

I test si distinguono soprattutto per **quanta parte del sistema mettono in gioco** in una volta sola. Un **test unitario** (*unit test*) verifica un'unità piccola e isolata, tipicamente una funzione o una classe, e ne sostituisce le dipendenze quando servono: è velocissimo e, quando fallisce, indica con precisione il punto rotto. Un **test di integrazione** (*integration test*) verifica che più unità funzionino **insieme**, per esempio un componente con il servizio da cui legge i dati, oppure un modulo che scrive davvero su disco: è più lento, ma più vicino all'uso reale. Un **test end-to-end** (*e2e*, «da un capo all'altro») avvia l'applicazione intera e la usa come farebbe una persona, in un browser vero: apre la pagina, compila un modulo, preme un pulsante e controlla che cosa compare. È il più realistico, ma anche il più lento, il più costoso da mantenere e il più esposto ai **test instabili** (*flaky*), quelli che a volte passano e a volte falliscono senza che il codice sia cambiato.

| Tipo | Che cosa mette in gioco | Durata tipica | Strumenti |
|---|---|---|---|
| unit | una funzione o una classe, con le dipendenze sostituite | millisecondi | `node:test`, Vitest, Jest |
| integration | più moduli insieme, spesso con il DOM | da millisecondi a qualche secondo | Vitest, Jest, Testing Library |
| end-to-end | l'applicazione intera in un browser | secondi | Playwright |

Quanti test scrivere di ciascun tipo è una questione di equilibrio, e due immagini classiche lo raccontano. La **piramide dei test**, introdotta da Mike Cohn e [ripresa da Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html), mette alla base molti test unitari, al centro meno test di integrazione e in cima pochi test end-to-end, secondo la regola che più si sale di livello, meno test si dovrebbero avere, perché quelli alti sono lenti e fragili. Il **trofeo dei test** proposto da [Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) sposta il baricentro. Aggiunge alla base un livello di controlli **statici**, quelli che trovano errori senza eseguire il codice, come il type checker di TypeScript e il linter (trattati nei capitoli [[04-varianti-di-javascript|04]] e [[05-linter-e-formatter|05]]), e allarga il livello di **integrazione**, riassumendo la ricetta in «non troppi test, soprattutto di integrazione». L'argomento è che un test dà tanta più fiducia quanto più somiglia al modo in cui il software viene usato, e in un'interfaccia una funzione isolata dice poco: conta che componente, servizio e DOM funzionino insieme.

Le due figure si contraddicono meno di quanto sembri. Entrambe chiedono pochi test end-to-end mirati e una massa di test veloci; cambia dove cade il peso. Nel frontend, dove un componente ha senso solo insieme al suo DOM, l'argomento del trofeo pesa parecchio, e lo stesso principio di «somigliare all'uso reale» guida Testing Library, descritta più avanti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 340" role="img" aria-label="A sinistra un asse verticale: in alto test più affidabili ma più lenti, in basso test più veloci ed economici. Al centro la piramide dei test: base larga di test unit, poi integration, in cima pochi e2e. A destra il trofeo dei test: in basso la base static, sopra uno stelo stretto di unit, poi la coppa larga di integration, in cima e2e" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n07-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><line x1="70" y1="176" x2="70" y2="64" stroke="currentColor" stroke-width="1.5" marker-end="url(#n07-a)"/><line x1="70" y1="176" x2="70" y2="288" stroke="currentColor" stroke-width="1.5" marker-end="url(#n07-a)"/><text x="70" y="34" font-size="11.5" text-anchor="middle" font-weight="700">più fiducia</text><text x="70" y="50" font-size="10.5" text-anchor="middle" opacity=".75">più lenti</text><text x="70" y="310" font-size="11.5" text-anchor="middle" font-weight="700">più veloci</text><text x="70" y="326" font-size="10.5" text-anchor="middle" opacity=".75">più economici</text><polygon points="270,62 310,138 230,138" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><text x="270" y="126" font-size="11.5" text-anchor="middle" font-weight="700">e2e</text><polygon points="230,138 310,138 350,214 190,214" fill="var(--link,#5fa04e)" fill-opacity=".12" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><text x="270" y="181" font-size="11.5" text-anchor="middle" font-weight="700">integration</text><polygon points="190,214 350,214 390,290 150,290" fill="var(--link,#5fa04e)" fill-opacity=".26" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><text x="270" y="257" font-size="11.5" text-anchor="middle" font-weight="700">unit</text><text x="270" y="320" font-size="12.5" text-anchor="middle" font-weight="700">piramide</text><polygon points="485,62 635,62 630,96 490,96" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><text x="560" y="84" font-size="11.5" text-anchor="middle" font-weight="700">e2e</text><polygon points="490,96 630,96 600,196 520,196" fill="var(--link,#5fa04e)" fill-opacity=".26" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><text x="560" y="150" font-size="11.5" text-anchor="middle" font-weight="700">integration</text><polygon points="530,196 590,196 584,248 536,248" fill="var(--link,#5fa04e)" fill-opacity=".12" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><text x="560" y="227" font-size="11.5" text-anchor="middle" font-weight="700">unit</text><rect x="485" y="248" width="150" height="42" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="560" y="274" font-size="11.5" text-anchor="middle" font-weight="700">static</text><text x="560" y="320" font-size="12.5" text-anchor="middle" font-weight="700">trofeo</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La larghezza di ogni fascia indica quanti test di quel tipo si scrivono. Nella <strong>piramide</strong> la massa sta nei test unit; nel <strong>trofeo</strong> sta nei test di integration, e alla base compaiono i controlli <em>static</em> (tratteggiati perché non eseguono il codice: type checker e linter). In entrambe, salendo, i test diventano più realistici ma anche più lenti e costosi, quindi se ne scrivono pochi.</figcaption>
</figure>

## Anatomia di un test

La [documentazione di Node](https://nodejs.org/api/test.html) dà la regola di fondo nella forma più semplice: una funzione di test **fallisce se lancia un'eccezione**, o se la Promise che restituisce viene rifiutata, e passa in ogni altro caso. Tutto il resto è organizzazione attorno a questa regola.

Il corpo di un buon test segue lo schema **AAA**: *Arrange* (preparare dati e condizioni di partenza), *Act* (eseguire l'azione da verificare), *Assert* (controllare il risultato). Il controllo si fa con le **asserzioni** (*assertion*), funzioni che verificano una condizione e lanciano un errore con un messaggio chiaro quando la condizione è falsa: `assert.equal(risultato, 25)` con il modulo `node:assert`, `expect(risultato).toBe(25)` in Vitest e Jest. Le funzioni `describe()` e `it()` (o `test()`, che è [lo stesso](https://nodejs.org/api/test.html#describe-and-it-aliases)) danno al tutto una struttura leggibile: `describe` raggruppa in una **suite** i test che riguardano la stessa unità, `it` definisce un singolo caso, e i due nomi letti di seguito descrivono il comportamento atteso, come «`totale()` somma prezzo × quantità di ogni riga».

Attorno ai casi girano gli **hook**, funzioni che il runner esegue in momenti precisi. `beforeEach()` e `afterEach()` girano prima e dopo **ogni** test della suite e servono a ricreare dati freschi e a ripulire; `before()` e `after()` girano **una volta sola**, prima del primo test e dopo l'ultimo (in Vitest e Jest si chiamano `beforeAll()` e `afterAll()`). Lo scopo degli hook è rendere ogni test **indipendente**: deve poter girare da solo o in qualunque ordine, senza ereditare lo stato lasciato da un altro.

```js
// src/carrello.js
export function totale(righe) {
  if (!Array.isArray(righe)) {
    throw new TypeError('righe deve essere un array');
  }
  return righe.reduce((somma, r) => somma + r.prezzo * r.quantita, 0);
}
```

```js
// test/carrello.test.js
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { totale } from '../src/carrello.js';

describe('totale()', () => {
  let righe;

  beforeEach(() => {
    // Arrange: dati nuovi per ogni test, così nessun test sporca l'altro
    righe = [
      { prezzo: 10, quantita: 2 },
      { prezzo: 5, quantita: 1 },
    ];
  });

  it('somma prezzo × quantità di ogni riga', () => {
    const risultato = totale(righe);   // Act
    assert.equal(risultato, 25);       // Assert
  });

  it('restituisce 0 per un carrello vuoto', () => {
    assert.equal(totale([]), 0);
  });

  it('rifiuta un argomento che non è un array', () => {
    assert.throws(() => totale(null), TypeError);
  });
});
```

L'esempio gira così com'è con Node 24, senza installare nulla, in un progetto con `"type": "module"` nel `package.json`: basta lanciare `node --test` dalla radice. L'import da `node:assert/strict` attiva la [modalità stretta](https://nodejs.org/api/assert.html#strict-assertion-mode), in cui `assert.equal()` confronta come `assert.strictEqual()` e, sugli oggetti, il messaggio d'errore mostra la differenza fra atteso e ottenuto.

```text
▶ totale()
  ✔ somma prezzo × quantità di ogni riga (0.48ms)
  ✔ restituisce 0 per un carrello vuoto (0.71ms)
  ✔ rifiuta un argomento che non è un array (0.30ms)
✔ totale() (2.14ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

## Le controfigure: stub, spy, mock e fake

Una funzione raramente vive da sola: chiama la rete, legge l'ora, scrive su disco, usa un servizio. Nei test queste **dipendenze** sono spesso un problema, perché sono lente (la rete), non deterministiche (l'ora, i numeri casuali), producono effetti indesiderati (inviare una vera email) o semplicemente non esistono ancora. La soluzione è sostituirle con un **test double**, una *controfigura* che prende il posto della dipendenza reale come lo stuntman sostituisce l'attore nelle scene pericolose. Il termine è di Gerard Meszaros, e la classificazione più citata, [riportata da Martin Fowler](https://martinfowler.com/bliki/TestDouble.html), distingue cinque tipi.

| Tipo | Che cosa fa | Esempio |
|---|---|---|
| **dummy** | viene passato ma non viene mai usato davvero | un argomento obbligatorio che il caso in esame ignora |
| **stub** | restituisce risposte preconfezionate | un `fetch` finto che risponde sempre `{ nome: 'Ada' }` |
| **spy** | uno stub (o un involucro attorno alla funzione vera) che **registra** come è stato chiamato | contare quante volte è partito il salvataggio, e con quali argomenti |
| **mock** | programmato in anticipo con le chiamate che **si aspetta** di ricevere | «deve essere chiamato una volta, con questo URL» |
| **fake** | un'implementazione funzionante ma semplificata, inadatta alla produzione | un database in memoria al posto di quello vero |

Un caso particolare di fake, molto frequente nel frontend, sono i **fake timer**: l'orologio reale viene sostituito da uno controllabile, così le callback di `setTimeout()` o `setInterval()` partono solo quando il test fa avanzare il tempo. Un *debounce* da 300 millisecondi, cioè una funzione che aspetta una pausa nelle chiamate prima di eseguire davvero, si verifica così in un istante, senza aspettare nulla.

Nel linguaggio quotidiano degli strumenti JavaScript la parola «mock» si usa in senso largo per tutte le controfigure: `vi.fn()` di Vitest e `mock.fn()` di Node creano una *mock function* che fa da spia e, se le si passa un'implementazione, anche da stub. Per orientarsi conta il ruolo che la controfigura svolge nel test, qualunque sia il nome dell'API. Conviene però usarle con misura: un test che sostituisce tutto finisce per verificare soprattutto le proprie controfigure. Il loro posto naturale sono i **confini** del sistema, cioè rete, tempo, file system e servizi esterni, mentre ciò che sta dentro l'applicazione, quando possibile, si lascia lavorare davvero.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 270" role="img" aria-label="Un test double al posto della dipendenza reale: il codice sotto test, nomeUtente(7), non raggiunge più fetch verso la rete, collegamento barrato; la sua chiamata arriva al test double, che come stub restituisce una risposta finta e come spy registra le chiamate; il test legge quel registro e verifica risultato e chiamate" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n07-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="70" width="190" height="60" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="125" y="95" font-size="12" text-anchor="middle" font-weight="700">codice sotto test</text><text x="125" y="115" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">nomeUtente(7)</text><rect x="30" y="180" width="190" height="60" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="125" y="205" font-size="12" text-anchor="middle" font-weight="700">il test</text><text x="125" y="224" font-size="10" text-anchor="middle" opacity=".8">verifica risultato e chiamate</text><rect x="460" y="20" width="190" height="60" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" opacity=".6"/><text x="555" y="45" font-size="12" text-anchor="middle" font-weight="700" opacity=".7">dipendenza reale</text><text x="555" y="64" font-size="10.5" text-anchor="middle" opacity=".7">fetch() verso la rete</text><rect x="460" y="120" width="190" height="84" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="555" y="144" font-size="12.5" text-anchor="middle" font-weight="700">test double</text><text x="555" y="165" font-size="10.5" text-anchor="middle" opacity=".85">stub: risposta finta</text><text x="555" y="184" font-size="10.5" text-anchor="middle" opacity=".85">spy: registra le chiamate</text><line x1="222" y1="88" x2="456" y2="52" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" opacity=".55" marker-end="url(#n07-b)"/><line x1="331" y1="61" x2="347" y2="79" stroke="currentColor" stroke-width="2.4"/><line x1="347" y1="61" x2="331" y2="79" stroke="currentColor" stroke-width="2.4"/><line x1="222" y1="112" x2="456" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#n07-b)"/><text x="296" y="110" font-size="10.5" text-anchor="middle" opacity=".8">chiamata</text><line x1="456" y1="184" x2="224" y2="208" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 3" marker-end="url(#n07-b)"/><text x="345" y="224" font-size="10.5" text-anchor="middle" opacity=".8">registro delle chiamate</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Durante il test la dipendenza reale (la rete) resta fuori gioco: la chiamata del codice arriva alla <strong>controfigura</strong>, che risponde con dati preconfezionati (il ruolo di <em>stub</em>) e annota ogni chiamata (il ruolo di <em>spy</em>). Il test controlla sia il risultato restituito dal codice sia quel registro.</figcaption>
</figure>

## Il test runner di Node: `node:test`

Dalla versione 18 Node include un proprio test runner, il modulo [`node:test`](https://nodejs.org/api/test.html), **stabile da Node 20**. Esiste solo con il prefisso `node:` (il perché del prefisso è nel [[02-moduli-e-pacchetti#i-moduli-integrati-e-il-prefisso-node|capitolo 02]]) e non richiede alcuna installazione: `describe`, `it`, gli hook e le controfigure vengono da `node:test`, le asserzioni da `node:assert`.

Lanciato con il flag `--test`, Node [cerca da solo i file di test](https://nodejs.org/api/test.html#running-tests-from-the-command-line) seguendo alcuni schemi di nome, detti *glob* (`*` sta per un nome qualunque, `**` per qualunque livello di sottocartelle): fra questi `**/*.test.js`, `**/*-test.js`, `**/test-*.js` e tutto ciò che sta in una cartella `test/`, ciascuno anche nelle varianti `.mjs` e `.cjs`. In Node 24 gli stessi schemi valgono anche per `.ts`, `.mts` e `.cts`, perché la rimozione dei tipi TypeScript (*type stripping*) è attiva di default (il meccanismo è descritto nel [[04-varianti-di-javascript#typescript-in-node-il-type-stripping|capitolo 04]]). Ogni file di test gira in un **processo figlio separato**, quindi lo stato globale di un file non può inquinare quello di un altro.

| Comando | Effetto |
|---|---|
| `node --test` | esegue tutti i file che rispettano gli schemi predefiniti |
| `node --test "src/**/*.spec.js"` | esegue solo i file indicati dal glob (fra virgolette, così non lo espande la shell) |
| `node --test --test-name-pattern="carrello"` | esegue solo i test il cui nome corrisponde all'espressione regolare |
| `node --test --watch` | resta in ascolto e riesegue i test toccati da una modifica (sperimentale) |
| `node --test --experimental-test-coverage` | aggiunge in fondo il report di copertura (sperimentale) |

Le controfigure passano per l'oggetto [`mock`](https://nodejs.org/api/test.html#mocking). `mock.fn()` crea una funzione-spia, eventualmente con un'implementazione finta, e ne registra le chiamate in `.mock.calls`; `mock.method(oggetto, 'nome')` fa lo stesso con un metodo esistente, sostituendolo sul posto. Le stesse funzioni sono disponibili anche come `t.mock` sul **contesto** del test, l'oggetto `t` che il runner passa alla funzione di test: in quel caso il runner **ripristina da solo** tutto ciò che è stato sostituito alla fine del test, mentre con il `mock` globale bisogna chiamare `mock.reset()`. Nell'esempio seguente `fetch` viene sostituito da uno stub che risponde senza toccare la rete, e lo stesso oggetto fa da spia.

```js
// src/utenti.js
export async function nomeUtente(id) {
  const risposta = await fetch(`https://api.example.com/utenti/${id}`);
  if (!risposta.ok) throw new Error(`HTTP ${risposta.status}`);
  const utente = await risposta.json();
  return utente.nome;
}
```

```js
// test/utenti.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nomeUtente } from '../src/utenti.js';

test('legge il nome dalla risposta, senza toccare la rete', async (t) => {
  // stub: fetch restituisce una risposta preconfezionata
  const finto = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ id: 7, nome: 'Ada' })
  );

  assert.equal(await nomeUtente(7), 'Ada');

  // spia: si verifica come è stato chiamato
  assert.equal(finto.mock.callCount(), 1);
  assert.equal(finto.mock.calls[0].arguments[0], 'https://api.example.com/utenti/7');
});

test('segnala un errore HTTP', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }));
  await assert.rejects(nomeUtente(7), /HTTP 404/);
});
```

I fake timer stanno in [`mock.timers`](https://nodejs.org/api/test.html#class-mocktimers), **stabile da Node 23.1** e quindi in Node 24. `enable()` accetta l'elenco delle API da sostituire (`'setTimeout'`, `'setInterval'`, `'setImmediate'`, `'Date'`; senza elenco le sostituisce tutte), `tick(ms)` fa avanzare l'orologio eseguendo i timer scaduti e `runAll()` esegue subito tutti quelli in coda. Le funzioni importate per destrutturazione, però, come `import { setTimeout } from 'node:timers'`, [non vengono sostituite](https://nodejs.org/api/test.html#timers); il codice deve chiamare la versione globale, oppure passare dall'oggetto del modulo, come in `timers.setTimeout()`.

```js
// src/debounce.js
export function debounce(fn, attesa) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), attesa);
  };
}
```

```js
// test/debounce.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from '../src/debounce.js';

test('chiama la funzione una volta sola, dopo la pausa', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const salva = t.mock.fn();
  const salvaConCalma = debounce(salva, 300);

  salvaConCalma('a');
  salvaConCalma('ab');
  salvaConCalma('abc');
  t.mock.timers.tick(299);
  assert.equal(salva.mock.callCount(), 0);   // la pausa non è ancora finita

  t.mock.timers.tick(1);
  assert.equal(salva.mock.callCount(), 1);
  assert.deepEqual(salva.mock.calls[0].arguments, ['abc']);
});
```

Non tutto è già stabile. In Node 24 restano **sperimentali** la [modalità watch del test runner](https://nodejs.org/api/test.html#watch-mode), anche se il `--watch` generico di Node è stabile da Node 22, e la [raccolta della copertura](https://nodejs.org/api/test.html#collecting-code-coverage), che si attiva appunto con un flag dal nome `--experimental-test-coverage`. È ancora più acerba la sostituzione di interi moduli con [`mock.module()`](https://nodejs.org/api/test.html#mockmodulespecifier-options), in fase di primo sviluppo e disponibile solo con il flag `--experimental-test-module-mocks`. Soprattutto, `node:test` **non offre un DOM**: è lo strumento ideale per librerie, script, logica pura e codice lato server, mentre per i componenti dell'interfaccia servono gli strumenti dei paragrafi seguenti.

## Vitest

[Vitest](https://vitest.dev/guide/why) è un test runner costruito sopra **Vite**, il dev server e bundler descritto nel [[06-bundler|capitolo 06]], e si propone come [il runner di riferimento per i progetti Vite](https://vitest.dev/guide/why), oltre che come alternativa valida anche senza Vite. Il vantaggio principale è che **riusa la configurazione dell'applicazione**: legge lo stesso `vite.config.js`, applica gli stessi plugin e la stessa pipeline di trasformazione del dev server e della build. Alias dei percorsi, TypeScript, JSX, import di file CSS: ciò che funziona nell'applicazione funziona anche nei test, senza una seconda configurazione da tenere allineata.

L'API è volutamente **compatibile con Jest**, al punto che la documentazione la presenta come un sostituto diretto nella maggior parte dei progetti: `describe`, `it`, `expect` con gli stessi *matcher* (i metodi di verifica come `toBe()` o `toHaveBeenCalledWith()`), e un oggetto `vi` che fa le veci di `jest` per le controfigure. Una differenza di stile: per esplicitezza Vitest [non rende globali](https://vitest.dev/config/globals) le sue funzioni, che quindi si importano da `'vitest'`; l'opzione `globals: true` le rende disponibili ovunque come in Jest. Lanciato con il comando `vitest`, in sviluppo resta in **modalità watch** e, grazie al grafo dei moduli di Vite, [riesegue solo i test toccati](https://vitest.dev/guide/features) dal file modificato; `vitest run` esegue tutto una volta sola, ed è anche la modalità in cui `vitest` si mette da solo in CI o in un terminale non interattivo.

```js
// src/debounce.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce()', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('chiama la funzione una volta sola, dopo la pausa', () => {
    const salva = vi.fn();
    const salvaConCalma = debounce(salva, 300);

    salvaConCalma('a');
    salvaConCalma('abc');
    vi.advanceTimersByTime(300);

    expect(salva).toHaveBeenCalledTimes(1);
    expect(salva).toHaveBeenCalledWith('abc');
  });
});
```

Le stesse controfigure hanno nomi diversi nei tre runner, ma lo stesso ruolo:

| Controfigura | `node:test` | Vitest | Jest |
|---|---|---|---|
| funzione finta (spia, stub) | `mock.fn()` | [`vi.fn()`](https://vitest.dev/api/vi#vi-fn) | [`jest.fn()`](https://jestjs.io/docs/jest-object#jestfnimplementation) |
| spia su un metodo esistente | `mock.method(obj, 'm')` | `vi.spyOn(obj, 'm')` | `jest.spyOn(obj, 'm')` |
| fake timer | `mock.timers.enable()` e `tick(ms)` | `vi.useFakeTimers()` e `vi.advanceTimersByTime(ms)` | `jest.useFakeTimers()` e `jest.advanceTimersByTime(ms)` |
| modulo intero sostituito | `mock.module()` (flag sperimentale) | `vi.mock('modulo')` | `jest.mock('modulo')` |

Per i componenti dell'interfaccia serve un DOM, e Node non ne ha uno. Vitest risolve il problema con gli **ambienti** (*environment*): quello predefinito è [`node`](https://vitest.dev/guide/environment), mentre `jsdom` e `happy-dom` simulano dentro Node le API del browser (`document`, `window`, gli eventi). Sono due librerie da installare a parte; happy-dom è considerata più veloce di jsdom, ma non implementa alcune API. L'ambiente si sceglie per tutto il progetto nella configurazione, oppure per un singolo file con un commento in testa, `// @vitest-environment jsdom`.

```js
// vite.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Un DOM simulato resta però una simulazione, e [la documentazione stessa](https://vitest.dev/guide/browser/why) avverte che le differenze rispetto a un browser vero possono produrre falsi positivi o falsi negativi. Per questo Vitest offre la **browser mode**, [stabile da Vitest 4](https://vitest.dev/blog/vitest-4) (ottobre 2025): i test girano in un browser reale, pilotato da un *provider*, cioè la libreria che controlla il browser, da installare a parte: di solito `@vitest/browser-playwright` (le alternative sono `@vitest/browser-webdriverio` e `@vitest/browser-preview`). Il prezzo è un avvio più lento, perché il browser va lanciato; inoltre la browser mode non sostituisce i test end-to-end, perché è pensata per provare componenti e moduli, non per percorrere l'applicazione intera.

```js
// vite.config.js — browser mode
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 185" role="img" aria-label="Dove gira un test, da sinistra a destra: solo Node, senza DOM, con node:test, Vitest o Jest; DOM simulato dentro Node con jsdom o happy-dom; browser vero un componente alla volta con la browser mode di Vitest; app completa nel browser vero con Playwright. Verso sinistra i test sono più veloci e isolati, verso destra più realistici e lenti" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n07-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="20" y="24" width="150" height="92" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="95" y="54" font-size="12.5" text-anchor="middle" font-weight="700">solo Node</text><text x="95" y="74" font-size="10.5" text-anchor="middle" opacity=".8">niente DOM</text><text x="95" y="98" font-size="10" text-anchor="middle">node:test, Vitest, Jest</text><rect x="190" y="24" width="150" height="92" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="265" y="54" font-size="12.5" text-anchor="middle" font-weight="700">DOM simulato</text><text x="265" y="74" font-size="10.5" text-anchor="middle" opacity=".8">dentro Node</text><text x="265" y="98" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">jsdom · happy-dom</text><rect x="360" y="24" width="150" height="92" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".18" stroke="currentColor" stroke-width="1.6"/><text x="435" y="54" font-size="12.5" text-anchor="middle" font-weight="700">browser vero</text><text x="435" y="74" font-size="10.5" text-anchor="middle" opacity=".8">un componente alla volta</text><text x="435" y="98" font-size="10" text-anchor="middle">Vitest browser mode</text><rect x="530" y="24" width="150" height="92" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".28" stroke="currentColor" stroke-width="1.8"/><text x="605" y="54" font-size="12.5" text-anchor="middle" font-weight="700">app completa</text><text x="605" y="74" font-size="10.5" text-anchor="middle" opacity=".8">nel browser vero</text><text x="605" y="98" font-size="10" text-anchor="middle">Playwright</text><line x1="350" y1="140" x2="24" y2="140" stroke="currentColor" stroke-width="1.4" marker-end="url(#n07-c)"/><line x1="350" y1="140" x2="676" y2="140" stroke="currentColor" stroke-width="1.4" marker-end="url(#n07-c)"/><text x="24" y="164" font-size="11" opacity=".8">più veloce e isolato</text><text x="676" y="164" font-size="11" text-anchor="end" opacity=".8">più realistico e lento</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Quattro posti in cui può girare un test. A sinistra basta Node ed è tutto rapidissimo; spostandosi verso destra si aggiunge un DOM simulato, poi un browser reale per il singolo componente, infine l'applicazione intera usata come farebbe una persona. Ogni passo aumenta la fiducia e anche il costo.</figcaption>
</figure>

La versione attuale è **Vitest 5**, uscita il 3 settembre 2026, che [richiede Node 22.12 o successivo e Vite 6.4 o successivo](https://vitest.dev/blog/vitest-5) e, fra le novità, azzera di default la cronologia delle chiamate delle controfigure prima di ogni test (`clearMocks: true`). L'uso di Vitest dentro un progetto Angular, con `TestBed`, i locator, le spie e i fake timer, è sviluppato nel <a href="../angular/#/capitoli/07-testing-with-vitest" target="_blank" rel="noopener">capitolo 07 del vault Angular</a>, che parte proprio dalla <a href="../angular/#/capitoli/07-testing-with-vitest?id=turning-on-browser-mode" target="_blank" rel="noopener">browser mode con Playwright</a>.

## Jest

[Jest](https://jestjs.io/docs/getting-started), creato da Meta (all'epoca Facebook) e dal 2022 [affidato alla OpenJS Foundation](https://jestjs.io/blog/2022/05/11/jest-joins-openjs), è stato a lungo un riferimento per i test JavaScript, e la sua API è quella che Vitest ha scelto di imitare: chi conosce l'uno legge l'altro senza fatica. La versione attuale è la **30**, [uscita a giugno 2025](https://jestjs.io/blog/2025/06/04/jest-30) e oggi alla 30.5. A differenza di Vitest, Jest [rende globali](https://jestjs.io/docs/api) `describe`, `it`, `expect` e `jest`, che quindi si usano senza importarli.

La differenza di fondo sta nel modo in cui il codice arriva al test. Jest non conosce la configurazione di Vite: [trasforma i file con Babel](https://jestjs.io/docs/configuration) (il trasformatore `babel-jest`), quindi TypeScript passa per un preset di Babel, che rimuove i tipi senza controllarli, oppure per il pacchetto `ts-jest`. Il supporto agli ES modules nativi è ancora dichiarato [sperimentale](https://jestjs.io/docs/ecmascript-modules) e richiede di avviare Node con il flag `--experimental-vm-modules`. L'ambiente predefinito è `node`; per un DOM simulato si sceglie `testEnvironment: 'jsdom'`, installando a parte il pacchetto `jest-environment-jsdom`, [non più incluso da Jest 28](https://jestjs.io/blog/2022/04/25/jest-28). In un progetto Vite tutto questo significa una seconda pipeline di trasformazione accanto a quella dell'applicazione, ed è il motivo pratico per cui lì si preferisce Vitest. Dove Jest è già in uso, invece, resta una scelta solida e mantenuta, e la compatibilità dell'API rende comunque agevole un'eventuale migrazione.

> [!info|label:Legacy]
> Nei progetti Angular meno recenti si incontra la coppia **Karma + Jasmine**: Jasmine fornisce suite, matcher e spie, Karma esegue i test in un browser vero. Karma è [deprecato](https://github.com/karma-runner/karma) e non riceve più nuove funzionalità, e la Angular CLI oggi crea i progetti nuovi [con Vitest](https://angular.dev/guide/testing). Il funzionamento di questa combinazione, ancora utile per leggere codice esistente, è nel <a href="../angular/#/cert/testing-classic" target="_blank" rel="noopener">vault Angular, alla nota sul testing classico</a>.

## Testare come un utente: Testing Library

[Testing Library](https://testing-library.com/docs/) è una famiglia di librerie per cercare elementi nel DOM e interagire con loro **come farebbe un utente**: non è un test runner, ma si usa dentro Vitest o Jest (con jsdom o in un browser vero). Il nucleo è `@testing-library/dom`, e attorno ci sono versioni pensate per React, Angular, Vue e altri framework. Tutto discende da un [principio guida](https://testing-library.com/docs/guiding-principles): più i test somigliano al modo in cui il software viene usato, più fiducia possono dare. Un utente non conosce le classi CSS, gli id o lo stato interno di un componente; vede un pulsante con la scritta «Aggiungi», un campo con l'etichetta «Email». I test scritti così sopravvivono alle riorganizzazioni interne, perché non dipendono dai dettagli di implementazione.

Per questo le query hanno un [ordine di preferenza](https://testing-library.com/docs/queries/about) preciso. In cima sta `getByRole()`, che cerca un elemento per il suo **ruolo di accessibilità** (pulsante, titolo, campo di testo) e per il suo nome accessibile, cioè come lo percepiscono anche le tecnologie assistive; seguono `getByLabelText()`, `getByPlaceholderText()` e `getByText()`, e solo come ultima risorsa `getByTestId()`, che cerca un attributo `data-testid` messo apposta. Il prefisso cambia il comportamento quando l'elemento manca:

| Query | Se l'elemento non c'è | Uso tipico |
|---|---|---|
| `getBy…` | lancia un errore | l'elemento deve esserci adesso |
| `queryBy…` | restituisce `null` | verificare che un elemento **non** ci sia |
| `findBy…` | restituisce una Promise che riprova fino a un timeout (1 secondo di default) | l'elemento comparirà dopo un'operazione asincrona |

Le query si usano di solito dall'oggetto `screen`, che le offre già legate a `document.body`. Per le interazioni c'è [`user-event`](https://testing-library.com/docs/user-event/intro), che riproduce la sequenza di eventi che il browser emetterebbe durante un'interazione reale: un clic non è un solo evento, ma pressione del puntatore, focus sull'elemento, rilascio e infine `click`.

```js
// src/contatore.js
export function montaContatore(contenitore) {
  let conteggio = 0;
  contenitore.innerHTML = `
    <p>Totale: 0</p>
    <button type="button">Aggiungi</button>
  `;
  const testo = contenitore.querySelector('p');
  contenitore.querySelector('button').addEventListener('click', () => {
    conteggio += 1;
    testo.textContent = `Totale: ${conteggio}`;
  });
}
```

```js
// src/contatore.test.js — Vitest con environment: 'jsdom'
import { it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { montaContatore } from './contatore.js';

it('aumenta il totale a ogni clic su «Aggiungi»', async () => {
  montaContatore(document.body);
  const utente = userEvent.setup();

  await utente.click(screen.getByRole('button', { name: 'Aggiungi' }));
  await utente.click(screen.getByRole('button', { name: 'Aggiungi' }));

  // getByText lancia un errore se il testo non c'è: trovarlo è già la verifica
  expect(screen.getByText('Totale: 2')).toBeDefined();
});
```

Nel test non compare alcun selettore CSS: il pulsante si trova per ruolo e nome, il risultato per il testo visibile. Nella browser mode di Vitest la stessa filosofia si ritrova in `page.getByRole()` e nelle altre query importate da `'vitest/browser'`, insieme a un `userEvent` che agisce sul browser vero; la documentazione di Vitest [sconsiglia lì](https://vitest.dev/guide/browser/) `@testing-library/user-event`, che si limita a simulare gli eventi. Un esempio completo in Angular, con i locator al posto delle query, è nel <a href="../angular/#/capitoli/07-testing-with-vitest" target="_blank" rel="noopener">capitolo 07 del vault Angular</a>.

## End-to-end con Playwright

[Playwright](https://playwright.dev/docs/intro), sviluppato da [Microsoft](https://github.com/microsoft/playwright), è una libreria per **pilotare i browser** da codice, accompagnata da un test runner proprio, `@playwright/test`. Supporta i tre motori principali, **Chromium**, **Firefox** e **WebKit** (quello di Safari), su Windows, Linux e macOS, e per impostazione predefinita li esegue *headless*, cioè senza finestra visibile, come serve in una pipeline. Il runner è un programma Node (la documentazione chiede Node 22, 24 o 26), ma i browser sono veri: il test apre l'applicazione, la usa e osserva ciò che succede, esattamente come una persona. La versione attuale è la [1.64](https://playwright.dev/docs/release-notes), di ottobre 2026.

La caratteristica che rende Playwright adatto ai test end-to-end è l'**attesa automatica** (*auto-waiting*). Prima di ogni azione, Playwright [esegue una serie di controlli](https://playwright.dev/docs/actionability) e aspetta che siano tutti soddisfatti: per un clic, che l'elemento sia visibile, fermo (non in mezzo a un'animazione), in grado di ricevere l'evento (non coperto da un altro elemento) e abilitato. Se entro il timeout le condizioni non si verificano, l'azione fallisce con un `TimeoutError`. Non servono quindi pause scritte a mano «per dare tempo alla pagina», che sono la causa classica dei test instabili: troppo corte falliscono a caso, troppo lunghe rallentano tutto. Lo stesso vale per le **asserzioni web-first**, come `await expect(locator).toBeVisible()`, che [riprovano](https://playwright.dev/docs/test-assertions) finché la condizione non è vera o non scade il tempo, 5 secondi di default.

Gli elementi si trovano con i **locator**, [il meccanismo su cui poggia](https://playwright.dev/docs/locators) l'attesa automatica. Le funzioni consigliate sono le stesse di Testing Library: `getByRole()`, `getByLabel()`, `getByText()`, `getByPlaceholder()`, fino a `getByTestId()` come ultima risorsa. I locator sono **rigorosi** (*strict*): se una ricerca corrisponde a più di un elemento, l'azione lancia un errore invece di sceglierne uno a caso.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  // avvia il dev server prima dei test e lo spegne alla fine
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

```ts
// e2e/accesso.spec.ts
import { test, expect } from '@playwright/test';

test('un utente registrato entra nella dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('segreta');
  await page.getByRole('button', { name: 'Accedi' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Ciao, Ada' })).toBeVisible();
});
```

L'opzione [`webServer`](https://playwright.dev/docs/test-webserver) avvia il dev server dell'applicazione prima dei test, e i *projects* fanno girare la stessa suite su più browser. Playwright legge [direttamente i file TypeScript](https://playwright.dev/docs/test-typescript), senza però controllarne i tipi, e all'occorrenza può intercettare le richieste di rete con `page.route()` per rispondere con dati finti.

| Comando | Effetto |
|---|---|
| `npm init playwright@latest` | aggiunge Playwright al progetto: configurazione, cartella dei test, esempio |
| `npx playwright install` | scarica i browser usati da questa versione di Playwright |
| `npx playwright test` | esegue tutti i test, headless, su tutti i *projects* |
| `npx playwright test --project=webkit` | esegue i test su un solo browser |
| `npx playwright test --headed` | mostra le finestre dei browser durante l'esecuzione |
| `npx playwright test --ui` | apre la modalità interattiva, con watch e ripercorrimento dei passi |
| `npx playwright codegen http://localhost:5173` | registra le azioni fatte a mano nel browser e le trascrive come codice di test |
| `npx playwright show-report` | apre il report HTML dell'ultima esecuzione |

## Coverage: che cosa misura e che cosa no

La **copertura del codice** (*code coverage*) è la percentuale di codice che viene **eseguita** mentre girano i test. Si misura su più assi: le **righe** eseguite, le **funzioni** chiamate almeno una volta e i **rami** (*branch*), cioè le strade alternative di ogni `if`, `switch` o operatore ternario, ciascuna delle quali deve essere percorsa per contare come coperta. In Node il report si ottiene con il flag sperimentale `--experimental-test-coverage`, che esclude per default i moduli di Node, `node_modules` e i file di test stessi; i flag `--test-coverage-lines`, `--test-coverage-branches` e `--test-coverage-functions` (da Node 22.8, anch'essi sperimentali) fissano una [soglia minima](https://nodejs.org/api/cli.html#--test-coverage-linesthreshold) sotto la quale il processo termina con errore. In Vitest si usa `vitest run --coverage`, con il provider [`v8`](https://vitest.dev/guide/coverage) come predefinito (pacchetto `@vitest/coverage-v8`, da installare a parte) e le soglie nell'opzione `coverage.thresholds`.

```text
ℹ file         | line % | branch % | funcs % | uncovered lines
ℹ src          |        |          |         |
ℹ  carrello.js | 100.00 |   100.00 |  100.00 |
ℹ  debounce.js | 100.00 |   100.00 |  100.00 |
ℹ  utenti.js   | 100.00 |   100.00 |  100.00 |
ℹ all files    | 100.00 |   100.00 |  100.00 |
```

Il limite della copertura sta nella parola *eseguita*: misura quali righe sono state **attraversate**, non se qualcuno ha **controllato** il risultato. Un test senza asserzioni copre il codice che chiama e non verifica nulla.

```js
it('esegue totale()', () => {
  totale([{ prezzo: 10, quantita: 2 }]);   // nessuna asserzione: passa sempre
});
```

La copertura, inoltre, non vede ciò che **manca**: se `totale()` non controlla le quantità negative, non c'è nessuna riga scoperta che lo segnali, perché quella riga non è mai stata scritta. Come riassume [Martin Fowler](https://martinfowler.com/bliki/TestCoverage.html), la copertura è uno strumento utile per **trovare le parti non testate** del codice, ma serve a poco come voto numerico della qualità dei test. Una soglia minima in CI impedisce che la copertura crolli senza che nessuno se ne accorga; inseguire il 100% come obiettivo, invece, porta facilmente a test scritti per colorare righe più che per verificare comportamenti.

## Quale scegliere

Gli strumenti non sono alternativi fra loro: un progetto frontend usa tipicamente un runner per i test unit e di integrazione e Playwright per gli end-to-end.

| | `node:test` | Vitest | Jest | Playwright |
|---|---|---|---|---|
| Che cos'è | test runner integrato in Node | test runner basato su Vite | test runner autonomo | automazione dei browser e runner e2e |
| Installazione | nessuna | `vitest`, più ambiente o provider | `jest`, più Babel o `ts-jest` per TypeScript | `@playwright/test` e i browser |
| Test tipici | unit e integration lato Node | unit, integration, componenti | unit, integration, componenti | end-to-end |
| DOM | no | jsdom, happy-dom o browser vero | jsdom | browser vero |
| TypeScript | type stripping di Node 24 | dalla pipeline di Vite | via Babel o `ts-jest` | integrato, senza controllo dei tipi |
| Controfigure | `mock.fn`, `mock.method`, `mock.timers` | `vi.fn`, `vi.spyOn`, `vi.mock`, fake timer | `jest.fn`, `jest.spyOn`, `jest.mock`, fake timer | intercettazione di rete con `page.route()` |
| Coverage | `--experimental-test-coverage` | `--coverage` (v8 o istanbul) | `--coverage` | non è il suo scopo |
| Versione (ottobre 2026) | Node 24 LTS | 5.0 | 30.5 | 1.64 |

La scelta segue la natura del progetto. Per una **libreria senza interfaccia**, uno script o un servizio Node, `node:test` basta e avanza: nessuna dipendenza, nessuna configurazione, e con Node 24 anche i file TypeScript. Per un'**applicazione frontend costruita con Vite**, Vitest è la scelta naturale, perché condivide configurazione e plugin con l'applicazione e offre sia il DOM simulato sia la browser mode; è anche il runner che la Angular CLI usa oggi per i progetti nuovi. **Jest** ha senso dove è già in uso e funziona bene: migrare costa poco grazie all'API comune, ma non c'è fretta di farlo senza un motivo concreto. A tutti questi si affianca **Playwright** per i pochi percorsi critici da verificare dall'inizio alla fine, come accesso, acquisto e salvataggio, nel browser vero e su più motori.

> [!tip]
> Molti test veloci e pochi test lenti: logica e componenti con un runner (`node:test` senza DOM, Vitest in un progetto Vite), i percorsi critici con Playwright. Le controfigure vanno ai confini (rete, tempo, file system), le query cercano gli elementi come li vede un utente, e la copertura serve a trovare il codice non testato, non a misurare la bontà dei test.

## Ripasso lampo

<details>
<summary>Che differenza c'è fra uno stub, una spia (spy) e un mock?</summary>

Lo **stub** restituisce risposte preconfezionate al posto della dipendenza reale. La **spia** registra come è stata chiamata (quante volte, con quali argomenti), da sola o in aggiunta al ruolo di stub. Il **mock**, in senso stretto, è programmato in anticipo con le chiamate che si aspetta di ricevere. Negli strumenti JavaScript «mock» si usa spesso per tutte: `vi.fn()` e `mock.fn()` fanno da spia e, con un'implementazione, da stub.

</details>

<details>
<summary>Quali parti di <code>node:test</code> sono ancora sperimentali in Node 24?</summary>

Il modulo in sé è stabile da Node 20, e i fake timer di `mock.timers` lo sono da Node 23.1. Restano sperimentali la modalità watch del test runner (`node --test --watch`) e la copertura (`--experimental-test-coverage`, con le relative soglie); `mock.module()` è in fase di primo sviluppo e richiede il flag `--experimental-test-module-mocks`.

</details>

<details>
<summary>Perché in un progetto Vite si tende a usare Vitest invece di Jest?</summary>

Perché Vitest riusa la configurazione, i plugin e la pipeline di trasformazione di Vite: TypeScript, JSX e alias funzionano nei test come nell'applicazione. Jest trasforma il codice per conto suo (Babel o `ts-jest`) e ha un supporto ESM ancora sperimentale, quindi richiederebbe una seconda configurazione da tenere allineata. L'API dei due è compatibile, per cui passare dall'uno all'altro costa poco.

</details>

<details>
<summary>Che cos'è l'auto-waiting di Playwright e perché rende i test meno instabili?</summary>

Prima di ogni azione Playwright aspetta che l'elemento sia pronto (visibile, fermo, non coperto, abilitato) e, nelle asserzioni web-first come `toBeVisible()`, riprova fino al timeout. Così non servono pause scritte a mano, che sono la causa tipica dei test che passano o falliscono a caso.

</details>

<details>
<summary>Una copertura del 100% garantisce che il codice sia corretto?</summary>

No. La copertura dice quali righe, rami e funzioni sono stati eseguiti, non se il risultato è stato verificato: un test senza asserzioni copre il codice senza controllare nulla. Inoltre non segnala i casi che il codice non gestisce, perché quelle righe non esistono. Serve a trovare le parti non testate, non a misurare la qualità dei test.

</details>
