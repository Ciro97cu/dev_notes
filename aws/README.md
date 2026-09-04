# AWS Solutions Architect Associate

Questo vault costruisce le conoscenze necessarie per progettare architetture AWS e preparare l'esame **AWS Certified Solutions Architect - Associate (SAA-C03)**. Il percorso parte da zero, ma non riduce lo studio a un catalogo di servizi: ogni servizio entra quando risolve un requisito di sicurezza, resilienza, prestazioni o costo.

> [!info|label:Milestone 5 · Storage]
> Sono disponibili l'orientamento all'esame, la matrice dei 14 task statement, i moduli 00-05 e i laboratori 01-05: dopo account, identità, rete e compute, il modulo sullo storage (object/block/file, classi S3, ciclo di vita, EBS ed EFS), con il laboratorio del bucket S3 sicuro e versionato. I moduli successivi vengono pubblicati soltanto dopo verifica tecnica ed editoriale.

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
| 06 | Database e caching: RDS, Aurora, DynamoDB, ElastiCache | In preparazione |
| 07 | Integration, serverless e container | In preparazione |
| 08 | High availability e disaster recovery | In preparazione |
| 09 | Edge networking e connettività ibrida | In preparazione |
| 10 | Data ingestion e analytics | In preparazione |
| 11 | Observability, governance e Infrastructure as Code | In preparazione |
| 12 | Cost optimization e architecture review | In preparazione |

## Pratica guidata

I micro-lab sono indipendenti e possono essere ripetuti senza conservare infrastruttura tra una sessione e l'altra. In parallelo crescerà una piccola applicazione di gestione ordini, già fornita, sulla quale verranno applicati progressivamente frontend statico, API, database e processi asincroni.

| Laboratorio | Modalità | Costo intenzionale |
|---|---|---|
| [LAB 01 · Bootstrap dell'account](labs/01-bootstrap-account.md) | Console + AWS CloudShell | Nessuno |
| [LAB 02 · Role e credenziali temporanee](labs/02-role-credenziali-temporanee.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 03 · VPC minima con CloudFormation](labs/03-vpc-minima-cloudformation.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 04 · Launch template e Auto Scaling](labs/04-launch-template-auto-scaling.md) | AWS CloudShell + CLI + CloudFormation | Nessuno |
| [LAB 05 · Bucket S3 sicuro e versionato](labs/05-bucket-s3-sicuro.md) | AWS CloudShell + CLI + CloudFormation | ~Nessuno |

Ogni laboratorio futuro dichiarerà prima dell'esecuzione la Region, le risorse create, il costo atteso, il limite temporale e il teardown. I servizi che richiedono infrastrutture costose o difficili da eliminare verranno studiati con simulazioni o negli ambienti gestiti di AWS Skill Builder.

## Fonti e aggiornamenti

La fonte che definisce il perimetro è l'[Exam Guide SAA-C03](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html). Le spiegazioni tecniche rimandano alle guide ufficiali dei singoli servizi; prezzi, Free Tier e disponibilità regionale vengono sempre trattati come dati variabili.

Il blueprint viene controllato mensilmente. Un cambiamento dell'esame non modifica automaticamente gli appunti: prima si produce una matrice delle differenze, poi si aggiorna il percorso mantenendo tracciabile la versione precedente.
