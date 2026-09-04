# LAB 05 · Un bucket S3 sicuro e versionato

Questo laboratorio crea un bucket **Amazon S3** con le protezioni che il modulo [05](../docs/05-storage-s3-ebs-efs.md) descrive (**Block Public Access**, **versioning**, **cifratura di default** e una **lifecycle rule**), lo popola di due versioni di un oggetto, ne osserva il comportamento e infine lo smonta. La configurazione di un bucket non ha costo; l'unica spesa sarebbe lo storage degli oggetti, qui pochi byte per pochi minuti: una frazione di centesimo, di fatto zero e ampiamente coperta dai crediti.

> [!info|label:SAA-C03 · D3T1, D4T1 e base D1T3]
> Esercita il versioning, la cifratura a riposo, il ciclo di vita e il Block Public Access di S3, e la creazione di un bucket in Infrastructure as Code. Sono i controlli su cui poggiano durabilità, costo e sicurezza dei dati a oggetti.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | un bucket S3 (config a costo zero) e due versioni di un oggetto di pochi byte |
| Costo intenzionale | **~0 USD** (pochi byte e poche richieste; frazioni di centesimo) |
| Servizi da non attivare | trasferimenti di grandi volumi, repliche cross-Region |
| Durata indicativa | 25-35 minuti |

> [!warning|label:Un bucket versionato va svuotato di TUTTE le versioni]
> Con il versioning attivo, cancellare gli oggetti «correnti» non basta: restano le **versioni precedenti** e il bucket non si elimina finché non sono rimosse anche quelle. Il teardown qui sotto le cancella esplicitamente prima di distruggere lo stack. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 220" role="img" aria-label="Un bucket S3 privato di default con quattro protezioni: Block Public Access, versioning, cifratura SSE-S3 e una lifecycle rule che sposta gli oggetti verso classi piu economiche." style="width:100%;max-width:720px;height:auto;color:inherit">
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="280" y="84" width="170" height="66" rx="9" fill="var(--link,#9a4d00)" fill-opacity=".14" stroke="var(--link,#9a4d00)" stroke-width="1.6"/>
    <text x="365" y="114" font-size="12.5" text-anchor="middle" font-weight="700">S3 bucket</text>
    <text x="365" y="132" font-size="9.5" text-anchor="middle" fill-opacity=".72">privato di default</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4">
      <rect x="40" y="28" width="196" height="40" rx="7"/>
      <rect x="494" y="28" width="186" height="40" rx="7"/>
      <rect x="40" y="166" width="196" height="40" rx="7"/>
      <rect x="474" y="166" width="206" height="40" rx="7"/>
    </g>
    <g text-anchor="middle" font-size="10.5">
      <text x="138" y="53">Block Public Access</text>
      <text x="587" y="53">Versioning</text>
      <text x="138" y="191">SSE-S3 · cifrato a riposo</text>
      <text x="577" y="191">Lifecycle → IA / Glacier</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.3">
      <path d="M236 55 L288 92"/>
      <path d="M494 55 L442 92"/>
      <path d="M236 178 L288 140"/>
      <path d="M474 178 L442 140"/>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Le quattro protezioni si dichiarano una volta nel template: il bucket nasce già privato, cifrato, versionato e con una regola di ciclo di vita.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Descrivere il bucket in CloudFormation

Creare in CloudShell il file:

```yaml
# bucket-lab.yaml — bucket S3 blindato: BPA, versioning, cifratura, lifecycle
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 05 - bucket S3 sicuro e versionato

Resources:
  DataBucket:
    Type: AWS::S3::Bucket
    Properties:                          # nessun BucketName: nome unico generato da AWS
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault: { SSEAlgorithm: AES256 }
      LifecycleConfiguration:
        Rules:
          - Id: verso-IA-poi-scadenza
            Status: Enabled
            Transitions:
              - { StorageClass: STANDARD_IA, TransitionInDays: 30 }
            ExpirationInDays: 365
      Tags: [{ Key: Project, Value: dev-notes-saa }]

Outputs:
  BucketName: { Value: !Ref DataBucket }
```

Distribuire lo stack e catturare il nome del bucket:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-05-s3 \
  --template-file bucket-lab.yaml \
  --region eu-west-1 --no-cli-pager

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-05-s3 \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text --no-cli-pager)

printf 'bucket: %s\n' "$BUCKET"
```

## 2 · Caricare due versioni dello stesso oggetto

Con il versioning attivo, caricare due volte la **stessa chiave** non sovrascrive: conserva entrambe le versioni.

```bash
printf 'versione 1\n' > nota.txt
aws s3 cp nota.txt "s3://${BUCKET}/nota.txt" --no-cli-pager

