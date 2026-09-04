# Matrice di copertura SAA-C03

La matrice collega il blueprint ufficiale ai moduli e ai laboratori del vault. Serve a distinguere tre stati che altrimenti si confonderebbero: un argomento **pianificato**, una base **avviata** e una competenza realmente **coperta** da spiegazione, decisioni architetturali, pratica e ripasso.

> [!info|label:Snapshot ufficiale · SAA-C03 v1.0]
> Sono mappati tutti i **14 Task Statement** pubblicati da AWS: 3 nel Domain 1, 2 nel Domain 2, 5 nel Domain 3 e 4 nel Domain 4. I titoli inglesi sono quelli dell'Exam Guide; le sintesi italiane rielaborano le sezioni *Knowledge of* e *Skills in*. *(verificato: 2026-09-04)*

## Regola di avanzamento

Un task passa a **Coperto** soltanto quando esistono:

1. una spiegazione dei concetti necessari;
2. almeno un confronto decisionale fra soluzioni plausibili;
3. una verifica pratica o una simulazione motivata;
4. domande originali con spiegazione dei distrattori.

Allo stato attuale: **14/14 task mappati; D1T1 coperto** (M02 + LAB 02) e i **restanti 13 avviati** (M03-M10 + LAB 03-10). Nessun task resta solo pianificato; l'approfondimento verso «Coperto» procede col simulatore e le passate successive.

## Domain 1 · Design Secure Architectures — 30%

| ID e Task Statement | Conoscenze e decisioni da padroneggiare | Moduli e pratica | Stato |
|---|---|---|---|
| **D1T1 · Design secure access to AWS resources** | Shared Responsibility, least privilege, IAM e federation; scegliere utenti, gruppi, ruoli, policy, STS, resource policy, MFA, accesso cross-account, IAM Identity Center, Control Tower e SCP in base allo scenario. | M01 Cloud e account; M02 IAM, credenziali temporanee e multi-account; LAB 01 bootstrap; LAB 02 role e credenziali temporanee | **Coperto** |
| **D1T2 · Design secure workloads and applications** | Protezione delle credenziali applicative, service endpoint, porte e protocolli, threat vector e servizi di sicurezza; progettare segmentazione VPC, security group, NACL, route table, WAF, Shield, Secrets Manager, VPN e Direct Connect. | M03 VPC e network security (segmentazione, SG, NACL, endpoint); LAB 03 VPC minima; M09 Edge, WAF/Shield/Secrets Manager e VPN/Direct Connect pianificati | **Avviato** |
| **D1T3 · Determine appropriate data security controls** | Data governance, classification, retention, recovery, encryption e key management; scegliere policy di accesso, KMS, ACM/TLS, rotazione, backup e replica coerenti con compliance e lifecycle. | M02, M05 Storage, M06 Database, M08 Resilience; encryption lab pianificato | Pianificato |

## Domain 2 · Design Resilient Architectures — 26%

| ID e Task Statement | Conoscenze e decisioni da padroneggiare | Moduli e pratica | Stato |
|---|---|---|---|
| **D2T1 · Design scalable and loosely coupled architectures** | API, caching, event-driven architecture, microservices stateful/stateless, multi-tier, messaging, container, serverless, workflow e scaling; scegliere servizi purpose-built e confini che consentano ai componenti di scalare indipendentemente. | M07 Integration (SQS, SNS, EventBridge, Lambda, container, Step Functions, API Gateway); LAB 07 coda SQS; M04/M06 compute e database; progetto ordini pianificato | **Avviato** |
| **D2T2 · Design highly available and/or fault-tolerant architectures** | Global infrastructure, failover, immutable infrastructure, service quota, proxy, durability e visibility; eliminare single point of failure e scegliere Multi-AZ/Multi-Region, backup, RPO/RTO e strategia DR adatta. | M08 HA/DR (Multi-AZ, RTO/RPO, 4 strategie DR, AWS Backup, Route 53); LAB 08 AWS Backup; M01/M04-M06 fondamenti; M09 Edge | **Avviato** |

