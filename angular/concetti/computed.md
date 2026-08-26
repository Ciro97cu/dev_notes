---
titolo: "computed()"
tags: [tipo/concetto, signals, reactivity]
aliases: [computed signal, segnale derivato]
---
# computed()

Un **`computed`** è un signal di **sola lettura** il cui valore è **derivato** da altri signal: invece di custodire un valore proprio, lo calcola a partire da quelli. La funzione che gli si passa viene rieseguita solo quando cambia uno dei signal che ha letto, e il risultato viene **memoizzato** (conservato e riutilizzato finché le dipendenze non cambiano). Il calcolo è inoltre **lazy**: avviene alla prima lettura, non al momento della creazione.

```ts
const price = signal(100);
const qty = signal(2);
const total = computed(() => price() * qty()); // 200, ricalcolato on-demand
```

> [!tip]
> Le dipendenze sono **auto-tracciate** ([[reactive-context]]): Angular registra solo i signal effettivamente letti durante l'esecuzione. Un ramo non percorso (per esempio dentro un `if` che risulta falso) non crea alcuna dipendenza.

> [!warning]
> La funzione di un `computed` deve essere **pura**: nessun side-effect e nessun `.set()` su altri signal. Quando serve produrre un effetto collaterale si usa invece un [[effect]].

**Usato in:** [[03-reactive-design-with-signals]], [[02-signal-based-components]]
