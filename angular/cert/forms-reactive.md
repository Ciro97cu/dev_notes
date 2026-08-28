---
titolo: "Reactive Forms"
tags: [tipo/cert, forms, legacy]
livello: [mid]
---
# Reactive Forms
> Cert Angular · non coperto dal *Modern Angular* (il vault usa i Signal Forms)

Nelle **reactive forms** (dette anche *model-driven*) la struttura della form è dichiarata **esplicitamente nella classe** come albero di oggetti `FormControl`/`FormGroup`/`FormArray`; il template si limita a legarsi a quel modello con delle direttive. Il modello è **immutabile e sincrono**: leggerlo dà sempre il valore corrente, e lo stato/valore sono esposti anche come `Observable`. È l'approccio scelto per form complesse, dinamiche o fortemente validate — ed è ciò che l'esame verifica per la parte forms "avanzata".

## `ReactiveFormsModule`
Le direttive (`formGroup`, `formControlName`, …) vivono in **`ReactiveFormsModule`**, da importare dove servono (componente standalone o NgModule — vedi [[ngmodules]]). È mutualmente alternativo a `FormsModule`: non si usano `ngModel` e reactive insieme sullo stesso controllo.

```ts
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-flight-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './flight-edit.html',
})
export class FlightEdit { /* ... */ }
```

## `FormControl`
Rappresenta **un singolo campo**: valore, validatori e stato. Il costruttore accetta valore iniziale e (opzionalmente) validatori sincroni e asincroni, oppure un oggetto di opzioni.

```ts
import { FormControl, Validators } from '@angular/forms';

const from = new FormControl('Hamburg', {
  validators: [Validators.required, Validators.minLength(3)],
  updateOn: 'blur',        // 'change' (default) | 'blur' | 'submit'
  nonNullable: true,       // reset() torna al valore iniziale, non a null
});

from.value;        // 'Hamburg'
from.valid;        // true/false
from.setValue('Graz');
```

`updateOn` decide **quando** il controllo si aggiorna (e rivalida): `'change'` a ogni tasto, `'blur'` all'uscita dal campo, `'submit'` solo al submit della form.

## `FormGroup`
Aggrega più controlli in un **oggetto** con chiavi fisse; il suo valore è la composizione dei figli, e la sua validità è l'AND delle validità dei figli.

```ts
import { FormGroup, FormControl, Validators } from '@angular/forms';

const form = new FormGroup({
  from: new FormControl('', Validators.required),
  to: new FormControl('', Validators.required),
});

form.value;                 // { from: '', to: '' }
form.get('from')?.setValue('Hamburg');
form.controls.to.valid;     // accesso tipizzato ai figli
```

## `FormArray`
Un `FormArray` è il fratello dinamico del `FormGroup`: aggrega i figli non per chiave ma per **indice**, come una lista. È la struttura giusta quando il numero di controlli non è noto in anticipo e cambia a runtime — si aggiungono e si rimuovono con `push`, `removeAt`, `insert` e `clear`, e il suo valore è l'array dei valori dei figli.

```ts
import { FormArray, FormControl } from '@angular/forms';

const passengers = new FormArray([new FormControl('Alice')]);
passengers.push(new FormControl('Bob'));
passengers.removeAt(0);
passengers.value; // ['Bob']
```

## `FormBuilder`
Riduce la verbosità del costruire l'albero a mano. Si ottiene via `inject(FormBuilder)` (o costruttore) e offre `group`/`control`/`array`.

```ts
import { inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

export class FlightEdit {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    from: ['Hamburg', [Validators.required, Validators.minLength(3)]],
    to: ['', Validators.required],
    passengers: this.fb.array([this.fb.control('')]),
  });
}
```

La tupla `[valoreIniziale, validators, asyncValidators]` è la scorciatoia per `fb.control(...)`. Per default i controlli di `FormBuilder` sono **nullable** (`reset()` li porta a `null`): `this.fb.nonNullable.group({...})` (o `fb.control(v, { nonNullable: true })`) usa un `NonNullableFormBuilder` che li rende non-nullable, così `reset()` ripristina il valore iniziale.

