# 04 · Anatomia di una torcia
> cap. 4 di «Code» (Petzold, 2ª ed.) — orig. *Anatomy of a Flashlight*

Dopo tre capitoli sui codici, il libro cambia marcia e affronta l'**elettricità** — perché è con l'elettricità che, di lì a poco, costruiremo la logica dei computer. L'oggetto di studio è il più semplice apparecchio elettrico di casa: la **torcia**. Smontarla mostra tutto ciò che serve. E c'è un motivo di fondo per cui proprio la torcia apre la strada ai computer: una torcia è **accesa o spenta**, non ha vie di mezzo — di nuovo quel binario incontrato con Morse e Braille.

## I pezzi

Una torcia è fatta di **batterie**, una **lampadina**, un **interruttore**, qualche pezzo di metallo e un involucro che tiene tutto insieme. Oggi la maggior parte usa **LED**, ma la vecchia lampadina a incandescenza ha il pregio di lasciar vedere cosa succede dentro il vetro: un **filamento di tungsteno** che si illumina quando lo attraversa l'elettricità, immerso in un gas inerte che gli impedisce di bruciare. I due capi del filamento sono collegati a fili sottili fissati alla base e alla punta della lampadina.

Si può costruire una torcia essenziale con sole batterie, lampadina e alcuni spezzoni di filo isolato (spelato alle estremità): due capi liberi fanno da **interruttore**, e toccandoli tra loro la luce si accende.

## Il circuito è un cerchio

La prima cosa da notare è che un **circuito è un cerchio**. La lampadina si accende solo se il percorso — dalle batterie al filo, alla lampadina, all'interruttore e di nuovo alle batterie — è **continuo**. Qualsiasi interruzione spegne tutto, e l'interruttore serve proprio a decidere se il cerchio è chiuso o aperto.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 205" role="img" aria-label="Lo stesso circuito con interruttore aperto (spento) e chiuso (acceso)" style="width:100%;max-width:520px;height:auto;color:inherit">
  <!-- ===== APERTO (spento) ===== -->
  <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M45 45 H100"/>                 <!-- top fino a cerniera -->
    <path d="M140 45 H195 V84"/>            <!-- top dopo interruttore + destra fino a lampadina -->
    <path d="M195 116 V155 H45 V120"/>      <!-- destra bassa + bottom + risalita sinistra -->
    <path d="M45 45 V80"/>                   <!-- sinistra alta fino a batteria -->
    <rect x="36" y="80" width="18" height="40" rx="3"/>   <!-- batteria -->
    <circle cx="195" cy="100" r="16"/>       <!-- lampadina -->
    <path d="M188 100 l4 -6 l4 11 l4 -6"/>   <!-- filamento -->
    <!-- interruttore aperto -->
    <circle cx="100" cy="45" r="3" fill="currentColor"/>
    <line x1="100" y1="45" x2="136" y2="28"/>
    <circle cx="140" cy="45" r="3" fill="currentColor"/>
  </g>
  <text x="49" y="76" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12">+</text>
  <text x="49" y="131" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13">−</text>
  <text x="118" y="192" text-anchor="middle" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13" opacity=".8">spento · interruttore aperto</text>

  <!-- ===== CHIUSO (acceso) ===== -->
  <g transform="translate(300,0)">
    <g fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--link,#059669)">
      <path d="M45 45 H100"/>
      <path d="M140 45 H195 V84"/>
      <path d="M195 116 V155 H45 V120"/>
      <path d="M45 45 V80"/>
      <rect x="36" y="80" width="18" height="40" rx="3"/>
      <circle cx="195" cy="100" r="16" style="fill:var(--link,#059669);fill-opacity:.18"/>
      <path d="M188 100 l4 -6 l4 11 l4 -6"/>
      <!-- interruttore chiuso -->
      <circle cx="100" cy="45" r="3" style="fill:var(--link,#059669)"/>
      <line x1="100" y1="45" x2="140" y2="45"/>
      <circle cx="140" cy="45" r="3" style="fill:var(--link,#059669)"/>
      <!-- raggi di luce -->
      <g stroke-linecap="round"><line x1="195" y1="78" x2="195" y2="72"/><line x1="217" y1="100" x2="223" y2="100"/><line x1="173" y1="100" x2="167" y2="100"/><line x1="211" y1="84" x2="215" y2="80"/><line x1="179" y1="84" x2="175" y2="80"/></g>
    </g>
    <text x="49" y="76" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="12">+</text>
    <text x="49" y="131" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13">−</text>
    <text x="118" y="192" text-anchor="middle" fill="currentColor" font-family="system-ui,Arial,sans-serif" font-size="13" opacity=".8">acceso · interruttore chiuso</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso circuito. A sinistra l'interruttore è <strong>aperto</strong>: il cerchio è spezzato, niente luce. A destra è <strong>chiuso</strong>: il cerchio è continuo, la corrente scorre (in verde) e la lampadina si accende.</figcaption>
