# 11 · Observability, governance e Infrastructure as Code

Un'architettura non si progetta soltanto: si **gestisce**. Tre capacità trasversali rendono un sistema governabile e attraversano tutti i Domain dell'esame. La prima è **vedere cosa succede** (observability): metriche, log e tracce di chi ha fatto cosa. La seconda è **tenere l'account in regola** (governance): conformità, raccomandazioni, controlli. La terza è **definire l'infrastruttura come codice** (Infrastructure as Code), così da ricrearla e verificarla in modo deterministico. Non sono un Domain a sé, ma reggono sicurezza, resilienza, prestazioni e costo.

> [!info|label:SAA-C03 · capacità trasversali]
> Il modulo raccoglie strumenti che compaiono in tutti i Domain: CloudWatch, CloudTrail e AWS Config per l'observability e la conformità, Trusted Advisor per le raccomandazioni, CloudFormation per l'Infrastructure as Code. Sono la base operativa (Operational Excellence del Well-Architected) su cui poggiano le scelte architetturali.

## Vedere cosa succede: observability

Tre servizi rispondono a tre domande diverse, e l'esame gioca proprio sul non confonderle. **Amazon CloudWatch** raccoglie **metriche e log**, disegna dashboard e fa scattare **allarmi** su soglie: risponde a «come va il sistema, e cosa non funziona». **AWS CloudTrail** registra le **chiamate API** dell'account, con chi le ha fatte, quando e su quali risorse: risponde a «chi ha fatto cosa». **AWS Config** registra la **configurazione** delle risorse nel tempo e la valuta rispetto a **regole di conformità**: risponde a «com'è configurata questa risorsa, ed è cambiata rispetto a quanto previsto».

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Tre servizi rispondono a tre domande: CloudWatch a come va e cosa non funziona con metriche log e allarmi; CloudTrail a chi ha fatto cosa con il log delle chiamate API; AWS Config a com'e configurata e cosa e cambiato con configurazioni e conformita." style="width:100%;max-width:720px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="14" y="30" width="224" height="150" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="248" y="30" width="210" height="150" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="468" y="30" width="238" height="150" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <g text-anchor="middle" font-weight="700" font-size="12.5">
      <text x="126" y="58">CloudWatch</text>
      <text x="353" y="58">CloudTrail</text>
      <text x="587" y="58">AWS Config</text>
    </g>
    <g text-anchor="middle" font-size="11" font-style="italic">
      <text x="126" y="100">«come va?</text>
      <text x="126" y="118">cosa non funziona?»</text>
      <text x="353" y="109">«chi ha fatto cosa?»</text>
      <text x="587" y="100">«com'è configurata?</text>
      <text x="587" y="118">cosa è cambiato?»</text>
    </g>
    <g text-anchor="middle" font-size="9.5" fill-opacity=".72">
      <text x="126" y="156">metriche · log · allarmi</text>
      <text x="353" y="156">log delle chiamate API</text>
      <text x="587" y="156">configurazioni · conformità</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il flusso tipico li usa insieme: <strong>CloudWatch</strong> segnala che qualcosa non va, <strong>CloudTrail</strong> dice chi ha cambiato qualcosa, <strong>AWS Config</strong> dice cosa è cambiato rispetto allo stato conforme.</figcaption>
</figure>

## Governare l'account: governance

La governance mantiene l'account ordinato, sicuro e in regola man mano che cresce. Alcuni strumenti sono già comparsi: **AWS Organizations** e le **SCP** ([modulo 02](02-iam-identita-multi-account.md)) fissano i confini di ciò che gli account possono fare; **AWS Config** verifica che le risorse rispettino le regole. A questi si aggiunge **AWS Trusted Advisor**, che ispeziona l'account e produce **raccomandazioni** in cinque aree (costo, sicurezza, prestazioni, tolleranza ai guasti e limiti di servizio), segnalando per esempio istanze sottoutilizzate, porte aperte o quote vicine al tetto. Una disciplina di **tagging** coerente, infine, è ciò che rende governabili costi e risorse su larga scala.

## Definire l'infrastruttura come codice: CloudFormation

