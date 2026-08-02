---
titolo: "input() — InputSignal"
tags: [tipo/concetto, components, signals]
aliases: [input, InputSignal, signal input]
---
# input() — InputSignal

Con **`input()`** si dichiara un **input di componente** — cioè un dato che arriva dal componente padre — sotto forma di **signal di sola lettura**. Prende il posto del vecchio decoratore `@Input()`: il valore si legge come un signal (`this.flight()`), è reattivo e si può quindi usare dentro [[computed]], [[effect]] e nel template.

```ts
flight = input<Flight>();                 // InputSignal<Flight | undefined>
id = input.required<number>();            // obbligatorio
label = input('', { alias: 'caption' });  // alias + default
count = input(0, { transform: numberAttribute }); // transform
```

> [!tip]
> `input.required` non ha un valore di default e fa **fallire la compilazione** se il padre non lo passa. Per un input **scrivibile** (bidirezionale) si usa invece [[model-signal]].

**Usato in:** [[02-signal-based-components]]