</figure>

## Cosa scorre nel filo: gli elettroni

Il cerchio suggerisce che qualcosa gira intorno al circuito. L'analogia più comune è quella dell'acqua nei tubi, ma prima o poi si rompe: l'elettricità non somiglia davvero a niente. Un modo per capirla è la **teoria degli elettroni**. La materia è fatta di **atomi**, e ogni atomo ha neutroni, protoni ed **elettroni**; di solito gli elettroni sono tanti quanti i protoni, ma in certe condizioni un elettrone si può staccare — ed è lì che nasce l'elettricità. La parola stessa viene dal greco *ήλεκτρον* (*elektron*), che significa "ambra": gli antichi greci strofinavano l'ambra con la lana e osservavano l'**elettricità statica**, perché la lana strappa elettroni all'ambra (come il tappeto li strappa alle suole delle scarpe).

Protoni ed elettroni hanno una **carica**, indicata con **+** e **−**: i segni non hanno senso aritmetico, dicono solo che le due cariche sono *opposte*. Cariche in numero uguale sono stabili; uno squilibrio tende a correggersi — è la scintilla che senti toccando una maniglia, o il fulmine tra nuvola e nuvola. Nella torcia, però, il flusso è ordinato e continuo: un atomo cede un elettrone a un vicino e ne strappa uno a un altro atomo adiacente, e così via. **L'elettricità nel circuito è il passaggio di elettroni di atomo in atomo.**

## Le batterie: da energia chimica a elettrica

Questo passaggio non parte da solo: serve qualcosa che lo inneschi, ed è la **batteria**. Le batterie da torcia (D, C, AA, AAA a seconda della misura) hanno un'estremità piatta col segno **−** e una con una piccola sporgenza col segno **+**. Dentro avviene una **reazione chimica** scelta apposta per accumulare elettroni in eccesso al terminale negativo e richiederne all'altro: così l'**energia chimica diventa energia elettrica**, a circa **1,5 volt**. La reazione può procedere solo se un circuito porta via gli elettroni dal negativo e li riconsegna al positivo: la batteria alimenta il circuito, ma è anche vero il contrario — il circuito permette alla reazione della batteria di avvenire, finché i reagenti non si esauriscono.

