---
titolo: "Template-Driven Forms"
tags: [tipo/cert, forms, legacy]
livello: [junior, mid]
---
# Template-Driven Forms
> Cert Angular · non coperto dal *Modern Angular* (il vault usa i Signal Forms)

Nelle **template-driven forms** la form è pilotata dal **template**: si annotano i controlli con direttive (`ngModel`, `ngForm`, `ngModelGroup`) e Angular costruisce **implicitamente** il modello dei dati e lo stato di validazione dietro le quinte. Non esiste una struttura dati dichiarata nella classe: il "grafo" della form vive nel markup. È l'approccio più rapido per form semplici; l'esame lo chiede perché è ancora diffusissimo e perché espone i concetti di stato del controllo e validazione via attributi.

## `FormsModule`
Tutte le direttive template-driven (`ngModel`, `ngForm`, `ngModelGroup`) vivono in **`FormsModule`**, che va importato dove serve — nel componente standalone via `imports`, o in un NgModule (vedi [[ngmodules]]).

```ts
// src/app/flight-search/flight-search.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-flight-search',
  imports: [FormsModule],
  templateUrl: './flight-search.html',
})
export class FlightSearch {
  from = 'Hamburg';
  to = 'Graz';

  search(f: NgForm): void {
    if (f.invalid) return;
    console.log(f.value); // { from: 'Hamburg', to: 'Graz' }
  }
}
```

## `[(ngModel)]` e l'obbligo dell'attributo `name`
La direttiva `ngModel` è il cuore delle template-driven forms: applicata a un controllo, lo registra nella form e ne collega il valore alla classe. La si può usare in tre forme, che si distinguono per la direzione del legame fra controllo e proprietà.

- **`[(ngModel)]="prop"`** — two-way binding (banana in a box): sincronizza il valore del controllo con la proprietà della classe in entrambe le direzioni.
- **`[ngModel]="prop"`** — one-way: imposta il valore iniziale ma non ri-scrive sulla proprietà.
- **`ngModel`** (senza binding) — registra il controllo nella form (per validazione/stato) senza legarlo a una proprietà.

Dentro un `<form>`, ogni controllo con `ngModel` **deve** avere un attributo **`name`**: è la chiave con cui Angular lo registra nel `NgForm` e con cui compare in `f.value`.

```html
<!-- src/app/flight-search/flight-search.html -->
<input name="from" [(ngModel)]="from" />
<input name="to" [(ngModel)]="to" />
```

> [!warning]
> Un `ngModel` dentro un `<form>` **senza** `name` lancia a runtime: *"If ngModel is used within a form tag, either the name attribute must be set or the form control must be defined as 'standalone' in ngModelOptions"*. Per usare `ngModel` fuori da una form (o volutamente escluso dal modello) serve `[ngModelOptions]="{ standalone: true }"`.

## Template reference: `#ref="ngModel"` e `#f="ngForm"`
La direttiva `ngForm` viene applicata **automaticamente** a ogni `<form>` quando `FormsModule` è importato: la si "cattura" in una template reference variable per leggerne stato e valore. Analogamente, esportando `ngModel` da un input si ottiene il riferimento al singolo `NgModel` (per mostrare errori sul campo).

```html
<form #f="ngForm" (ngSubmit)="search(f)">
  <input name="from" [(ngModel)]="from" #fromCtrl="ngModel" required minlength="3" />

  @if (fromCtrl.invalid && fromCtrl.touched) {
    <small>Partenza obbligatoria (min 3 caratteri)</small>
  }

  <button [disabled]="f.invalid">Cerca</button>
</form>
```

Qui `f` è un `NgForm` (con `f.value`, `f.valid`, `f.controls`…) e `fromCtrl` è un `NgModel` (con `fromCtrl.value`, `fromCtrl.errors`, `fromCtrl.touched`…).

## `(ngSubmit)`
`(ngSubmit)` è l'evento emesso da `NgForm` al submit: va preferito a un `(click)` sul bottone perché intercetta anche l'invio da tastiera e **previene** il reload di default del browser. Il bottone di submit non richiede `type="submit"` esplicito se è l'unico bottone nel form, ma dichiararlo è buona pratica.

## Validatori come attributi
In template-driven i validatori sono **attributi HTML** che Angular mappa sulle relative `Validators` (vedi le stesse in [[forms-reactive]]):

| Attributo | Effetto |
| --- | --- |
| `required` | valore non vuoto |
| `minlength` / `maxlength` | lunghezza minima/massima della stringa |
| `pattern` | match con una regex |
| `email` | formato email valido |
| `min` / `max` | valore numerico minimo/massimo |

```html
<input
  name="email"
  [(ngModel)]="email"
  required
  email
  #emailCtrl="ngModel"
/>
@if (emailCtrl.errors?.['email']) {
  <small>Email non valida</small>
}
```

Gli errori finiscono in `emailCtrl.errors`, un oggetto `{ [key: string]: any } | null`: `required` produce `{ required: true }`, `minlength` produce `{ minlength: { requiredLength, actualLength } }`, ecc.

## `ngModelGroup`
Con `ngModelGroup` si raggruppano più controlli in un **sotto-oggetto** del modello, dotato di stato e validità propri. È il modo per dare una struttura annidata ai dati del form senza doverla dichiarare nella classe, coerentemente col fatto che nel template-driven il modello resta implicito.

