---
modulo: 14
titolo: "Transforms"
tags: [tipo/modulo, transforms]
---
# 14 · Transforms
> modulo 14 — *CSS* · rif. MDN

Le **transform** spostano, ruotano, scalano e inclinano un elemento agendo sul suo **sistema di coordinate visivo**. Il punto chiave: **non toccano il flusso del layout** — l'elemento continua a occupare lo spazio originale, cambia solo come viene *disegnato*. Questo le rende ideali per le animazioni performanti (vedi [[15-transizioni-animazioni]]).

Oggi le trasformazioni si scrivono in **due modi**:

- le **proprietà individuali** `translate`, `rotate`, `scale` — il modo attuale, [Baseline dal 2022](https://developer.mozilla.org/en-US/docs/Web/CSS/translate);
- la proprietà **`transform`** con le sue funzioni (`translate()`, `rotate()`, `scale()`, `skew()`, …) — la forma classica, ancora validissima e indispensabile per `skew`, le matrici e le combinazioni 3D.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 580 168" role="img" aria-label="Le quattro trasformazioni: translate, rotate, scale, skew" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="52" y="44" width="56" height="56" rx="4" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><rect x="70" y="60" width="56" height="56" rx="4" fill="var(--link,#1572b6)" fill-opacity=".22" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="80" y="150" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">translate</text><rect x="192" y="44" width="56" height="56" rx="4" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><g transform="rotate(24 220 72)"><rect x="192" y="44" width="56" height="56" rx="4" fill="var(--link,#1572b6)" fill-opacity=".22" stroke="var(--link,#1572b6)" stroke-width="1.6"/></g><circle cx="220" cy="72" r="3" fill="currentColor"/><text x="220" y="150" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">rotate</text><rect x="332" y="44" width="56" height="56" rx="4" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><rect x="321" y="33" width="78" height="78" rx="5" fill="var(--link,#1572b6)" fill-opacity=".22" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="360" y="150" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">scale</text><rect x="472" y="44" width="56" height="56" rx="4" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><polygon points="483,44 539,44 517,100 461,100" fill="var(--link,#1572b6)" fill-opacity=".22" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="500" y="150" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">skew</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le quattro trasformazioni sullo stesso quadrato (tratteggiato = posizione originale): <code>translate</code> sposta, <code>rotate</code> ruota attorno al <code>transform-origin</code> (il punto), <code>scale</code> ridimensiona, <code>skew</code> inclina. In ogni caso lo spazio occupato nel layout resta quello originale.</figcaption>
</figure>

## `translate` — spostare

Sposta l'elemento sull'asse X (orizzontale) e Y (verticale). Le percentuali sono **relative alla dimensione dell'elemento stesso**, non del genitore — comodo per centrare o spostare "di sé stesso".

```css
/* moderno: proprietà individuale */
.box { translate: 20px 40px; }   /* x=20px, y=40px */
.box { translate: -50%; }        /* solo x, metà della propria larghezza */

/* classico: funzione dentro transform */
.box { transform: translate(20px, 40px); }
.box { transform: translateX(20px); }   /* solo X */
.box { transform: translateY(40px); }   /* solo Y */
```

> [!tip]
> `translate: -50% -50%` combinato con `top: 50%; left: 50%` centra un elemento posizionato rispetto al proprio ingombro, senza conoscerne le dimensioni.

## `rotate` — ruotare (e `transform-origin`)

Ruota l'elemento attorno a un punto. L'angolo si esprime in `deg` (gradi), `turn` (1turn = 360°) o `rad`; valori positivi ruotano in **senso orario**.

```css
.box { rotate: 45deg; }                    /* moderno */
.box { transform: rotate(45deg); }         /* classico */
.box { transform: rotate(0.25turn); }      /* = 90deg */
```

Il perno di rotazione (e di scala) è definito da **`transform-origin`**, che di default vale `50% 50%` — il **centro** dell'elemento. Si sposta con keyword (`top`, `left`, `right`, `bottom`, `center`), lunghezze o percentuali.

```css
.box {
  transform-origin: top left;   /* ruota attorno allo spigolo in alto a sinistra */
  rotate: 15deg;
}
```

## `scale` — scalare

Ridimensiona l'elemento. Il valore è un **numero senza unità** (o una percentuale): `1` = dimensione originale, `2` = doppia, `0.5` = metà. I **valori negativi ribaltano** l'elemento (effetto specchio).

```css
.box { scale: 1.5; }        /* moderno: 150% su X e Y */
.box { scale: 2 0.5; }      /* X=200%, Y=50% */
.box { scale: -1 1; }       /* ribalta orizzontalmente */

.box { transform: scale(1.5); }        /* classico */
.box { transform: scaleX(2); }         /* solo X */
```

> [!warning]
> `scale` ingrandisce anche i contenuti (testo, bordi) mantenendo la nitidezza vettoriale, ma **non** rifluisce il layout: il box occupa sempre lo spazio della dimensione originale, quindi un ingrandimento può far sovrapporre l'elemento ai vicini.

## `skew` — inclinare (solo via `transform`)

Inclina l'elemento lungo un asse, con un angolo. **Non esiste** una proprietà individuale `skew`: si usa solo la funzione dentro `transform`.

```css
.box { transform: skewX(15deg); }        /* inclina in orizzontale */
.box { transform: skewY(10deg); }
.box { transform: skew(15deg, 10deg); }  /* X e Y insieme */
```

## L'ordine delle funzioni conta

Dentro `transform` si concatenano più funzioni separate da spazio. Si leggono **da sinistra a destra** e ognuna opera nel sistema di riferimento **ridefinito** dalla precedente: cambiare l'ordine cambia il risultato.

```css
/* prima sposta di 100px, poi ruota attorno alla nuova posizione */
.a { transform: translateX(100px) rotate(45deg); }

/* prima ruota (gli assi girano), poi "sposta" lungo l'asse X inclinato */
.b { transform: rotate(45deg) translateX(100px); }
```

Nel primo caso l'elemento finisce 100px a destra e ruotato sul posto; nel secondo lo spostamento segue l'asse già ruotato, quindi va in diagonale.

## Perché le proprietà individuali sono il default moderno

Le `translate`/`rotate`/`scale` standalone risolvono i due limiti storici di `transform`:

1. **Componibilità senza ordine da ricordare** — si impostano in dichiarazioni separate e non si sovrascrivono a vicenda. Con `transform` invece un secondo `transform` **azzera** il primo.
2. **Animazione indipendente** — si può far transitare solo la rotazione mentre la scala resta ferma, cosa impossibile con un unico `transform`.

```css
.card {
  translate: 0 0;
  scale: 1;
  transition: scale 0.2s;     /* anima SOLO la scala */
}
.card:hover { scale: 1.05; }  /* translate e rotate restano intatti */
```

Quando sono presenti tutte, l'ordine di applicazione è fisso: **`translate` → `rotate` → `scale`**, e l'eventuale `transform` si applica **dopo** ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/translate)). Per `skew`, le matrici o le combinazioni 3D complesse resta comunque `transform` la strada.

