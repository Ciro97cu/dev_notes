# 04 · Compute elastico: EC2, Auto Scaling e load balancing

**Amazon EC2 (Elastic Compute Cloud)** fornisce server virtuali su richiesta: si accende una macchina, la si usa e la si spegne pagando la capacità effettivamente consumata. All'esame, però, la domanda quasi mai è «quale singolo server»: è come rendere il compute **elastico** (che cresce e cala con la domanda) e **resiliente** (che sopravvive al guasto di una Availability Zone). La risposta ricorrente combina tre elementi (un load balancer, un Auto Scaling group e più AZ) ed è il modello che questo modulo costruisce.

> [!info|label:SAA-C03 · D3T2 e D4T2, base D2T1 e D2T2]
> Il modulo copre *Design high-performing and elastic compute solutions* (D3T2) e *Design cost-optimized compute solutions* (D4T2): tipi di istanza, opzioni d'acquisto, Elastic Load Balancing e Auto Scaling. È anche la base delle architetture scalabili e ad alta disponibilità (D2T1, D2T2).

## Amazon EC2: il server virtuale

Un'**istanza EC2** è una macchina virtuale che nasce da una **AMI (Amazon Machine Image)**, cioè un modello che contiene il sistema operativo e l'eventuale software preinstallato. Alla partenza si sceglie un **instance type** (per esempio `t3.micro`), che appartiene a una **famiglia** ottimizzata per un profilo d'uso: general purpose, compute optimized, memory optimized, storage optimized. La scelta della famiglia è già una decisione architetturale, perché lega la spesa al collo di bottiglia reale del carico (CPU, memoria o I/O).

Altri elementi accompagnano l'istanza: uno script di **user data** che la configura al primo avvio, una **key pair** per l'accesso SSH, e l'appartenenza a una subnet con il suo security group. Per non ripetere queste scelte a mano ogni volta, si descrivono una volta sola in un **launch template**, il modello riutilizzabile che dice *come* lanciare un'istanza. È il mattone su cui poggia l'Auto Scaling.

## Scegliere e pagare la capacità: le purchasing options

La stessa istanza può costare molto diversamente a seconda di **come** la si acquista. Le opzioni sono la leva principale del Domain 4 sul compute, e ognuna risponde a un profilo di carico:

| Opzione | Come si paga | Sconto tipico | Quando |
|---|---|---|---|
| **On-Demand** | al secondo, nessun impegno | nessuno (prezzo pieno) | carichi brevi, imprevedibili o di prova |
| **Savings Plans** | impegno di spesa oraria per 1 o 3 anni | fino a ~72% | carichi **stabili e prevedibili**; flessibili tra famiglie/Region |
| **Reserved Instances** | impegno su un tipo per 1 o 3 anni | fino a ~72% (Standard) | carichi stabili su un tipo definito |
| **Spot** | capacità inutilizzata, prezzo variabile | fino a ~90% | carichi **tolleranti alle interruzioni** (batch, stateless) |
| **Dedicated Hosts/Instances** | hardware dedicato | — | vincoli di compliance o licenze |

Due opposti chiariscono la logica. Gli **Spot** sono i più economici (fino al 90% in meno) ma AWS può revocarli con un preavviso di due minuti: vanno bene per un elaborato batch o per server web stateless dietro un bilanciatore, non per un database. I **Savings Plans** (che AWS preferisce ai Reserved Instances per la loro flessibilità) premiano invece l'impegno pluriennale su un carico costante. On-Demand sta nel mezzo: nessuno sconto ma nessun vincolo, ideale finché non si conosce ancora il profilo del carico. *(Le percentuali di sconto vanno verificate sul pricing ufficiale al momento della scelta.)*

## Distribuire il carico: Elastic Load Balancing

Un **load balancer** distribuisce il traffico in ingresso su più bersagli collocati in **AZ diverse**, e grazie agli **health check** invia le richieste solo ai bersagli sani, togliendo dal giro quelli guasti. È il componente che permette a un'applicazione di sopravvivere alla perdita di una singola istanza o di un'intera zona. AWS ne offre tre tipi, che l'esame chiede di distinguere per **livello** di rete:

| Load balancer | Livello | Traffico | Quando |
|---|---|---|---|
| **Application (ALB)** | 7 (HTTP/HTTPS) | web, con routing per **host e path** | applicazioni web, microservizi, terminazione TLS, WAF |
| **Network (NLB)** | 4 (TCP/UDP) | prestazioni estreme, **IP statico** per AZ | latenza bassissima, milioni di richieste, PrivateLink |
| **Gateway (GWLB)** | 3 | pacchetti verso **appliance** di rete | firewall e ispezione di terze parti |

La regola di scelta è quasi sempre questa: se il criterio è il **contenuto** della richiesta (un URL, un header, un percorso), serve l'**ALB** di livello 7; se il criterio è la **pura prestazione** di trasporto (TCP/UDP, latenza minima, un indirizzo IP fisso), serve l'**NLB** di livello 4.

## Scalare con la domanda: EC2 Auto Scaling