Il modo in cui si collegano più batterie cambia il risultato:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 150" role="img" aria-label="Batterie in serie (3 volt) e in parallelo (1,5 volt, durata doppia)" style="width:100%;max-width:500px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" font-size="12" fill="currentColor">
    <!-- SERIE -->
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <rect x="40" y="40" width="26" height="46" rx="3"/><rect x="78" y="40" width="26" height="46" rx="3"/>
    </g>
    <text x="46" y="36" fill="currentColor">+</text><text x="70" y="63" fill="currentColor">−</text>
    <text x="84" y="36" fill="currentColor">+</text><text x="108" y="63" fill="currentColor">−</text>
    <text x="72" y="112" text-anchor="middle" font-weight="700">in serie</text>
    <text x="72" y="130" text-anchor="middle" opacity=".8">= 3 V</text>
    <!-- PARALLELO -->
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <rect x="300" y="30" width="60" height="24" rx="3"/><rect x="300" y="66" width="60" height="24" rx="3"/>
      <line x1="330" y1="24" x2="330" y2="30"/><line x1="330" y1="90" x2="330" y2="96"/>
    </g>
    <text x="366" y="46" fill="currentColor">+</text><text x="366" y="82" fill="currentColor">+</text>
    <text x="330" y="112" text-anchor="middle" font-weight="700">in parallelo</text>
    <text x="330" y="130" text-anchor="middle" opacity=".8">= 1,5 V, ma dura il doppio</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">In <strong>serie</strong> (una dietro l'altra, + con −) le tensioni si sommano: 1,5 + 1,5 = 3 V. In <strong>parallelo</strong> (+ con +, − con −) la tensione resta 1,5 V, ma la carica dura il doppio.</figcaption>
</figure>

## Conduttori, isolanti, resistenza

Perché servono i fili? L'elettricità *può* attraversare l'aria (i fulmini), ma con enorme fatica. Alcune sostanze la trasportano molto meglio, e dipende dalla loro struttura atomica: un atomo con **un solo elettrone nel guscio esterno** lo cede facilmente, ed è ciò che serve per condurre. I migliori **conduttori** sono **rame, argento e oro** (stessa colonna della tavola periodica); il rame è il più usato per i fili. L'opposto è la **resistenza**: le sostanze molto resistenti sono **isolanti** — gomma e plastica (con cui si rivestono i fili), stoffa, legno, aria secca. Il rame ha resistenza bassa ma non nulla: un filo **più lungo** resiste di più (chilometri di filo spegnerebbero la torcia), uno **più spesso** resiste di meno (offre più elettroni al passaggio).

## Volt, ampere, ohm — e la legge di Ohm

Tre grandezze descrivono l'elettricità, e la cosa più utile è capirle con l'**analogia dell'acqua in un tubo**:

| Grandezza | Unità (e chi le dà il nome) | Cos'è | Nell'acqua |
|---|---|---|---|
| **Tensione** (E) | volt — *Alessandro Volta* (1745-1827) | il *potenziale* di fare lavoro (esiste anche a circuito staccato) | la **pressione** |
| **Corrente** (I) | ampere — *André-Marie Ampère* (1775-1836) | quanti elettroni passano (1 A ≈ 6 quintilioni di elettroni al secondo) | la **quantità d'acqua** che scorre |
| **Resistenza** (R) | ohm — *Georg Simon Ohm* (1789-1854) | quanto la sostanza ostacola il passaggio | la **strettezza** del tubo |

La **tensione** è un potenziale, come un mattone sollevato: fermo in mano non fa nulla, ma più in alto sta, più lavoro può fare cadendo. Da queste tre grandezze nasce la relazione più famosa dell'elettricità, la **legge di Ohm**:

> **I = E / R** — la corrente è pari alla tensione diviso la resistenza.

Cioè: più tensione (pressione) → più corrente; più resistenza (tubo stretto) → meno corrente. Due casi limite lo chiariscono. Una batteria appoggiata da sola: E = 1,5 V ma la resistenza dell'aria è enorme, quindi I ≈ 0. Un **corto circuito** (i due poli uniti da un filo di rame): resistenza bassissima, corrente altissima, il filo si scalda fino a incandescenza e può fondere. Ed è esattamente così che funziona la **lampadina**: il filamento ha una resistenza tale (~4 ohm) che l'energia elettrica si converte in luce e calore. Con due batterie in serie (3 V) la corrente è 3 / 4 = **0,75 ampere**.

C'è infine il **watt** (da *James Watt*, 1736-1819), misura della **potenza**: **P = E × I**. La nostra lampadina è quindi da 3 V × 0,75 A = **2,25 watt**. I LED stanno sostituendo le incandescenti proprio perché danno la stessa luce con meno calore e meno watt.

