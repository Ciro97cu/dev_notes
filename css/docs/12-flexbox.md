---
modulo: 12
titolo: "Flexbox"
tags: [tipo/modulo, flexbox, layout]
---
# 12 · Flexbox

> modulo 12 — *CSS* · rif. MDN

**Flexbox** (*Flexible Box Layout*) è un modello di layout **monodimensionale**: dispone gli elementi lungo **un asse** per volta — una riga *oppure* una colonna — e sa distribuire lo spazio libero e allineare gli elementi in modo naturale. È lo strumento giusto per barre di navigazione, gruppi di pulsanti, card affiancate, centrature: ovunque conti come si comportano gli elementi lungo una singola direzione. Per griglie a righe **e** colonne insieme (layout bidimensionale) si usa invece [[13-grid]].

## Container e item

Flexbox nasce da una relazione **genitore-figli**: si attiva sul contenitore, e riguarda solo i suoi **figli diretti**.

```css
.container {
  display: flex;        /* container di livello block */
}
```

- `display: flex` — il container si comporta come un box **block** (occupa tutta la larghezza disponibile) e i suoi figli diretti diventano **flex item**.
- `display: inline-flex` — stesso comportamento interno, ma il container si dispone **in linea** col testo circostante (larghezza pari al contenuto).

I figli diretti sono gli unici coinvolti: i nipoti seguono il flusso normale, a meno che anche il figlio non sia a sua volta un flex container. Il testo libero dentro il container viene avvolto in un flex item anonimo.

> [!tip]
> Attivare Flexbox non richiede markup speciale: basta `display: flex` sul genitore. Da quel momento proprietà come `width`, `float` e i margini automatici sui figli si comportano diversamente dal flusso normale.

## I due assi: main e cross

Tutto in Flexbox ruota attorno a **due assi perpendicolari**:

- **Asse principale** (*main axis*) — la direzione lungo cui gli item vengono disposti. Ha un **main-start** e un **main-end**.
- **Asse trasversale** (*cross axis*) — perpendicolare al principale. Ha un **cross-start** e un **cross-end**.

Quale sia orizzontale e quale verticale **non è fisso**: lo decide `flex-direction`. Questa è la chiave per non confondersi con le proprietà di allineamento.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 430 190" role="img" aria-label="Flexbox: asse principale (justify-content) e trasversale (align-items)" style="width:100%;max-width:470px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="235" y="30" font-size="11" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">flex-direction: row</text><rect x="70" y="44" width="330" height="86" rx="8" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3"/><rect x="84" y="60" width="84" height="54" rx="6" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="92" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="188" y="60" width="84" height="54" rx="6" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="230" y="92" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="292" y="60" width="84" height="54" rx="6" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="334" y="92" font-size="15" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><line x1="70" y1="150" x2="398" y2="150" stroke="currentColor" stroke-width="1.6"/><path d="M398 146 L404 150 L398 154 Z" fill="currentColor"/><text x="237" y="170" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">asse principale — justify-content</text><line x1="44" y1="44" x2="44" y2="126" stroke="currentColor" stroke-width="1.6"/><path d="M40 126 L44 132 L48 126 Z" fill="currentColor"/><text x="20" y="88" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor" transform="rotate(-90 20 88)">asse trasversale — align-items</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I due assi di un flex container: <code>justify-content</code> allinea lungo l'<strong>asse principale</strong> (orizzontale con <code>flex-direction: row</code>), <code>align-items</code> lungo l'<strong>asse trasversale</strong>. Con <code>column</code> i due assi si scambiano.</figcaption>
</figure>

La regola mnemonica: **`justify-content` allinea sull'asse principale**, **`align-items` sull'asse trasversale**. Se si cambia `flex-direction`, il significato "orizzontale/verticale" di queste due proprietà si scambia di conseguenza.

> [!tip]
> Flexbox ragiona per **logica** (start/end), non per lati fisici (left/right, top/bottom): questo lo rende automaticamente corretto anche nelle lingue da destra a sinistra (RTL) e nei writing mode verticali.

## Proprietà del container

### `flex-direction` — orientare l'asse principale

Stabilisce direzione e verso dell'asse principale.

