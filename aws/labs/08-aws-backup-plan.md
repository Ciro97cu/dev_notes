# LAB 08 · Un piano di backup con AWS Backup

Questo laboratorio crea un **vault** e un **piano di backup** con **AWS Backup**, come descritto nel modulo [08](../docs/08-alta-disponibilita-disaster-recovery.md), e ne osserva la cadenza e la retention, cioè l'RPO e la finestra di conservazione. Il piano **non assegna alcuna risorsa**, quindi nessun backup viene eseguito e nessuno storage viene consumato: il costo è zero. Serve a leggere la struttura di un piano, non a produrre copie reali.

> [!info|label:SAA-C03 · D2T2]
> Esercita AWS Backup, i piani (schedule, retention, lifecycle) e il legame fra cadenza dei backup e RPO. È lo strumento con cui si centralizza la strategia Backup & Restore.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | un backup vault e un backup plan (**senza risorse assegnate**) |
| Costo intenzionale | **0 USD** (nessun backup eseguito, nessuno storage) |
| Servizi da non attivare | assegnazione di risorse al piano (avvierebbe backup fatturabili) |
| Durata indicativa | 25-30 minuti |

> [!warning|label:Nessuna BackupSelection]
> Il piano di questo laboratorio **non** include una *backup selection*, cioè non punta ad alcuna risorsa. È ciò che lo tiene a costo zero: senza risorse assegnate non parte alcun job e non si accumula storage. Assegnare un volume EBS o una tabella comincerebbe a produrre (e fatturare) recovery point. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 200" role="img" aria-label="Un backup plan con una regola giornaliera e retention di 35 giorni deposita i recovery point in un backup vault; senza risorse assegnate non viene eseguito alcun backup, quindi il costo e zero." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l8-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="40" y="52" width="240" height="96" rx="10" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <text x="160" y="76" font-size="12" text-anchor="middle" font-weight="700">backup plan</text>
    <g font-size="10" text-anchor="middle" fill-opacity=".8">
      <text x="160" y="100">regola: ogni giorno alle 03:00</text>
      <text x="160" y="120">retention: 35 giorni</text>
      <text x="160" y="138" fill-opacity=".6">(la cadenza determina l'RPO)</text>
    </g>
    <rect x="440" y="60" width="230" height="80" rx="10" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <text x="555" y="92" font-size="12" text-anchor="middle" font-weight="700">backup vault</text>
    <text x="555" y="112" font-size="9.5" text-anchor="middle" fill-opacity=".7">0 recovery point · nessuna risorsa</text>
    <path d="M280 100 L438 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#l8-arrow)"/>
    <text x="360" y="92" font-size="9" text-anchor="middle" fill-opacity=".75">depositerebbe qui</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La <strong>cadenza</strong> della regola è ciò che fissa l'RPO (ogni quanto si crea un punto di recupero); la <strong>retention</strong> dice per quanto si conservano. Senza risorse assegnate, il vault resta vuoto e il costo nullo.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare vault e piano in CloudFormation

Creare in CloudShell il file:

```yaml
# backup-lab.yaml — vault e piano AWS Backup (senza risorse assegnate)
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 08 - AWS Backup vault e plan a costo zero

Resources:
  BackupVault:
    Type: AWS::Backup::BackupVault
    Properties:
      BackupVaultName: saa-lab-vault

  BackupPlan:
    Type: AWS::Backup::BackupPlan
    Properties:
      BackupPlan:
        BackupPlanName: saa-lab-plan
        BackupPlanRule:
          - RuleName: giornaliero-35g
            TargetBackupVault: !Ref BackupVault
            ScheduleExpression: 'cron(0 3 * * ? *)'    # ogni giorno alle 03:00 UTC -> RPO ~24h
            Lifecycle:
              DeleteAfterDays: 35                       # retention

Outputs:
  PlanId:    { Value: !Ref BackupPlan }
  VaultName: { Value: !Ref BackupVault }
```

Distribuire lo stack:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-08-backup \
  --template-file backup-lab.yaml \
  --region eu-west-1 --no-cli-pager
```

## 2 · Leggere il piano: cadenza e retention

```bash
PLAN_ID=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-08-backup \
  --query "Stacks[0].Outputs[?OutputKey=='PlanId'].OutputValue" \
  --output text --no-cli-pager)

