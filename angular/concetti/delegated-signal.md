---
titolo: "delegatedSignal() — storico"
tags: [tipo/concetto, signals, reactivity, state-management, legacy]
aliases: [delegatedSignal, delegated signal, signal delegato]
---
# delegatedSignal() — nota storica

> [!warning]
> **Superato da Angular 22.1.** `delegatedSignal` era un **helper custom** dell'example project del libro, non parte di Angular. Da **Angular 22.1** la stessa cosa si ottiene con il [[linked-signal]] nativo passando un'opzione **`set`** → l'helper non serve più. Questa nota resta come **memoria storica**; per il modo attuale vedi **[[linked-signal]]**.

Signal **scrivibile** che non teneva il valore al proprio interno ma **delegava** (affidava ad altri) sia la lettura sia la scrittura — tipicamente a uno store. Risolveva la perdita di reattività del [[linked-signal]] "semplice": con un linked signal l'override tocca solo la copia locale, quindi serve un'azione esplicita (es. un bottone *Search*) per propagare il valore; il `delegatedSignal` invece riscriveva **subito** alla sorgente a ogni update.

Accettava due parametri: una funzione di **lettura** (come `linkedSignal`) e una funzione di **scrittura**, invocata a ogni update per riscrivere il nuovo valore nello store.

```ts
// helper custom (pre-Angular 22.1) — oggi si usa linkedSignal con `set`
protected readonly filter = delegatedSignal(
  () => ({ from: this.store.from(), to: this.store.to() }), // read
  (value) => this.store.updateFilter(value.from, value.to), // write
);
```

Implementazione (nell'example project, `shared/util-common/delegated-signal.ts`): un `linkedSignal` che faceva override di `set`/`update`. Legandolo a una `form()`, conveniva fare [[glossario#debounce-debouncing|debounce]] dell'input (via schema della form) per non ritriggerare la resource a ogni tasto. Alternative dell'epoca: rilassare l'incapsulamento esponendo signal scrivibili dallo store, oppure un handler sull'evento `input`.

**Contesto:** [[05-state-management-services-signals]] · **Sostituito da:** [[linked-signal]]
