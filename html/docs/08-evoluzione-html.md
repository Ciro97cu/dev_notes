---
modulo: 8
titolo: "Evoluzione dell'HTML"
tags: [tipo/modulo, future-proof, standard]
---
# 08 · Evoluzione dell'HTML
> modulo 8 — *HTML* · rif. WHATWG

Come CSS e JavaScript, anche HTML si evolve — ma con un modello **diverso da entrambi**. Conoscerlo spiega una domanda che prima o poi ci si pone: perché non esiste (e non esisterà) un "HTML6"? E, di conseguenza, come ci si tiene aggiornati su cosa si può usare.

## HTML è un *Living Standard*

Oggi HTML è mantenuto dal **[WHATWG](https://whatwg.org/)** come **Living Standard**: un'unica specifica **aggiornata in continuo**, senza numeri di versione. "HTML5" è stata l'ultima versione numerata; da allora si dice soltanto "HTML", e per definizione è sempre l'ultima. Non c'è un "HTML6" in arrivo: la specifica cambia gradualmente, una feature per volta, come un documento vivo.

Ci si è arrivati dopo una storia movimentata. HTML4 (1999) era del W3C, che poi puntò su **XHTML 2.0**, una direzione incompatibile col web esistente e mai adottata. Nel 2004 i produttori di browser fondarono il **WHATWG** e ripartirono da un HTML "vivo", che diventò HTML5. Per anni W3C e WHATWG pubblicarono versioni **in parallelo**, con parecchia confusione, finché nel **2019** un accordo formale ha chiuso la questione: il **WHATWG è l'unica fonte di verità** per HTML (e per il DOM); le vecchie "HTML 5.x" del W3C sono ormai storia.

## Tre modelli a confronto

È il punto che chiude il cerchio con gli altri due vault: le tre tecnologie del web si evolvono in **tre modi diversi**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 215" role="img" aria-label="Tre modelli di evoluzione: JavaScript edizioni annuali, CSS moduli, HTML Living Standard" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="12" y="58" font-size="13" font-weight="700">JavaScript</text><text x="12" y="128" font-size="13" font-weight="700">CSS</text><text x="12" y="200" font-size="13" font-weight="700">HTML</text><line x1="120" y1="54" x2="678" y2="54" stroke="currentColor" stroke-width="1.5"/><circle cx="170" cy="54" r="4" fill="currentColor"/><text x="170" y="72" font-size="9" text-anchor="middle" opacity=".8">ES2015</text><circle cx="296" cy="54" r="4" fill="currentColor"/><text x="296" y="72" font-size="9" text-anchor="middle" opacity=".8">ES2018</text><circle cx="422" cy="54" r="4" fill="currentColor"/><text x="422" y="72" font-size="9" text-anchor="middle" opacity=".8">ES2021</text><circle cx="548" cy="54" r="4" fill="currentColor"/><text x="548" y="72" font-size="9" text-anchor="middle" opacity=".8">ES2024</text><circle cx="660" cy="54" r="4" fill="currentColor"/><text x="660" y="72" font-size="9" text-anchor="middle" opacity=".8">ES2026</text><rect x="130" y="111" width="120" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="190" y="128" font-size="9.5" text-anchor="middle">Grid · REC</text><rect x="292" y="111" width="130" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="357" y="128" font-size="9.5" text-anchor="middle">Nesting · CR</text><rect x="470" y="111" width="130" height="26" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="535" y="128" font-size="9.5" text-anchor="middle">Anchor · WD</text><text x="398" y="184" font-size="10" text-anchor="middle" opacity=".85">Living Standard — aggiornato in continuo, nessuna versione</text><line x1="130" y1="196" x2="666" y2="196" stroke="currentColor" stroke-width="1.8"/><path d="M674 196 L664 191 L664 201 Z" fill="currentColor"/></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><strong>JavaScript</strong> raccoglie le novità in edizioni <em>annuali</em> (punti su una linea); <strong>CSS</strong> avanza per <em>moduli indipendenti</em>, ognuno a uno stadio diverso; <strong>HTML</strong> è un flusso <em>continuo</em>, senza versioni.</figcaption>
</figure>

| | Chi lo cura | Modello | Versioni |
|---|---|---|---|
| **JavaScript** | comitato **TC39** | edizioni **annuali** | ES2015, ES2026… |
| **CSS** | **CSS Working Group** (W3C) | **moduli** con *Level* + stadi WD→CR→PR→REC | per modulo |
| **HTML** | **WHATWG** | **Living Standard** | nessuna |

I processi dei due vicini sono approfonditi in <a href="../javascript/#/docs/moderno/processo-tc39" target="_blank" rel="noopener">JavaScript · Il processo TC39</a> e <a href="../css/#/docs/16-future-proof" target="_blank" rel="noopener">CSS · Future-proof</a>.

## Cosa significa "nessuna versione", in pratica

Che non si punta a "HTML versione X". Si controlla invece il **supporto della singola feature** — su **[Baseline](https://web.dev/baseline)**, Can I Use e MDN — esattamente come si fa per il CSS. Il `<!doctype html>` in cima al documento ([[01-documento-dom]]) non è un numero di versione: significa solo "HTML moderno". Il lavoro avviene **in pubblico su GitHub** (il repo `whatwg/html`): le proposte passano per issue e pull request, i browser le implementano, e le feature arrivano di continuo invece che in un rilascio annuale.

## Compatibilità e legacy

Un principio guida tutto questo: **"don't break the web"**. L'HTML è ferocemente **retrocompatibile** — le pagine di vent'anni fa continuano a funzionare — ed è il motivo per cui il doctype non cambia e gli elementi vecchi non "spariscono": semplicemente non si usano più.

> [!info] Legacy
> Elementi da non usare, retaggio dell'epoca in cui l'HTML si occupava anche di presentazione: `<center>`, `<font>`, `<big>`, `<marquee>`, i frameset. Tutto ciò che è aspetto oggi è **CSS**. Restano validi solo come reperti in pagine vecchie.

Per controllare che il proprio markup sia corretto resta utile il **[validatore del W3C](https://validator.w3.org/)**, che segnala tag mal annidati, attributi inventati e strutture non valide.

## Restare a prova di futuro

La strategia è la stessa vista per il CSS: **progressive enhancement**. Si parte da una base in **HTML semantico** che funziona ovunque — anche senza CSS e senza JavaScript — e la si arricchisce dove il browser regge. Un markup solido, semantico e accessibile invecchia bene quasi per definizione, perché poggia sulle fondamenta più stabili della piattaforma.

*➕ Fuori dal filo di questo modulo, ma utile saperlo: i **Web Components** (in particolare i Custom Elements) permettono di definire propri elementi — `<mio-widget>` — estendendo il vocabolario dell'HTML. È un tema a sé, che vive a metà tra HTML e JavaScript.*

## Ripasso lampo

<details>
<summary>Cos'è un <em>Living Standard</em> e perché non esiste "HTML6"?</summary>

È una specifica **unica e aggiornata in continuo**, senza numeri di versione. "HTML5" è stata l'ultima versione numerata; da allora HTML si aggiorna una feature per volta, quindi non c'è (né ci sarà) un "HTML6": si dice solo "HTML", sempre l'ultima versione.

</details>

<details>
<summary>Chi mantiene HTML, e cosa è cambiato nel 2019?</summary>

Il **WHATWG** (nato nel 2004 dai produttori di browser). Nel 2019 un accordo formale ha reso il WHATWG l'**unica fonte di verità** per HTML e DOM, chiudendo anni di versioni parallele con il W3C.

</details>

<details>
<summary>In cosa differiscono i modelli di evoluzione di JavaScript, CSS e HTML?</summary>

**JavaScript**: edizioni **annuali** (ECMAScript, via TC39). **CSS**: **moduli indipendenti** con *Level* e stadi WD→CR→PR→REC (W3C). **HTML**: **Living Standard** WHATWG, aggiornato in continuo, senza versioni.

</details>

<details>
<summary>Se HTML non ha versioni, come si sa cosa si può usare?</summary>

Si controlla il **supporto della singola feature** su Baseline, Can I Use e MDN — come per il CSS. Il `<!doctype html>` non è una versione, indica solo "HTML moderno".

</details>

<details>
<summary>Cosa vuol dire "don't break the web"?</summary>

Che l'HTML resta **retrocompatibile**: le pagine vecchie continuano a funzionare, e per questo gli elementi obsoleti (`<center>`, `<font>`, `<marquee>`…) non spariscono, semplicemente non si usano più. La presentazione è compito del CSS.

</details>

**In sintesi:**
- HTML è un **Living Standard** del **WHATWG**: aggiornato in continuo, **nessuna versione** — niente "HTML6", solo "HTML".
- Tre modelli diversi: JavaScript = **edizioni annuali**, CSS = **moduli** con stadi, HTML = **flusso continuo**.
- "Nessuna versione" significa ragionare per **feature** (Baseline/Can I Use/MDN); il lavoro è pubblico su GitHub (`whatwg/html`).
- **"Don't break the web"**: retrocompatibilità, legacy solo storico; a prova di futuro con **HTML semantico + progressive enhancement**.
