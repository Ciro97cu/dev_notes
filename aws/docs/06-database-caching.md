# 06 · Database e caching: RDS, Aurora, DynamoDB, ElastiCache

Scegliere un database su AWS significa far combaciare il **modello di accesso** dei dati con il servizio giusto, e poi renderlo **disponibile**, **scalabile** e **veloce**. La domanda d'esame quasi mai è «quale motore», ma «quale servizio soddisfa questo access pattern senza sprecare capacità»: interrogazioni relazionali complesse spingono verso RDS o Aurora, letture per chiave a grande scala verso DynamoDB, e in entrambi i casi una cache può togliere carico e latenza. È il cuore dei task su database ad alte prestazioni (D3T3) e a costo ottimizzato (D4T3).

> [!info|label:SAA-C03 · D3T3 e D4T3, base D2T2]
> Il modulo copre *Determine high-performing database solutions* (D3T3) e *Design cost-optimized database solutions* (D4T3): relazionale contro non relazionale, Amazon RDS e Aurora, Amazon DynamoDB, caching con ElastiCache e DAX, più la distinzione fra alta disponibilità e scalabilità delle letture (base D2T2).

## Relazionale o non relazionale?

Un database **relazionale** organizza i dati in tabelle con uno schema fisso, permette interrogazioni ricche con join fra tabelle e garantisce transazioni **ACID**: è la scelta quando le relazioni fra i dati contano e servono query flessibili. Su AWS lo offrono **Amazon RDS** e **Amazon Aurora**. Un database **non relazionale** (NoSQL) rinuncia a schema rigido e join per **scalare orizzontalmente** e rispondere in **millisecondi a cifra singola** su enormi volumi, purché si acceda ai dati secondo pattern noti (tipicamente per chiave): è **Amazon DynamoDB**. La scelta non è «quale è migliore» ma «quale corrisponde a come i dati vengono letti e scritti».

## Amazon RDS: il relazionale gestito

**Amazon RDS (Relational Database Service)** esegue database relazionali gestiti (**MySQL, PostgreSQL, MariaDB, Oracle, SQL Server**): AWS si occupa di patch, backup, ripristino e infrastruttura, lasciando al cliente schema, query e dati. Due meccanismi di replica vanno tenuti **nettamente distinti**, perché sono la trappola più frequente del Domain: il **Multi-AZ** serve la disponibilità, la **Read Replica** serve la scala delle letture.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 250" role="img" aria-label="Multi-AZ contro Read Replica: il Multi-AZ tiene uno standby sincrono in un'altra AZ per il failover automatico, non leggibile e dietro un unico endpoint; la Read Replica e una copia asincrona che serve letture aggiuntive da un endpoint separato, anche cross-Region." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="db-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="18" y="40" width="332" height="196" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="370" y="40" width="332" height="196" rx="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="184" y="64" font-size="12.5" text-anchor="middle" font-weight="700">Multi-AZ · alta disponibilità</text>
    <text x="536" y="64" font-size="12.5" text-anchor="middle" font-weight="700">Read Replica · scala le letture</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5">
      <rect x="54" y="92" width="112" height="52" rx="8"/>
      <rect x="410" y="92" width="112" height="52" rx="8"/>
      <rect x="556" y="92" width="122" height="52" rx="8"/>
    </g>
    <rect x="202" y="92" width="112" height="52" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>
    <g text-anchor="middle" font-size="11">
      <text x="110" y="114">Primary</text>
      <text x="110" y="131" font-size="9" fill-opacity=".65">AZ-a</text>
      <text x="258" y="114">Standby</text>
      <text x="258" y="131" font-size="9" fill-opacity=".65">AZ-b</text>
      <text x="466" y="122">Primary</text>
      <text x="617" y="114">Read Replica</text>
      <text x="617" y="131" font-size="9" fill-opacity=".65">letture</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#db-arrow)">
      <path d="M166 118 L200 118"/>
      <path d="M522 118 L554 118"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".8">
      <text x="183" y="112">sincrona</text>
      <text x="538" y="112">asincrona</text>
    </g>
    <g font-size="9.5" fill-opacity=".78">
      <text x="54" y="176">failover automatico</text>
      <text x="54" y="193">standby non leggibile</text>
      <text x="54" y="210">un solo endpoint</text>
      <text x="410" y="176">letture dalla replica</text>
      <text x="410" y="193">scritture sul primary</text>
      <text x="410" y="210">anche cross-Region</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il <strong>Multi-AZ</strong> tiene uno standby sincrono che entra in gioco solo al failover, e non serve letture. La <strong>Read Replica</strong> è una copia asincrona pensata per assorbire traffico di lettura, e può stare in un'altra Region per il disaster recovery.</figcaption>
