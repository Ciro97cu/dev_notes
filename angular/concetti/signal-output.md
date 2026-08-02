---
titolo: "output() — OutputEmitterRef"
tags: [tipo/concetto, components, signals]
aliases: [output, OutputEmitterRef, signal output]
---
# output() — OutputEmitterRef

Con **`output()`** si dichiara un **evento** che il componente emette verso il padre — il canale con cui il figlio comunica "in su". Prende il posto di `@Output()` con `EventEmitter`: restituisce un `OutputEmitterRef`, e l'evento si lancia con `.emit(value)`.

```ts
flightChange = output<Flight>();
// ...
this.flightChange.emit(updated);
```
```html
<flight-card (flightChange)="onChange($event)" />
```

> [!tip]
> È la coppia naturale di [[signal-input]] per il pattern "input giù, evento su". Per il caso bidirezionale combinato (`[(x)]`) c'è invece [[model-signal]] / [[two-way-binding]].

**Usato in:** [[02-signal-based-components]]
