# 12 · Cost optimization e architecture review

Il costo su AWS non è un conto che arriva a fine mese: è una **dimensione di progetto**, presente in ogni scelta architetturale, e questo modulo conclusivo la mette a fuoco. Raccoglie gli strumenti per **vedere e governare la spesa**, le **leve** con cui la si riduce senza rinunciare ai requisiti, e il metodo con cui si **rivede un'architettura** nel suo insieme, il Well-Architected Framework. È anche la lente con cui l'esame stesso va letto: ogni domanda è, in fondo, una piccola revisione architetturale.

> [!info|label:SAA-C03 · D4T1-D4T4 e architecture review]
> Il modulo chiude il Domain 4 (*Cost-Optimized Architectures*) raccogliendo gli strumenti di cost management (Cost Explorer, AWS Budgets, Cost and Usage Report, Compute Optimizer) e le leve del risparmio, e introduce il Well-Architected Framework come metodo di revisione trasversale ai sei pilastri.

## Le leve del costo ottimizzato

Ridurre la spesa non significa spendere poco a ogni costo, ma **soddisfare i requisiti senza sprechi**. Le leve sono quelle incontrate lungo tutto il percorso, ora messe in fila. Scegliere il **servizio giusto** per l'access pattern (una classe S3 IA invece di Standard, DynamoDB on-demand invece di provisioned quando il traffico è imprevedibile). Dimensionare al punto giusto (*right-sizing*): né più né meno capacità del necessario. Scegliere la **modalità d'acquisto** adatta al profilo del carico (Spot per l'interrompibile, Savings Plans per lo stabile). Sfruttare l'**elasticità**: spegnere ciò che non serve, far scalare il resto. Ridurre il **trasferimento dati**: tenere il traffico nella stessa AZ, usare i gateway endpoint invece del NAT, mettere CloudFront davanti all'origine. E preferire i servizi **managed e serverless**, che tagliano il costo operativo oltre a quello infrastrutturale.

## Gli strumenti del cost management

Quattro servizi rispondono a quattro esigenze diverse, e l'esame chiede di distinguerle. **AWS Cost Explorer** **analizza** la spesa passata e la **prevede**: si filtra e raggruppa per servizio, tag, Region, con proiezioni fino a mesi avanti. **AWS Budgets** **avvisa**: fissa una soglia di costo o utilizzo e manda una notifica quando la si supera (è il servizio usato nel [LAB 01](../labs/01-bootstrap-account.md)). Il **Cost and Usage Report (CUR)** fornisce il **dettaglio voce per voce** di ogni addebito, per analisi fini. **AWS Compute Optimizer** usa il machine learning per **consigliare il right-sizing** delle risorse di calcolo (istanze EC2, Auto Scaling group, volumi EBS, funzioni Lambda).

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 170" role="img" aria-label="Quattro strumenti di cost management: Cost Explorer analizza e prevede la spesa, AWS Budgets avvisa al superamento di una soglia, il Cost and Usage Report da il dettaglio voce per voce, Compute Optimizer consiglia il rightsizing." style="width:100%;max-width:720px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="10" y="34" width="168" height="102" rx="10"/>
      <rect x="188" y="34" width="168" height="102" rx="10"/>
      <rect x="366" y="34" width="168" height="102" rx="10"/>
      <rect x="544" y="34" width="166" height="102" rx="10"/>
    </g>
    <g text-anchor="middle" font-weight="700" font-size="11">
      <text x="94" y="66">Cost Explorer</text>
      <text x="272" y="66">AWS Budgets</text>
      <text x="450" y="66">Cost &amp; Usage Report</text>
      <text x="627" y="66">Compute Optimizer</text>
    </g>
    <g text-anchor="middle" font-size="10.5">
      <text x="94" y="98">analizza</text>
      <text x="272" y="98">avvisa</text>
      <text x="450" y="98">dettaglia</text>
      <text x="627" y="98">consiglia</text>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".7">
      <text x="94" y="118">spesa e previsioni</text>
      <text x="272" y="118">soglia superata</text>
      <text x="450" y="118">voce per voce</text>
      <text x="627" y="118">right-sizing</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem"><strong>Cost Explorer</strong> per capire dove va la spesa, <strong>Budgets</strong> per essere avvisati, il <strong>CUR</strong> per il dettaglio, <strong>Compute Optimizer</strong> per sapere cosa ridimensionare. Sono complementari, non alternativi.</figcaption>
</figure>

## Rivedere l'architettura: il Well-Architected Framework

Nessuna delle scelte fatte finora vive isolata: sicurezza, resilienza, prestazioni e costo vanno bilanciati insieme. Il **AWS Well-Architected Framework** offre il metodo per questa revisione, organizzando le buone pratiche in **sei pilastri**. Li si è incontrati nel [modulo 01](01-cloud-region-account.md); qui tornano come griglia con cui valutare (e migliorare) qualunque workload.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="I sei pilastri del Well-Architected Framework: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization e Sustainability." style="width:100%;max-width:720px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="16" y="24" width="222" height="72" rx="10"/>
      <rect x="249" y="24" width="222" height="72" rx="10"/>
      <rect x="482" y="24" width="222" height="72" rx="10"/>
      <rect x="16" y="108" width="222" height="72" rx="10"/>
      <rect x="249" y="108" width="222" height="72" rx="10"/>
      <rect x="482" y="108" width="222" height="72" rx="10"/>
    </g>
    <g text-anchor="middle" font-weight="700" font-size="12">
      <text x="127" y="56">Operational Excellence</text>
      <text x="360" y="56">Security</text>
      <text x="593" y="56">Reliability</text>
      <text x="127" y="140">Performance Efficiency</text>
      <text x="360" y="140">Cost Optimization</text>
      <text x="593" y="140">Sustainability</text>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".68">
      <text x="127" y="74">gestire e migliorare</text>
      <text x="360" y="74">proteggere</text>
      <text x="593" y="74">reggere ai guasti</text>
      <text x="127" y="158">usare bene le risorse</text>
      <text x="360" y="158">evitare gli sprechi</text>
      <text x="593" y="158">ridurre l'impatto</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">I sei pilastri sono i criteri di una revisione: un'architettura ben fatta li bilancia secondo i requisiti, senza massimizzarne uno solo a scapito degli altri. Lo strumento <strong>Well-Architected Tool</strong> guida questa valutazione.</figcaption>
</figure>

## L'esame è una revisione architetturale

Vale la pena chiudere sul metodo, perché è ciò che l'esame misura davvero. Una domanda SAA-C03 descrive uno scenario con dei **requisiti** e propone più soluzioni realizzabili: il compito non è ricordare un servizio, ma **scegliere il compromesso migliore** dati quei requisiti. Il procedimento è sempre lo stesso: individuare il requisito **vincolante** (un RTO stretto, «minimo carico operativo», «il più economico»), **eliminare** le opzioni che lo violano, e solo allora confrontare le alternative rimaste sui pilastri in gioco. È la stessa disciplina del Well-Architected, applicata a una domanda per volta.

## Exam lens

- *analizzare e prevedere la spesa nel tempo, per servizio o tag*: **Cost Explorer**.
- *essere avvisati quando la spesa supera una soglia*: **AWS Budgets**.
- *il dettaglio di ogni singolo addebito per un'analisi fine*: **Cost and Usage Report**.
- *raccomandazioni automatiche di right-sizing sul compute*: **Compute Optimizer**.
- *attribuire i costi a team o progetti*: i **cost allocation tag**.
- *ridurre il costo del trasferimento dati*: tenere il traffico in-AZ o privato (gateway endpoint), CloudFront, evitare NAT inutili.
- *rivedere un workload rispetto alle buone pratiche*: il **Well-Architected Framework** e il suo Tool.
- La meta-regola: davanti a più risposte «giuste», si torna al requisito vincolante e si scarta ciò che lo viola, prima di confrontare il resto.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra Cost Explorer e AWS Budgets?</summary>

**Cost Explorer** **analizza** e **prevede** la spesa: si filtra e raggruppa per servizio, tag o Region, con proiezioni nel futuro. **AWS Budgets** **avvisa**: fissa una soglia di costo o utilizzo e notifica quando la si supera. Uno serve a capire dove va la spesa, l'altro a essere allertati.

</details>

<details>
<summary>Quale strumento consiglia il right-sizing delle risorse di calcolo?</summary>

**AWS Compute Optimizer**, che con il machine learning analizza la configurazione e l'utilizzo di EC2, Auto Scaling group, volumi EBS, Lambda e servizi Fargate, e suggerisce dimensioni più adatte. Cost Explorer mostra la spesa; Compute Optimizer dice **cosa ridimensionare**.

</details>

<details>
<summary>Quali sono i sei pilastri del Well-Architected Framework?</summary>

Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization e Sustainability. Sono i criteri con cui si rivede un workload: un'architettura ben fatta li **bilancia** secondo i requisiti, senza massimizzarne uno solo a scapito degli altri.

</details>

<details>
<summary>Come si riduce il costo del trasferimento dati?</summary>

Tenendo il traffico **vicino e privato**: comunicazioni nella **stessa AZ** dove possibile, **gateway endpoint** per S3/DynamoDB invece del NAT, **CloudFront** davanti all'origine per servire dalla cache. Il trasferimento dati fra AZ, fra Region e verso internet è una delle voci di costo più facili da sprecare.

</details>

<details>
<summary>Perché si dice che l'esame SAA-C03 è una revisione architetturale?</summary>

Perché ogni domanda propone più soluzioni realizzabili e chiede quella che soddisfa meglio i **requisiti** dati (sicurezza, resilienza, prestazioni, costo, carico operativo). Si individua il requisito vincolante, si eliminano le opzioni che lo violano e si confronta il resto: è la disciplina del Well-Architected applicata a una domanda per volta.

</details>

**In sintesi:** il costo è una dimensione di progetto governata da leve (servizio e dimensione giusti, modalità d'acquisto adatta, elasticità, meno trasferimento dati, managed/serverless) e da strumenti (Cost Explorer per analizzare e prevedere, Budgets per avvisare, CUR per il dettaglio, Compute Optimizer per il right-sizing); il Well-Architected Framework, con i suoi sei pilastri, è il metodo per rivedere un'architettura nel suo insieme, ed è la stessa lente con cui affrontare ogni domanda d'esame.

## Fonti

- [Analyzing your costs with AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html) - verificato 2026-09-04
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) - verificato 2026-09-04
- [AWS Cost and Usage Report](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html) - verificato 2026-09-04
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html) - verificato 2026-09-04
- [AWS Well-Architected Framework - The pillars](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html) - verificato 2026-09-04
