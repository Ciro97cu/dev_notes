---
titolo: "model() — ModelSignal"
tags: [tipo/concetto, components, signals]
aliases: [model, ModelSignal, writable input]
---
# model() — ModelSignal

Con **`model()`** si dichiara un input **scrivibile**: mette insieme un [[signal-input]] e un [[signal-output]] (l'evento `<nome>Change`) per abilitare il **two-way binding** ([[two-way-binding]]), cioè il legame a doppio senso tra padre e figlio. Lo si modifica con `.set`/`.update` dall'interno del componente, e la modifica **risale automaticamente** al padre.

```ts
value = model<string>('');     // ModelSignal<string>
value.set('ciao');             // emette automaticamente valueChange
```
```html
<my-input [(value)]="text" />  <!-- bind bidirezionale -->
```

> [!tip]
> In pratica `model` è un input e un output tenuti in sincronia. È la scelta giusta per componenti come form-control o input personalizzati, dove il figlio deve poter aggiornare direttamente il valore del padre.

**Usato in:** [[02-signal-based-components]], [[06-signal-forms]]
