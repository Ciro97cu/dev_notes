---
titolo: "Equality & immutability"
tags: [tipo/concetto, signals, reactivity]
aliases: [equality, immutability, glitch-free]
---
# Equality & immutability

Un [[signal]] avvisa chi dipende da lui **solo se il nuovo valore è diverso** dal precedente. Il confronto avviene di default con `Object.is`, ma si può personalizzare con l'opzione `equal`. È proprio per questo che lo stato va trattato in modo **immutabile**: invece di modificare un valore sul posto, se ne crea uno nuovo e si sostituisce il riferimento.

```ts
// ❌ non notifica: stesso riferimento
list().push(x);
// ✅ notifica: nuovo array
list.update(l => [...l, x]);
```

> [!warning]
> Le mutazioni "sul posto" (`obj.prop = ...`, `arr.push(...)`) lasciano computed, effect e UI **non aggiornati**, perché il riferimento non cambia e il signal non se ne accorge. Questo è anche alla base della proprietà **glitch-free**: i consumatori vedono soltanto valori coerenti e già stabilizzati.

**Usato in:** [[03-reactive-design-with-signals]]
