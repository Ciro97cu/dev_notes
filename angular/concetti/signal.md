---
titolo: "signal()"
tags: [tipo/concetto, signals, reactivity]
aliases: [WritableSignal, segnale]
---
# signal()

Un **signal** è un contenitore per un valore che cambia nel tempo e che **avvisa** chi lo sta usando ogni volta che quel valore cambia: è così che Angular sa cosa ridisegnare quando lo stato dell'app si aggiorna. Lo si crea con `signal(valoreIniziale)`, ottenendo un `WritableSignal` (un signal *scrivibile*): lo si **legge** chiamandolo come una funzione — `count()` — e lo si **modifica** con `.set(nuovoValore)`, oppure con `.update(prev => next)` quando il nuovo valore dipende dal precedente. Il meccanismo chiave è questo: quando un signal viene letto dentro un *contesto reattivo* ([[reactive-context]]) — un `computed`, un `effect` o il template — Angular **registra** quella dipendenza, così, appena il valore cambia, tutto ciò che lo stava usando si ricalcola da sé, senza doverlo aggiornare a mano.

```ts
const count = signal(0);
count();             // lettura → 0
count.set(5);        // scrittura
count.update(n => n + 1); // 6
```

> [!warning]
> Un signal avvisa chi dipende da lui **solo se il valore cambia davvero** — confronto fatto con l'[[equality-immutability|equality]] (di default `Object.is`). Modificare un oggetto "sul posto" (`obj.x = 1`) non conta come cambiamento e **non** fa scattare l'aggiornamento: per questo si passa sempre un **nuovo riferimento** con `.set`/`.update`.

**Usato in:** [[02-signal-based-components]], [[03-reactive-design-with-signals]], [[05-state-management-services-signals]]