Un **Auto Scaling group (ASG)** mantiene in esecuzione un numero di istanze che varia con la domanda, lanciandole da un launch template e distribuendole su più subnet in AZ diverse. Il suo comportamento è definito da tre numeri: **min**, **desired** e **max**. Il *desired* è quante istanze si vogliono adesso; il gruppo non scende mai sotto *min* né sale sopra *max*. Se un'istanza diventa malsana (fallisce un health check dell'EC2 o del load balancer), l'ASG la **termina e la rimpiazza** da sé, mantenendo la capacità desiderata: è questa autoriparazione a dare l'alta disponibilità.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 240" role="img" aria-label="Il contratto di capacità di un Auto Scaling group: due istanze in esecuzione pari al desired, il minimo a una, il massimo a quattro; la politica di scaling aggiunge istanze verso il massimo quando la metrica supera il target e le rimuove verso il minimo quando scende." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="asg-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <text x="360" y="28" font-size="12" text-anchor="middle" font-weight="700">Auto Scaling group · min · desired · max</text>
    <g stroke="currentColor" stroke-width="1.5">
      <rect x="120" y="70" width="90" height="66" rx="8" fill="var(--bg,#fff)"/>
      <rect x="230" y="70" width="90" height="66" rx="8" fill="var(--bg,#fff)"/>
      <rect x="340" y="70" width="90" height="66" rx="8" fill="var(--bg,#fff)" stroke-dasharray="6 4"/>
      <rect x="450" y="70" width="90" height="66" rx="8" fill="var(--bg,#fff)" stroke-dasharray="6 4"/>
    </g>
    <g text-anchor="middle" font-size="11">
      <text x="165" y="108">EC2</text>
      <text x="275" y="108">EC2</text>
      <text x="385" y="108" fill-opacity=".55">EC2</text>
      <text x="495" y="108" fill-opacity=".55">EC2</text>
    </g>
    <g font-size="10" text-anchor="middle" fill-opacity=".8">
      <text x="165" y="156">min = 1</text>
      <text x="275" y="156">desired = 2</text>
      <text x="495" y="156">max = 4</text>
      <text x="220" y="176" fill-opacity=".6">in esecuzione</text>
      <text x="440" y="176" fill-opacity=".6">capacità di riserva</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#asg-arrow)">
      <path d="M330 52 L438 52"/>
      <path d="M330 210 L222 210"/>
    </g>
    <g font-size="10" text-anchor="middle" fill-opacity=".85">
      <text x="384" y="46">scale out: metrica &gt; target</text>
      <text x="276" y="204">scale in: metrica &lt; target</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il gruppo tiene il <em>desired</em> di istanze, mai sotto <em>min</em> né sopra <em>max</em>. Una politica di scaling muove il desired dentro quei limiti in base a una metrica.</figcaption>
</figure>

