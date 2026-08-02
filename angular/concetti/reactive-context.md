---
titolo: "Reactive context & auto-tracking"
tags: [tipo/concetto, signals, reactivity]
aliases: [auto-tracking, contesto reattivo, signal graph]
---
# Reactive context & auto-tracking

Il **contesto reattivo** è l'esecuzione di una funzione "tracciante" — un [[computed]], un [[effect]] o il template — durante la quale ogni signal **letto** viene automaticamente registrato come dipendenza. Questo *auto-tracking* costruisce il **signal graph** (il grafo dei signal): la rete di chi dipende da chi. Grazie a esso, quando un signal cambia si ricalcolano **solo** i nodi che davvero ne dipendono, e non tutto il resto.

Due caratteristiche contano più delle altre. Primo, le dipendenze sono **dinamiche**: valgono solo i signal letti *in quella* esecuzione, quindi un ramo di codice non percorso (per esempio un `if` in cui non si entra) non crea dipendenza. Secondo, la propagazione è **glitch-free**: Angular non lascia mai vedere ai consumatori stati intermedi incoerenti, ma solo valori già stabilizzati (vedi [[equality-immutability]]). Quando serve leggere un signal senza dipenderne si usa [[untracked]].

> [!tip]
> Ragionare in termini di **grafo dei signal** (le sorgenti che alimentano i derivati, che a loro volta alimentano effetti e UI) è il modello mentale chiave del reactive design.

**Usato in:** [[03-reactive-design-with-signals]]
