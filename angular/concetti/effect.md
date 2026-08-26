---
titolo: "effect()"
tags: [tipo/concetto, signals, reactivity]
aliases: [effetto, side effect]
---
# effect()

Un **`effect`** serve a eseguire un **side-effect** (cioè qualcosa che agisce sul mondo esterno, come scrivere in console, manipolare il DOM o avviare un timer) in reazione ai signal che legge al suo interno. Gira una prima volta appena creato e poi di nuovo a ogni cambiamento delle dipendenze che ha auto-tracciato ([[reactive-context]]). Va creato dentro un [[injection-context]] (oppure passandogli un `Injector`) e si ripulisce da solo quando il componente che lo ospita viene distrutto.

```ts
effect((onCleanup) => {
  console.log('count =', count());
  const id = setInterval(...);
  onCleanup(() => clearInterval(id)); // cleanup opzionale
});
```

> [!warning]
> Un `effect` non è il posto giusto per **derivare stato** (per quello c'è [[computed]]) né per tenere in sync due signal a vicenda, cosa che rischia di innescare un loop. Scrivere su un signal dentro un effect è sconsigliato; se serve davvero, conviene valutare un [[linked-signal]]. Per leggere un signal senza però dipenderne c'è [[untracked]].

**Usato in:** [[03-reactive-design-with-signals]]
