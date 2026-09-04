# LAB 06 · Una tabella DynamoDB on-demand

Questo laboratorio crea una tabella **Amazon DynamoDB** con chiave composta e capacità **on-demand**, come descritto nel modulo [06](../docs/06-database-caching.md), la popola di pochi elementi e mostra la differenza fra una **Query per partition key** e una **GetItem** per chiave completa. La modalità on-demand non ha costo orario o di capacità: si paga per richiesta, e qui le richieste sono una manciata su pochi byte, una frazione di centesimo, di fatto zero.

> [!info|label:SAA-C03 · D3T3 e D4T3]
> Esercita il modello key-value di DynamoDB, la chiave partition/sort, la modalità di capacità on-demand e la differenza pratica fra Query e GetItem. Sono i concetti su cui si decide quando e come usare un NoSQL serverless.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | una tabella DynamoDB **on-demand** con pochi elementi |
| Costo intenzionale | **~0 USD** (nessuna capacità provisionata; poche richieste su pochi byte) |
| Servizi da non attivare | capacità provisioned, Global Tables, DAX |
| Durata indicativa | 25-35 minuti |

> [!warning|label:On-demand, non provisioned]
> La tabella usa `BillingMode: PAY_PER_REQUEST` (on-demand): non c'è capacità da riservare né costo fisso, si paga solo per le richieste effettive. La modalità **provisioned** dichiarerebbe una capacità (e un costo) costante: qui non serve. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 220" role="img" aria-label="Una tabella DynamoDB on-demand con chiave composta pk e sk: tre elementi, due dei quali condividono la partition key prod#1; una Query per pk restituisce gli elementi di quella partition, mentre GetItem richiede pk e sk completi." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="ddb-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <text x="390" y="20" font-size="12" text-anchor="middle" font-weight="700">Tabella DynamoDB · capacità on-demand</text>
    <rect x="230" y="34" width="330" height="140" rx="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <rect x="240" y="46" width="310" height="40" rx="6" fill="var(--link,#9a4d00)" fill-opacity=".14" stroke="none"/>
    <g font-family="ui-monospace,Menlo,monospace" font-size="11">
      <text x="252" y="70">pk=prod#1 · sk=rev#a · rating 5</text>
      <text x="252" y="108">pk=prod#1 · sk=rev#b · rating 4</text>
      <text x="252" y="146">pk=prod#2 · sk=rev#a · rating 3</text>
    </g>
    <path d="M240 86 L550 86" stroke="currentColor" stroke-width="1" opacity=".3"/>
    <path d="M240 124 L550 124" stroke="currentColor" stroke-width="1" opacity=".3"/>
    <rect x="36" y="76" width="150" height="46" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="111" y="98" font-size="11" text-anchor="middle">Query</text>
    <text x="111" y="114" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" fill-opacity=".75">pk=prod#1</text>
    <path d="M186 99 L228 80" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#ddb-arrow)"/>
    <text x="390" y="200" font-size="9.5" text-anchor="middle" fill-opacity=".8">Query per partition key restituisce gli item della partition · GetItem richiede pk + sk completi</text>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">I due elementi con <code>pk=prod#1</code> stanno nella stessa partition: una <strong>Query</strong> su quella chiave li restituisce entrambi. Una <strong>GetItem</strong>, invece, individua un solo elemento e pretende <code>pk</code> e <code>sk</code> insieme.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare la tabella in CloudFormation

Creare in CloudShell il file:

```yaml
# ddb-lab.yaml — tabella DynamoDB con chiave composta, capacita on-demand
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 06 - tabella DynamoDB on-demand

Resources:
  ReviewsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: saa-lab-reviews
      BillingMode: PAY_PER_REQUEST         # on-demand: nessuna capacita da riservare
      AttributeDefinitions:
        - { AttributeName: pk, AttributeType: S }
        - { AttributeName: sk, AttributeType: S }
      KeySchema:
        - { AttributeName: pk, KeyType: HASH }    # partition key
        - { AttributeName: sk, KeyType: RANGE }   # sort key
      Tags: [{ Key: Project, Value: dev-notes-saa }]

Outputs:
  TableName: { Value: !Ref ReviewsTable }
```

Distribuire lo stack e attendere che la tabella sia attiva:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-06-ddb \
  --template-file ddb-lab.yaml \
  --region eu-west-1 --no-cli-pager

aws dynamodb wait table-exists --table-name saa-lab-reviews --region eu-west-1
```

## 2 · Inserire alcuni elementi

```bash
aws dynamodb put-item --table-name saa-lab-reviews \
  --item '{"pk":{"S":"prod#1"},"sk":{"S":"rev#a"},"rating":{"N":"5"}}' --no-cli-pager
aws dynamodb put-item --table-name saa-lab-reviews \
  --item '{"pk":{"S":"prod#1"},"sk":{"S":"rev#b"},"rating":{"N":"4"}}' --no-cli-pager
aws dynamodb put-item --table-name saa-lab-reviews \
  --item '{"pk":{"S":"prod#2"},"sk":{"S":"rev#a"},"rating":{"N":"3"}}' --no-cli-pager
```

Ogni elemento è individuato dalla coppia `pk` + `sk`. Due recensioni condividono `pk=prod#1`: appartengono alla stessa partition.

## 3 · Query per partition key

Una **Query** recupera tutti gli elementi di una partition in un colpo solo:

```bash
aws dynamodb query --table-name saa-lab-reviews \
  --key-condition-expression 'pk = :p' \
  --expression-attribute-values '{":p":{"S":"prod#1"}}' \
  --query 'Items[].{sk:sk.S, rating:rating.N}' \
  --output table --no-cli-pager
```

La tabella restituisce **due** righe (`rev#a` e `rev#b`), le recensioni di `prod#1`. È il pattern per cui DynamoDB è veloce: si legge per chiave, non si scandisce tutta la tabella.

## 4 · GetItem per chiave completa e verifica della capacità

Una **GetItem** individua un **singolo** elemento e pretende la chiave completa:

```bash
aws dynamodb get-item --table-name saa-lab-reviews \
  --key '{"pk":{"S":"prod#1"},"sk":{"S":"rev#a"}}' \
  --query 'Item.{rating:rating.N}' --output json --no-cli-pager
```

Restituisce l'unico elemento con quella coppia di chiavi. Confermare infine la modalità di capacità:

```bash
aws dynamodb describe-table --table-name saa-lab-reviews \
  --query 'Table.{Stato:TableStatus, Capacita:BillingModeSummary.BillingMode}' \
  --output table --no-cli-pager
```

`Capacita` deve riportare `PAY_PER_REQUEST`: la tabella è on-demand.

## Failure drill · GetItem senza la sort key

`GetItem` richiede la chiave **completa**. Fornire solo la partition key su una tabella a chiave composta è un errore:

```bash
aws dynamodb get-item --table-name saa-lab-reviews \
  --key '{"pk":{"S":"prod#1"}}' --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (ValidationException) when calling the GetItem operation:
The provided key element does not match the schema
```

Manca la `sk`: `GetItem` non può individuare un singolo elemento. Per recuperare tutti gli elementi che condividono solo la `pk` si usa una **Query**, come al passo 3. Nessuna scrittura avviene, non c'è nulla da ripulire.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-06-ddb --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-06-ddb --region eu-west-1
```

Verificare che la tabella non esista più:

```bash
aws dynamodb describe-table --table-name saa-lab-reviews --region eu-west-1 --no-cli-pager
```

Il comando deve fallire con `ResourceNotFoundException`: la tabella è sparita insieme allo stack. Con la modalità on-demand non restava alcuna capacità da spegnere.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-06-ddb` creato, tabella `saa-lab-reviews` attiva |
| Capacità | `describe-table` riporta `PAY_PER_REQUEST` |
| Query | `pk=prod#1` restituisce **due** elementi |
| GetItem | `pk=prod#1` + `sk=rev#a` restituisce un solo elemento |
| Failure drill | GetItem con la sola `pk` restituisce `ValidationException` |
| Teardown | stack eliminato, `describe-table` restituisce `ResourceNotFoundException` |

## Exam lens

- **Query** opera su una **partition key** e restituisce gli elementi di quella partition; **Scan** legge tutta la tabella ed è costosa: una domanda che chiede efficienza su DynamoDB spinge verso l'accesso per chiave, non verso lo scan.
- **GetItem** richiede la **chiave primaria completa** (partition più sort, se presente): un `ValidationException` sulla chiave segnala che manca un elemento della chiave.
- La modalità **on-demand** toglie la pianificazione della capacità ed è adatta a traffico imprevedibile; **provisioned** conviene solo su traffico stabile e prevedibile.

## Fonti

- [`AWS::DynamoDB::Table` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html) - verificato 2026-09-04
- [DynamoDB read/write capacity modes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html) - verificato 2026-09-04
- [`dynamodb query` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/query.html) - verificato 2026-09-04
- [`dynamodb get-item` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/get-item.html) - verificato 2026-09-04
- [Working with items in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html) - verificato 2026-09-04