> [!info|label:Baseline]
> Le proprietà individuali `translate`, `rotate`, `scale` sono [Baseline "widely available"](https://developer.mozilla.org/en-US/docs/Web/CSS/scale) dall'agosto 2022. La proprietà `transform` è supportata universalmente da molto prima.

## Le transform non toccano il layout

Una transform modifica solo la resa visiva: l'elemento **occupa ancora la sua posizione e dimensione originali** nel flusso, i vicini non si spostano. Due conseguenze pratiche, oltre alla performance:

- un elemento con `transform` diverso da `none` crea uno **stacking context** (influisce sullo `z-index`, vedi [[09-display-posizionamento]]);
- diventa **containing block** per i discendenti `position: fixed` e `position: absolute` — utile saperlo quando un `fixed` "smette" di essere ancorato al viewport.

## Transform 3D

Aggiungendo l'asse **Z** (profondità, verso/lontano dall'osservatore) si passa al 3D. Serve prima dare una **prospettiva**.

### `perspective`: la profondità

`perspective` definisce la distanza dell'osservatore dal piano `z=0`. Si mette sul **genitore** che contiene gli elementi 3D. **Valori piccoli** (es. `200px`) danno un effetto marcato e distorto; valori grandi (`1500px`) un effetto lieve, "da lontano".

```css
.scene { perspective: 800px; }          /* sul CONTENITORE */
.scene > .box { rotate: y 45deg; }      /* il figlio sfrutta la prospettiva */
```

Esiste anche la funzione `perspective()` **dentro `transform`**, che dà prospettiva al **singolo elemento** invece che ai figli:

```css
.box { transform: perspective(800px) rotateY(45deg); }
```

`perspective-origin` (sul genitore, default `50% 50%`) sposta il **punto di fuga**, cioè la posizione da cui l'osservatore guarda la scena.

### Rotazioni e spostamenti sugli assi 3D

```css
.box { transform: rotateX(45deg); }     /* ribalta in avanti/indietro */
.box { transform: rotateY(45deg); }     /* gira come una porta */
.box { transform: rotateZ(45deg); }     /* = rotate(45deg), sul piano */
.box { rotate: y 180deg; }              /* equivalente moderno di rotateY */

.box { transform: translateZ(50px); }              /* avvicina all'osservatore */
.box { transform: translate3d(10px, 20px, 50px); } /* x, y, z insieme */
```

### Card che si gira: `transform-style` + `backface-visibility`

Per una scena 3D reale servono due proprietà:

- **`transform-style: preserve-3d`** sul contenitore: fa vivere i figli nello spazio 3D invece di appiattirli sul piano del genitore (default `flat`). Non è ereditata: va messa su ogni contenitore intermedio.
- **`backface-visibility: hidden`** su una faccia: la nasconde quando è rivolta dall'altra parte (il "retro"). Perfetta per le carte da girare.

