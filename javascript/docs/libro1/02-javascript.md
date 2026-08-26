# Introduzione a JavaScript

Questo capitolo è una panoramica dei concetti fondamentali di JavaScript (tipi, variabili, scope, closure, `this`, prototype), ognuno trattato in superficie qui e approfondito nei libri successivi della serie.

## Valori e tipi

In JavaScript i **tipi appartengono ai valori, non alle variabili**. I tipi built-in disponibili sono:

- `string`
- `number`
- `boolean`
- `null` e `undefined`
- `object`
- `symbol` (introdotto con ES6)

L'operatore `typeof` restituisce sempre una stringa che descrive il tipo del valore corrente:

```js
var a;
typeof a;           // "undefined"
a = "hello world";
typeof a;           // "string"
a = 42;
typeof a;           // "number"
a = true;
typeof a;           // "boolean"
a = null;
typeof a;           // "object" — bug storico del linguaggio, mai corretto
a = { b: "c" };
typeof a;           // "object"
```

`typeof null` restituisce `"object"` per via di un bug presente fin dalle origini del linguaggio, mantenuto per compatibilità con il codice esistente.

### Oggetti

Un oggetto è un valore composto che contiene proprietà (named locations), ognuna con il proprio valore di qualsiasi tipo:

```js
var obj = {
    a: "hello world",
    b: 42,
    c: true
};

obj.a;      // "hello world" — dot notation
obj["b"];   // 42            — bracket notation
```

La dot notation è preferibile per leggibilità. La bracket notation è necessaria quando il nome della proprietà contiene caratteri speciali, oppure quando è memorizzato in una variabile:

```js
var chiave = "a";
obj[chiave]; // "hello world"
```

### Array

Un array è un sottotipo di oggetto che organizza i valori in posizioni numeriche indicizzate a partire da `0`:

```js
var arr = ["hello world", 42, true];
arr[0];       // "hello world"
arr.length;   // 3
typeof arr;   // "object"
```

Gli array possono contenere valori di qualsiasi tipo. La proprietà `length` si aggiorna automaticamente.

### Funzioni

Anche le funzioni sono un sottotipo di oggetto. `typeof` restituisce `"function"`, ma si tratta comunque di oggetti con proprietà accessibili:

```js
function foo() {
    return 42;
}
foo.bar = "hello";

typeof foo;     // "function"
typeof foo();   // "number"
typeof foo.bar; // "string"
```

### Metodi built-in

I tipi primitivi espongono metodi e proprietà tramite un meccanismo chiamato **boxing**: quando si accede a una proprietà su un valore primitivo, JavaScript lo avvolge temporaneamente nel corrispondente object wrapper (`String`, `Number`, `Boolean`) per permettere l'accesso ai metodi.

```js
var a = "hello world";
var b = 3.14159;

a.length;          // 11
a.toUpperCase();   // "HELLO WORLD"
b.toFixed(4);      // "3.1416"
```

### Confronto tra valori

**Coercizione esplicita** — la conversione di tipo è esplicita nel codice:

```js
var a = "42";
var b = Number(a); // stringa → numero
console.log(b);    // 42
```

**Coercizione implicita** — JavaScript converte automaticamente il tipo come effetto collaterale di un'operazione:

```js
var a = "42";
var b = a * 1; // "42" → 42
```

### Truthy e falsy

Quando un valore non-boolean viene convertito in boolean, può diventare `true` (truthy) o `false` (falsy). I valori **falsy** in JavaScript sono esattamente:

- `""` (stringa vuota)
- `0`, `-0`, `NaN` (not a number — valore numerico non valido)
- `null`, `undefined`
- `false`

Qualsiasi altro valore è **truthy**: `"hello"`, `42`, `[]`, `{}`, funzioni.

### Uguaglianza: `==` vs `===`

La distinzione corretta non è "confronta il valore" vs "confronta valore e tipo", ma:

- `==` (**loose equality**) — confronta il valore **con** coercizione permessa
- `===` (**strict equality**) — confronta il valore **senza** coercizione

```js
var a = "42";
var b = 42;

a == b;   // true  — "42" viene convertita a 42 prima del confronto
a === b;  // false — nessuna coercizione, tipi diversi
```

Per i valori non primitivi (oggetti, array, funzioni) entrambi gli operatori confrontano solo il **riferimento**, non il contenuto:

```js
var a = [1, 2, 3];
var b = [1, 2, 3];
var c = "1,2,3";

a == c;  // true  — l'array viene convertito in stringa
a == b;  // false — riferimenti diversi
```

Regole pratiche per scegliere tra `==` e `===`:

- se uno dei due valori può essere `true`, `false`, `0`, `""` o `[]` → usare `===`
- in tutti gli altri casi, `==` è sicuro e può rendere il codice più leggibile

### Disuguaglianza

