# LAB 10 · Interrogare S3 con Amazon Athena

Questo laboratorio mette in pratica la parte finale della pipeline del modulo [10](../docs/10-data-ingestion-analytics.md): un piccolo dataset su **S3**, una tabella nel **Glue Data Catalog** e una query SQL con **Amazon Athena**, tutto serverless. Athena costa per **dati scansionati** (5 USD/TB): qui si scansionano poche decine di byte, quindi una frazione di centesimo, di fatto zero.

> [!info|label:SAA-C03 · D3T5]
> Esercita il data lake su S3, la definizione di una tabella nel catalogo e l'analisi ad-hoc con Athena, senza infrastruttura. Mostra il disaccoppiamento fra dati (su S3) e motore di query (Athena).

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | un bucket S3, un workgroup Athena, una tabella nel catalogo Glue |
| Costo intenzionale | **~0 USD** (pochi byte scansionati; Glue Data Catalog in free tier) |
| Servizi da non attivare | cluster EMR, cluster Redshift, crawler ricorrenti |
| Durata indicativa | 30-40 minuti |

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 180" role="img" aria-label="Un file CSV su S3 viene descritto da una tabella nel Glue Data Catalog; Amazon Athena esegue una query SQL leggendo direttamente da S3 e scrive il risultato in una cartella dei risultati su S3." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l10-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6">
      <rect x="20" y="58" width="150" height="64" rx="9"/>
      <rect x="286" y="58" width="150" height="64" rx="9"/>
      <rect x="552" y="58" width="150" height="64" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="95" y="86" font-size="12" font-weight="700">S3</text>
      <text x="95" y="104" font-size="9" fill-opacity=".72">dati/ordini.csv</text>
      <text x="361" y="82" font-size="12" font-weight="700">Glue</text>
      <text x="361" y="100" font-size="9" fill-opacity=".72">tabella: ordini</text>
      <text x="627" y="82" font-size="12" font-weight="700">Athena</text>
      <text x="627" y="100" font-size="9" fill-opacity=".72">query SQL</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#l10-arrow)">
      <path d="M170 90 L284 90"/>
      <path d="M436 90 L550 90"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".78">
      <text x="227" y="82">descrive</text>
      <text x="493" y="82">interroga</text>
    </g>
    <path d="M627 122 L627 150" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#l10-arrow)"/>
    <text x="627" y="166" font-size="8.5" text-anchor="middle" fill-opacity=".7">risultato su S3</text>
    <text x="95" y="150" font-size="8.5" text-anchor="middle" fill-opacity=".6">i dati restano su S3</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">La tabella nel catalogo <strong>descrive</strong> il CSV su S3; Athena lo <strong>interroga sul posto</strong> e scrive l'output in una cartella dei risultati. I dati non vengono spostati né caricati in un database.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare bucket e workgroup in CloudFormation

Creare in CloudShell il file:

```yaml
# athena-lab.yaml — bucket S3 e workgroup Athena
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 10 - Athena su S3

Resources:
  DataBucket:
    Type: AWS::S3::Bucket
    Properties:
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  AthenaWorkgroup:
    Type: AWS::Athena::WorkGroup
    Properties:
      Name: saa-lab-wg
      State: ENABLED
      RecursiveDeleteOption: true        # elimina il workgroup anche con storico query
      WorkGroupConfiguration:
        ResultConfiguration:
          OutputLocation: !Sub 's3://${DataBucket}/risultati/'

Outputs:
  BucketName: { Value: !Ref DataBucket }
```

Distribuire lo stack e catturare il nome del bucket:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-10-athena \
  --template-file athena-lab.yaml \
  --region eu-west-1 --no-cli-pager

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-10-athena \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text --no-cli-pager)
```

## 2 · Caricare un piccolo dataset su S3

```bash
printf 'id,prodotto,importo\n1,mela,3\n2,pane,2\n3,mela,4\n' > ordini.csv
aws s3 cp ordini.csv "s3://${BUCKET}/dati/ordini.csv" --no-cli-pager
```

## 3 · Una funzione per eseguire le query

Le query di Athena sono **asincrone**: si avviano e si attende l'esito. Questa funzione di comodo avvia una query, aspetta che finisca e ne restituisce l'ID:

```bash
run_athena () {
  local qid state
  qid=$(aws athena start-query-execution --work-group saa-lab-wg \
    --query-string "$1" --query QueryExecutionId --output text --no-cli-pager)
  while :; do
    state=$(aws athena get-query-execution --query-execution-id "$qid" \
      --query 'QueryExecution.Status.State' --output text --no-cli-pager)
    case "$state" in
      SUCCEEDED) break ;;
      FAILED|CANCELLED) printf 'stato query: %s\n' "$state" >&2; break ;;
      *) sleep 2 ;;
    esac
  done
  printf '%s\n' "$qid"
}
```

## 4 · Creare database e tabella nel catalogo

```bash
run_athena "CREATE DATABASE IF NOT EXISTS saa_lab_db" >/dev/null

