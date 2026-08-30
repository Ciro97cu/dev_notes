# NgRx classico (Store + Effects)

La gestione dello stato in stile Redux prima del Signal Store: actions, reducers, selectors, effects. Riferimento storico o per progetti che lo adottano.

## Gestione stato con NgRx classico (Store + Effects)

Prima del <a href="../angular/#/capitoli/09-ngrx-signal-store" target="_blank" rel="noopener">Signal Store</a>, NgRx implementava il pattern **Redux** con quattro elementi: **actions**, **reducers**, **selectors**, **effects**.

**Cos'è uno "state".** Nel frontend lo *stato* è la condizione corrente di un componente o dell'intera app: la rappresentazione di tutti i dati dinamici che cambiano quando l'utente interagisce. NgRx centralizza questa gestione per ottenere coerenza, prevedibilità e manutenibilità.

### Ciclo di vita di un'azione

Un componente **invia** (dispatch) un'azione per notificare che è successo qualcosa. Due possibilità:

1. **Solo aggiornamento di stato** — l'azione non richiede side effect: uno o più **reducer** (funzioni pure) la gestiscono e aggiornano la loro porzione di stato. I componenti leggono lo stato con i **selector** e lo legano alla UI.
2. **Con side effect (async)** — l'azione richiede un effetto collaterale (chiamata HTTP, redirect, scrittura su `localStorage`…): uno o più **effect** lo eseguono e, al termine, inviano una **nuova azione** (es. *success* con il risultato come payload, o *failure*). I reducer gestiscono quell'azione e aggiornano lo stato; i selector espongono la nuova porzione ai componenti.

Questa separazione (actions incapsulano l'intento, reducer decidono il *come* dello stato, selector interrogano, effect isolano i side effect) favorisce modularità, testabilità e scalabilità.

```ts
// action — cosa è successo
const loadFlights = createAction('[Flights] Load', props<{ from: string }>());
const loadOk = createAction('[Flights] Load Success', props<{ flights: Flight[] }>());

// reducer — come cambia lo stato (funzione pura, nuovo oggetto)
const reducer = createReducer(initial,
  on(loadOk, (state, { flights }) => ({ ...state, flights }))
);

// effect — side effect async, poi invia una nuova azione
loadFlights$ = createEffect(() => this.actions$.pipe(
  ofType(loadFlights),
  switchMap(({ from }) => this.http.getFlights(from).pipe(
    map((flights) => loadOk({ flights }))
  ))
));

// selector — interroga una porzione di stato
const selectFlights = createSelector(selectFlightState, (s) => s.flights);
```

### `dispatch: false`

Per **default** NgRx interpreta il valore emesso da un effect come un'**azione da inviare**. Se un effect esegue solo un side effect e **non** deve produrre una nuova azione (es. scrive su `localStorage` e basta), va dichiarato con `{ dispatch: false }`:

```ts
logNavigation$ = createEffect(
  () => this.actions$.pipe(tap(() => /* side effect */ null)),
  { dispatch: false } // senza questo, NgRx invierebbe l'output come azione → errori
);
```

> [!warning]
> Dimenticare `{ dispatch: false }` su un effect che non emette un'azione valida porta a comportamenti anomali (l'app può bloccarsi) **senza** un errore chiaro.

### Shallow comparison

Redux (e quindi NgRx classico) tratta lo stato come un oggetto **immutabile** e rileva i cambiamenti confrontando i **riferimenti** (*shallow comparison*), non ispezionando in profondità ogni proprietà: se il riferimento è cambiato, lo stato è cambiato. È molto più veloce del confronto profondo, ma richiede che ogni aggiornamento produca un **nuovo** oggetto (vedi [Immutabilità](docs/concetti-programmazione.md?id=immutabilità)).

> [!tip]
> Con `selectSignal` (da NgRx 16) il problema dei ri-render inutili si attenua: invece di notificare l'intero store, aggiorna solo i valori che cambiano, per una reattività a grana fine.