Gli operatori `<`, `>`, `<=`, `>=` non hanno varianti strict. Se entrambi i valori sono stringhe il confronto è **lessicografico** (alfabetico); altrimenti entrambi vengono convertiti in numero. Attenzione a `NaN`:

```js
var a = 42;
var b = "foo"; // non convertibile in numero → NaN

a < b;  // false — NaN non è né maggiore né minore
a > b;  // false
a == b; // false
```

---

## Variabili e scope

Un identificatore valido in JavaScript deve iniziare con `a-z`, `A-Z`, `$` o `_`, seguito da lettere, cifre o quegli stessi caratteri. Le keyword del linguaggio (`for`, `if`, `null`, ecc.) sono **reserved words** e non possono essere usate come nomi di variabile.

### Hoisting

Quando una variabile viene dichiarata con `var` all'interno di uno scope, la dichiarazione viene "spostata" concettualmente in cima a quello scope dal compiler — questo comportamento si chiama **hoisting**. Solo la dichiarazione viene hoisted, non l'assegnamento:

```js
foo(); // funziona — la dichiarazione di foo() è hoisted

function foo() {
    a = 3;
    console.log(a); // 3
    var a;          // dichiarazione hoisted in cima a foo()
}

console.log(a); // 2 — la `a` qui è quella globale
var a = 2;
```

Fare affidamento sull'hoisting delle variabili per usarle prima della loro dichiarazione è una pratica da evitare. È accettato invece fare riferimento a funzioni dichiarate con `function` prima della loro posizione nel codice.

### Scope annidati e `let`

Le variabili dichiarate con `var` appartengono all'intera funzione in cui compaiono. Da ES6, `let` limita lo scope al **blocco** (la coppia `{ }`) più vicina:

```js
function foo() {
    var a = 1;

    if (a >= 1) {
        let b = 2;      // scope: solo questo blocco if

        while (b < 5) {
            let c = b * 2; // scope: solo questo blocco while
            b++;
            console.log(a + c);
        }
    }
    // b e c non sono accessibili qui
}
foo(); // 5 7 9
```

Dichiarare una variabile senza `var`/`let`/`const` in modalità non-strict la crea automaticamente nel global scope — una pratica da evitare sempre.

---

## Condizionali

Oltre all'`if..else` visto nel capitolo precedente, JavaScript mette a disposizione il `switch` e l'operatore ternario.

### switch

Utile quando si confronta la stessa variabile con più valori. L'istruzione `break` è necessaria per uscire dal `case` dopo l'esecuzione: senza di essa l'esecuzione continua nel `case` successivo (**fall through**, talvolta usato deliberatamente):

```js
switch (a) {
    case 2:
    case 10:
        // eseguito se a è 2 o 10 (fall through intenzionale)
        break;
    case 42:
        // eseguito solo se a è 42
        break;
    default:
        // fallback
}
```

### Operatore ternario

Forma compatta di un `if..else` a singola espressione, usata tipicamente in un assegnamento:

```js
var b = (a > 41) ? "hello" : "world";
// equivale a:
// if (a > 41) { b = "hello" } else { b = "world" }
```

---

## Strict mode

La direttiva `"use strict"` (introdotta con ES5) attiva un sottoinsieme più restrittivo del linguaggio che impedisce alcuni comportamenti problematici e rende il codice più ottimizzabile dall'engine. Si applica a un'intera funzione o a un intero file:

```js
"use strict"; // attiva strict mode per tutto il file

function foo() {
    a = 1; // ReferenceError: `var` mancante non crea una globale
}
```

Usare strict mode è fortemente consigliato per tutti i programmi JavaScript.

---

## Funzioni come valori

In JavaScript una funzione non è solo un blocco di codice con un nome: è essa stessa un **valore** che può essere assegnato a una variabile, passato come argomento o restituito da un'altra funzione.

```js
var foo = function() {
    // function expression anonima
};

var x = function bar() {
    // function expression con nome (preferibile: il nome appare negli stack trace)
};
```

### IIFE (Immediately Invoked Function Expression)

Una function expression può essere eseguita immediatamente dopo la sua definizione. Le parentesi esterne impediscono all'engine di trattarla come una function declaration:

```js
(function IIFE() {
    var a = 10;
    console.log(a); // 10
})();

// Le variabili dentro l'IIFE non inquinano lo scope esterno
console.log(typeof a); // "undefined" (se `a` non è dichiarata fuori)
```

Un'IIFE può anche restituire un valore:

```js
var x = (function IIFE() {
    return 42;
})();
x; // 42
```

---

## Closure

La closure è uno dei concetti più importanti, e meno compresi, di JavaScript. Una closure si forma quando una funzione interna mantiene l'accesso alle variabili del proprio scope anche dopo che la funzione esterna ha terminato l'esecuzione.

