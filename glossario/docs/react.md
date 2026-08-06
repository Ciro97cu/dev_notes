# React

Termini dell'ecosistema React. Il repo non ha (ancora) un vault dedicato a React: queste voci restano qui come riferimento.

## Codice dichiarativo

In React si scrive codice **dichiarativo**: si descrive *cosa* deve mostrare l'interfaccia, non *come* renderizzarla passo passo (approccio *imperativo*). È React a occuparsi del "come".

```jsx
// Imperativo (DOM vanilla): si descrive OGNI passo
const btn = document.createElement('button');
btn.textContent = 'Clicca qui';
document.body.appendChild(btn);

// Dichiarativo (React): si dichiara solo il risultato voluto
function Button() {
  return <button>Clicca qui</button>;
}
```

Vantaggi: maggiore **leggibilità** (il codice descrive l'intento), **manutenibilità** e **testabilità**.

## Hooks

Gli **Hooks** sono funzioni speciali che permettono ai componenti **funzionali** di "agganciare" funzionalità di React come stato e ciclo di vita — cose che prima erano possibili solo nei componenti a classe. Permettono di riusare la logica di stato tra componenti senza modificare la gerarchia.

Esempi: `useState` (stato locale), `useEffect` (effetti collaterali, es. fetch dei dati).

```jsx
import { useState } from 'react';

function Contatore() {
  const [count, setCount] = useState(0); // [valore corrente, funzione per aggiornarlo]
  return <button onClick={() => setCount(count + 1)}>Cliccato {count} volte</button>;
}
```

**Regole degli Hooks:**
1. Vanno chiamati **solo** dentro componenti funzionali o dentro altri Hook (custom hook).
2. Vanno chiamati al **livello superiore** del componente, mai dentro `if`, cicli o funzioni annidate — così l'ordine di invocazione resta stabile tra un render e l'altro.

## Errori in console

Quando si verifica un errore a runtime, l'interprete JavaScript stampa un messaggio in console con informazioni utili a individuarlo. Esempio classico:

```
TypeError: Cannot read properties of undefined (reading 'nome')
    at ComponenteReact (ComponenteReact.js:10)
```

Come si legge:
1. **Tipo** — `TypeError`: si sta usando un valore in modo incompatibile con il suo tipo.
2. **Descrizione** — `Cannot read properties of undefined (reading 'nome')`: si legge la proprietà `nome` di qualcosa che è `undefined`.
3. **Stack trace** — `at … (ComponenteReact.js:10)`: dove è avvenuto l'errore (file e riga).

In questo caso, alla riga 10 l'oggetto da cui si legge `nome` non è definito: va verificato perché è `undefined` (dato non ancora caricato, prop mancante, ecc.).

## Minificazione e ottimizzazione

In fase di build si **minifica** e si **ottimizza** il codice per ridurre le dimensioni dei file (JS, CSS) e migliorare i tempi di caricamento — critico su connessioni lente e dispositivi modesti.

- **Minificazione** — rimuove spazi e commenti e accorcia i nomi delle variabili, così `function calcolaTotale(prezzo, quantita) {…}` diventa `function c(p,q){…}`.
- **Ottimizzazione** — semplifica espressioni, elimina codice morto (*dead code elimination*), pre-calcola costanti (*constant folding*), così `var x = 10 * 5;` diventa `var x = 50;`.

## Million.js

Million.js è un compilatore che ottimizza i componenti React, dichiarato "fino al 70% più veloce" dagli autori. React aggiorna la UI in due fasi — **rendering** (genera un'istantanea del componente) e **riconciliazione** (confronta l'istantanea con la precedente per capire cosa aggiornare); la riconciliazione può rallentare con molti elementi JSX. Million.js **bypassa la riconciliazione** aggiornando direttamente il nodo DOM.

Due modalità:
- **Automatica** — monitora i cambi di stato e aggiorna il DOM da sé. È il default se installato via CLI ed è il modo **raccomandato**: ottimizza senza modifiche significative al codice.
- **Manuale** — controllo completo: si aggiorna il DOM esplicitamente con i metodi della libreria. Più flessibile, per casi particolari.

Personalizzazione della modalità automatica (oggetto `auto`):
- `threshold` — soglia oltre cui un componente viene convertito; più alta è, meno componenti vengono ottimizzati.
- `skip` — array di identificatori (nomi di hook, variabili, funzioni) da **saltare**.

Casi utili:
- **Ignorare un componente** che dà problemi: commento `// million-ignore` sopra di esso.
- **Silenziare** i messaggi di aiuto: opzione `mute: true` nell'oggetto `auto`.