</figure>

In sintesi: il Multi-AZ replica in modo **sincrono** verso uno standby che **non** si legge, garantendo il failover automatico in caso di guasto dell'istanza o della zona; la Read Replica replica in modo **asincrono** verso una o più copie che **servono letture**, alleggerendo il primary, e può essere promossa a database autonomo o collocata in un'altra Region. Chiedere «alta disponibilità» significa Multi-AZ; chiedere «scalare le letture» significa Read Replica. RDS aggiunge backup automatici e snapshot per il ripristino.

## Amazon Aurora: il relazionale cloud-native

**Amazon Aurora** è il database relazionale che AWS ha riprogettato per il cloud, compatibile con **MySQL e PostgreSQL** ma con uno storage distribuito che tiene **sei copie dei dati su tre Availability Zone** e cresce da solo fino a decine di terabyte. Supporta fino a **quindici read replica** con replica veloce, offre una variante **Aurora Serverless** che scala la capacità di calcolo in automatico con il carico, e un **Global Database** che replica su più Region per bassa latitudine globale e disaster recovery. Si sceglie Aurora quando serve il relazionale ma con prestazioni e disponibilità superiori a quelle di RDS standard, accettando di restare nei due motori compatibili.

## Amazon DynamoDB: il NoSQL serverless

**Amazon DynamoDB** è un database NoSQL **key-value** completamente **serverless**: nessuna istanza da gestire, scala in automatico e risponde in **millisecondi a cifra singola** anche su tabelle enormi. Ogni elemento è individuato da una **partition key** (ed eventualmente una **sort key**), e l'accesso efficiente avviene per chiave: progettare la tabella significa progettare gli access pattern in anticipo, non normalizzare come nel relazionale.

La capacità si paga in due modi, ed è una scelta di costo del Domain 4. In modalità **on-demand** si paga per richiesta e la tabella assorbe da sé i picchi: adatta a traffico **imprevedibile o intermittente**, ed è la modalità consigliata quando non si conosce il carico. In modalità **provisioned** si dichiara una capacità di lettura e scrittura (con auto scaling): conviene per traffico **stabile e prevedibile**, dove costa meno. A completare il quadro: le **Global Tables** replicano la tabella in più Region in modalità multi-attiva; **DynamoDB Accelerator (DAX)** è una cache in memoria specifica per DynamoDB che porta le letture ai **microsecondi**; gli **Streams** espongono le modifiche per innescare elaborazioni.

## Amazon ElastiCache e il caching

Anche il database più veloce beneficia di una **cache in memoria** davanti a sé, che risponde alle letture ripetute in tempi inferiori al millisecondo e toglie carico al database. **Amazon ElastiCache** è il servizio gestito che la fornisce, con i motori **Valkey** (consigliato per i nuovi deployment), **Redis** e **Memcached**. A differenza di DAX, che serve solo DynamoDB, ElastiCache è **generico** e si mette davanti a qualsiasi fonte: RDS, DynamoDB, il risultato di un'API. Usi tipici sono lo *store* delle sessioni, le classifiche e la cache delle query più frequenti.

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 210" role="img" aria-label="Pattern di caching: l'applicazione cerca prima nella cache in memoria; se il dato c'e (hit) risponde subito, altrimenti (miss) legge dal database e riempie la cache per le richieste successive." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="ca-a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="30" y="74" width="150" height="60" rx="9"/>
      <rect x="286" y="74" width="150" height="60" rx="9"/>
      <rect x="546" y="74" width="144" height="60" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="105" y="100" font-size="12" font-weight="700">applicazione</text>
      <text x="361" y="99" font-size="12" font-weight="700">ElastiCache</text>
      <text x="361" y="116" font-size="9" fill-opacity=".7">cache in memoria</text>
      <text x="618" y="108" font-size="12" font-weight="700">database</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#ca-a)">
      <path d="M180 100 L284 100"/>
    </g>
    <path d="M436 118 L544 118" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="6 4" marker-end="url(#ca-a)"/>
    <g text-anchor="middle" font-size="9" fill-opacity=".82">
      <text x="232" y="92">cerca in cache</text>
      <text x="490" y="112">solo se miss</text>
    </g>
    <text x="360" y="168" font-size="10" text-anchor="middle" fill-opacity=".8">hit: risposta dalla cache in sub-millisecondi · miss: legge dal database e popola la cache</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Su un <em>hit</em> la cache risponde senza toccare il database; su un <em>miss</em> si legge dal database e si riempie la cache, così le richieste successive per lo stesso dato diventano immediate.</figcaption>
</figure>

## Scegliere il database