```html
<form #f="ngForm">
  <fieldset ngModelGroup="passenger" #pass="ngModelGroup">
    <input name="firstName" ngModel required />
    <input name="lastName" ngModel required />
  </fieldset>
</form>
<!-- f.value === { passenger: { firstName: '...', lastName: '...' } } -->
```

`pass` è un `NgModelGroup` con `pass.valid`/`pass.value` del solo gruppo.

## Stati del controllo e classi CSS
Ogni controllo (e la form intera) espone dei **flag booleani** di stato, sempre a coppie complementari, più i flag di validità:

| Flag | Complemento | Significato |
| --- | --- | --- |
| `touched` | `untouched` | l'utente ha visitato (blur) il campo |
| `dirty` | `pristine` | il valore è stato modificato |
| `valid` | `invalid` | supera / non supera i validatori |
| `pending` | — | validazione **async** in corso |
| `disabled` | `enabled` | controllo abilitato o meno |

A ciascun flag Angular sincronizza una **classe CSS** sull'elemento, utile per lo styling condizionale:

`ng-touched` / `ng-untouched` · `ng-dirty` / `ng-pristine` · `ng-valid` / `ng-invalid` · `ng-pending`. Sul `<form>` compare anche `ng-submitted` dopo il primo submit.

```css
input.ng-invalid.ng-touched {
  border-color: red; /* errore mostrato solo dopo che l'utente ha toccato il campo */
}
```

> [!warning]
> La sincronizzazione del modello in template-driven è **asincrona**: `[(ngModel)]` aggiorna la proprietà dopo un tick, non nello stesso event handler. Impostare `from` da codice e leggere subito `f.value` può dare il valore vecchio. La reattività "immediata" è invece un tratto delle reactive forms.

> [!warning]
> Mostrare gli errori subito (`invalid`) è sgradevole: l'utente li vede prima ancora di digitare. Si combina sempre con `touched` (o `dirty`) — es. `ctrl.invalid && ctrl.touched` — per rivelarli solo dopo l'interazione.

> [!info] vs Modern
> Il vault non usa `ngModel`: adotta i **Signal Forms** (`@angular/forms/signals`), dove `form()` genera un albero di field reattivi e i validatori si dichiarano in uno schema (`required`, `minLength`, custom). Two-way binding, stato (`dirty`/`invalid`/`touched`) e submit diventano signal. Tutto in [[06-signal-forms]] (qui non ripetuto).

> [!info] Stato attuale
> `FormsModule` e le template-driven forms **non sono deprecate**: restano pienamente supportate e convivono con `@angular/forms/signals`. I **Signal Forms** sono l'approccio moderno raccomandato per il codice nuovo, ma in Angular 22 sono **ancora sperimentali** (package `@angular/forms/signals`, l'API può cambiare); l'API classica resta lo standard **stabile** delle codebase esistenti ([angular.dev/guide/forms/template-driven-forms](https://angular.dev/guide/forms/template-driven-forms) · [panoramica forms](https://angular.dev/guide/forms)).

## Ripasso lampo

<details>
<summary>Perché un <code>ngModel</code> dentro un <code><form></code> richiede l'attributo <code>name</code>?</summary>

Perché `name` è la chiave con cui il controllo si registra nel `NgForm` e con cui compare in `f.value`. Senza, si ha un errore a runtime; l'unica alternativa è dichiararlo `[ngModelOptions]="{ standalone: true }"` per escluderlo dal modello.

</details>

<details>
<summary>Che differenza c'è fra <code>[(ngModel)]</code>, <code>[ngModel]</code> e <code>ngModel</code> da solo?</summary>

`[(ngModel)]` è two-way (legge e scrive la proprietà); `[ngModel]` è one-way (imposta solo il valore iniziale); `ngModel` senza binding registra il controllo per validazione/stato senza legarlo ad alcuna proprietà.

</details>

<details>
<summary>Come si ottiene il riferimento alla form e a un singolo controllo nel template?</summary>

Con template reference variable che esportano le direttive: `#f="ngForm"` dà il `NgForm` (valore/validità dell'intera form), `#ctrl="ngModel"` dà il singolo `NgModel` (per errori e stato del campo).

</details>

<details>
<summary>Perché conviene combinare <code>invalid</code> con <code>touched</code> prima di mostrare un errore?</summary>

Per non mostrare l'errore appena la form si carica (quando il campo è vuoto ma l'utente non l'ha ancora toccato). `invalid && touched` rivela il messaggio solo dopo che l'utente ha interagito (blur) col campo.

</details>

<details>
<summary>Quali classi CSS applica Angular a un input non valido e già visitato?</summary>

`ng-invalid` e `ng-touched` (oltre a `ng-dirty` se modificato). Si può quindi stilizzare con un selettore come `input.ng-invalid.ng-touched`.

</details>

**In sintesi:**
- Template-driven = modello e validazione **impliciti**, guidati dalle direttive nel template; serve `FormsModule`.
- `[(ngModel)]` per il two-way binding, con `name` obbligatorio dentro `<form>`; `#f="ngForm"` e `#ref="ngModel"` per accedere a stato e valore; submit via `(ngSubmit)`.
- Validatori come **attributi** (`required`, `minlength`, `pattern`, `email`…); errori in `ctrl.errors`; `ngModelGroup` per sotto-oggetti.
- Stati `touched`/`dirty`/`valid`/`pending` e classi CSS `ng-*` per lo styling; sync del modello **asincrona**.
- Equivalente moderno = **Signal Forms**, in [[06-signal-forms]]; il classico resta lo standard stabile (non deprecato), i Signal Forms sono ancora sperimentali.
