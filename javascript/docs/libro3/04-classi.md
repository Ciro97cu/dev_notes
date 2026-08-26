# Classi e mixin

JavaScript ha una sintassi che assomiglia a quella delle classi (`new`, `instanceof`, e in ES6 la keyword `class`), ma il meccanismo sottostante funziona in modo radicalmente diverso dai linguaggi class-oriented. Capire questa differenza è fondamentale per non farsi ingannare dalle apparenze.

## Teoria delle classi

Nei linguaggi OO classici, una **classe** è un progetto astratto che descrive dati e comportamenti correlati. Una **istanza** è la realizzazione concreta di quel progetto — una copia di tutti i dati e i comportamenti definiti dalla classe.

Il meccanismo di base è la **copia**: quando si istanzia una classe, i comportamenti vengono copiati dalla classe all'istanza. Quando una classe figlia eredita dalla classe padre, i comportamenti vengono copiati dal padre al figlio.

**Polimorfismo** è la capacità di un metodo figlio di fare riferimento alla versione padre dello stesso metodo. In linguaggi come Java o C++ si usa `super` per questo riferimento relativo.

**JavaScript non ha classi.** Non nel senso reale del termine. Le classi sono un pattern di design, e in JS il meccanismo che costruisce gli oggetti funziona con **link**, non con copie. Questo punto è il cuore di tutto ciò che segue nel libro.

---

## Meccanica delle classi

In pseudocodice classico, una classe si definisce così:

```
class Vehicle {
    engines = 1
    ignition() { output("Accendo l'engine.") }
    drive() { ignition(); output("Sterzo e avanzo!") }
}

class Car inherits Vehicle {
    wheels = 4
    drive() {
        inherited:drive()  /* relative polymorphism — riferimento alla versione padre */
        output("Vado su tutte le ", wheels, " ruote!")
    }
}

class SpeedBoat inherits Vehicle {
    engines = 2
    ignition() { output("Accendo i miei ", engines, " motori.") }
    pilot() {
        inherited:drive()
        output("Sfrecciando sull'acqua!")
    }
}
```

`Car` sovrascrive `drive()` ma può chiamare la versione di `Vehicle` tramite `inherited:drive()`. `SpeedBoat` sovrascrive `ignition()` — quando `pilot()` chiama `inherited:drive()`, che a sua volta chiama `ignition()`, viene usata la versione di `SpeedBoat` (non di `Vehicle`). Questo è il polimorfismo in azione.

**Ereditarietà multipla** è problematica: se due classi padre forniscono entrambe un metodo `drive()`, quale versione viene usata dalla classe figlia? Il cosiddetto **diamond problem** (problema del diamante — quando D eredita da B e C che ereditano entrambe da A) non ha una soluzione pulita. JavaScript semplicemente non supporta l'ereditarietà multipla nativa.

---

## JavaScript non ha classi

In JavaScript non esistono classi. Non avviene nessuna copia automatica al momento dell'istanziazione o dell'ereditarietà. Gli oggetti non vengono copiati in altri oggetti — vengono **collegati** (questo è il meccanismo `[[Prototype]]`, esplorato nel prossimo capitolo).

Poiché molti sviluppatori vogliono comportamenti simili alle classi, si ricorre al pattern dei **mixin** — un modo manuale di simulare la copia di comportamento da un oggetto a un altro.

---

## Mixin

### Explicit mixin

La forma base di un mixin è una funzione che itera sulle proprietà di un oggetto sorgente e le copia in un oggetto target, saltando quelle già presenti:

```js
function mixin(sourceObj, targetObj) {
    for (var key in sourceObj) {
        if (!(key in targetObj)) { // non sovrascrive
            targetObj[key] = sourceObj[key];
        }
    }
    return targetObj;
}

var Vehicle = {
    engines: 1,
    ignition: function() { console.log("Accendo l'engine."); },
    drive: function() {
        this.ignition();
        console.log("Sterzo e avanzo!");
    }
};

var Car = mixin(Vehicle, {
    wheels: 4,
    drive: function() {
        Vehicle.drive.call(this); /* explicit pseudopolymorphism */
        console.log("Vado su tutte le " + this.wheels + " ruote!");
    }
});
```

**Explicit pseudopolymorphism**: `Vehicle.drive.call(this)` è il modo in cui JS simula il riferimento relativo `inherited:drive()`. Non è un riferimento relativo — è un riferimento assoluto al nome dell'oggetto. Se `Car.drive()` si chiamasse diversamente, non ci sarebbe ambiguità e non servirebbe; ma siccome ha lo stesso nome, bisogna risolvere manualmente il conflitto ogni volta.

Questa è la debolezza fondamentale dell'approccio: crea legami espliciti fragili che devono essere mantenuti manualmente in ogni funzione. Il costo di manutenzione supera quasi sempre il beneficio.

**Cosa viene copiato davvero?** I valori primitivi vengono copiati. Le funzioni (e gli oggetti referenziati) vengono copiati come **riferimenti** — non come duplicati. Se si modifica la funzione `ignition` condivisa aggiungendole proprietà, sia `Vehicle` che `Car` ne risentiranno.

### Parasitic inheritance (ereditarietà parassitaria)

Una variante dell'explicit mixin, popolarizzata da Douglas Crockford:

```js
function Vehicle() { this.engines = 1; }
Vehicle.prototype.ignition = function() { console.log("Accendo l'engine."); };
Vehicle.prototype.drive = function() {
    this.ignition();
    console.log("Sterzo e avanzo!");
};

function Car() {
    var car = new Vehicle();        /* crea un'istanza Vehicle */
    car.wheels = 4;
    var vehDrive = car.drive;       /* salva riferimento al metodo padre */
    car.drive = function() {
        vehDrive.call(this);        /* chiama il metodo padre nel contesto di Car */
        console.log("Vado su tutte le " + this.wheels + " ruote!");
    };
    return car;
}

var myCar = new Car();
myCar.drive();
/* Accendo l'engine.
   Sterzo e avanzo!
   Vado su tutte le 4 ruote! */
```

Si crea un'istanza di `Vehicle`, la si modifica, e la si restituisce. `new Car()` crea e poi scarta un oggetto: si potrebbe chiamare `Car()` senza `new` con risultato identico.

### Implicit mixin

Si "prende in prestito" il comportamento di un oggetto chiamandolo con un `this` diverso:

```js
var Something = {
    cool: function() {
        this.greeting = "Hello World";
        this.count = this.count ? this.count + 1 : 1;
    }
};

var Another = {
    cool: function() {
        Something.cool.call(this); /* implicit mixin */
    }
};

Something.cool();
Something.greeting; // "Hello World"
Something.count;    // 1

Another.cool();
Another.greeting;   // "Hello World"
Another.count;      // 1 — stato separato da Something
```

`Something.cool.call(this)` "mescola" il comportamento di `Something` in `Another` tramite il rebinding di `this`. Il legame è però fragile e non è relativo — va evitato dove possibile.

---

## Ripasso veloce

**Classi = copie**: istanziazione copia dalla classe all'istanza; ereditarietà copia dal padre al figlio. JavaScript non fa né l'una né l'altra in modo automatico.

**JS non ha classi**: la sintassi `new`, `instanceof` e `class` è zucchero sintattico su un sistema di link tra oggetti — non di copie.

**Explicit mixin**: copia manuale delle proprietà con una funzione tipo `mixin()`. Richiede explicit pseudopolymorphism (`OtherObj.method.call(this)`) per risolvere i conflitti di nome — pattern fragile e costoso da mantenere.

```js
/* NON è ereditarietà — è copia di riferimenti */
var Car = mixin(Vehicle, { /* ... */ });
Car.ignition === Vehicle.ignition; // true — stesso oggetto, non una copia
```

**Conclusione di Kyle Simpson**: simulare le classi in JavaScript crea più problemi di quanti ne risolva. Il capitolo 6 mostrerà un'alternativa più naturale per il linguaggio.

---

## Domande

<details>
<summary>Perché JavaScript non ha classi "vere" nonostante la keyword `class` di ES6?</summary>

Perché `class` in ES6 è zucchero sintattico — una sintassi più comoda che nasconde il meccanismo sottostante, che rimane quello dei prototipi e dei link tra oggetti. In linguaggi come Java, l'istanziazione produce una **copia** del comportamento dalla classe all'istanza. In JavaScript, `new Foo()` crea un oggetto che viene **collegato** tramite `[[Prototype]]` a `Foo.prototype` — non ne copia le proprietà. Il comportamento sembra simile in superficie, ma il meccanismo è fondamentalmente diverso, e questa differenza emerge in tutti i casi non banali.

</details>

<details>
<summary>Cosa sono i mixin e perché nascono in JavaScript?</summary>

I mixin sono un pattern per simulare manualmente la copia di comportamento da un oggetto a un altro, compensando il fatto che JavaScript non ha un meccanismo di copia automatica come le classi dei linguaggi OO tradizionali. La funzione `mixin(source, target)` itera sulle proprietà di un oggetto sorgente e le copia nell'oggetto target (tipicamente saltando quelle già presenti). Nascono dal desiderio di usare pattern class-oriented in un linguaggio che non li supporta nativamente.

</details>

<details>
<summary>Cos'è l'explicit pseudopolymorphism e perché è problematico?</summary>

È il pattern `OtherObj.method.call(this)` usato per chiamare la versione "padre" di un metodo quando il metodo figlio ha lo stesso nome. A differenza del polimorfismo relativo dei linguaggi OO (`super.method()`), il riferimento è assoluto — dipende dal nome dell'oggetto padre. Questo crea un legame esplicito e fragile che va aggiornato manualmente ogni volta che l'oggetto padre cambia nome o viene ristrutturato. In sistemi con molti livelli di ereditarietà simulata, questo pattern si propaga in ogni funzione che ha bisogno di richiamare il comportamento del "padre", moltiplicando la fragilità.

</details>

<details>
<summary>Perché la copia tramite mixin non è equivalente alla copia class-to-instance dei linguaggi OO?</summary>

Perché i mixin copiano i valori primitivi ma copiano solo i **riferimenti** agli oggetti e alle funzioni — non i loro contenuti. Se `Vehicle` e `Car` condividono un riferimento alla stessa funzione `ignition`, modificare quella funzione (aggiungendo proprietà, per esempio) influenza entrambi. In un linguaggio class-oriented, ogni istanza ottiene la propria copia indipendente del comportamento. La copia di un riferimento è fondamentalmente diversa dalla copia di un valore.

</details>

<details>
<summary>Qual è la differenza tra mixin esplicito e mixin implicito?</summary>

Il mixin esplicito usa una funzione dedicata che copia le proprietà da un oggetto sorgente a un target, creando una struttura separata. Il mixin implicito usa `OtherObj.method.call(this)` per eseguire il comportamento di un altro oggetto nel contesto dell'oggetto corrente — senza copiare nulla. Il mixin implicito è più leggero ma ancora più fragile: il legame dipende interamente dal nome letterale dell'oggetto sorgente, non può essere reso relativo, e qualsiasi refactoring del nome rompe il codice che lo usa.

</details>