```js
function makeAdder(x) {
    function add(y) {
        return y + x; // `add` ha una closure su `x`
    }
    return add;
}

var plusUno = makeAdder(1);
var piuDieci = makeAdder(10);

plusUno(3);     // 4  (1 + 3)
plusUno(41);    // 42 (1 + 41)
piuDieci(13);   // 23 (10 + 13)
```

`makeAdder(1)` restituisce la funzione `add` che "ricorda" `x = 1`; `makeAdder(10)` restituisce un'altra istanza che ricorda `x = 10`. Ogni chiamata a `makeAdder` produce una closure indipendente.

### Module pattern

L'applicazione più comune della closure è il **module pattern**: si espone un'API pubblica mantenendo privati i dettagli implementativi.

```js
function User() {
    var username, password; // variabili private

    function doLogin(user, pw) {
        username = user;
        password = pw;
        /* logica di login */
    }

    return {
        login: doLogin // unico punto di accesso pubblico
    };
}

var fred = User(); // crea un'istanza del modulo
fred.login("fred", "12Battery34!");
```

`username` e `password` non sono accessibili dall'esterno; `doLogin` mantiene una closure su di esse anche dopo che `User()` ha terminato. `User()` viene chiamata senza `new` perché non è una classe: è una funzione normale che restituisce un oggetto.

---

## this

Il keyword `this` all'interno di una funzione non si riferisce alla funzione stessa — è il malinteso più comune. `this` punta a un **oggetto**, e quale oggetto dipende esclusivamente da come la funzione viene chiamata.

Esistono quattro regole:

```js
function foo() {
    console.log(this.bar);
}

var bar = "global";
var obj1 = { bar: "obj1", foo: foo };
var obj2 = { bar: "obj2" };

foo();           // "global" — this punta al global object (in non-strict)
obj1.foo();      // "obj1"   — this punta a obj1
foo.call(obj2);  // "obj2"   — this punta a obj2 (call esplicita)
new foo();       // undefined — this punta a un nuovo oggetto vuoto
```

1. **Chiamata normale** — `this` punta all'oggetto globale (`window` nel browser); in strict mode è `undefined`
2. **Chiamata come metodo** — `this` punta all'oggetto che precede il punto (`obj1.foo()` → `obj1`)
3. **Chiamata con `call`/`apply`/`bind`** — `this` viene impostato esplicitamente
4. **Chiamata con `new`** — `this` punta al nuovo oggetto creato dall'operatore

Il Libro III approfondisce ogni regola in dettaglio.

---

## Prototype

Il meccanismo del **prototype** in JavaScript è la catena di risalita che JavaScript percorre quando cerca una proprietà non trovata direttamente sull'oggetto. Ogni oggetto ha un riferimento interno a un altro oggetto (il suo prototype); se la proprietà non esiste sull'oggetto corrente, la ricerca risale nella catena.

`Object.create()` è il modo più diretto per creare un oggetto e impostarne esplicitamente il prototype:

```js
var foo = { a: 42 };

var bar = Object.create(foo); // bar è collegato a foo tramite prototype
bar.b = "hello world";

bar.b; // "hello world" — trovato direttamente su bar
bar.a; // 42            — non esiste su bar, trovato su foo tramite prototype
```

L'uso più comune, e spesso frainteso, del prototype è tentare di emulare le classi e l'ereditarietà di altri linguaggi. Il Libro III mostra perché questo approccio è problematico e propone in alternativa il **behavior delegation**, un pattern che sfrutta il prototype nel modo per cui è stato progettato.

---

## Compatibilità: polyfilling e transpiling

I browser più vecchi non supportano le funzionalità più recenti di JavaScript. Le due strategie principali per gestire questo problema sono:

### Polyfilling

Un polyfill è una porzione di codice che riproduce il comportamento di una funzionalità ES6+ in ambienti che non la supportano nativamente:

```js
/* Polyfill per Number.isNaN() — non disponibile in ambienti pre-ES6 */
if (!Number.isNaN) {
    Number.isNaN = function isNaN(x) {
        return x !== x; // NaN è l'unico valore non uguale a se stesso
    };
}
```

Non tutte le funzionalità sono polyfillabili: le nuove sintassi (es. `let`, arrow function, destructuring) generano errori di parsing e non possono essere simulate con codice esistente.

### Transpiling

Il **transpiling** (transforming + compiling) converte codice scritto con sintassi moderna in codice equivalente compatibile con ambienti più vecchi. Il codice sorgente usa la sintassi nuova; quello distribuito è il risultato della trasformazione.

```js
/* ES6 — default parameter */
function foo(a = 2) {
    console.log(a);
}

/* Transpilato per ambienti pre-ES6 */
function foo() {
    var a = arguments[0] !== (void 0) ? arguments[0] : 2;
    console.log(a);
}
```

