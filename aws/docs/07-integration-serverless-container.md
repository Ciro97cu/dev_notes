# 07 · Integrazione, serverless e container

Quando due componenti si chiamano **direttamente**, il loro destino è legato: se quello a valle rallenta o si guasta, quello a monte resta bloccato ad aspettare, e i due non possono crescere separatamente. Il **disaccoppiamento** rompe questo legame inserendo un intermediario (una coda, un topic, un bus di eventi), così i componenti scalano e falliscono in modo indipendente. A questo si affiancano il **serverless** (Lambda) e i **container** (Fargate, ECS, EKS), forme di calcolo che tolgono lavoro operativo. È il cuore delle architetture scalabili e a basso accoppiamento (D2T1).

> [!info|label:SAA-C03 · D2T1, base D3T2 e D4T2]
> Il modulo copre *Design scalable and loosely coupled architectures* (D2T1): messaggistica con SQS, SNS ed EventBridge, calcolo serverless con Lambda, container con ECS/EKS/Fargate, orchestrazione con Step Functions e API Gateway. Tocca anche il compute serverless dei task D3T2 e D4T2.

## Perché disaccoppiare

Un componente che invoca un altro in modo **sincrono** aspetta la risposta: se il chiamato è lento, il chiamante è lento; se è giù, il chiamante fallisce; se arriva un picco di richieste, entrambi devono reggerlo nello stesso istante. Inserendo una **coda** in mezzo, il produttore deposita il lavoro e prosegue, mentre il consumatore lo ritira al proprio ritmo. La coda fa da **cuscinetto** che assorbe i picchi e da **isolante** che impedisce a un guasto di propagarsi.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 210" role="img" aria-label="Disaccoppiamento con SQS: un produttore invia messaggi in una coda senza attendere; i consumatori, un Auto Scaling group, li prelevano al proprio ritmo. La coda assorbe i picchi e isola i guasti." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="in-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="26" y="72" width="140" height="60" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="96" y="98" font-size="12" text-anchor="middle" font-weight="700">produttore</text>
    <text x="96" y="115" font-size="9" text-anchor="middle" fill-opacity=".7">(API, evento)</text>
    <rect x="270" y="60" width="184" height="86" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <text x="362" y="80" font-size="11.5" text-anchor="middle" font-weight="700">Amazon SQS</text>
    <g fill="var(--link,#9a4d00)" fill-opacity=".22" stroke="var(--link,#9a4d00)" stroke-width="1">
      <rect x="290" y="98" width="30" height="30" rx="3"/>
      <rect x="326" y="98" width="30" height="30" rx="3"/>
      <rect x="362" y="98" width="30" height="30" rx="3"/>
      <rect x="398" y="98" width="30" height="30" rx="3"/>
    </g>
    <rect x="556" y="60" width="148" height="86" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="7 5"/>
    <text x="630" y="96" font-size="11.5" text-anchor="middle" font-weight="700">consumatori</text>
    <text x="630" y="114" font-size="9" text-anchor="middle" fill-opacity=".7">(Auto Scaling)</text>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#in-arrow)">
      <path d="M166 102 L268 102"/>
      <path d="M454 102 L554 102"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".8">
      <text x="217" y="94">invia · non aspetta</text>
      <text x="505" y="94">preleva · poll</text>
    </g>
    <text x="360" y="182" font-size="10" text-anchor="middle" fill-opacity=".8">la coda assorbe i picchi; produttore e consumatori scalano e falliscono in modo indipendente</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Con la coda in mezzo, un'ondata di richieste non travolge i consumatori: si accumula nella coda e viene smaltita al ritmo sostenibile, mentre l'Auto Scaling aggiunge consumatori se la coda cresce.</figcaption>
</figure>

## Amazon SQS: la coda

**Amazon SQS (Simple Queue Service)** è una coda di messaggi gestita, **pull-based**: i consumatori interrogano la coda e ritirano i messaggi. Quando un consumatore preleva un messaggio, questo diventa **invisibile** agli altri per un intervallo (il *visibility timeout*) durante il quale lo elabora; se lo porta a termine, lo cancella, altrimenti allo scadere il messaggio ridiventa visibile e verrà riprovato. I messaggi che falliscono troppe volte finiscono in una **dead-letter queue (DLQ)**, dove si ispezionano senza bloccare la coda principale. Esistono due tipi: la coda **standard** offre altissima velocità con consegna *at-least-once* e ordine *best-effort*; la coda **FIFO** garantisce **ordine stretto** ed esattamente-una-volta, a costo di un throughput inferiore.

## Amazon SNS: il pub/sub

**Amazon SNS (Simple Notification Service)** è un servizio **pub/sub**: un messaggio pubblicato su un **topic** viene **spinto** (push) a **tutti** i sottoscrittori in una volta, che siano funzioni Lambda, code SQS, endpoint HTTP o email. Serve quando un evento deve raggiungere **molti** destinatari contemporaneamente. Il pattern di **fan-out** più usato combina SNS e SQS: SNS pubblica su un topic a cui sono iscritte più code SQS, così ogni consumatore riceve la propria copia e la elabora con i vantaggi della coda (cuscinetto, riprova, DLQ).

