---
modulo: 9
titolo: "Web Components"
tags: [tipo/modulo, componenti, moderno]
---
# 09 · Web Components
> modulo 9 — *HTML* · rif. MDN · WHATWG/W3C

I **Web Components** sono un insieme di standard del browser per creare **elementi HTML propri** — riutilizzabili, con markup, stile e comportamento incapsulati — che funzionano **ovunque**: con qualsiasi framework o con nessuno, perché sono nativi della piattaforma. Invece di comporre l'ennesimo `<div class="card">`, si definisce un vero `<user-card></user-card>` che il browser conosce e tratta come un elemento a tutti gli effetti.

## I tre pilastri

La tecnologia nasce dalla combinazione di tre standard, ognuno con un compito:

1. **Custom Elements** — registrare un **nuovo tag** legato a una classe JavaScript.
2. **Shadow DOM** — un DOM interno **incapsulato**, con stili che non escono e non entrano.
3. **HTML Templates** (`<template>` e `<slot>`) — markup riutilizzabile e "buchi" dove **proiettare** contenuto.

## Custom Elements: un tag tutto tuo

Un custom element è una classe che estende `HTMLElement`, registrata con un nome:

```js
class UserCard extends HTMLElement {
  static observedAttributes = ['name'];
  connectedCallback()    { /* quando l'elemento entra nel DOM */ }
  disconnectedCallback() { /* quando esce dal DOM */ }
  attributeChangedCallback(nome, prima, dopo) { /* un attributo osservato è cambiato */ }
}
customElements.define('user-card', UserCard);
```

```html
<user-card name="Anna"></user-card>
```

I **lifecycle callback** sono i momenti in cui il browser avvisa il componente: quando entra o esce dalla pagina (`connectedCallback`/`disconnectedCallback`) e quando cambia uno degli attributi dichiarati in `observedAttributes`. Una regola sul nome da non dimenticare: **deve contenere un trattino** (`user-card`, non `usercard`), così non collide mai con un futuro tag HTML standard.

## Shadow DOM: l'incapsulamento

Chiamando `element.attachShadow({ mode: 'open' })` si crea uno **shadow root**: un albero DOM separato, "nascosto" dentro l'elemento. Il vantaggio grosso è l'**incapsulamento degli stili** — il CSS scritto dentro lo shadow DOM vale **solo lì**, e quello della pagina non entra. È l'isolamento vero che con `<div>` e classi non si ha mai, dove ogni regola è globale e rischia di collidere.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 620 210" role="img" aria-label="Un custom element user-card: contiene la light DOM (il contenuto scritto tra i tag) e uno shadow root incapsulato con stili scoped e un template che proietta la light DOM in uno slot" style="width:100%;max-width:620px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="16" y="22" width="588" height="172" rx="10" fill="none" stroke="currentColor" stroke-width="1.7"/><text x="30" y="42" font-size="12" font-weight="700" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;user-card&gt;</text><text x="120" y="64" font-size="9.5" text-anchor="middle" opacity=".7">light DOM</text><rect x="40" y="72" width="160" height="40" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="120" y="96" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;span&gt;Anna&lt;/span&gt;</text><rect x="270" y="56" width="316" height="124" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3"/><text x="286" y="74" font-size="9.5" opacity=".8">shadow root — incapsulato</text><rect x="286" y="84" width="284" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="296" y="103" font-size="9.5" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;style&gt; .card { … } &lt;/style&gt;</text><rect x="286" y="124" width="284" height="48" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="296" y="142" font-size="9.5" font-family="ui-monospace,Menlo,Consolas,monospace">&lt;div class="card"&gt;</text><text x="296" y="159" font-size="9.5" font-family="ui-monospace,Menlo,Consolas,monospace">  &lt;slot&gt;&lt;/slot&gt; &lt;/div&gt;</text><path d="M200 92 L282 155" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M286 155 L278 151 L278 159 Z" fill="currentColor"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'elemento ha una <strong>light DOM</strong> (ciò che si scrive tra i suoi tag) e uno <strong>shadow root</strong> incapsulato con i propri stili e markup. Lo <code>&lt;slot&gt;</code> è il "buco" dove la light DOM viene <strong>proiettata</strong> dentro lo shadow DOM. Gli stili dello shadow non escono, quelli della pagina non entrano.</figcaption>
</figure>

## Template e `<slot>`

