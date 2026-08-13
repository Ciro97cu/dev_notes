# Il processo TC39: come nasce (ed evolve) JavaScript

*➕ Fuori dalla serie YDKJS — questa pagina della sezione «JavaScript moderno» spiega **come** il linguaggio evolve (chi decide, cos'è uno "stage", come seguire una novità), un argomento che i sei libri non trattano.*

Nelle altre pagine di questa sezione ricorrono espressioni come *«finished proposals di TC39»* o *«feature arrivata allo Stage 4»*. Se non è chiaro cosa significhino, questa pagina fa da guida: spiega **chi governa** JavaScript, con quale **processo** una nuova funzionalità entra nel linguaggio, cosa vogliono dire i vari **stage**, e come si fa a **trovare una proposta** sul web e capire a che punto è.

## Chi comanda su JavaScript: Ecma, TC39, ECMAScript

JavaScript non è di proprietà di una singola azienda: è uno **standard**, cioè un insieme di regole scritte e pubbliche che tutti concordano di seguire. Dietro ci sono alcuni attori con nomi facili da confondere, che conviene distinguere subito:

| Termine | Che cos'è |
|:--|:--|
| **Ecma International** | Un'organizzazione internazionale che pubblica **standard** tecnici (non solo per il web). È l'ente "editore". |
| **TC39** | *Technical Committee 39*: il **comitato**, interno a Ecma, che cura lo standard di JavaScript. È qui che si decide cosa entra nel linguaggio. |
| **ECMA-262** | Il **documento di specifica**: il testo tecnico, lungo e minuzioso, che descrive esattamente come deve comportarsi ogni funzionalità del linguaggio. |
| **ECMAScript** | Il **nome ufficiale** del linguaggio definito da ECMA-262. |
| **JavaScript** | Il **nome comune** con cui tutti chiamano lo stesso linguaggio (la differenza è storica e di marchio). In pratica, ECMAScript ≈ JavaScript. |

Il **TC39** è composto da *delegati*: soprattutto i produttori dei browser (Google, Apple, Mozilla, Microsoft), più altre aziende e alcuni esperti invitati. Il comitato si riunisce circa **sei volte l'anno** e decide **per consenso** — cioè una proposta avanza solo se nessun membro si oppone con motivazioni serie. Perché serve una *specifica* così pignola? Perché JavaScript non gira su un solo programma: ogni browser ha il suo **motore** (*engine*) che esegue il codice — **V8** in Chrome e in Node.js, **SpiderMonkey** in Firefox, **JavaScriptCore** in Safari. Se ognuno interpretasse le regole a modo suo, lo stesso programma darebbe risultati diversi altrove. La specifica serve proprio a far sì che tutti i motori si comportino allo stesso modo.

## Il ciclo annuale: una nuova edizione ogni giugno

Dal 2015 in poi TC39 pubblica **una nuova edizione** dello standard **ogni anno, a giugno**. Ogni edizione ha due nomi: uno per **anno** (`ES2015`, `ES2016`, …, `ES2026`) e uno per **numero d'ordine** (`ES2015` è la 6ª edizione, cioè `ES6`; `ES2026` è la 17ª, cioè `ES17`). Ogni giugno l'edizione raccoglie **tutte e sole** le proposte che entro una certa scadenza hanno raggiunto la maturità massima (lo **Stage 4**, che si spiega tra poco). È questo il motivo per cui in questa sezione i contenuti sono organizzati *per edizione*.

## Gli stage: dalla 0 alla 4

Una funzionalità non compare dall'oggi al domani: attraversa una **pipeline** di stadi, gli *stage*, numerati da 0 a 4 (con una tappa intermedia, la 2.7, aggiunta nel 2024). A ogni tappa il comitato deve dare il proprio consenso, e a ogni tappa i requisiti si fanno più stringenti: si parte da un'idea vaga e si arriva a una funzionalità completa, testata e già presente nei browser.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 610 150" role="img" aria-label="Pipeline degli stage TC39 da 0 a 4" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><line x1="73" y1="88" x2="123" y2="88" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M123 84 L129 88 L123 92 Z" fill="currentColor" opacity=".7"/><line x1="175" y1="88" x2="225" y2="88" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M225 84 L231 88 L225 92 Z" fill="currentColor" opacity=".7"/><line x1="277" y1="88" x2="327" y2="88" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M327 84 L333 88 L327 92 Z" fill="currentColor" opacity=".7"/><line x1="379" y1="88" x2="429" y2="88" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M429 84 L435 88 L429 92 Z" fill="currentColor" opacity=".7"/><line x1="481" y1="88" x2="531" y2="88" stroke="currentColor" stroke-width="1.4" opacity=".55"/><path d="M531 84 L537 88 L531 92 Z" fill="currentColor" opacity=".7"/><circle cx="50" cy="88" r="19" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="50" y="93" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">0</text><text x="50" y="61" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".7">Strawperson</text><text x="50" y="123" text-anchor="middle" font-size="10" fill="currentColor">idea</text><circle cx="152" cy="88" r="19" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="152" y="93" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">1</text><text x="152" y="61" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".7">Proposal</text><text x="152" y="123" text-anchor="middle" font-size="10" fill="currentColor">problema</text><circle cx="254" cy="88" r="19" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="254" y="93" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">2</text><text x="254" y="61" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".7">Draft</text><text x="254" y="123" text-anchor="middle" font-size="10" fill="currentColor">bozza</text><circle cx="356" cy="88" r="19" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="356" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">2.7</text><text x="356" y="123" text-anchor="middle" font-size="10" fill="currentColor">spec</text><text x="356" y="135" text-anchor="middle" font-size="10" fill="currentColor">completa</text><circle cx="458" cy="88" r="19" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="458" y="93" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">3</text><text x="458" y="61" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".7">Candidate</text><text x="458" y="123" text-anchor="middle" font-size="10" fill="currentColor">test +</text><text x="458" y="135" text-anchor="middle" font-size="10" fill="currentColor">impl.</text><circle cx="560" cy="88" r="19" fill="var(--link,#059669)" fill-opacity=".18" stroke="currentColor" stroke-width="1.8"/><text x="560" y="93" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">4</text><text x="560" y="61" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".7">Finished</text><text x="560" y="123" text-anchor="middle" font-size="10" fill="currentColor">nello</text><text x="560" y="135" text-anchor="middle" font-size="10" fill="currentColor">standard</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il percorso di una proposta. A ogni stadio i requisiti crescono; solo lo Stage 4 entra nello standard. Molte proposte si fermano lungo la strada o vengono ritirate.</figcaption>
</figure>

Prima di leggere lo schema, tre parole da conoscere: un **champion** è il membro del comitato che "adotta" una proposta e la porta avanti riunione dopo riunione; **Test262** è la **suite di test ufficiale**, migliaia di piccoli programmi che un motore deve superare per dimostrare di aver implementato la feature *esattamente* come dice la specifica; un'**implementazione** è appunto la feature realizzata dentro un motore reale (V8, SpiderMonkey…). Ecco cosa significa ciascuno stage e cosa serve per entrarci:

| Stage | Nome | Cosa significa | Per entrarci serve |
|:--:|:--|:--|:--|
| **0** | *Strawperson* | Un'idea buttata lì, ancora informale. | Niente: la assegna l'autore stesso. |
| **1** | *Proposal* | Il comitato accetta di studiarla sul serio. | Un **champion**, la descrizione del problema e la forma generale della soluzione, un repository pubblico. |
| **2** | *Draft* | Il comitato si aspetta che, prima o poi, entri nel linguaggio. | Prime **API** e sintassi con esempi d'uso, una **prima bozza** di testo di specifica, revisori assegnati. |
| **2.7** | *(tappa aggiunta nel 2024)* | La specifica è **finita** e approvata; manca solo scrivere i test. | Testo di specifica **completo**, con l'ok dei revisori e del gruppo degli editor. |
| **3** | *Candidate* | Pronta da implementare: si raccoglie esperienza sul campo. | I **test** (Test262) scritti e un'esperienza pre-implementazione. I motori cominciano a spedirla. |
| **4** | *Finished* | **È nello standard.** | Almeno **due implementazioni** che passano i test, già distribuite, più la richiesta di modifica alla specifica approvata. |

## Un esempio concreto: il ciclo di vita di `Temporal`

Il processo diventa più chiaro seguendo una feature reale dall'inizio alla fine. **`Temporal`** — la nuova API per date e orari — è il caso perfetto, perché ha appena **completato l'intero ciclo**, arrivando allo Stage 4 in ES2026.

**Il problema.** L'oggetto `Date` di JavaScript è notoriamente difettoso: è **mutabile**, conta i **mesi da zero**, non gestisce davvero i **fusi orari** e ha un parsing inaffidabile. Per anni è stato uno dei principali punti dolenti di chi scrive JavaScript. L'idea era rimpiazzarlo con un'API moderna e immutabile: `Temporal`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 620 132" role="img" aria-label="Timeline di Temporal: Stage 1 2017, Stage 2 2019, Stage 3 2021, Stage 4 2026" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><line x1="55" y1="82" x2="565" y2="82" stroke="currentColor" stroke-width="1.6"/><circle cx="55" cy="82" r="7" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="2"/><text x="55.0" y="64" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Stage 1</text><text x="55.0" y="106" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="var(--link,#e6c200)">2017</text><text x="55.0" y="120" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">l'idea · il problema</text><circle cx="168" cy="82" r="7" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="2"/><text x="168.33333333333331" y="64" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Stage 2</text><text x="168.33333333333331" y="106" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="var(--link,#e6c200)">2019</text><text x="168.33333333333331" y="120" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">bozza di spec</text><circle cx="282" cy="82" r="7" fill="none" fill-opacity="1" stroke="currentColor" stroke-width="2"/><text x="281.66666666666663" y="64" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Stage 3</text><text x="281.66666666666663" y="106" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="var(--link,#e6c200)">2021</text><text x="281.66666666666663" y="120" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">spec completa · impl.</text><circle cx="565" cy="82" r="7" fill="var(--link,#e6c200)" fill-opacity=".35" stroke="currentColor" stroke-width="2"/><text x="565.0" y="64" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Stage 4</text><text x="565.0" y="106" font-size="11.5" text-anchor="middle" font-weight="700" opacity="1" fill="var(--link,#e6c200)">2026</text><text x="565.0" y="120" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">in ES2026</text><text x="310.0" y="26" font-size="12.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Temporal: dall'idea allo standard (circa 9 anni)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il viaggio di <code>Temporal</code> attraverso gli stage: Stage 1 (2017), Stage 2 (2019), Stage 3 (2021) e — dopo circa quattro anni di implementazioni — Stage 4 (11 marzo 2026), in ES2026.</figcaption>
</figure>

**Il percorso, tappa per tappa:**

- **Stage 1 (2017)** — Maggie Johnson-Pint presenta l'idea al comitato: c'è un problema chiaro (`Date`) e una direzione, così il TC39 accetta di studiarla.
- **Stage 2 (2019)** — esce la prima **bozza di specifica** e prendono forma i tipi distinti (`PlainDate`, `ZonedDateTime`, `Duration`…): il comitato si aspetta ormai che entri nel linguaggio.
- **Stage 3 (2021)** — la specifica è **completa** e i motori iniziano a implementarla. Qui `Temporal` resta a lungo — **circa quattro anni** — per raccogliere esperienza sul campo e limare i dettagli (come il supporto ai calendari non gregoriani).
- **Stage 4 (11 marzo 2026)** — due implementazioni superano i test di conformità, la pull request alla specifica è approvata e `Temporal` entra ufficialmente in **ES2026** ([Igalia](https://www.igalia.com/2026/03/13/Temporal-Reaches-Stage-4.html)). Poco dopo, Node.js 26 lo abilita di default.

**La soluzione.** Nove anni dall'idea allo standard: un promemoria di quanto lo Stage 4 sia una garanzia, non una formalità. Il risultato è l'API descritta nella pagina di [ES2026](es2026.md) — immutabile, con i mesi che partono da 1 e supporto nativo a fusi orari e calendari.

## Perché documentiamo (di norma) solo lo Stage 4

Ed ecco la risposta alla nota che compare nelle altre pagine. Lo **Stage 4** è l'unico livello in cui una feature è **definitiva**: è entrata nell'edizione annuale di ECMAScript, ha almeno due motori che la implementano correttamente, e non cambierà più. Tutto ciò che sta **sotto** lo Stage 4 è ancora in movimento: la sintassi o il comportamento possono cambiare, e una proposta può persino essere **abbandonata** (finisce tra le *inactive*, cioè ritirate o respinte). Documentare come "parte del linguaggio" qualcosa di Stage 2 o 3 rischierebbe quindi di insegnare una cosa che non arriverà mai, o che arriverà diversa. Le proposte di **Stage 3** sono un caso speciale: sono quasi certe e spesso già presenti in qualche browser, perciò vale la pena *tenerle d'occhio* e citarle come "in arrivo" — ma non darle per scontate.

## Come trovare una proposta e capirne lo stage

Il punto di partenza è un unico repository su GitHub: **`github.com/tc39/proposals`**. Lì le proposte sono ordinate proprio per stage.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 520 190" role="img" aria-label="Dove trovare una proposta e il suo stage" style="width:100%;max-width:540px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="18" y="26" width="248" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="30" y="46" font-size="11" font-weight="700" fill="currentColor">github.com/tc39/proposals</text><g font-size="10" fill="currentColor"><text x="30" y="70">tabelle: Stage 3 · 2.7 · 2</text><text x="30" y="90">file: stage-1 · stage-0</text><text x="30" y="110" font-weight="700">finished-proposals.md</text><text x="42" y="124" opacity=".75">= Stage 4 (+ edizione ES)</text><text x="30" y="146">inactive-proposals.md</text><text x="42" y="160" opacity=".75">= ritirate / respinte</text></g><path d="M268 103 H354" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#mk)"/><text x="311" y="96" text-anchor="middle" font-size="9" fill="currentColor" opacity=".75">ogni proposta</text><defs><marker id="mk" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="currentColor"/></marker></defs><rect x="356" y="70" width="150" height="66" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/><text x="431" y="94" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">tc39/proposal-‹nome›</text><text x="431" y="116" text-anchor="middle" font-size="10" fill="currentColor">README: «Stage: N»</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Nel repository <code>tc39/proposals</code>: tabelle per gli Stage 2, 2.7 e 3; file a parte per gli Stage 0 e 1; le <em>finished</em> (Stage 4) con l'edizione in cui sono entrate; le <em>inactive</em> (ritirate). Ogni proposta ha poi un proprio repository, il cui README dichiara lo stage.</figcaption>
</figure>

La pagina principale (il `README`) elenca in **tabelle** le proposte dallo Stage 2 in su, con colonne come *Proposal*, *Author* (chi l'ha proposta), *Champion* e i *Test262 flag*. Le proposte più acerbe (Stage 0 e 1) stanno in file separati; quelle **finite** sono in **`finished-proposals.md`**, con indicata l'**edizione** in cui sono entrate; quelle abbandonate in `inactive-proposals.md`. Inoltre **ogni** proposta ha un proprio repository, chiamato `tc39/proposal-‹nome›`, il cui `README` indica in alto lo stage corrente.

Un esempio concreto, `Temporal` (la nuova API per le date vista nella pagina di [ES2026](es2026.md)): cercando "temporal" si arriva al repository `tc39/proposal-temporal`, il cui README dichiara **Stage 4**; e infatti la si ritrova in `finished-proposals.md` sotto l'edizione **ES2026**. Conclusione: è ufficiale, fa parte dello standard.

## Attenzione: lo stage **non** è il supporto nei browser

C'è un ultimo equivoco da sciogliere, ed è importante. Lo **stage** misura la maturità di una feature **nella specifica** (il processo di TC39). Il **supporto nei browser** è tutt'altra cosa: dice se i motori (V8, SpiderMonkey, JavaScriptCore) l'hanno *davvero* implementata e distribuita agli utenti. Sono **due assi indipendenti**:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 410 226" role="img" aria-label="Lo stage nella specifica e il supporto nei browser sono due assi indipendenti" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><line x1="100" y1="180" x2="392" y2="180" stroke="currentColor" stroke-width="1.4"/><line x1="100" y1="180" x2="100" y2="44" stroke="currentColor" stroke-width="1.4"/><path d="M392 180 l-6 -3 v6 z" fill="currentColor"/><path d="M100 44 l-3 6 h6 z" fill="currentColor"/><text x="140" y="194" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">0</text><text x="195" y="194" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">1</text><text x="250" y="194" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">2</text><text x="305" y="194" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">3</text><text x="360" y="194" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">4</text><line x1="97" y1="180" x2="103" y2="180" stroke="currentColor" stroke-width="1"/><text x="92" y="183" text-anchor="end" font-size="8.5" fill="currentColor" opacity=".7">nessuno</text><line x1="97" y1="118" x2="103" y2="118" stroke="currentColor" stroke-width="1"/><text x="92" y="121" text-anchor="end" font-size="8.5" fill="currentColor" opacity=".7">in diffusione</text><line x1="97" y1="56" x2="103" y2="56" stroke="currentColor" stroke-width="1"/><text x="92" y="59" text-anchor="end" font-size="8.5" fill="currentColor" opacity=".7">Baseline</text><text x="246" y="210" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".8">maturità nella spec (Stage)</text><text x="16" y="112" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".8" transform="rotate(-90 16 112)">supporto nei browser</text><circle cx="360" cy="56" r="4" fill="var(--link,#059669)"/><text x="352" y="50" text-anchor="end" font-size="9" fill="currentColor">Array.flat (ES2019)</text><circle cx="360" cy="118" r="4" fill="var(--link,#059669)"/><text x="352" y="133" text-anchor="end" font-size="9" fill="currentColor">Temporal (ES2026)</text><circle cx="305" cy="95" r="4" fill="var(--link,#059669)"/><text x="298" y="89" text-anchor="end" font-size="9" fill="currentColor">una Stage 3 già nei motori</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Due assi diversi. Una feature può essere Stage 4 (nello standard) ma non ancora presente ovunque (Temporal); e i browser a volte spediscono una feature già allo Stage 3, prima che sia "finita".</figcaption>
</figure>

Per sapere lo **stage** si guarda TC39 (i repository qui sopra); per sapere il **supporto reale** si guardano invece **[Can I Use](https://caniuse.com/)** e **[Baseline](https://web.dev/baseline)** (lo stato riportato anche su [MDN](https://developer.mozilla.org/)). È il motivo per cui, in queste note, l'edizione ES (lo stage) e la disponibilità nei browser (Baseline) vengono citate come **due informazioni separate**.

> [!tip]
> In una riga: **TC39** è il comitato che scrive lo standard **ECMAScript** (≈ JavaScript); una feature attraversa gli **stage 0→4**; solo lo **Stage 4** è definitivo ed entra nell'edizione annuale; lo si verifica su `github.com/tc39/proposals`; e lo stage è cosa **diversa** dal supporto nei browser (quello si controlla su Can I Use / Baseline).

## Domande

<details>
<summary>Cosa sono <code>TC39</code>, <code>ECMA-262</code> ed <code>ECMAScript</code>, e come si legano a JavaScript?</summary>

**TC39** (*Technical Committee 39*) è il comitato, interno all'organizzazione **Ecma International**, che cura lo standard di JavaScript. Il documento che scrive si chiama **ECMA-262**, e il linguaggio che quel documento definisce si chiama ufficialmente **ECMAScript**. *JavaScript* è semplicemente il nome comune dello stesso linguaggio: per gli scopi pratici, ECMAScript e JavaScript sono la stessa cosa. La specifica serve perché ogni browser ha un proprio **motore** (V8, SpiderMonkey, JavaScriptCore) e devono comportarsi tutti allo stesso modo.

</details>

<details>
<summary>Quali sono gli stage di una proposta e cosa li distingue?</summary>

Sono sei tappe: **Stage 0** (*Strawperson*, un'idea), **Stage 1** (*Proposal*, il comitato accetta di studiarla: serve un champion e un problema chiaro), **Stage 2** (*Draft*, prima bozza di specifica), **Stage 2.7** (specifica completa e approvata, aggiunta nel 2024), **Stage 3** (*Candidate*, test pronti e prime implementazioni), **Stage 4** (*Finished*, è nello standard con due implementazioni che passano i test). A ogni tappa i requisiti crescono e serve il consenso del comitato.

</details>

<details>
<summary>Perché queste note documentano di regola solo le feature allo Stage 4?</summary>

Perché lo **Stage 4** è l'unico livello **definitivo**: la feature è entrata nell'edizione annuale di ECMAScript, ha almeno due implementazioni che passano i test ufficiali e non cambierà più. Sotto lo Stage 4 la sintassi può ancora cambiare e la proposta può persino essere **ritirata**. Documentarla come "parte del linguaggio" sarebbe quindi inaffidabile. Le proposte di Stage 3 si possono citare come "in arrivo", ma non dare per scontate.

</details>

<details>
<summary>Come si trova una proposta sul web e si capisce a che stage è (per esempio <code>Temporal</code>)?</summary>

Si parte dal repository **`github.com/tc39/proposals`**: le proposte sono divise per stage (tabelle per Stage 2/2.7/3, file per Stage 0/1, `finished-proposals.md` per lo Stage 4 con l'edizione ES, `inactive-proposals.md` per le ritirate). Ogni proposta ha inoltre un proprio repository `tc39/proposal-‹nome›` il cui README dichiara lo stage. Per `Temporal`: il repo `tc39/proposal-temporal` indica **Stage 4**, e compare in `finished-proposals.md` sotto **ES2026** — quindi è ufficiale.

</details>

<details>
<summary>Lo stage di una proposta dice se posso usarla nel browser?</summary>

No: sono **due cose diverse**. Lo *stage* misura la maturità nella **specifica**; il **supporto nei browser** dice se i motori l'hanno davvero implementata. Una feature può essere Stage 4 ma non ancora disponibile ovunque, e i browser a volte spediscono già una Stage 3. Per il supporto reale si consultano **Can I Use** e **Baseline** (anche su MDN), non lo stage.

</details>