```css
.container {
  flex-direction: row;            /* default: da sinistra a destra */
  /* row-reverse                     da destra a sinistra */
  /* column                          dall'alto in basso */
  /* column-reverse                  dal basso in alto */
}
```

Con `row`/`row-reverse` il main axis è orizzontale; con `column`/`column-reverse` diventa verticale. Le varianti `-reverse` invertono anche il punto di partenza (main-start e main-end si scambiano).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 480 150" role="img" aria-label="flex-direction: row, row-reverse, column, column-reverse — verso dell'asse principale" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="16" y="40" width="90" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="24" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="35.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="49" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="60.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="74" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="85.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><path d="M24 112 L94 112" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M98 112 L91 108 L91 116 Z" fill="currentColor"/><text x="61.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">row</text><rect x="132" y="40" width="90" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="140" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="151.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><rect x="165" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="176.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="190" y="54" width="22" height="30" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="201.0" y="72.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><path d="M214 112 L144 112" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M140 112 L147 108 L147 116 Z" fill="currentColor"/><text x="177.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">row-reverse</text><rect x="248" y="40" width="90" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="258" y="50" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="280.0" y="61.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="258" y="70" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="280.0" y="81.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="258" y="90" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="280.0" y="101.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><path d="M326 50 L326 114" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M326 118 L322 111 L330 111 Z" fill="currentColor"/><text x="293.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">column</text><rect x="364" y="40" width="90" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="374" y="50" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="396.0" y="61.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><rect x="374" y="70" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="396.0" y="81.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="374" y="90" width="44" height="16" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="396.0" y="101.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><path d="M442 116 L442 54" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M442 50 L438 57 L446 57 Z" fill="currentColor"/><text x="409.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">column-reverse</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>flex-direction</code> imposta direzione e verso dell'asse principale; la freccia indica l'ordine con cui scorrono gli item (i numeri sono l'ordine nel DOM).</figcaption>
</figure>

### `flex-wrap` — andare a capo

Di default gli item stanno tutti su **una sola riga** e, se non c'è spazio, si restringono. `flex-wrap` permette invece di mandarli a capo su più righe.