run_athena "CREATE EXTERNAL TABLE IF NOT EXISTS saa_lab_db.ordini (
  id string, prodotto string, importo int
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
LOCATION 's3://${BUCKET}/dati/'
TBLPROPERTIES ('skip.header.line.count'='1')" >/dev/null
```

La tabella `ordini` ora **descrive** il CSV su S3: colonne, tipi e posizione. Nessun dato è stato copiato; è solo metadato nel catalogo.

## 5 · Eseguire una query di aggregazione

```bash
QID=$(run_athena "SELECT prodotto, sum(importo) AS totale
                  FROM saa_lab_db.ordini
                  GROUP BY prodotto ORDER BY totale DESC")

aws athena get-query-results --query-execution-id "$QID" \
  --query 'ResultSet.Rows[].Data[].VarCharValue' \
  --output text --no-cli-pager
```

Il risultato mostra l'intestazione e poi `mela 7` e `pane 2`: Athena ha letto il CSV direttamente da S3 e aggregato con SQL, senza database da gestire.

## Failure drill · una colonna inesistente

Interrogare una colonna che non esiste manda la query in **FAILED**:

```bash
QID=$(run_athena "SELECT colonna_inesistente FROM saa_lab_db.ordini")

aws athena get-query-execution --query-execution-id "$QID" \
  --query 'QueryExecution.Status.StateChangeReason' \
  --output text --no-cli-pager
```

La funzione stampa `stato query: FAILED`, e il motivo è simile a:

```text
COLUMN_NOT_FOUND: line 1:8: Column 'colonna_inesistente' cannot be resolved
```

La query fallisce in fase di pianificazione: nulla viene scansionato oltre i metadati, nessun dato è modificato.

## Teardown e verifica finale

Prima si eliminano tabella e database dal catalogo, poi si svuota il bucket e si distrugge lo stack:

```bash
run_athena "DROP TABLE IF EXISTS saa_lab_db.ordini" >/dev/null
run_athena "DROP DATABASE IF EXISTS saa_lab_db" >/dev/null

aws s3 rm "s3://${BUCKET}" --recursive --no-cli-pager

aws cloudformation delete-stack --stack-name saa-lab-10-athena --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-10-athena --region eu-west-1
```

Verificare che il database non esista più:

```bash
aws athena get-query-results --query-execution-id \
  "$(run_athena 'SHOW DATABASES')" \
  --query 'ResultSet.Rows[].Data[].VarCharValue' --output text --no-cli-pager
```

Nell'elenco non deve comparire `saa_lab_db`. Bucket, workgroup e catalogo sono puliti; nessuna risorsa fatturabile resta attiva.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-10-athena` creato, bucket e workgroup presenti |
| Tabella | `saa_lab_db.ordini` creata nel catalogo Glue |
| Query | l'aggregazione restituisce `mela 7` e `pane 2` |
| Failure drill | la colonna inesistente manda la query in `FAILED` (`COLUMN_NOT_FOUND`) |
| Teardown | tabella e database rimossi, bucket svuotato, stack eliminato |

## Exam lens

- **Athena** interroga i dati **sul posto** su S3 senza caricarli: è la scelta per analisi ad-hoc e serverless, e si paga per i dati scansionati (partizionare e comprimere i dati riduce la spesa).
- Il **Glue Data Catalog** è ciò che rende un file su S3 una «tabella»: senza il metadato dello schema, Athena non saprebbe come leggerlo.
- Il **disaccoppiamento** è evidente: gli stessi dati su S3 potrebbero essere letti anche da Redshift Spectrum o da EMR; si sceglie il motore in base alla domanda, non si sposta il dato.

## Fonti

- [`AWS::Athena::WorkGroup` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-athena-workgroup.html) - verificato 2026-09-04
- [Creating tables in Athena](https://docs.aws.amazon.com/athena/latest/ug/creating-tables.html) - verificato 2026-09-04
- [`athena start-query-execution` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/athena/start-query-execution.html) - verificato 2026-09-04
- [`athena get-query-results` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/athena/get-query-results.html) - verificato 2026-09-04
- [AWS Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html) - verificato 2026-09-04