I transpiler più usati sono **Babel** (ES6+ → ES5) e **Traceur**. L'uso di un transpiler nella pipeline di build permette di scrivere sempre con la sintassi più recente senza preoccuparsi dei browser target.

---

## JavaScript non JavaScript

Parte del codice che si scrive in un programma JavaScript non è controllata dal linguaggio stesso, ma dall'ambiente in cui gira. Nel browser, ad esempio, `document` è un **host object** (oggetto fornito dall'ambiente host, non dall'engine JS) che implementa la DOM API — tipicamente scritta in C/C++.

```js
var el = document.getElementById("foo"); // DOM API — non è JS puro
alert("ciao");                           // fornito dal browser
console.log("debug");                    // fornito dall'ambiente (browser o Node)
```

Queste API non fanno parte della specifica ECMAScript ma sono presenti in ogni programma JavaScript scritto per il browser. È importante conoscerne l'esistenza per non confonderle con funzionalità del linguaggio.

---

## Ripasso veloce

**typeof**: restituisce sempre una stringa. `typeof null === "object"` è un bug storico.

**Equality**: `==` permette la coercizione; `===` no. Per oggetti e array entrambi confrontano solo il riferimento.

```js
[] == []   // false — riferimenti diversi
[] == ""   // true  — coercizione: [] → ""
```

**Truthy/falsy**: i falsy sono `""`, `0`, `-0`, `NaN`, `null`, `undefined`, `false`. Tutto il resto è truthy.

**Hoisting**: `var` e le function declaration vengono portate in cima al loro scope dal compiler. `let` e `const` non hanno lo stesso comportamento.

**Closure**: una funzione "ricorda" lo scope in cui è stata creata, anche dopo che quel contesto ha terminato l'esecuzione.

```js
function crea(x) {
    return function(y) { return x + y; };
}
var aggiungi5 = crea(5);
aggiungi5(3); // 8
```

**`this`**: dipende dal **call-site** (il punto da cui la funzione viene chiamata), non da dove è definita. Quattro regole: chiamata normale → global; come metodo → oggetto che precede il punto; `call`/`apply`/`bind` → oggetto passato; `new` → nuovo oggetto.

**Prototype**: JavaScript risale la catena di prototype per trovare proprietà non presenti direttamente sull'oggetto.

```js
var a = { x: 1 };
var b = Object.create(a);
b.x; // 1 — trovato su `a` tramite prototype
```

---

## Domande

<details>
<summary>Perché `typeof null` restituisce `"object"` invece di `"null"`?</summary>

È un bug presente fin dalla prima implementazione di JavaScript, mai corretto perché farlo romperebbe troppo codice esistente che si basa su quel comportamento. Per verificare se un valore è `null` si usa il confronto `=== null`, non `typeof`.

</details>

<details>
<summary>Qual è la differenza tra coercizione esplicita e implicita?</summary>

La coercizione esplicita è visibile nel codice: si usa esplicitamente una funzione o un costruttore per convertire il tipo (`Number("42")`, `String(42)`). La coercizione implicita avviene automaticamente come effetto collaterale di un'operazione (`"42" * 1`, `"99" == 99`). Entrambe seguono regole precise definite dalla specifica ECMAScript.

</details>

<details>
<summary>Cosa si intende per hoisting e quali variabili sono soggette a questo comportamento?</summary>

L'hoisting è il meccanismo per cui le dichiarazioni di variabili (`var`) e le function declaration vengono elaborate dal compiler prima dell'esecuzione, come se fossero "spostate" in cima al loro scope. Solo la dichiarazione viene hoisted, non l'assegnamento: una variabile `var` hoisted ha valore `undefined` fino alla riga in cui viene assegnata. `let` e `const` hanno un comportamento diverso (temporal dead zone): esistono nello scope ma non sono accessibili prima della loro dichiarazione.

</details>

<details>
<summary>Come funziona una closure e perché è utile?</summary>

Una closure si forma quando una funzione interna mantiene un riferimento allo scope in cui è stata creata, anche dopo che la funzione esterna ha terminato. Questo permette alla funzione interna di accedere alle variabili dello scope esterno indefinitamente. È utile per creare stato privato (module pattern), per factory function che producono funzioni specializzate, e per callback che hanno bisogno di ricordare il contesto in cui sono state create.

</details>

<details>
<summary>Qual è la differenza tra polyfilling e transpiling?</summary>

Il polyfilling implementa in codice esistente il comportamento di API o funzioni non presenti nell'ambiente (es. `Number.isNaN` su browser vecchi). Funziona solo per funzionalità che si possono riprodurre con la sintassi già supportata. Il transpiling converte la sintassi nuova (es. `let`, arrow function, template literal) in sintassi equivalente compatibile con ambienti più vecchi — perché la nuova sintassi causa errori di parsing se usata in un engine che non la supporta. Babel è il transpiler più usato.

</details>
