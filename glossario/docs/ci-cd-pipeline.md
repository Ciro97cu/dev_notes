# CI/CD e pipeline

Ogni modifica al codice di un progetto, prima di arrivare agli utenti, deve percorrere sempre gli stessi passi: essere unita al lavoro degli altri, controllata, testata, costruita e infine messa online. Farlo a mano a ogni cambiamento è lento e, soprattutto, dimentica sempre qualcosa. **CI/CD** è il nome di questa automazione: un sistema che, a ogni modifica spinta sul repository, esegue da solo quella sequenza di passi su una macchina dedicata, e ferma tutto al primo che va storto. La sigla unisce due metà, l'integrazione continua e la consegna continua.

## CI: integrazione continua

L'**integrazione continua** (*Continuous Integration*) è la pratica di unire spesso il proprio lavoro a quello del resto del team e di far verificare **in automatico**, a ogni unione, che il codice regga. A ogni `git push` (o apertura di una pull request) un server prende il codice aggiornato e ci fa girare sopra una batteria di controlli: installa le dipendenze, passa il *linter* (il controllo di stile), esegue i test, costruisce l'applicazione. Se uno di questi passi fallisce, chi ha spinto la modifica lo sa nel giro di minuti, quando l'errore è ancora piccolo e fresco, invece di scoprirlo settimane dopo mescolato al lavoro di altri. Il valore della CI è tutto qui: **accorciare la distanza tra l'errore e la sua scoperta**.

## CD: consegna continua

La **consegna continua** (*Continuous Delivery*) è la metà che viene dopo: una volta che i controlli della CI sono verdi, l'artefatto costruito viene **rilasciato in automatico** negli ambienti, di solito prima uno di prova (*collaudo* o *staging*) e poi la produzione, cioè il sito che vedono gli utenti. Si distinguono due gradi: nella *continuous delivery* il rilascio in produzione resta dietro un'approvazione manuale (l'automazione prepara tutto, una persona dà l'ultimo via), mentre nella *continuous deployment* anche quell'ultimo passo è automatico. La differenza è solo dove si mette il pulsante umano; il meccanismo a monte è identico.

## La pipeline

La **pipeline** è la ricetta concreta che mette in fila quei passi: un file, versionato nel repository, che descrive *cosa* eseguire e *in che ordine*. Il sistema di CI/CD lo legge e lo esegue a ogni evento configurato. Il vocabolario è quasi sempre lo stesso, a tre livelli: una pipeline si divide in **stage** (le grandi fasi, per esempio «build» e «deploy»), ogni stage contiene **job** (unità di lavoro che possono girare in parallelo), e ogni job è una lista di **step**, i singoli comandi.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 260" role="img" aria-label="Flusso di una pipeline: un git push innesca la fase CI (install, lint, test, build eseguiti in sequenza), che se passa porta alla fase CD (deploy su collaudo, poi in produzione). Il primo passo, install, richiede che il runner monti la versione di Node richiesta." style="width:100%;max-width:700px;height:auto;color:inherit">
<g font-family="system-ui,Arial,sans-serif" fill="currentColor">
<rect x="14" y="116" width="76" height="40" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/>
<text x="52" y="140" font-size="11" text-anchor="middle">git push</text>
<rect x="104" y="86" width="356" height="110" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/>
<text x="282" y="104" font-size="11" text-anchor="middle" font-weight="700">CI · integrazione continua</text>
<g font-size="10" text-anchor="middle">
<rect x="116" y="132" width="78" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="155" y="154">install</text>
<rect x="204" y="132" width="64" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="236" y="154">lint</text>
<rect x="278" y="132" width="64" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="310" y="154">test</text>
<rect x="352" y="132" width="96" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="400" y="154">build</text>
</g>
<path d="M194 150 L204 150" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M204 150 L198 147 L198 153 Z" fill="currentColor"/>
<path d="M268 150 L278 150" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M278 150 L272 147 L272 153 Z" fill="currentColor"/>
<path d="M342 150 L352 150" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M352 150 L346 147 L346 153 Z" fill="currentColor"/>
<rect x="484" y="86" width="222" height="110" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7" stroke-dasharray="6 4"/>
<text x="595" y="104" font-size="11" text-anchor="middle" font-weight="700">CD · consegna</text>
<g font-size="10" text-anchor="middle">
<rect x="496" y="132" width="90" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="541" y="154">collaudo</text>
<rect x="598" y="132" width="96" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="646" y="154">produzione</text>
</g>
<path d="M586 150 L598 150" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M598 150 L592 147 L592 153 Z" fill="currentColor"/>
<path d="M90 136 L104 136" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M104 136 L98 133 L98 139 Z" fill="currentColor"/>
<path d="M460 141 L484 141" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M484 141 L478 138 L478 144 Z" fill="currentColor"/>
<path d="M155 168 L155 200 L200 200" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="3 3"/>
<text x="206" y="204" font-size="9" fill-opacity="0.7">il runner monta qui la versione di Node</text>
</g>
</svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un passo che fallisce <strong>ferma la pipeline</strong>: se i test non passano, non si arriva mai al deploy. La fase CD è tratteggiata perché il salto in produzione spesso resta dietro un'approvazione manuale.</figcaption>
</figure>