## `Validators` built-in
Funzioni statiche di `Validators` da passare a controlli e gruppi: `required`, `requiredTrue` (per checkbox), `min`, `max`, `minLength`, `maxLength`, `pattern`, `email`, più i combinatori `compose` / `composeAsync`. Producono la stessa forma di errori vista in [[forms-template-driven]] (`{ required: true }`, `{ minlength: { requiredLength, actualLength } }`, …).

## Validatore custom sincrono (`ValidatorFn`)
Una `ValidatorFn` è `(control: AbstractControl) => ValidationErrors | null`: ritorna `null` se valido, altrimenti un oggetto d'errore che finisce in `control.errors`.

```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cityValidator(allowed: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ok = allowed.includes(control.value);
    return ok ? null : { city: { value: control.value } };
  };
}

// uso: new FormControl('', cityValidator(['Hamburg', 'Graz']))
```

Applicato a un `FormGroup`, un `ValidatorFn` diventa un **cross-field validator** (es. confronto password/conferma): riceve il gruppo e valida più campi insieme.

## Validatore custom asincrono (`AsyncValidatorFn`)
Una `AsyncValidatorFn` ritorna un `Observable` o una `Promise` di `ValidationErrors | null`. Mentre è in corso, il controllo è in stato `pending`. Tipico per controlli lato server (es. unicità).

```ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map } from 'rxjs';

export function uniqueCodeValidator(api: FlightApi): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    api.isCodeTaken(control.value).pipe(
      map((taken) => (taken ? { codeTaken: true } : null)),
    );
}
```

Gli async validator si passano nel **terzo** slot (o come `asyncValidators` nelle opzioni). Vedi [[rxjs]] per gli operatori usati.

## `setValue` vs `patchValue`
Entrambi i metodi scrivono programmaticamente il valore di un controllo o di un gruppo, ma differiscono per quanto sono esigenti sull'oggetto che ricevono.

- **`setValue(v)`** — richiede un oggetto **completo**, con **tutte** le chiavi del gruppo; una chiave mancante o in più è un errore. Utile per garantire coerenza.
- **`patchValue(v)`** — aggiorna solo le chiavi presenti, ignora il resto. Comodo per aggiornamenti parziali.

```ts
form.setValue({ from: 'Hamburg', to: 'Graz', passengers: ['Alice'] }); // tutte le chiavi
form.patchValue({ to: 'Vienna' });                                     // solo 'to'
```

## `valueChanges` / `statusChanges`
Oltre allo stato leggibile in modo sincrono, ogni `AbstractControl` (un singolo controllo o un intero gruppo) espone il proprio andamento nel tempo come due `Observable`, il punto di aggancio naturale per la programmazione reattiva sui form.

- **`valueChanges`** — emette il nuovo valore a ogni cambiamento (rispettando `updateOn`).
- **`statusChanges`** — emette lo stato di validità (`'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'`).

```ts
this.form.controls.from.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
  .subscribe((value) => this.search(value));
```

È il punto di innesto tipico degli operatori RxJS ([[rxjs]]): `debounceTime`, `switchMap` verso una ricerca, ecc.

## Direttive di binding nel template
Una volta costruito l'albero nella classe, lo si collega al markup con un insieme di direttive di `ReactiveFormsModule`, ognuna delle quali aggancia un pezzo del modello all'elemento HTML corrispondente.

- **`[formGroup]="form"`** — lega il `FormGroup` radice all'elemento (di solito `<form>`).
- **`formControlName="from"`** — lega un input al figlio `from` del gruppo corrente.
- **`formGroupName="passenger"`** — apre un sotto-`FormGroup` annidato.
- **`formArrayName="passengers"`** — apre un `FormArray`, iterandone i controlli.

```html
<form [formGroup]="form" (ngSubmit)="save()">
  <input formControlName="from" />
  <input formControlName="to" />

  <div formArrayName="passengers">
    @for (ctrl of passengers.controls; track $index) {
      <input [formControlName]="$index" />
    }
  </div>

  <button [disabled]="form.invalid">Salva</button>
</form>
```

> [!tip]
> Per un `FormControl` **isolato** (fuori da un gruppo) si usa `[formControl]="ctrl"` invece di `formControlName` (che presuppone un `[formGroup]` padre).