```css
.container {
  flex-wrap: nowrap;        /* default: tutto su una riga, gli item si restringono */
  /* wrap                      va a capo su più righe */
  /* wrap-reverse              va a capo, ma le righe si impilano in ordine inverso */
}
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 464 118" role="img" aria-label="flex-wrap: nowrap tiene tutto su una riga, wrap manda a capo su piu righe" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="24" y="44" width="190" height="58" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="119.0" y="36" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">nowrap</text><rect x="32.0" y="60" width="31.6" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="47.8" y="76.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="67.6" y="60" width="31.6" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="83.39999999999999" y="76.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="103.2" y="60" width="31.6" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="119.0" y="76.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><rect x="138.8" y="60" width="31.6" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="154.60000000000002" y="76.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">4</text><rect x="174.4" y="60" width="31.6" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="190.20000000000002" y="76.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">5</text><rect x="250" y="44" width="190" height="58" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="345.0" y="36" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">wrap</text><rect x="258" y="52" width="48" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="282.0" y="64.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">1</text><rect x="312" y="52" width="48" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="336.0" y="64.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">2</text><rect x="366" y="52" width="48" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="390.0" y="64.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">3</text><rect x="258" y="76" width="48" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="282.0" y="88.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">4</text><rect x="312" y="76" width="48" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="336.0" y="88.24" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">5</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>flex-wrap</code>: con <code>nowrap</code> (default) gli item stanno su <strong>una</strong> riga e si restringono; con <code>wrap</code> vanno <strong>a capo</strong> su piu righe.</figcaption>
</figure>

### `flex-flow` — lo shorthand di direzione e wrap

Combina `flex-direction` e `flex-wrap` in una sola dichiarazione:

```css
.container {
  flex-flow: row wrap;      /* = flex-direction: row; flex-wrap: wrap; */
}
```

### `justify-content` — allineamento sull'asse principale

Distribuisce lo **spazio libero** lungo l'asse principale.

```css
.container {
  justify-content: flex-start;      /* default: item impacchettati a main-start */
  /* flex-end          impacchettati a main-end */
  /* center            centrati sull'asse principale */
  /* space-between     primo a inizio, ultimo a fine, spazio uguale in mezzo */
  /* space-around      spazio uguale attorno a ogni item (i bordi valgono metà) */
  /* space-evenly      spazio uguale ovunque, bordi compresi */
}
```

La differenza tra i tre `space-*`:

- `space-between` — nessuno spazio ai bordi; tutto il vuoto va **tra** gli item.
- `space-around` — ogni item ha lo stesso spazio a sinistra e a destra, quindi lo spazio tra due item è **doppio** rispetto a quello ai bordi.
- `space-evenly` — ogni intervallo, bordi inclusi, è **identico**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 226" role="img" aria-label="justify-content: flex-start, center, flex-end, space-between, space-around, space-evenly" style="width:100%;max-width:470px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="145" y="16" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="151" y="20" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="189" y="20" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="227" y="20" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="33" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">flex-start</text><rect x="145" y="50" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="238" y="54" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="276" y="54" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="314" y="54" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="67" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">center</text><rect x="145" y="84" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="325" y="88" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="363" y="88" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="401" y="88" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="101" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">flex-end</text><rect x="145" y="118" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="151" y="122" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="276" y="122" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="401" y="122" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="135" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">space-between</text><rect x="145" y="152" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="180" y="156" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="276" y="156" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="372" y="156" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="169" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">space-around</text><rect x="145" y="186" width="300" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="195" y="190" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="276" y="190" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="357" y="190" width="38" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="126" y="203" font-size="10" text-anchor="end" font-weight="700" opacity="1" fill="currentColor">space-evenly</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I valori di <code>justify-content</code> sull'asse principale. I tre <code>space-*</code> differiscono solo ai <strong>bordi</strong>: <code>between</code> niente spazio ai bordi, <code>around</code> mezzo spazio, <code>evenly</code> spazio uguale ovunque.</figcaption>
</figure>

### `align-items` — allineamento sull'asse trasversale

Allinea gli item lungo l'asse trasversale, entro l'altezza (o larghezza) della riga.

```css
.container {
  align-items: stretch;         /* default: gli item riempiono il cross axis */
  /* flex-start        allineati a cross-start */
  /* flex-end          allineati a cross-end */
  /* center            centrati sull'asse trasversale */
  /* baseline          allineati sulla linea di base del testo */
}
```

`stretch` agisce solo se l'item non ha una dimensione esplicita sull'asse trasversale (es. nessuna `height` fissata quando il cross axis è verticale).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 512 118" role="img" aria-label="align-items: flex-start, center, flex-end, stretch, baseline sull'asse trasversale" style="width:100%;max-width:520px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="12" y="30" width="92" height="74" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="58.0" y="22" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">flex-start</text><rect x="24" y="38" width="20" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="50" y="38" width="20" height="44" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="76" y="38" width="20" height="34" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="112" y="30" width="92" height="74" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="158.0" y="22" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">center</text><rect x="124" y="54.0" width="20" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="150" y="45.0" width="20" height="44" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="176" y="50.0" width="20" height="34" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="212" y="30" width="92" height="74" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="258.0" y="22" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">flex-end</text><rect x="224" y="70" width="20" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="250" y="52" width="20" height="44" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="276" y="62" width="20" height="34" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="312" y="30" width="92" height="74" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="358.0" y="22" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">stretch</text><rect x="324" y="38" width="20" height="58" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="350" y="38" width="20" height="58" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="376" y="38" width="20" height="58" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><rect x="412" y="30" width="92" height="74" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="458.0" y="22" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">baseline</text><rect x="424" y="66" width="20" height="26" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="434.0" y="86" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">a</text><rect x="450" y="48" width="20" height="44" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="460.0" y="86" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">a</text><rect x="476" y="58" width="20" height="34" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="486.0" y="86" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">a</text><path d="M418 86 L498 86" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I valori di <code>align-items</code> sull'asse trasversale, con item di altezze diverse. <code>stretch</code> (default) li allunga a riempire la riga; <code>baseline</code> allinea le <strong>linee di base del testo</strong> (le "a" poggiano sul tratteggio).</figcaption>
</figure>

### `align-content` — allineamento delle righe multiple

Quando gli item vanno a capo (`flex-wrap: wrap`) e occupano **più righe**, `align-content` distribuisce lo spazio **tra le righe** lungo l'asse trasversale.

```css
.container {
  flex-wrap: wrap;
  align-content: flex-start;    /* normal | flex-start | flex-end | center |
                                   space-between | space-around | space-evenly | stretch */
}
```

> [!warning]
> `align-content` non ha **nessun effetto** su un container a riga singola (`flex-wrap: nowrap`, il default): serve solo quando esistono più righe da distribuire. Da non confondere con `align-items`, che allinea gli item **dentro** ciascuna riga.

### `gap` — il modo moderno di spaziare

`gap` imposta lo spazio **tra** gli item (e tra le righe, quando c'è wrap), senza toccare i bordi esterni del container. È il modo standard di gestire la spaziatura in Flexbox.

```css
.container {
  display: flex;
  gap: 1rem;              /* stesso spazio tra tutti gli item */
  /* gap: 1rem 2rem;         row-gap column-gap */
}
```

Rispetto ai margini sui singoli item, `gap` non aggiunge spazio spurio ai margini esterni, non richiede di azzerare il margine sul primo/ultimo elemento e non soffre di *margin collapsing* (vedi [[05-box-model]]). Le sotto-proprietà `row-gap` e `column-gap` permettono di regolare le due direzioni separatamente.

> [!info] Baseline
> `gap` nei flex container è **Baseline widely available**: supportato da tutti i browser correnti dopo l'arrivo in Safari 14.1 (aprile 2021). Oggi è la scelta di default per spaziare in flex. ([MDN — `gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/gap), [Can I Use — flexbox-gap](https://caniuse.com/flexbox-gap))

> [!info] Legacy
> Prima di `gap` si spaziava con i **margini** sugli item (es. `margin-right` su ciascuno tranne l'ultimo, o `margin: 0 0.5rem` sul container per compensare). Tecnica ancora leggibile in codice datato o dove serve supporto a Safari &lt; 14.1, ma superata: preferire `gap`.

### `place-content` e `place-items` — gli shorthand

Due shorthand accorpano le proprietà di allineamento del container:

```css
.container {
  place-content: center space-between;   /* = align-content: center; justify-content: space-between; */
  place-items: center;                   /* = align-items: center; justify-items: center; */
}
```

> [!warning]
> In Flexbox `justify-items` (e `justify-self` sugli item) **non hanno effetto**: l'allineamento sull'asse principale è governato da `justify-content` sul container e dai margini automatici sugli item. Di conseguenza, in un flex container `place-items` finisce per impostare di fatto il solo `align-items`. Queste proprietà tornano pienamente utili in [[13-grid]].

## Proprietà degli item

Le tre proprietà `flex-*` decidono come ogni item **cresce**, **si restringe** e da quale **dimensione base** parte lungo l'asse principale.

### `flex-grow` — crescere

Fattore di crescita: quanta parte dello spazio **libero** l'item si prende, in proporzione agli altri.

```css
.item {
  flex-grow: 0;     /* default: non cresce */
}
```

Con tutti gli item a `flex-grow: 1` lo spazio extra si divide in parti uguali; un item a `2` prende il doppio dello spazio extra rispetto a uno a `1`.

### `flex-shrink` — restringersi

Fattore di restringimento: quanto l'item si contrae quando lo spazio **manca**.

```css
.item {
  flex-shrink: 1;   /* default: può restringersi */
}
```

Con `flex-shrink: 0` l'item **non** si restringe e può causare overflow del container.

### `flex-basis` — la dimensione di partenza

Dimensione dell'item lungo l'asse principale **prima** che grow/shrink entrino in gioco.

```css
.item {
  flex-basis: auto;   /* default: usa width/height o il contenuto */
  /* flex-basis: 200px;  parte da 200px */
  /* flex-basis: 0;      ignora il contenuto, parte da zero */
}
```

### `flex` — lo shorthand (il modo consigliato)

Accorpa `flex-grow`, `flex-shrink` e `flex-basis`. MDN consiglia di usare **lo shorthand** anziché le tre proprietà separate, perché imposta valori sensati per quelle omesse.

```css
.item {
  flex: 1;                /* = 1 1 0%  → cresce/si restringe, base 0 */
  /* flex: 1 1 auto;         forma esplicita a tre valori */
}
```

Valori con espansione da ricordare:

- `flex: 1` → `1 1 0%` — tutti gli item con questo valore si dividono lo spazio **in parti uguali**, ignorando la dimensione del contenuto (base `0`). È il pattern per colonne di pari larghezza.
- `flex: auto` → `1 1 auto` — cresce e si restringe, ma **partendo dalla dimensione del contenuto**: item con più contenuto restano più larghi.
- `flex: none` → `0 0 auto` — dimensione fissa sul contenuto, né cresce né si restringe.
- `flex: initial` → `0 1 auto` — il default: non cresce, ma può restringersi.

> [!tip]
> Differenza chiave tra `flex: 1` e `flex: auto`: entrambi crescono, ma `flex: 1` azzera la base (larghezze **uguali** a prescindere dal contenuto), mentre `flex: auto` parte dal contenuto (larghezze **proporzionali** al contenuto).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 466 112" role="img" aria-label="flex 1 contro flex auto: larghezze uguali contro proporzionali al contenuto" style="width:100%;max-width:460px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="16" y="40" width="200" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="116.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">flex: 1  (larghezze uguali)</text><rect x="24.0" y="53" width="57.333333333333336" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="52.66666666666667" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">A</text><rect x="87.33333333333334" y="53" width="57.333333333333336" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="116.00000000000001" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">BBBB</text><rect x="150.66666666666669" y="53" width="57.333333333333336" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="179.33333333333334" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">CC</text><rect x="250" y="40" width="200" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="350.0" y="32" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">flex: auto  (larghezze dal contenuto)</text><rect x="258" y="53" width="34" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="275.0" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">A</text><rect x="298" y="53" width="96" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="346.0" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">BBBB</text><rect x="400" y="53" width="44" height="28" rx="4" fill="var(--link,#1572b6)" fill-opacity=".18" stroke="var(--link,#1572b6)" stroke-width="1.4"/><text x="422.0" y="70.6" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">CC</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>flex: 1</code> (= <code>1 1 0%</code>) divide lo spazio in parti <strong>uguali</strong> ignorando il contenuto; <code>flex: auto</code> (= <code>1 1 auto</code>) parte dal <strong>contenuto</strong>, quindi gli item restano proporzionali a esso.</figcaption>
</figure>

### `align-self` — sovrascrivere l'allineamento del singolo

Permette a un singolo item di ignorare l'`align-items` del container sull'asse trasversale.

```css
.item {
  align-self: flex-end;    /* auto | flex-start | flex-end | center | baseline | stretch */
}
```

### `order` — riordinare visivamente

Cambia l'ordine **visivo** degli item (default `0`); a parità di `order` vale l'ordine del sorgente.

```css
.item {
  order: 1;      /* item con order più basso appaiono prima */
}
```

> [!warning]
> `order` altera solo la disposizione visiva, **non** l'ordine del DOM: la navigazione da tastiera e gli screen reader seguono comunque l'ordine del markup. Un disallineamento tra ordine visivo e ordine del sorgente danneggia l'accessibilità (WCAG 1.3). Va usato con parsimonia; l'ordine logico dovrebbe stare nell'HTML. ([MDN — `order`](https://developer.mozilla.org/en-US/docs/Web/CSS/order))

## Pattern comuni

### Centrare perfettamente

Centratura sui due assi in tre righe:

```css
.center {
  display: flex;
  justify-content: center;   /* centra sull'asse principale */
  align-items: center;       /* centra sull'asse trasversale */
}
```

### Navbar con logo a sinistra e link a destra

`justify-content: space-between` spinge i due gruppi ai lati opposti; `gap` spazia i link tra loro.

```html
<nav class="navbar">
  <a class="logo" href="/">Logo</a>
  <ul class="links">
    <li><a href="/chi-siamo">Chi siamo</a></li>
    <li><a href="/contatti">Contatti</a></li>
  </ul>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;   /* logo a sinistra, link a destra */
  align-items: center;              /* allineati verticalmente al centro */
}

.links {
  display: flex;
  gap: 1.5rem;                      /* spazio tra i link */
  list-style: none;
}
```

### Footer sempre in fondo (sticky footer)

Un layout a colonna alto quanto la viewport, con il contenuto centrale che **si espande** (`flex: 1`) e spinge il footer in basso anche quando la pagina è corta.

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;         /* alto almeno quanto la viewport */
}

main {
  flex: 1;                   /* occupa tutto lo spazio residuo */
}
```

Il `footer` non ha bisogno di regole: viene naturalmente spinto in fondo dal `main` che cresce.

## Flexbox (1D) o Grid (2D)?

Regola pratica: se si ragiona su **una direzione** per volta (una fila di elementi che si distribuisce e va a capo), è **Flexbox**. Se si progetta una struttura a **righe e colonne allineate insieme** (una griglia vera), è **Grid**. I due modelli si combinano spesso: Grid per l'impianto della pagina, Flexbox dentro i singoli componenti. Il modulo dedicato: [[13-grid]].

Collegamenti: [[13-grid]] · [[05-box-model]] · [[09-display-posizionamento]]

## Ripasso lampo

<details>
<summary>Qual è la differenza tra <code>justify-content</code> e <code>align-items</code>, e da cosa dipende quale dei due agisce in orizzontale?</summary>

`justify-content` allinea sull'**asse principale**, `align-items` sull'**asse trasversale**. Quale sia orizzontale dipende da `flex-direction`: con `row` il principale è orizzontale, con `column` diventa verticale (i due si scambiano).

</details>

<details>
<summary>Perché si preferisce <code>gap</code> ai margini per spaziare i flex item?</summary>

`gap` mette spazio solo **tra** gli item (non ai bordi esterni), non richiede di azzerare il margine sul primo/ultimo elemento e non soffre di margin collapsing. È **Baseline** dal 2021 (Safari 14.1) ed è il modo standard oggi.

</details>

<details>
<summary>A cosa si espande <code>flex: 1</code> e in cosa differisce da <code>flex: auto</code>?</summary>

`flex: 1` = `1 1 0%`: gli item si dividono lo spazio in **parti uguali** ignorando il contenuto (base `0`). `flex: auto` = `1 1 auto`: crescono anch'essi, ma **partendo dal contenuto**, quindi risultano proporzionali a esso.

</details>

<details>
<summary>Quando <code>align-content</code> ha effetto e quando invece è inutile?</summary>

Ha effetto solo con **più righe** (`flex-wrap: wrap` e item che vanno a capo), perché distribuisce lo spazio tra le righe. Su un container a riga singola (`nowrap`, il default) non fa nulla.

</details>

<details>
<summary>Perché <code>order</code> va usato con cautela?</summary>

Cambia solo l'ordine **visivo**, non quello del DOM: tastiera e screen reader seguono il markup. Il disallineamento danneggia l'accessibilità (WCAG 1.3); l'ordine logico va tenuto nell'HTML.

</details>

<details>
<summary>Flexbox o Grid?</summary>

Flexbox per il layout **monodimensionale** (una riga o una colonna, con eventuale wrap); Grid per il **bidimensionale** (righe e colonne allineate insieme). Spesso si combinano: vedi [[13-grid]].

</details>

**In sintesi:**
- `display: flex`/`inline-flex` sul container rende i **figli diretti** flex item, disposti lungo un **asse principale** (orientato da `flex-direction`) e allineati sull'**asse trasversale**.
- Container: `flex-direction`, `flex-wrap` (`flex-flow` shorthand), `justify-content` (asse principale), `align-items` (trasversale), `align-content` (righe multiple), **`gap`** come modo standard di spaziare.
- Item: `flex-grow`/`flex-shrink`/`flex-basis` (shorthand `flex`, con `flex: 1` per colonne uguali), `align-self`, `order`.
- Flexbox è **1D**; per il layout **2D** a righe e colonne si passa a [[13-grid]].
