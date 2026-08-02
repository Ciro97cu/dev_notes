---
titolo: "Lightweight store (signal-based)"
tags: [tipo/concetto, state-management, signals, architecture, angular-22]
aliases: [store, signal store pattern, lightweight store]
---
# Lightweight store (signal-based)

Il **lightweight store** è un modo di gestire lo stato **senza librerie esterne**: un service [[service|@Service]] che tiene lo stato in [[signal]] privati ed espone verso l'esterno solo signal e [[computed]] di **sola lettura**, più dei metodi per modificarlo. Così si ottiene un **unidirectional data flow**, un flusso a senso unico: la UI legge i valori derivati e può cambiarli soltanto passando dai metodi, mai toccando lo stato direttamente.

```ts
@Service()   // Angular 22; pre-22: @Injectable({ providedIn: 'root' }). A livello feature: @Service({ autoProvided: false }) + providers
export class FlightStore {
  private _flights = signal<Flight[]>([]);
  readonly flights = this._flights.asReadonly();
  readonly count = computed(() => this._flights().length);
  load(criteria: string) { /* set _flights */ }
}
```

> [!tip]
> La granularità e la collocazione contano: uno store per-feature conviene fornirlo a livello [[providers|route o componente]], così ha lo scope giusto e viene ripulito da solo; conviene inoltre evitare cicli e ridondanze tra store diversi. Per esigenze più ricche c'è [[09-ngrx-signal-store|NgRx Signal Store]].

**Usato in:** [[05-state-management-services-signals]], [[08-sustainable-architectures]]