> [!warning]
> `formControlName` **non** accetta un `FormControl`: vuole il **nome** (stringa) del figlio nel `[formGroup]` circostante. Passargli l'istanza è un errore comune. Per un controllo standalone serve `[formControl]`.

> [!warning]
> `setValue` con un oggetto **incompleto** lancia *"Must supply a value for form control with name: ..."*. Per aggiornamenti parziali usare `patchValue`.

> [!info|label:vs Modern]
> Il vault non usa `FormGroup`/`FormControl`: adotta i **Signal Forms** (`@angular/forms/signals`), dove `form(model, schema)` deriva l'albero da un signal, i validatori stanno nello schema (con supporto a custom e async) e `valueChanges`/`statusChanges` sono sostituiti dai signal di stato del field. Tutto in [[06-signal-forms]] (qui non ripetuto).

> [!info|label:Stato attuale]
> `ReactiveFormsModule` e le reactive forms **non sono deprecate**: restano pienamente supportate e convivono con `@angular/forms/signals`. I **Signal Forms** sono l'approccio moderno raccomandato per il codice nuovo, ma in Angular 22 sono **ancora sperimentali** (package `@angular/forms/signals`, l'API può cambiare); l'API classica resta lo standard **stabile** delle codebase esistenti ([angular.dev/guide/forms/reactive-forms](https://angular.dev/guide/forms/reactive-forms) · [Validators](https://angular.dev/api/forms/Validators)).

## Ripasso lampo

<details>
<summary>Qual è la differenza di fondo fra reactive e template-driven forms?</summary>

Nelle reactive il modello (`FormControl`/`FormGroup`/`FormArray`) è dichiarato **esplicitamente nella classe**, sincrono e immutabile; il template vi si lega con direttive. Nelle template-driven ([[forms-template-driven]]) il modello è **implicito**, costruito da `ngModel` nel template, e la sincronizzazione è asincrona.

</details>

<details>
<summary>Quando usare <code>setValue</code> e quando <code>patchValue</code>?</summary>

`setValue` richiede un oggetto **completo** con tutte le chiavi del gruppo (errore se ne manca una): utile per garantire coerenza. `patchValue` aggiorna solo le chiavi fornite e ignora le altre: comodo per aggiornamenti parziali.

</details>

<details>
<summary>Che firma hanno un validator sync e uno async, e cosa ritornano?</summary>

Sync: `ValidatorFn = (control) => ValidationErrors | null` (`null` se valido). Async: `AsyncValidatorFn = (control) => Observable<ValidationErrors | null> | Promise<...>`; durante l'attesa il controllo è `pending`.

</details>

<details>
<summary>A cosa serve <code>updateOn</code> e quali valori accetta?</summary>

Decide **quando** il controllo aggiorna valore e validità: `'change'` (default, a ogni tasto), `'blur'` (all'uscita dal campo), `'submit'` (solo al submit). Riduce validazioni/emissioni inutili.

</details>

<details>
<summary>Perché <code>formControlName</code> dà errore se gli passo un'istanza di <code>FormControl</code>?</summary>

Perché `formControlName` vuole il **nome** (stringa) del figlio nel `[formGroup]` padre, non l'istanza. Per legare direttamente un `FormControl` isolato si usa `[formControl]="ctrl"`.

</details>

**In sintesi:**
- Reactive forms = modello **esplicito** nella classe (`FormControl`/`FormGroup`/`FormArray`), sincrono e immutabile; serve `ReactiveFormsModule`.
- `FormBuilder` (`fb.group`/`control`/`array`, `nonNullable`) riduce il boilerplate; `Validators` built-in + validator custom `ValidatorFn` (sync) e `AsyncValidatorFn` (async, stato `pending`).
- `setValue` (oggetto completo) vs `patchValue` (parziale); stato e valore osservabili via `valueChanges`/`statusChanges` (innesto per RxJS, vedi [[rxjs]]).
- Binding col template via `[formGroup]` + `formControlName`/`formGroupName`/`formArrayName` (o `[formControl]` per controlli isolati).
- Equivalente moderno = **Signal Forms**, in [[06-signal-forms]]; il classico resta lo standard stabile (non deprecato), i Signal Forms sono ancora sperimentali.