## Amazon EventBridge: il bus di eventi

**Amazon EventBridge** è un **event bus** serverless: gli eventi vi affluiscono da servizi AWS, applicazioni proprie o partner SaaS, e delle **regole** li instradano ai bersagli in base al **contenuto** dell'evento. La differenza con SNS è il **routing per regola**: mentre un topic SNS manda lo stesso messaggio a tutti gli iscritti, EventBridge filtra e smista ciascun evento verso il bersaglio giusto, con oltre duecento integrazioni predefinite. È la scelta per l'integrazione *event-driven* fra servizi eterogenei.

## Quale servizio di messaggistica?

I tre servizi si somigliano ma rispondono a domande diverse, e l'esame gioca su questo.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 220" role="img" aria-label="Tre pattern di messaggistica: SQS e una coda da cui un gruppo di consumatori preleva; SNS e un topic che spinge in fan-out a molti sottoscrittori; EventBridge e un bus che instrada gli eventi verso i bersagli in base a regole." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="ms-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="14" y="34" width="224" height="176" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="248" y="34" width="210" height="176" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="468" y="34" width="238" height="176" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <g text-anchor="middle" font-weight="700" font-size="12">
      <text x="126" y="58">SQS · coda</text>
      <text x="353" y="58">SNS · topic</text>
      <text x="587" y="58">EventBridge · bus</text>
    </g>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.3" font-size="9.5" text-anchor="middle">
      <rect x="34" y="100" width="52" height="30" rx="5"/><rect x="100" y="100" width="52" height="30" rx="5"/><rect x="166" y="100" width="52" height="30" rx="5"/>
      <rect x="266" y="100" width="52" height="30" rx="5"/><rect x="332" y="100" width="52" height="30" rx="5"/>
      <rect x="392" y="78" width="52" height="26" rx="5"/><rect x="392" y="112" width="52" height="26" rx="5"/><rect x="392" y="146" width="52" height="26" rx="5"/>
      <rect x="484" y="100" width="56" height="30" rx="5"/>
      <rect x="626" y="72" width="66" height="26" rx="5"/><rect x="626" y="108" width="66" height="26" rx="5"/><rect x="626" y="150" width="66" height="26" rx="5"/>
    </g>
    <g font-size="9.5" text-anchor="middle">
      <text x="60" y="119">prod.</text><text x="126" y="119">coda</text><text x="192" y="119">cons.</text>
      <text x="292" y="119">pub.</text><text x="358" y="119">topic</text>
      <text x="418" y="95">sub</text><text x="418" y="129">sub</text><text x="418" y="163">sub</text>
      <text x="512" y="119">regola</text>
      <text x="659" y="89">target</text><text x="659" y="125">target</text><text x="659" y="167">target</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.3" marker-end="url(#ms-arrow)">
      <path d="M86 115 L98 115"/><path d="M152 115 L164 115"/>
      <path d="M318 115 L330 115"/>
      <path d="M384 108 L390 92"/><path d="M384 118 L390 124"/><path d="M384 126 L390 156"/>
      <path d="M540 115 L624 85"/><path d="M540 115 L624 121"/><path d="M540 115 L624 160"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".72">
      <text x="126" y="196">un gruppo preleva · pull</text>
      <text x="353" y="196">fan-out a molti · push</text>
      <text x="587" y="196">instrada per regola</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem"><strong>SQS</strong>: un lavoro atteso in coda, prelevato da un gruppo di consumatori. <strong>SNS</strong>: un messaggio spinto a molti sottoscrittori insieme. <strong>EventBridge</strong>: eventi smistati verso bersagli diversi secondo regole sul contenuto.</figcaption>
</figure>

## AWS Lambda: il serverless a funzioni

**AWS Lambda** esegue **funzioni** in risposta a un evento senza che si gestisca alcun server: si carica il codice, lo si collega a una sorgente di eventi (un caricamento su S3, un messaggio su SQS, una richiesta su API Gateway) e AWS lo esegue quando serve, scalando da zero a migliaia di esecuzioni parallele e facendo pagare **solo l'esecuzione**. Ha un limite di durata di **15 minuti** per invocazione ed è **stateless**: è ideale per elaborazioni brevi, event-driven e a volume variabile, meno per processi lunghi o a stato persistente.

## Container: ECS, EKS e Fargate

Per applicazioni impacchettate in **container**, AWS offre l'orchestrazione con **Amazon ECS** (semplice, integrato in AWS) o **Amazon EKS** (Kubernetes gestito), e due modi di fornire il calcolo sottostante: istanze EC2 che si gestiscono, oppure **AWS Fargate**, che esegue i container **senza gestire istanze** (serverless per container). Le immagini si conservano in **Amazon ECR**. La scelta rispetto a Lambda si gioca spesso su una domanda sola: se il lavoro sta in 15 minuti ed è a picchi, **Lambda**; se è un processo lungo o un servizio sempre attivo, un **container** (con Fargate per togliere la gestione delle istanze).

## Orchestrare: Step Functions e API Gateway

Quando un processo si compone di **più passi** con condizioni, ritentativi e rami paralleli, **AWS Step Functions** lo descrive come una **macchina a stati** e ne coordina l'esecuzione fra Lambda, ECS e altri servizi, senza incastrare la logica di orchestrazione dentro il codice. **Amazon API Gateway**, invece, è la porta d'ingresso gestita per esporre **API** REST o HTTP davanti a Lambda o ad altri backend, con autenticazione, throttling e caching: è ciò che trasforma una funzione in un endpoint pubblico governato.

## Exam lens

- *disaccoppiare produttore e consumatore, assorbire i picchi, elaborare un lavoro alla volta*: **SQS**.
- *un evento deve raggiungere molti destinatari insieme*: **SNS** (o **SNS + SQS** per il fan-out con code).
- *instradare eventi da molte sorgenti in base al contenuto*: **EventBridge**.
- *ordine stretto ed esattamente-una-volta*: **SQS FIFO**.
- *eseguire codice senza server, per eventi brevi*: **Lambda**; *processo oltre 15 minuti o servizio sempre attivo*: un **container** (Fargate/ECS/EKS).
- *eseguire container senza gestire istanze*: **Fargate**.
- *coordinare un flusso a più passi con ritentativi e rami*: **Step Functions**.
- *esporre una funzione come API REST/HTTP gestita*: **API Gateway**.
- La trappola più comune: SQS è **pull** (il consumatore preleva) e per un solo gruppo di consumatori; SNS è **push** e fa fan-out a molti. Scambiarli porta a diagnosi sbagliate.

## Ripasso lampo

<details>
<summary>Qual è la differenza fra SQS e SNS?</summary>

**SQS** è una **coda** *pull*: i consumatori prelevano i messaggi, che restano in attesa finché qualcuno li ritira; serve a disaccoppiare produttore e consumatore. **SNS** è un **pub/sub** *push*: un messaggio pubblicato su un topic viene spinto a **tutti** i sottoscrittori insieme (fan-out). Una accoda per un consumatore, l'altra notifica molti.

</details>

<details>
<summary>A cosa serve il visibility timeout di SQS?</summary>

Quando un consumatore preleva un messaggio, questo diventa **invisibile** agli altri per il visibility timeout, il tempo che il consumatore ha per elaborarlo e cancellarlo. Se non lo cancella in tempo (per esempio perché è andato in errore), il messaggio ridiventa visibile e viene riprovato, evitando che un lavoro vada perso per un guasto del consumatore.

</details>

<details>
<summary>Quando si sceglie EventBridge invece di SNS?</summary>

**EventBridge** quando serve **instradare** eventi verso bersagli diversi in base al **contenuto** (regole che filtrano i campi dell'evento), o integrare sorgenti AWS/SaaS eterogenee. **SNS** quando basta **spingere lo stesso messaggio** a un insieme di sottoscrittori. EventBridge instrada e filtra; SNS fa broadcast.

</details>

<details>
<summary>Un'elaborazione dura 40 minuti: Lambda o container?</summary>

Un **container** (ECS/EKS, eventualmente su **Fargate** per non gestire istanze). Lambda ha un limite di **15 minuti** per invocazione, quindi non è adatto a un processo di 40 minuti. Lambda resta la scelta per elaborazioni brevi ed event-driven.

</details>

<details>
<summary>Come si ottiene un fan-out con code affidabili?</summary>

Con il pattern **SNS + SQS**: SNS pubblica su un topic a cui sono iscritte più code SQS, così ogni consumatore riceve la propria copia in una coda, con cuscinetto, riprova e dead-letter queue. Si uniscono il broadcast di SNS e l'affidabilità di SQS.

</details>

**In sintesi:** disaccoppiare separa il destino dei componenti; SQS accoda (pull, un gruppo, con visibility timeout e DLQ, standard o FIFO), SNS fa pub/sub push in fan-out, EventBridge instrada eventi per regola; Lambda esegue funzioni serverless brevi ed event-driven; ECS/EKS con Fargate eseguono container, senza gestire istanze; Step Functions orchestra flussi a più passi e API Gateway espone API gestite.

## Fonti

- [What is Amazon SQS?](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) - verificato 2026-09-04
- [Amazon SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) - verificato 2026-09-04
- [What is Amazon SNS?](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) - verificato 2026-09-04
- [What is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html) - verificato 2026-09-04
- [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) - verificato 2026-09-04
- [AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) - verificato 2026-09-04
- [What is AWS Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) - verificato 2026-09-04
