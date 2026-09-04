# AWS Solutions Architect Associate

Questo vault costruisce le conoscenze necessarie per progettare architetture AWS e preparare l'esame **AWS Certified Solutions Architect - Associate (SAA-C03)**. Il percorso parte da zero, ma non riduce lo studio a un catalogo di servizi: ogni servizio entra quando risolve un requisito di sicurezza, resilienza, prestazioni o costo.

> [!info|label:Percorso completo · moduli 00-12, lab 01-12, simulatore]
> Sono disponibili **tutti i moduli (00-12), i laboratori (01-12)**, la matrice di copertura dei 14 Task Statement e il **[simulatore d'esame](exam/simulatore.md)** con domande originali scenario-based: dai fondamenti (account, identità, rete, compute, storage, database) a integrazione, resilienza, edge, dati, governance e cost optimization, ciascuno con un laboratorio pratico a costo zero. Le passate successive approfondiscono i task verso lo stato «Coperto».

## Percorso didattico

Il percorso segue una progressione da principiante, mentre la [matrice SAA-C03](exam/matrice-saa-c03.md) mantiene il collegamento esplicito con i quattro Domain ufficiali.

| Modulo | Argomento | Stato |
|---|---|---|
| 00 | [Orientamento SAA-C03](docs/00-orientamento-saa-c03.md) | Disponibile |
| 01 | [Cloud, Region e account](docs/01-cloud-region-account.md) | Disponibile |
| 02 | [IAM, credenziali temporanee e multi-account](docs/02-iam-identita-multi-account.md) | Disponibile |
| 03 | [Amazon VPC e network security](docs/03-vpc-network-security.md) | Disponibile |
| 04 | [Compute elastico: EC2, Auto Scaling e load balancing](docs/04-compute-ec2-autoscaling.md) | Disponibile |
| 05 | [Storage: S3, EBS, EFS e data lifecycle](docs/05-storage-s3-ebs-efs.md) | Disponibile |
| 06 | [Database e caching: RDS, Aurora, DynamoDB, ElastiCache](docs/06-database-caching.md) | Disponibile |
| 07 | [Integration, serverless e container](docs/07-integration-serverless-container.md) | Disponibile |
| 08 | [High availability e disaster recovery](docs/08-alta-disponibilita-disaster-recovery.md) | Disponibile |
| 09 | [Edge networking e connettività ibrida](docs/09-edge-networking-hybrid.md) | Disponibile |
| 10 | [Data ingestion e analytics](docs/10-data-ingestion-analytics.md) | Disponibile |
| 11 | [Observability, governance e Infrastructure as Code](docs/11-observability-governance-iac.md) | Disponibile |
| 12 | [Cost optimization e architecture review](docs/12-cost-optimization-architecture-review.md) | Disponibile |

## Pratica guidata

I micro-lab sono indipendenti e possono essere ripetuti senza conservare infrastruttura tra una sessione e l'altra. In parallelo crescerà una piccola applicazione di gestione ordini, già fornita, sulla quale verranno applicati progressivamente frontend statico, API, database e processi asincroni.

| Laboratorio | Modalità | Costo intenzionale |
|---|---|---|
| [LAB 01 · Bootstrap dell'account](labs/01-bootstrap-account.md) | Console + AWS CloudShell | Nessuno |
| [LAB 02 · Role e credenziali temporanee](labs/02-role-credenziali-temporanee.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 03 · VPC minima con CloudFormation](labs/03-vpc-minima-cloudformation.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 04 · Launch template e Auto Scaling](labs/04-launch-template-auto-scaling.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 05 · Bucket S3 sicuro e versionato](labs/05-bucket-s3-sicuro.md) | AWS CloudShell + CLI + CloudFormation | ~Nessuno |
| [LAB 06 · Tabella DynamoDB on-demand](labs/06-tabella-dynamodb.md) | AWS CloudShell + CLI + CloudFormation | ~Nessuno |
| [LAB 07 · Coda SQS con dead-letter queue](labs/07-coda-sqs-dlq.md) | AWS CloudShell + CLI + CloudFormation | ~Nessuno |
| [LAB 08 · Piano di backup con AWS Backup](labs/08-aws-backup-plan.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 09 · Gateway endpoint privato a S3](labs/09-vpc-gateway-endpoint.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 10 · Interrogare S3 con Athena](labs/10-athena-su-s3.md) | AWS CloudShell + CLI + CloudFormation | ~Nessuno |
| [LAB 11 · Drift detection con CloudFormation](labs/11-cloudformation-drift.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 12 · Budget di costo con AWS Budgets](labs/12-budget-di-costo.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |

Ogni laboratorio futuro dichiarerà prima dell'esecuzione la Region, le risorse create, il costo atteso, il limite temporale e il teardown. I servizi che richiedono infrastrutture costose o difficili da eliminare verranno studiati con simulazioni o negli ambienti gestiti di AWS Skill Builder.

## Fonti e aggiornamenti

La fonte che definisce il perimetro è l'[Exam Guide SAA-C03](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html). Le spiegazioni tecniche rimandano alle guide ufficiali dei singoli servizi; prezzi, Free Tier e disponibilità regionale vengono sempre trattati come dati variabili.

Il blueprint viene controllato mensilmente. Un cambiamento dell'esame non modifica automaticamente gli appunti: prima si produce una matrice delle differenze, poi si aggiorna il percorso mantenendo tracciabile la versione precedente.
