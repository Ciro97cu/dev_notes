---
titolo: "Two-way binding [(x)]"
tags: [tipo/concetto, components, templates]
aliases: [two-way, banana in a box]
---
# Two-way binding [(x)]

La sintassi **"banana in a box"** `[(prop)]="expr"` è **zucchero sintattico** per due binding messi insieme: un property binding `[prop]` (il valore che scende dal padre) e un event binding `(propChange)` (l'aggiornamento che risale dal figlio). Funziona su una proprietà esposta come [[model-signal]], oppure sul classico abbinamento `prop`/`propChange`.

```html
<my-input [(value)]="text" />
<!-- equivale a -->
<my-input [value]="text" (valueChange)="text.set($event)" />
```

> [!warning]
> Serve la convenzione di naming `prop` + `propChange`: senza quell'evento il doppio senso non funziona. Con i signal, `model()` fornisce già la coppia pronta all'uso.

**Usato in:** [[02-signal-based-components]]