La decisione parte dal modello di accesso. Se i dati sono **relazionali** e servono query flessibili con join, si va su **RDS** (o **Aurora** quando servono più prestazioni e disponibilità). Se l'accesso è **per chiave** su grande scala con latenza minima, si va su **DynamoDB**. Poi si aggiungono i controlli ortogonali: **Multi-AZ** per l'alta disponibilità, **Read Replica** per scalare le letture relazionali, **ElastiCache** o **DAX** per abbattere latenza e carico. Oltre a questi esistono database *purpose-built* per esigenze specifiche (documentale, a grafo, time-series), che l'esame nomina ma non approfondisce.

## Exam lens

- *database ad alta disponibilità con failover automatico*: **RDS Multi-AZ**, non una read replica (lo standby non è leggibile e serve solo al failover).
- *alleggerire il primary dal traffico di lettura*: una **Read Replica** (asincrona), eventualmente cross-Region per il disaster recovery.
- *key-value a scala enorme, serverless, millisecondi*: **DynamoDB**.
- *relazionale gestito con minimo carico operativo*: **RDS**; con prestazioni e disponibilità superiori: **Aurora**.
- *ridurre la latenza delle letture ripetute o il carico sul database*: **ElastiCache** (generico) o **DAX** (solo DynamoDB).
- *traffico DynamoDB imprevedibile*: capacità **on-demand**; *stabile e prevedibile*: **provisioned**.
- *database attivo in più Region*: **DynamoDB Global Tables** o **Aurora Global Database**.
- La trappola classica: usare «read replica» per l'alta disponibilità (sbagliato, non fa failover automatico) o «Multi-AZ» per scalare le letture (sbagliato, lo standby non si legge).

## Ripasso lampo

<details>
<summary>Qual è la differenza fra RDS Multi-AZ e una Read Replica?</summary>

Il **Multi-AZ** tiene uno standby **sincrono** in un'altra AZ, **non leggibile**, che serve al **failover automatico**: è alta disponibilità. La **Read Replica** è una copia **asincrona** che **serve letture** per alleggerire il primary, può stare in un'altra Region e va promossa a mano: è scalabilità delle letture. Una dà disponibilità, l'altra scala i read.

</details>

<details>
<summary>Quando si sceglie DynamoDB al posto di RDS?</summary>

Quando l'accesso è **per chiave** su grandissima scala con latenza a millisecondi a cifra singola e uno schema flessibile, e non servono join o query relazionali complesse. DynamoDB è serverless e scala orizzontalmente da sé; RDS è la scelta quando contano relazioni, join e transazioni ACID.

</details>

<details>
<summary>On-demand o provisioned per una tabella DynamoDB con traffico imprevedibile?</summary>

**On-demand**: si paga per richiesta e la tabella assorbe i picchi senza pianificare la capacità. La modalità **provisioned** (con auto scaling) conviene invece per traffico **stabile e prevedibile**, dove costa meno a parità di volume.

</details>

<details>
<summary>Che differenza c'è fra ElastiCache e DAX?</summary>

**DAX** è una cache in memoria **specifica per DynamoDB**, integrata e write-through, che porta le letture ai microsecondi. **ElastiCache** è una cache **generica** (Valkey, Redis, Memcached) che si mette davanti a qualsiasi fonte, RDS compreso, ma richiede all'applicazione di gestire la logica di cache. Per DynamoDB si valuta DAX; per tutto il resto, ElastiCache.

</details>

<details>
<summary>Cosa rende Aurora diverso da RDS?</summary>

Aurora è il relazionale **riprogettato da AWS** per il cloud: storage distribuito con **sei copie su tre AZ**, crescita automatica, fino a **quindici read replica**, varianti Serverless e Global Database. Resta compatibile con **MySQL e PostgreSQL**, ma offre prestazioni e disponibilità superiori a RDS standard.

</details>

**In sintesi:** si sceglie il database dal modello di accesso (relazionale su RDS/Aurora, key-value su DynamoDB); RDS distingue Multi-AZ (alta disponibilità, standby sincrono non leggibile) da Read Replica (scala le letture, asincrona); Aurora è il relazionale cloud-native con sei copie su tre AZ; DynamoDB è NoSQL serverless con capacità on-demand o provisioned, Global Tables e DAX; ElastiCache mette una cache in memoria davanti a qualsiasi fonte per abbattere latenza e carico.

## Fonti

- [Amazon RDS Multi-AZ deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html) - verificato 2026-09-04
- [Working with RDS read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html) - verificato 2026-09-04
- [Amazon Aurora storage and reliability](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html) - verificato 2026-09-04
- [DynamoDB read/write capacity modes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html) - verificato 2026-09-04
- [In-memory acceleration with DynamoDB Accelerator (DAX)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html) - verificato 2026-09-04
- [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html) - verificato 2026-09-04