A eseguire la pipeline è un **runner** (detto anche *agent*): una macchina pulita, creata al momento, che clona il repository, prepara l'ambiente e lancia gli step. «Pulita» è la parola chiave: il runner non ha nulla di preinstallato dal progetto, quindi tra i primi passi c'è sempre l'installazione degli strumenti che servono, a partire dalla versione di **Node** giusta. La pipeline stessa si scrive in **YAML** (il formato è spiegato in [Formati dati](formati-e-fondamenti.md?id=yaml-yaml-aint-markup-language)) e vive nel repository: su GitHub in `.github/workflows/`, su Azure DevOps in un file come `azure-pipelines.yml` (il legame tra questi file e la root del progetto è in [Anatomia di un progetto](anatomia-progetto.md)).

## Un file di pipeline, da vicino

Ecco una pipeline minima in stile Azure DevOps. Si legge dall'alto: quando parte, su quale macchina, con quali passi.

```yaml
# azure-pipelines.yml — girato a ogni push su main
trigger:
  - main                       # l'evento che innesca la pipeline

pool:
  vmImage: ubuntu-latest       # il runner: una macchina Linux pulita, creata al volo

variables:
  nodeJsVersion: '22.x'        # la versione di Node scelta per questa pipeline

steps:
  - task: NodeTool@0           # scarica Node e lo mette nel PATH del runner
    inputs:
      versionSpec: $(nodeJsVersion)
  - script: npm ci             # installa dal lockfile, in modo riproducibile
  - script: npm run lint       # controllo di stile
  - script: npm test           # test
  - script: npm run build      # costruzione dell'artefatto
```

Il passo `NodeTool@0` è quello che merita attenzione. Poiché il runner nasce vuoto, è lì che si decide **quale versione di Node** eseguirà tutto il resto: `versionSpec` la fissa, qui pescandola da una variabile (`nodeJsVersion`) così che stia scritta in un unico punto e si cambi in un colpo solo. Da quel momento ogni `npm` e ogni script gira su quella versione.

Questo spiega un guasto ricorrente. Se il codice del progetto, o una delle sue dipendenze, usa una funzionalità introdotta in **Node 22**, ma la pipeline è configurata per montare **Node 20**, il runner installa la versione vecchia e uno dei passi successivi (tipicamente `build` o `test`) si interrompe con un errore del tipo «richiede Node >= 22». La pipeline diventa rossa e nessun deploy parte. La correzione è portare quella singola riga da `'20.x'` a `'22.x'`: al giro dopo il runner monta Node 22 e la sequenza torna verde. È un caso emblematico di come la versione dichiarata nel `package.json` con `engines` (in locale) e quella montata dalla pipeline (in remoto) debbano dirsi la stessa cosa; quando divergono, è la pipeline ad accorgersene per prima.

> [!note]
> **CI/CD, non un prodotto solo.** Lo stesso schema ha nomi diversi a seconda di chi lo offre: **GitHub Actions**, **GitLab CI**, **Azure Pipelines**, **CircleCI**, **Jenkins**. Cambiano i dettagli del file YAML e il nome dei task, ma restano l'evento che innesca, il runner pulito, gli stage/job/step e la regola d'oro: un passo che fallisce ferma tutto.