## Domain 3 · Design High-Performing Architectures — 24%

| ID e Task Statement | Conoscenze e decisioni da padroneggiare | Moduli e pratica | Stato |
|---|---|---|---|
| **D3T1 · Determine high-performing and/or scalable storage solutions** | Object, file e block storage, servizi managed e opzioni ibride; scegliere servizio e configurazione che soddisfano throughput, latenza e crescita futura. | M05 Storage (object/block/file, classi S3, EBS, EFS); LAB 05 bucket S3; FSx e opzioni ibride pianificati | **Avviato** |
| **D3T2 · Design high-performing and elastic compute solutions** | EC2, Batch, EMR, Lambda, Fargate, ECS/EKS, messaging e scaling; identificare metriche di scaling e dimensionare il compute senza accoppiare i componenti. | M04 Compute (EC2, ELB, Auto Scaling, pattern ALB+ASG); LAB 04 Auto Scaling; M07 Integration (serverless/container) pianificato | **Avviato** |
| **D3T3 · Determine high-performing database solutions** | Access pattern, engine, relational/non-relational/in-memory, capacity, IOPS, connection, proxy, cache e replica; scegliere architettura, read replica e cache in base a letture, scritture e latenza. | M06 Database (RDS Multi-AZ/Read Replica, Aurora, DynamoDB, ElastiCache/DAX); LAB 06 DynamoDB; purpose-built pianificati | **Avviato** |
| **D3T4 · Determine high-performing and/or scalable network architectures** | Subnet tier, routing, addressing, edge, load balancing e connettività privata/ibrida; progettare topologia globale o multi-tier, collocare le risorse e scegliere bilanciatore e collegamento. | M09 Edge (CloudFront, Global Accelerator, Route 53, VPN/Direct Connect, Transit Gateway); LAB 09 gateway endpoint; M03/M04 rete e compute | **Avviato** |
| **D3T5 · Determine high-performing data ingestion and transformation solutions** | Frequenza, volume, velocità, accesso sicuro, transfer, stream, transformation, analytics e visualization; scegliere ingestion, compute, data lake e formato dei dati. | M10 Data (Kinesis Streams/Firehose, S3 data lake, Glue, Athena/Redshift/EMR, QuickSight); LAB 10 Athena su S3 | **Avviato** |

## Domain 4 · Design Cost-Optimized Architectures — 20%