Creare risorse a mano nella Console non è ripetibile né verificabile. L'**Infrastructure as Code (IaC)** descrive l'infrastruttura in un **file di testo** versionabile, da cui AWS la crea in modo deterministico. **AWS CloudFormation** è il servizio nativo: un **template** (i file YAML usati nei laboratori di questo vault) definisce le risorse, e CloudFormation lo trasforma in uno **stack**, l'insieme delle risorse gestite come un'unità che si crea, aggiorna ed elimina in blocco.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Un template CloudFormation descrive lo stato desiderato; CloudFormation lo crea come stack di risorse reali; il drift detection confronta desiderato e reale e segnala DRIFTED quando una modifica manuale li allontana." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="iac-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="24" y="40" width="170" height="64" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="109" y="66" font-size="12" text-anchor="middle" font-weight="700">template</text>
    <text x="109" y="84" font-size="9" text-anchor="middle" fill-opacity=".72">stato desiderato</text>
    <rect x="290" y="40" width="150" height="64" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <text x="365" y="66" font-size="11.5" text-anchor="middle" font-weight="700">CloudFormation</text>
    <text x="365" y="84" font-size="9" text-anchor="middle" fill-opacity=".72">stack</text>
    <rect x="536" y="40" width="160" height="64" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="616" y="66" font-size="12" text-anchor="middle" font-weight="700">risorse reali</text>
    <text x="616" y="84" font-size="9" text-anchor="middle" fill-opacity=".72">stato reale</text>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#iac-arrow)">
      <path d="M194 72 L288 72"/>
      <path d="M440 72 L534 72"/>
    </g>
    <text x="241" y="64" font-size="9" text-anchor="middle" fill-opacity=".8">crea</text>
    <path d="M616 104 L616 140" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#iac-arrow)"/>
    <text x="628" y="126" font-size="9" fill-opacity=".8">modifica manuale</text>
    <path d="M109 104 L109 158 L603 158" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" marker-end="url(#iac-arrow)"/>
    <text x="330" y="174" font-size="9" text-anchor="middle" fill-opacity=".8">drift detection: confronta desiderato e reale → DRIFTED se divergono</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il template è la fonte di verità dell'infrastruttura. Il <strong>drift detection</strong> confronta lo stato desiderato con quello reale e segnala quando una modifica fatta a mano ha allontanato le risorse dal template.</figcaption>
</figure>

I vantaggi sono quelli che rendono un'architettura professionale: la stessa infrastruttura si **ricrea identica** in un altro account o Region, le modifiche passano per revisione come il codice, e il **drift detection** scopre quando qualcuno ha cambiato una risorsa a mano, fuori dal template. Sopra CloudFormation, l'**AWS CDK** permette di scrivere l'infrastruttura in un linguaggio di programmazione, generando poi i template.

## Exam lens

- *monitorare metriche e log, far scattare un allarme su una soglia*: **CloudWatch**.
- *sapere chi ha effettuato una certa chiamata API e quando*: **CloudTrail**.
- *verificare se una risorsa è conforme e cosa è cambiato nella sua configurazione*: **AWS Config**.
- *ricevere raccomandazioni su costo, sicurezza, prestazioni e limiti*: **Trusted Advisor**.
- *infrastruttura ripetibile, versionabile e verificabile*: **CloudFormation** (IaC).
- *scoprire modifiche manuali fuori dal template*: il **drift detection** di CloudFormation.
- La trappola: CloudWatch guarda le **prestazioni** (metriche/log), CloudTrail l'**audit** delle API, Config la **conformità** della configurazione. Sono tre domande diverse.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra CloudWatch, CloudTrail e AWS Config?</summary>

**CloudWatch** raccoglie metriche e log e fa scattare allarmi (come va, cosa non funziona). **CloudTrail** registra le **chiamate API** dell'account (chi ha fatto cosa). **AWS Config** registra la **configurazione** delle risorse e la valuta rispetto a regole di conformità (com'è configurata, cosa è cambiato). Prestazioni, audit, conformità: tre domande distinte.

</details>

<details>
<summary>A cosa serve AWS Trusted Advisor?</summary>

A ispezionare l'account e produrre **raccomandazioni** in cinque aree: costo, sicurezza, prestazioni, tolleranza ai guasti e limiti di servizio. Segnala per esempio risorse sottoutilizzate, configurazioni rischiose o quote vicine al limite, senza applicare modifiche: suggerisce.

</details>

<details>
<summary>Che cos'è uno stack CloudFormation e perché l'IaC è preferibile alla Console?</summary>

Uno **stack** è l'insieme delle risorse create da un **template**, gestite come un'unità che si crea, aggiorna ed elimina in blocco. L'**Infrastructure as Code** è preferibile perché è **ripetibile** (stessa infrastruttura in account o Region diversi), **versionabile** e **revisionabile** come il codice, contro le creazioni manuali che non si possono riprodurre né verificare.

</details>

<details>
<summary>Cosa rileva il drift detection di CloudFormation?</summary>

Rileva le **modifiche manuali** fatte alle risorse fuori dal template: confronta lo stato **desiderato** (il template) con lo stato **reale** e segnala `DRIFTED` quando divergono. Serve a scoprire i cambiamenti «di nascosto» che minano la riproducibilità dell'infrastruttura.

</details>

<details>
<summary>Un allarme di CloudWatch dice anche chi ha causato il problema?</summary>

No. CloudWatch dice **che** qualcosa è fuori soglia (una metrica, un log). Per sapere **chi** ha fatto la chiamata API che ha causato il cambiamento si guarda **CloudTrail**, e per sapere **cosa** è cambiato nella configurazione si guarda **AWS Config**. I tre servizi si completano.

</details>

**In sintesi:** l'observability distingue CloudWatch (metriche/log/allarmi, come va), CloudTrail (audit delle API, chi ha fatto cosa) e AWS Config (configurazione e conformità, cosa è cambiato); la governance aggiunge Trusted Advisor per le raccomandazioni e Organizations/SCP per i confini; l'Infrastructure as Code con CloudFormation rende l'infrastruttura ripetibile, versionabile e sorvegliabile con il drift detection.

## Fonti

- [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) - verificato 2026-09-04
- [What is AWS CloudTrail?](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) - verificato 2026-09-04
- [What is AWS Config?](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html) - verificato 2026-09-04
- [AWS Trusted Advisor](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html) - verificato 2026-09-04
- [What is AWS CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) - verificato 2026-09-04
- [Detecting unmanaged configuration changes (drift)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html) - verificato 2026-09-04