aws backup get-backup-plan --backup-plan-id "$PLAN_ID" \
  --query 'BackupPlan.Rules[].{Regola:RuleName, Cadenza:ScheduleExpression, RetentionGiorni:Lifecycle.DeleteAfterDays, Vault:TargetBackupVaultName}' \
  --output table --no-cli-pager
```

La tabella mostra la regola `giornaliero-35g`, la cadenza `cron(0 3 * * ? *)` (un punto di recupero al giorno, quindi un RPO nell'ordine delle 24 ore) e i 35 giorni di retention. È la cadenza a determinare quanto lavoro si può perdere; la retention, per quanto si conserva.

## 3 · Verificare che il vault sia vuoto

```bash
aws backup list-recovery-points-by-backup-vault \
  --backup-vault-name saa-lab-vault \
  --query 'length(RecoveryPoints)' \
  --output text --no-cli-pager
```

Il risultato deve essere `0`: nessun recovery point, perché nessuna risorsa è assegnata al piano. È la conferma pratica che il laboratorio non produce nulla di fatturabile.

## Failure drill · una lifecycle non valida

AWS Backup impone che, se si sposta un recovery point in **cold storage**, la sua cancellazione avvenga almeno **90 giorni dopo**. Provare a violare la regola è un errore controllato:

```bash
aws backup create-backup-plan --backup-plan '{
  "BackupPlanName": "saa-lab-invalido",
  "Rules": [{
    "RuleName": "regola-invalida",
    "TargetBackupVaultName": "saa-lab-vault",
    "ScheduleExpression": "cron(0 3 * * ? *)",
    "Lifecycle": { "MoveToColdStorageAfterDays": 30, "DeleteAfterDays": 35 }
  }]
}' --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (InvalidParameterValueException) when calling the CreateBackupPlan operation:
Expiration must be at least 90 days later than moving to cold storage.
```

`DeleteAfterDays: 35` con `MoveToColdStorageAfterDays: 30` viola il minimo (`30 + 90`): AWS rifiuta. Nessun piano viene creato, non c'è nulla da ripulire.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-08-backup --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-08-backup --region eu-west-1
```

Verificare che il vault non esista più:

```bash
aws backup describe-backup-vault --backup-vault-name saa-lab-vault --region eu-west-1 --no-cli-pager
```

Il comando deve fallire con un errore di risorsa inesistente: vault e piano sono spariti con lo stack. Poiché il vault era vuoto, l'eliminazione è pulita.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-08-backup` creato, vault e piano presenti |
| Piano | la regola riporta cadenza giornaliera e retention 35 giorni |
| Vault | `list-recovery-points` restituisce `0` |
| Failure drill | la lifecycle non valida restituisce `InvalidParameterValueException` |
| Teardown | stack eliminato, il vault non esiste più |

## Exam lens

- La **cadenza** dei backup fissa l'**RPO**: backup più frequenti significano meno dati persi, ma più storage. Una domanda che chiede un RPO stretto punta a una cadenza più fitta, non solo a «fare backup».
- **AWS Backup** centralizza le copie di più servizi con un piano unico: è la risposta a «backup regolari e governati» al posto di script per ogni servizio.
- Un vault deve essere **vuoto** per essere eliminato: i recovery point vanno rimossi (o scaduti) prima, un dettaglio operativo che ricorda che i backup sono dati veri con un costo.

## Fonti

- [`AWS::Backup::BackupPlan` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-backup-backupplan.html) - verificato 2026-09-04
- [`AWS::Backup::BackupVault` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-backup-backupvault.html) - verificato 2026-09-04
- [Backup plans in AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/about-backup-plans.html) - verificato 2026-09-04
- [`backup get-backup-plan` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/backup/get-backup-plan.html) - verificato 2026-09-04