Due elementi HTML completano il quadro:

- **`<template>`** — markup **inerte**: il browser lo tiene da parte senza renderizzarlo (né immagini caricate, né script eseguiti) finché non lo si clona. Serve a definire una volta la struttura interna del componente.
- **`<slot>`** — un **segnaposto** dove il contenuto scritto tra i tag dell'elemento (la *light DOM*) viene proiettato dentro lo shadow DOM. Così chi usa il componente mette il proprio contenuto, e il componente decide *dove* farlo comparire.

## Quando usarli — e i limiti

Il punto di forza è essere **framework-agnostic**: un Web Component è utile per **design system** condivisi tra team e tecnologie diverse, o per widget da incorporare in pagine "ostili" (un CMS, un'app di un altro framework). Ma vanno scelti a ragion veduta, perché la piattaforma dà le fondamenta e non le comodità:

- l'**accessibilità** va gestita a mano (nessuna magia: ruoli, focus, tastiera restano compito tuo — vedi [[07-accessibilita-aria]]);
- l'integrazione con i **form** richiede lavoro (i *form-associated custom elements* con `ElementInternals`);
- **SSR e hydration** sono più delicati che con un framework;
- la *developer experience* è più spartana. Per scriverli con meno cerimonie si usa spesso una micro-libreria come **[Lit](https://lit.dev/)**.

## E i framework? (l'aggancio con Angular)

Web Components e framework non sono in competizione: i Web Components sono il **livello basso** (la piattaforma), i framework — React, Vue, Angular — aggiungono reattività, routing e strumenti. E si parlano: **Angular Elements** (`@angular/elements`, con `createCustomElement`) impacchetta un componente Angular **come** custom element, così un widget scritto in Angular si può usare in una pagina non-Angular o dentro un altro framework. È il motivo per cui li si incontra nelle **librerie Angular** e nei micro-frontend (approfondito in <a href="../angular/#/capitoli/18-micro-frontends" target="_blank" rel="noopener">Angular · Micro-frontend</a>).

> [!info] Baseline
> **Custom Elements**, **Shadow DOM** e `<template>` sono **Baseline: widely available** — supportati da tutti i browser core da anni. [MDN — Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

## Ripasso lampo

<details>
<summary>Cosa sono i Web Components e perché "funzionano ovunque"?</summary>

Sono standard del browser per creare **elementi HTML propri** riutilizzabili (markup, stile e comportamento incapsulati). Funzionano con qualsiasi framework o con nessuno perché sono **nativi della piattaforma**, non legati a una libreria.

</details>

<details>
<summary>Quali sono i tre pilastri?</summary>

**Custom Elements** (registrare un nuovo tag legato a una classe), **Shadow DOM** (un DOM interno con stili incapsulati) e **HTML Templates** (`<template>` per markup inerte riutilizzabile e `<slot>` per proiettare contenuto).

</details>

<details>
<summary>A cosa serve il <code>Shadow DOM</code>?</summary>

A **incapsulare**: crea un albero DOM separato dentro l'elemento, con stili che valgono **solo lì** (non escono verso la pagina, e la pagina non entra). È l'isolamento che con `<div>` e classi globali non si ottiene.

</details>

<details>
<summary>Perché il nome di un custom element deve avere un trattino?</summary>

Per non collidere mai con i tag HTML standard (presenti o futuri): `user-card` è garantito "tuo", `usercard` no. È una regola della specifica.

</details>

<details>
<summary>Che rapporto c'è con i framework come Angular?</summary>

Sono complementari: i Web Components sono la piattaforma di basso livello, i framework aggiungono reattività e strumenti. **Angular Elements** (`createCustomElement`) impacchetta un componente Angular come custom element, usabile fuori da Angular — utile per librerie condivise e micro-frontend.

</details>

**In sintesi:**
- I **Web Components** permettono di definire **elementi HTML propri** (`<user-card>`), nativi e riutilizzabili con o senza framework.
- Tre pilastri: **Custom Elements** (nuovo tag + classe con lifecycle), **Shadow DOM** (stili incapsulati), **`<template>`/`<slot>`** (markup riutilizzabile + proiezione).
- Il nome richiede un **trattino**; l'accessibilità e i form restano **a carico tuo**; per l'ergonomia si usa spesso **Lit**.
- Sono complementari ai framework: **Angular Elements** impacchetta un componente Angular come custom element.
