---
titolo: "linkedSignal()"
tags: [tipo/concetto, signals, reactivity, angular-22]
aliases: [linkedSignal, signal collegato]
---
# linkedSignal()

Signal **scrivibile ma derivato**: ha un valore calcolato da una sorgente, ma lo si può anche sovrascrivere con `.set`/`.update`. Quando la sorgente cambia, **si reinizializza** al valore derivato (perdendo l'override). Utile per stato locale che dipende da un input ma deve restare editabile (es. selezione che si resetta al cambio lista).

```ts
const options = signal(['A', 'B']);
const selected = linkedSignal(() => options()[0]); // derivato, ma settabile
selected.set('B');        // override locale
options.set(['X', 'Y']);  // selected torna a 'X'
```

> [!tip]
> Sta a metà tra [[signal]] (scrivibile) e [[computed]] (derivato): scrivibile **e** reattivo alla sorgente.

## Delegare la scrittura con `set`

Oltre alla funzione di computazione (la **lettura**), `linkedSignal` accetta un **oggetto opzioni con un `set`** che delega la **scrittura** ad altre parti del sistema — tipicamente uno store. Il `set` è invocato a ogni `.set`/`.update`, riceve il nuovo valore e lo riscrive alla sorgente; quando lo store aggiorna i suoi signal, il linked signal ricalcola e i due restano **in sync**. Risolve la perdita di reattività del linked signal "semplice", dove l'override tocca solo la copia locale e servirebbe un'azione esplicita per propagarlo.

```ts
protected readonly filter = linkedSignal(
  () => ({ from: this.store.from(), to: this.store.to() }),  // lettura
  {
    set: (value) => this.store.updateFilter(value.from, value.to),  // scrittura → store
  },
);
```

> [!info] Angular 22+
> L'opzione `set` è disponibile da **Angular 22.1**. Prima si otteneva lo stesso effetto con un helper custom (`delegatedSignal`): vedi [[delegated-signal]] per il contesto storico.

**Usato in:** [[03-reactive-design-with-signals]] · [[05-state-management-services-signals]]