A muovere il *desired* è una **scaling policy**. La più usata è il **target tracking**: si sceglie una metrica e un valore obiettivo (per esempio «CPU media al 50%» o «richieste per istanza dietro l'ALB») e l'ASG aggiunge o toglie istanze per tenere la metrica vicino al bersaglio, come un termostato. Esistono anche lo **step/simple scaling** (regole a soglie), lo **scheduled scaling** (variazioni a orari noti, per esempio più capacità nelle ore di punta) e il **predictive scaling** (previsione basata sullo storico).

## Il pattern «elastico e resiliente»

Messi insieme i pezzi, la risposta canonica a «un'applicazione web che scala con la domanda e sopravvive al guasto di una zona» è sempre la stessa: un **ALB** davanti a un **Auto Scaling group** con istanze distribuite su **almeno due AZ**. L'ALB smista il traffico e nasconde le singole istanze; l'ASG scala e ripara; le due o più AZ assorbono la perdita di una zona.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 320" role="img" aria-label="Pattern elastico e resiliente: da internet il traffico entra in un Application Load Balancer che distribuisce su un Auto Scaling group con istanze EC2 in due Availability Zone (eu-west-1a e eu-west-1b)." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="cp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="300" y="10" width="120" height="32" rx="16" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="360" y="31" font-size="11" text-anchor="middle">Internet</text>
    <rect x="130" y="62" width="460" height="40" rx="9" fill="var(--link,#9a4d00)" fill-opacity=".16" stroke="var(--link,#9a4d00)" stroke-width="1.5"/>
    <text x="360" y="87" font-size="12" text-anchor="middle" font-weight="700">Application Load Balancer</text>
    <rect x="90" y="128" width="540" height="176" rx="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="9 6"/>
    <text x="106" y="150" font-size="11" font-weight="700">Auto Scaling group · ≥ 2 AZ</text>
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <rect x="120" y="164" width="230" height="126" rx="9"/>
      <rect x="370" y="164" width="230" height="126" rx="9"/>
    </g>
    <g font-size="10.5" fill-opacity=".8">
      <text x="136" y="184">AZ eu-west-1a</text>
      <text x="386" y="184">AZ eu-west-1b</text>
    </g>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4">
      <rect x="150" y="200" width="80" height="46" rx="7"/>
      <rect x="240" y="200" width="80" height="46" rx="7"/>
      <rect x="400" y="200" width="80" height="46" rx="7"/>
      <rect x="490" y="200" width="80" height="46" rx="7"/>
    </g>
    <g font-size="10" text-anchor="middle">
      <text x="190" y="228">EC2</text>
      <text x="280" y="228">EC2</text>
      <text x="440" y="228">EC2</text>
      <text x="530" y="228">EC2</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#cp-arrow)">
      <path d="M360 42 L360 60"/>
      <path d="M300 102 L235 162"/>
      <path d="M420 102 L485 162"/>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">L'ALB distribuisce su istanze in AZ diverse; l'Auto Scaling group le aggiunge, rimuove e rimpiazza secondo domanda e salute. La stessa idea vale per un NLB quando serve il livello 4.</figcaption>
</figure>

## Oltre le istanze: serverless e container

Non tutto il compute è una macchina da gestire. Con **AWS Lambda** si esegue codice in risposta a un evento senza amministrare alcun server, pagando solo l'esecuzione; con **AWS Fargate** si eseguono container senza gestire le istanze che li ospitano; **Amazon ECS** ed **EKS** orchestrano container su larga scala. Sono la scelta quando il requisito dice «senza server da gestire» o «carico intermittente»; li approfondisce il modulo su integrazione e serverless. Qui basti riconoscerli come alternativa a EC2 quando l'obiettivo è togliere lavoro operativo.

## Exam lens

- *scala automaticamente con la domanda*: un **Auto Scaling group** con una **target tracking policy**, non il ridimensionamento manuale.
- *sopravvive al guasto di una AZ*: istanze su **più AZ** dietro un load balancer, con l'ASG che rimpiazza le istanze perse.
- *il più economico per un batch che tollera interruzioni*: **Spot**.
- *il più economico per un carico costante su tre anni*: **Savings Plans** (o Reserved Instances).
- *instradare in base all'URL o al path*: **ALB** (livello 7); *massima prestazione TCP/UDP con IP statico*: **NLB** (livello 4).
- *nessun server da gestire*: **Lambda** o **Fargate**, non EC2.
- Trappola di costo: scegliere Spot per un componente che **non** tollera interruzioni (un database, un nodo con stato) è sbagliato anche se è il più economico.

## Ripasso lampo

<details>
<summary>Quali sono i tre numeri che definiscono un Auto Scaling group e cosa fanno?</summary>

**min**, **desired** e **max**. Il *desired* è la capacità voluta in un dato momento; il gruppo non scende mai sotto *min* né sale sopra *max*. Una scaling policy muove il desired dentro quei limiti in base a una metrica.

</details>

<details>
<summary>Quando si sceglie un Application Load Balancer e quando un Network Load Balancer?</summary>

L'**ALB** (livello 7) quando l'instradamento dipende dal contenuto HTTP, come host o path, o serve terminazione TLS e integrazione con il WAF. L'**NLB** (livello 4) quando servono prestazioni estreme su TCP/UDP, latenza minima o un indirizzo IP statico per Availability Zone.

</details>

<details>
<summary>Per un elaborato batch che tollera le interruzioni, qual è l'opzione d'acquisto più conveniente?</summary>

Le istanze **Spot**, scontate fino al 90%, perché AWS può revocarle con due minuti di preavviso ma il batch può riprendere. Per un carico costante e non interrompibile si sceglierebbe invece un **Savings Plan** o un Reserved Instance.

</details>

<details>
<summary>Come ottiene l'alta disponibilità un Auto Scaling group?</summary>

Distribuendo le istanze su **più Availability Zone** e sostituendo da sé quelle che falliscono un health check: mantiene la capacità desiderata anche quando un'istanza, o un'intera zona, viene meno. Il load balancer davanti smette intanto di inviare traffico ai bersagli malsani.

</details>

<details>
<summary>Che cos'è un launch template e perché serve all'Auto Scaling?</summary>

È il modello riutilizzabile che descrive *come* lanciare un'istanza: AMI, instance type, security group, user data. L'Auto Scaling group lo usa per creare istanze identiche quando scala, senza dover ripetere la configurazione ogni volta.

</details>

**In sintesi:** EC2 offre server virtuali da un'AMI, con instance type e opzioni d'acquisto (On-Demand, Savings Plans/Reserved, Spot) scelte in base al profilo del carico; l'Elastic Load Balancing distribuisce il traffico (ALB al livello 7, NLB al livello 4); l'Auto Scaling group tiene la capacità fra min e max e ripara le istanze; il pattern ALB + ASG su più AZ è la risposta canonica a «elastico e resiliente»; Lambda e Fargate tolgono del tutto la gestione dei server.

## Fonti

- [What is Amazon EC2?](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html) - verificato 2026-09-04
- [Instance purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html) - verificato 2026-09-04
- [Spot Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html) - verificato 2026-09-04
- [Elastic Load Balancing features](https://aws.amazon.com/elasticloadbalancing/features/) - verificato 2026-09-04
- [What is Amazon EC2 Auto Scaling?](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html) - verificato 2026-09-04
- [Target tracking scaling policies](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html) - verificato 2026-09-04
- [Launch templates](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/launch-templates.html) - verificato 2026-09-04