| ID e Task Statement | Conoscenze e decisioni da padroneggiare | Moduli e pratica | Stato |
|---|---|---|---|
| **D4T1 · Design cost-optimized storage solutions** | Storage type, tier, access pattern, lifecycle, backup, hybrid transfer e strumenti di costo; dimensionare, migrare e archiviare i dati con il servizio e il tier meno costosi che rispettano i requisiti. | M05 Storage (classi, lifecycle, tiering); LAB 05; M12 Cost e transfer ibrido pianificati | **Avviato** |
| **D4T2 · Design cost-optimized compute solutions** | Instance family/size, scaling, serverless/container, global e hybrid compute, Spot, Reserved Instances e Savings Plans; scegliere disponibilità, bilanciatore e capacità senza spreco. | M04 Compute (opzioni d'acquisto Spot/RI/Savings Plans, rightsizing); LAB 04; M07 e M12 Cost pianificati | **Avviato** |
| **D4T3 · Design cost-optimized database solutions** | Engine, tipo di database, capacity, cache, connection/proxy, retention, backup e replica; confrontare managed, serverless, relazionale e purpose-built anche nei costi di migrazione. | M06 Database (capacità on-demand/provisioned, caching, serverless); LAB 06; M12 Cost pianificato | **Avviato** |
| **D4T4 · Design cost-optimized network architectures** | NAT gateway, load balancing, DNS, peering, Transit Gateway, VPN, Direct Connect, bandwidth e data transfer; ridurre passaggi cross-AZ/Region e scegliere endpoint, CDN, route e collegamenti adatti. | M09 Edge (CDN, gateway endpoint vs NAT, VPN vs Direct Connect, data transfer); LAB 09; M03 rete; M12 Cost pianificato | **Avviato** |

## Copertura trasversale dei servizi

L'Exam Guide specifica che gli elenchi non sono esaustivi: un servizio *in scope* può apparire senza essere il centro della domanda, mentre la scelta corretta dipende sempre dal requisito. Per evitare studio frammentario, i servizi vengono raggruppati per decisione.

| Famiglia decisionale | Servizi e concetti principali | Task prevalenti |
|---|---|---|
| Identity e governance | IAM, IAM Identity Center, STS, Organizations, Control Tower, SCP, resource policy | D1T1 |
| Network security | VPC, security group, NACL, WAF, Shield, Secrets Manager, Cognito, GuardDuty, Macie | D1T2 |
| Data protection | KMS, ACM, TLS, AWS Backup, lifecycle, replication | D1T3 |
| Decoupling | SQS, SNS, EventBridge, Step Functions, API Gateway, Lambda, Fargate, ECS/EKS | D2T1, D3T2 |
| Availability e recovery | ELB, Auto Scaling, Route 53, Multi-AZ, Multi-Region, RDS Proxy, backup, RPO/RTO | D2T2 |
| Storage | S3, EBS, EFS, FSx, DataSync, Storage Gateway, Transfer Family | D3T1, D4T1 |
| Database e cache | RDS, Aurora, DynamoDB, ElastiCache e database purpose-built | D3T3, D4T3 |
| Edge e hybrid network | CloudFront, Global Accelerator, VPN, Direct Connect, PrivateLink, Transit Gateway, VPC peering | D3T4, D4T4 |
| Data pipeline | Kinesis, Glue, Athena, Lake Formation, EMR e strumenti di visualization | D3T5 |
| Cost management | Cost Explorer, AWS Budgets, Cost and Usage Report, pricing models e data transfer | D4T1-D4T4 |
| Observability e governance | CloudWatch, CloudTrail, AWS Config, Trusted Advisor, CloudFormation | trasversale (M11) |

> [!warning]
> Questa tabella non sostituisce gli elenchi ufficiali *in scope* e *out of scope*. AWS dichiara espressamente che tecnologie e servizi possono cambiare e che il blueprint non è una lista esaustiva di ogni possibile contenuto.

## Registro delle fonti

| Fonte ufficiale | Uso nella matrice | Verifica |
|---|---|---|
| [Exam Guide SAA-C03](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html) | Formato, scoring, Domain e pesi | 2026-09-04 |
| [Domain 1 · Secure](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html) | D1T1-D1T3, knowledge e skills | 2026-09-04 |
| [Domain 2 · Resilient](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain2.html) | D2T1-D2T2, knowledge e skills | 2026-09-04 |
| [Domain 3 · High-Performing](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain3.html) | D3T1-D3T5, knowledge e skills | 2026-09-04 |
| [Domain 4 · Cost-Optimized](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html) | D4T1-D4T4, knowledge e skills | 2026-09-04 |
| [In-Scope AWS Services](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-in-scope-services.html) | Controllo del perimetro dei servizi | 2026-09-04 |
| [Out-of-Scope AWS Services](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-out-of-scope-services.html) | Strumenti e servizi da non trattare come materia d'esame | 2026-09-04 |

## Controllo delle revisioni

Il controllo mensile confronta codice dell'esame, versione della guida, Domain, pesi, Task Statement e liste di servizi. Se AWS pubblica un successore di SAA-C03, il vault non cambia etichetta in modo silenzioso: si crea prima una matrice fra versione precedente e nuova, si marcano contenuti invariati, rimossi e aggiunti, poi si pianifica la migrazione.