## L'interruttore: acceso o spento

Restava il pezzo più importante: l'**interruttore**. Decide se l'elettricità scorre. Quando lascia passare la corrente si dice **chiuso** (*on*); quando la blocca, **aperto** (*off*). Attenzione al ribaltamento rispetto alle porte: una **porta chiusa** blocca il passaggio, un **interruttore chiuso** lo consente.

E qui i due fili del libro si riannodano. O l'interruttore è chiuso o è aperto; o la corrente scorre o non scorre; o la lampadina è accesa o spenta. Non c'è via di mezzo. Esattamente come i codici binari di Morse e Braille, la torcia ha **due soli stati**. È questa somiglianza tra codici binari e semplici circuiti elettrici che, nei prossimi capitoli, permetterà di costruire con gli interruttori prima la **logica** e poi il computer.

> [!tip]
> Tieni insieme i due fili del libro: un interruttore è **acceso/spento** come un punto/linea o un rilievo/piatto. Il computer nascerà dal mettere in fila tanti di questi "due stati" — non da qualcosa di più complicato.

> [!warning]
> *Chiuso* e *aperto* per un interruttore sono l'opposto che per una porta: **chiuso = passa corrente** (acceso), **aperto = non passa** (spento). È una fonte classica di confusione.

## Ripasso lampo

<details>
<summary>Perché un circuito deve essere un "cerchio"?</summary>

Perché la corrente scorre solo lungo un **percorso continuo**: batteria → filo → lampadina → interruttore → batteria. Qualsiasi interruzione del cerchio spegne la lampadina, e l'interruttore serve proprio a chiudere o spezzare quel percorso.

</details>

<details>
<summary>Cosa scorre davvero nel filo, e chi lo mette in moto?</summary>

Scorrono gli **elettroni**, che passano di atomo in atomo (l'elettricità *è* questo passaggio). A metterli in moto è la **batteria**, che con una reazione chimica converte energia chimica in elettrica, accumulando elettroni al polo negativo e richiamandoli al positivo.

</details>

<details>
<summary>Che differenza c'è tra collegare le batterie in serie e in parallelo?</summary>

In **serie** (+ con −) le tensioni si **sommano**: due pile da 1,5 V danno 3 V. In **parallelo** (+ con +, − con −) la tensione resta **1,5 V**, ma la carica disponibile raddoppia, quindi le pile **durano il doppio**.

</details>

<details>
<summary>Enuncia la legge di Ohm e spiega i tre termini.</summary>

**I = E / R**: la **corrente** (I, in ampere) è pari alla **tensione** (E, in volt) diviso la **resistenza** (R, in ohm). Più tensione dà più corrente; più resistenza la riduce. Nell'analogia idraulica: E = pressione, I = acqua che scorre, R = strettezza del tubo.

</details>

<details>
<summary>Perché l'interruttore lega la torcia al tema del binario?</summary>

Perché ha **due soli stati** — aperto o chiuso — e quindi la torcia è o spenta o accesa, senza vie di mezzo: lo stesso binario di Morse e Braille. È il ponte verso le porte logiche e, da lì, verso il computer.

</details>

**In sintesi:**

- Un **circuito è un cerchio**: serve un percorso continuo, e l'interruttore decide se chiuderlo. Il libro colora la corrente (qui in verde) per mostrarla.
- L'elettricità è il **passaggio di elettroni** di atomo in atomo, innescato dalla **batteria** (energia chimica → elettrica, ~1,5 V); in serie le tensioni si sommano, in parallelo cresce la durata.
- Tre grandezze legate dalla **legge di Ohm** `I = E / R` (tensione, corrente, resistenza ≈ pressione, acqua, strettezza del tubo); la potenza è `P = E × I` in watt.
- L'**interruttore** è **acceso/spento** (occhio: *chiuso* = passa corrente): due soli stati, lo stesso binario dei capitoli precedenti e la base dei circuiti logici che verranno.