```css
.scene {
  perspective: 800px;
}

.card {
  position: relative;
  width: 200px;
  height: 280px;
  transform-style: preserve-3d;   /* le due facce vivono nel 3D */
  transition: transform 0.6s;
}

.scene:hover .card {
  transform: rotateY(180deg);     /* gira la carta al passaggio del mouse */
}

.face {
  position: absolute;
  inset: 0;                       /* le facce sovrapposte */
  backface-visibility: hidden;    /* nasconde il lato rivolto all'indietro */
}

.face--back {
  transform: rotateY(180deg);     /* il retro parte già girato di 180° */
}
```

## Performance: transform e opacity sono "gratis"

Per disegnare un frame il browser attraversa una pipeline: **style → layout → paint → composite**. Animare proprietà geometriche (`width`, `height`, `top`, `left`, `margin`) fa ripartire da **layout** (reflow) a ogni frame — costoso.

`transform` e `opacity` invece si fermano all'ultimo stadio: sono gestiti dal **compositor** sulla **GPU**, senza reflow né repaint ([MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)). Per questo la regola è: **anima con `transform` e `opacity`**, non con proprietà di layout.

```css
/* ❌ lento: ogni frame ricalcola il layout */
@keyframes slide-bad { to { left: 100px; } }

/* ✅ fluido: solo composite sulla GPU */
@keyframes slide-good { to { transform: translateX(100px); } }
```

`will-change` avvisa il browser in anticipo di quali proprietà cambieranno, così può promuovere l'elemento a un layer dedicato del compositor. Va usato **con parsimonia**: applicarlo a troppi elementi consuma memoria e peggiora le prestazioni. Meglio attivarlo appena prima dell'animazione e rimuoverlo dopo, non lasciarlo fisso nel foglio di stile.

```css
.menu { will-change: transform; }   /* solo dove serve davvero */
```

> [!warning]
> `will-change` non è un acceleratore generico: si mette **solo** su un problema di fluidità reale e misurato. Può anche creare uno stacking context inatteso.

> [!info|label:Legacy]
> Anni fa `transform` richiedeva il prefisso `-webkit-` e il trucco `translate3d(0,0,0)` (o `translateZ(0)`) si usava per forzare l'accelerazione GPU. Oggi `transform` è supportato senza prefissi e per la promozione a layer esiste `will-change`: entrambi gli hack sono superflui.

Collegamenti: [[15-transizioni-animazioni]] · [[09-display-posizionamento]]

## Ripasso lampo

<details>
<summary>Applicare una <code>transform</code> sposta i box vicini nel layout?</summary>

No. La transform cambia **solo la resa visiva**; l'elemento continua a occupare la sua posizione e dimensione originali nel flusso. Per questo è ideale per animazioni performanti.

</details>

<details>
<summary>Che vantaggio hanno le proprietà <code>translate</code>/<code>rotate</code>/<code>scale</code> rispetto alla singola <code>transform</code>?</summary>

Sono **componibili** senza ricordare un ordine (non si sovrascrivono) e si possono **animare indipendentemente** (es. solo la scala). Con `transform` un secondo valore azzera il primo. Quando coesistono, l'ordine è `translate → rotate → scale`, poi `transform`. Per `skew` e le matrici serve ancora `transform`.

</details>

<details>
<summary>In <code>transform: rotate(45deg) translateX(100px)</code>, invertire le due funzioni cambia il risultato?</summary>

Sì. Le funzioni si applicano da sinistra a destra e ognuna opera nel sistema di coordinate ridefinito dalla precedente: ruotando prima, il `translateX` segue l'asse già inclinato (spostamento in diagonale).

</details>

<details>
<summary>Dove va la proprietà <code>perspective</code> e cosa cambia un valore piccolo?</summary>

Sul **genitore** che contiene gli elementi 3D. Un valore piccolo (es. `200px`) rende l'effetto di profondità più **marcato**; uno grande lo attenua. La funzione `perspective()` dentro `transform` dà invece prospettiva al singolo elemento.

</details>

<details>
<summary>Perché animare <code>transform</code> è più fluido che animare <code>width</code> o <code>left</code>?</summary>

`transform` (e `opacity`) sono gestiti dal **compositor sulla GPU**, senza far ripartire layout e paint. Animare `width`/`left` innesca un **reflow** a ogni frame, molto più costoso.

</details>

**In sintesi:**
- Le transform cambiano solo l'aspetto: l'elemento **non lascia** il suo posto nel flusso → animazioni leggere.
- Modo attuale = **proprietà individuali** `translate`/`rotate`/`scale` (Baseline 2022), componibili e animabili in modo indipendente; `transform` resta per `skew`, matrici, combo 3D (e lì **l'ordine conta**).
- 3D: `perspective` sul genitore, `perspective()` sul singolo elemento, `transform-style: preserve-3d` e `backface-visibility: hidden` per scene reali (es. card che si gira).
- Anima **`transform` e `opacity`**; usa `will-change` con parsimonia solo su problemi di fluidità reali.