printf 'versione 2\n' > nota.txt
aws s3 cp nota.txt "s3://${BUCKET}/nota.txt" --no-cli-pager

aws s3api list-object-versions \
  --bucket "$BUCKET" \
  --query 'Versions[].{Key:Key, VersionId:VersionId, Corrente:IsLatest, Dimensione:Size}' \
  --output table --no-cli-pager
```

La tabella elenca **due** versioni della chiave `nota.txt`: una sola è `Corrente = True`, ma la precedente resta recuperabile. È la rete di sicurezza contro sovrascritture e cancellazioni accidentali.

## 3 · Verificare cifratura, lifecycle e accesso pubblico

```bash
aws s3api get-bucket-encryption --bucket "$BUCKET" --no-cli-pager
aws s3api get-bucket-lifecycle-configuration --bucket "$BUCKET" --no-cli-pager
aws s3api get-public-access-block --bucket "$BUCKET" --no-cli-pager
```

Il primo comando mostra `SSEAlgorithm: AES256` (cifratura SSE-S3 attiva). Il secondo mostra la regola che a 30 giorni sposta gli oggetti in `STANDARD_IA` e li elimina a 365. Il terzo mostra le quattro voci del Block Public Access tutte a `true`.

## Failure drill · una policy pubblica bloccata

Provare a rendere il bucket leggibile da chiunque, con una bucket policy che concede `s3:GetObject` al principal `*`. Il Block Public Access la respinge:

```bash
aws s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::${BUCKET}/*\"}]}" \
  --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (AccessDenied) when calling the PutBucketPolicy operation:
... because public policies are blocked by the BlockPublicPolicy block public access setting.
```

Il bucket resta privato: il Block Public Access ha impedito che una policy lo esponesse. Nessuna modifica è andata a segno, non c'è nulla da ripristinare.

## Teardown e verifica finale

Prima si svuotano **tutte le versioni** (obbligatorio su un bucket versionato), poi si elimina lo stack:

```bash
aws s3api delete-objects \
  --bucket "$BUCKET" \
  --delete "$(aws s3api list-object-versions \
    --bucket "$BUCKET" \
    --query '{Objects: Versions[].{Key:Key, VersionId:VersionId}}' \
    --output json)" \
  --no-cli-pager

aws cloudformation delete-stack --stack-name saa-lab-05-s3 --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-05-s3 --region eu-west-1
```

Verificare che il bucket non esista più:

```bash
aws s3api head-bucket --bucket "$BUCKET" --no-cli-pager
```

Il comando deve fallire con `Not Found`: il bucket è sparito e con lui lo stack. Nessuna risorsa fatturabile resta attiva.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-05-s3` creato, bucket con nome generato |
| Versioning | `list-object-versions` mostra **due** versioni di `nota.txt` |
| Cifratura | `get-bucket-encryption` mostra `AES256` |
| Lifecycle | regola a 30 giorni verso `STANDARD_IA`, scadenza a 365 |
| Block Public Access | le quattro voci a `true`; la bucket policy pubblica è respinta |
| Teardown | versioni cancellate, stack eliminato, `head-bucket` restituisce `Not Found` |

## Exam lens

- Un bucket è **privato di default**: renderlo pubblico è una scelta esplicita, e il **Block Public Access** è la cintura di sicurezza contro le esposizioni per errore. Una domanda su un data breach da bucket aperto punta quasi sempre lì.
- Il **versioning** protegge da sovrascritture e cancellazioni; non è un backup verso un altro luogo, ma conserva la storia dell'oggetto nello stesso bucket.
- La **lifecycle rule** è la leva di costo di S3: sposta e scade i dati da sé. Se l'access pattern è ignoto, la risposta alternativa è **Intelligent-Tiering**.
- La cifratura a riposo con **SSE-S3** è attiva senza configurazione; **SSE-KMS** entra in gioco quando servono controllo e audit sulle chiavi.

## Fonti

- [`AWS::S3::Bucket` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html) - verificato 2026-09-04
- [Blocking public access to your Amazon S3 storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) - verificato 2026-09-04
- [Using versioning in S3 buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html) - verificato 2026-09-04
- [Setting default server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-bucket-encryption.html) - verificato 2026-09-04
- [`s3api delete-objects` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/s3api/delete-objects.html) - verificato 2026-09-04
- [`s3api list-object-versions` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-object-versions.html) - verificato 2026-09-04
