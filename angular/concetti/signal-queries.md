---
titolo: "Signal queries (viewChild / contentChild)"
tags: [tipo/concetto, components, signals]
aliases: [viewChild, viewChildren, contentChild, contentChildren]
---
# Signal queries

Le **signal query** recuperano riferimenti a elementi o componenti della pagina sotto forma di **signal**, al posto dei decoratori `@ViewChild`/`@ContentChild`. Si dividono in due famiglie a seconda di *dove* cercano: `viewChild`/`viewChildren` guardano dentro il **proprio template** (la *view* del componente), mentre `contentChild`/`contentChildren` guardano il contenuto **proiettato** dal padre via [[content-projection]] (il *content*).

```ts
title = viewChild<ElementRef>('title');     // Signal<ElementRef | undefined>
items = contentChildren(ItemComponent);     // Signal<readonly ItemComponent[]>
first = viewChild.required(ChildCmp);        // versione required
```

> [!warning]
> Il riferimento è disponibile solo dopo che la rispettiva fase di rendering è avvenuta: conviene leggerlo dentro un [[effect]] o negli hook appropriati, non nel costruttore. Il libro invita inoltre a **mettere in discussione** l'abuso di `viewChild`, preferendo dove possibile input/output e servizi.

**Usato in:** [[10-signal-queries-component-communication]], [[11-directives-templates-containers]]
