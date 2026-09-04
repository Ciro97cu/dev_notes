# 10 · Data ingestion e analytics

Trasformare dati grezzi in informazioni utili segue quasi sempre la stessa **catena**: portare i dati dentro AWS (*ingestion*), conservarli in un magazzino centrale (il *data lake*), catalogarli e trasformarli, interrogarli e infine visualizzarli. A ogni stadio corrisponde un servizio, e la scelta dipende dalla forma dei dati e da come vanno usati. È il tema del task sull'ingestione e la trasformazione dei dati (D3T5).

> [!info|label:SAA-C03 · D3T5]
> Il modulo copre *Determine high-performing data ingestion and transformation solutions* (D3T5): ingestione batch e streaming con Kinesis, il data lake su S3, la catalogazione e l'ETL con AWS Glue, l'analisi con Athena, Redshift ed EMR, la visualizzazione con QuickSight.

## La pipeline dei dati

Prima dei singoli servizi conviene vedere il flusso nel suo insieme. I dati entrano da sorgenti diverse (applicazioni, dispositivi, file), si **conservano** grezzi in un magazzino unico e poco costoso, si **catalogano e trasformano** in un formato interrogabile, si **analizzano** con query o elaborazioni, e i risultati si **visualizzano** in dashboard. Ogni stadio è indipendente dagli altri: si può cambiare lo strumento di uno senza rifare gli altri.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 170" role="img" aria-label="La pipeline dei dati: ingestione (Kinesis o batch), archiviazione nel data lake S3, catalogazione ed ETL con AWS Glue, analisi con Athena o Redshift, visualizzazione con QuickSight." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="dp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="8" y="52" width="126" height="62" rx="9"/>
      <rect x="156" y="52" width="126" height="62" rx="9"/>
      <rect x="304" y="52" width="126" height="62" rx="9"/>
      <rect x="452" y="52" width="126" height="62" rx="9"/>
      <rect x="600" y="52" width="112" height="62" rx="9"/>
    </g>
    <g text-anchor="middle" font-weight="700" font-size="11.5">
      <text x="71" y="80">ingestione</text>
      <text x="219" y="80">S3</text>
      <text x="367" y="80">AWS Glue</text>
      <text x="515" y="80">Athena /</text>
      <text x="656" y="80">QuickSight</text>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".72">
      <text x="71" y="98">Kinesis · batch</text>
      <text x="219" y="98">data lake</text>
      <text x="367" y="98">catalogo · ETL</text>
      <text x="515" y="96">Redshift</text>
      <text x="515" y="108">query</text>
      <text x="656" y="98">dashboard</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#dp-arrow)">
      <path d="M134 83 L154 83"/>
      <path d="M282 83 L302 83"/>
      <path d="M430 83 L450 83"/>
      <path d="M578 83 L598 83"/>
    </g>
    <g text-anchor="middle" font-size="8.5" fill-opacity=".62">
      <text x="71" y="132">raccogliere</text>
      <text x="219" y="132">conservare</text>
      <text x="367" y="132">catalogare</text>
      <text x="515" y="132">interrogare</text>
      <text x="656" y="132">visualizzare</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Gli stadi sono disaccoppiati: al centro sta il <strong>data lake su S3</strong>, che separa lo storage dal calcolo, così ingestione, trasformazione e analisi evolvono in modo indipendente.</figcaption>
</figure>

## Ingestione: batch o streaming

