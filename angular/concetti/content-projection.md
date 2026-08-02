---
titolo: "Content projection (ng-content)"
tags: [tipo/concetto, components, templates]
aliases: [ng-content, content projection, proiezione del contenuto]
---
# Content projection (ng-content)

La **content projection** permette a un componente di **mostrare al proprio interno del contenuto che gli passa il padre**, inserendolo dove compare l'elemento `<ng-content>`. Con l'attributo `select` si creano **più slot**, ciascuno riempito in base a un selettore CSS; un `<ng-content>` senza `select` fa da slot di default.

```html
<!-- card.html -->
<header><ng-content select="[card-title]" /></header>
<section><ng-content /></section>   <!-- slot di default -->
```
```html
<app-card>
  <h2 card-title>Titolo</h2>
  <p>corpo proiettato</p>
</app-card>
```

> [!tip]
> Il contenuto proiettato resta nel contesto del **padre** (usa i suoi binding e il suo lifecycle), non del figlio che lo ospita. Per interagirci da codice si usano le [[signal-queries]] (`contentChild`); la versione programmatica con `ng-template`/`ViewContainerRef` è nel capitolo sulle direttive.

**Usato in:** [[02-signal-based-components]], [[10-signal-queries-component-communication]], [[11-directives-templates-containers]]