I dati arrivano in due modi. In modalità **batch** si caricano file a intervalli (per esempio esporti giornalieri su S3). In modalità **streaming** arrivano di continuo, evento dopo evento (click, letture di sensori, log), e servono servizi dedicati. **Amazon Kinesis** ne offre due, che l'esame chiede di distinguere. **Kinesis Data Streams** cattura lo stream in **tempo reale** (latenza sotto il secondo), lo conserva per un periodo configurabile e lo mette a disposizione di **consumatori propri** che lo elaborano, anche rileggendo i dati (*replay*): è la scelta quando serve elaborazione personalizzata e a bassissima latenza. **Amazon Data Firehose** (già Kinesis Data Firehose) è invece la via **gestita** per **consegnare** lo stream a una destinazione (S3, Redshift, OpenSearch) in near-real-time, con batching e trasformazione opzionale, **senza scrivere né gestire consumatori**.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Kinesis Data Streams cattura lo stream in tempo reale e lo espone a consumatori propri con possibilita di replay; Data Firehose consegna lo stream in modo gestito a destinazioni come S3 o Redshift senza consumatori da scrivere." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="ki-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="16" y="30" width="330" height="150" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="374" y="30" width="330" height="150" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="181" y="52" font-size="12" text-anchor="middle" font-weight="700">Data Streams · real-time</text>
    <text x="539" y="52" font-size="12" text-anchor="middle" font-weight="700">Data Firehose · gestito</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4" font-size="9.5" text-anchor="middle">
      <rect x="34" y="86" width="70" height="40" rx="6"/><text x="69" y="110">sorgente</text>
      <rect x="140" y="86" width="76" height="40" rx="6"/><text x="178" y="106">stream</text><text x="178" y="118" font-size="8" fill-opacity=".7">shard</text>
      <rect x="252" y="86" width="80" height="40" rx="6"/><text x="292" y="106">consumatori</text><text x="292" y="118" font-size="8" fill-opacity=".7">propri</text>
      <rect x="392" y="86" width="70" height="40" rx="6"/><text x="427" y="110">sorgente</text>
      <rect x="498" y="86" width="80" height="40" rx="6"/><text x="538" y="110">Firehose</text>
      <rect x="614" y="86" width="76" height="40" rx="6"/><text x="652" y="106">S3 /</text><text x="652" y="118">Redshift</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#ki-arrow)">
      <path d="M104 106 L138 106"/><path d="M216 106 L250 106"/>
      <path d="M462 106 L496 106"/><path d="M578 106 L612 106"/>
    </g>
    <g text-anchor="middle" font-size="8.5" fill-opacity=".72">
      <text x="181" y="150">consumatori propri · replay</text>
      <text x="539" y="150">consegna automatica · niente consumatori</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem"><strong>Data Streams</strong> mette lo stream a disposizione di consumatori che lo elaborano (e possono rileggerlo). <strong>Data Firehose</strong> lo <em>consegna</em> a una destinazione senza codice di consumo: la scelta è fra controllo e semplicità.</figcaption>
</figure>

## Il data lake su S3

Al centro della pipeline sta il **data lake**, e su AWS è quasi sempre **Amazon S3**: un magazzino unico, durevole e a basso costo dove confluiscono dati di **qualunque formato**, grezzi o raffinati. Il vantaggio architetturale è il **disaccoppiamento fra storage e calcolo**: i dati stanno fermi su S3, e strumenti diversi (Athena, Redshift, EMR) li interrogano senza spostarli, ciascuno quando serve. Si paga lo storage una volta e si sceglie il motore di analisi in base alla domanda.

## Catalogare e trasformare: AWS Glue

Perché i dati su S3 siano interrogabili come tabelle, serve sapere che **schema** hanno e dove sono. **AWS Glue** è il servizio serverless che se ne occupa: il suo **Data Catalog** è un registro centrale dei metadati (tabelle, colonne, posizioni) condiviso da Athena e Redshift, popolabile a mano o con dei **crawler** che deducono lo schema dai file. Glue offre inoltre l'**ETL** (Extract, Transform, Load) serverless per pulire e trasformare i dati fra uno stadio e l'altro, senza gestire cluster.

## Interrogare e analizzare: Athena, Redshift, EMR

Sullo stesso data lake si affacciano tre motori con profili diversi. **Amazon Athena** è **serverless**: interroga i dati **direttamente su S3** con SQL, senza infrastruttura, pagando per i dati scansionati; è ideale per analisi **ad-hoc** e occasionali. **Amazon Redshift** è un **data warehouse**: carica i dati in un cluster e serve query **complesse su dati strutturati a grande scala**, con prestazioni elevate e continue; è la scelta della business intelligence pesante. **Amazon EMR** esegue framework **big data** (Apache Spark, Hadoop, Presto) su cluster gestiti, per elaborazioni personalizzate, machine learning e trasformazioni massicce. A valle, **Amazon QuickSight** costruisce dashboard e report sui risultati.

## Exam lens

- *streaming in tempo reale con elaborazione personalizzata e replay*: **Kinesis Data Streams**.
- *consegnare lo streaming a S3 o Redshift senza gestire consumatori*: **Amazon Data Firehose**.
- *SQL ad-hoc sui dati già su S3, serverless, si paga per query*: **Amazon Athena**.
- *data warehouse per query complesse su dati strutturati a scala*: **Amazon Redshift**.
- *Spark/Hadoop, big data e machine learning su cluster gestiti*: **Amazon EMR**.
- *catalogo centrale degli schemi ed ETL serverless*: **AWS Glue**.
- *magazzino unico, economico, per dati di ogni formato*: **data lake su S3**.
- *dashboard e visualizzazione*: **Amazon QuickSight**.
- La trappola: Data Streams (costruisci i consumatori, real-time, replay) contro Firehose (consegna gestita, near-real-time, niente consumatori); Athena (interroga sul posto su S3) contro Redshift (carica in un warehouse).

## Ripasso lampo

<details>
<summary>Qual è la differenza fra Kinesis Data Streams e Data Firehose?</summary>

**Data Streams** cattura lo stream in **tempo reale** e lo espone a **consumatori propri** che lo elaborano, con possibilità di **replay**: massimo controllo, bassissima latenza. **Data Firehose** **consegna** lo stream in modo **gestito** a destinazioni come S3 o Redshift in near-real-time, senza scrivere consumatori: massima semplicità. Uno dà controllo, l'altro toglie lavoro.

</details>

<details>
<summary>Quando si usa Athena e quando Redshift?</summary>

**Athena** per analisi **ad-hoc** e occasionali con SQL **direttamente su S3**, serverless, pagando per i dati scansionati. **Redshift** quando servono query **complesse e ripetute su dati strutturati a grande scala**, caricati in un **data warehouse** con prestazioni elevate e continue. Athena interroga sul posto; Redshift carica e ottimizza.

</details>

<details>
<summary>A cosa serve il Data Catalog di AWS Glue?</summary>

È il **registro centrale dei metadati** (schemi, tabelle, posizioni) del data lake: dice a servizi come Athena e Redshift Spectrum come sono fatti i dati su S3 e dove trovarli, così possono interrogarli come tabelle. Si popola a mano o con i **crawler** che deducono lo schema dai file.

</details>

<details>
<summary>Perché il data lake su S3 disaccoppia storage e calcolo?</summary>

Perché i dati restano fermi su **S3** e i motori di analisi (Athena, Redshift, EMR) li leggono senza spostarli, ciascuno quando serve. Si paga lo storage una volta e si sceglie il calcolo in base alla domanda, cambiando motore senza rifare l'archiviazione. È il contrario di un sistema in cui dati e calcolo sono legati nello stesso prodotto.

</details>

<details>
<summary>Quale servizio per elaborazioni big data con Spark o Hadoop?</summary>

**Amazon EMR**, che fornisce cluster gestiti con i framework big data (Apache Spark, Hadoop, Presto) per trasformazioni massicce, machine learning e analisi personalizzate. Athena e Redshift servono SQL; EMR serve i framework di elaborazione distribuita.

</details>

**In sintesi:** la pipeline dei dati va da ingestione (batch o streaming con Kinesis Data Streams per il real-time con consumatori propri, Data Firehose per la consegna gestita) al data lake su S3 (storage disaccoppiato dal calcolo), alla catalogazione e all'ETL con Glue, all'analisi con Athena (SQL serverless su S3), Redshift (data warehouse) o EMR (big data), fino alla visualizzazione con QuickSight.

## Fonti

- [What is Amazon Kinesis Data Streams?](https://docs.aws.amazon.com/streams/latest/dev/introduction.html) - verificato 2026-09-04
- [What is Amazon Data Firehose?](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html) - verificato 2026-09-04
- [What is AWS Glue?](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html) - verificato 2026-09-04
- [What is Amazon Athena?](https://docs.aws.amazon.com/athena/latest/ug/what-is.html) - verificato 2026-09-04
- [What is Amazon Redshift?](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html) - verificato 2026-09-04
- [What is Amazon EMR?](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html) - verificato 2026-09-04
