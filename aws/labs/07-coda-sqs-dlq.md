# LAB 07 · Una coda SQS con dead-letter queue

Questo laboratorio crea una coda **Amazon SQS** con una **dead-letter queue** collegata, come descritto nel modulo [07](../docs/07-integration-serverless-container.md), vi invia qualche messaggio e ne osserva il ciclo: invio, ricezione (con il *visibility timeout*) e cancellazione. SQS non ha costo fisso e le poche richieste di questo laboratorio valgono frazioni di centesimo, di fatto zero.

> [!info|label:SAA-C03 · D2T1]
> Esercita il disaccoppiamento con una coda, il visibility timeout, la dead-letter queue e la redrive policy: i mattoni di un'architettura a basso accoppiamento, dove produttore e consumatore non si bloccano a vicenda.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | una coda SQS standard e la sua dead-letter queue |
| Costo intenzionale | **~0 USD** (poche richieste; SQS non ha costo fisso) |
| Servizi da non attivare | Lambda, SNS, integrazioni con altri servizi |
| Durata indicativa | 25-35 minuti |

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 220" role="img" aria-label="Un produttore invia messaggi alla coda saa-lab-orders, da cui un consumatore li preleva e li cancella; i messaggi che falliscono l'elaborazione piu di tre volte finiscono nella dead-letter queue collegata." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l7-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="24" y="40" width="130" height="52" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="89" y="71" font-size="11.5" text-anchor="middle">produttore</text>
    <rect x="256" y="36" width="180" height="60" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.7"/>
    <text x="346" y="60" font-size="11.5" text-anchor="middle" font-weight="700">saa-lab-orders</text>
    <text x="346" y="78" font-size="9" text-anchor="middle" fill-opacity=".7">coda principale</text>
    <rect x="560" y="40" width="140" height="52" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="630" y="63" font-size="11.5" text-anchor="middle">consumatore</text>
    <text x="630" y="79" font-size="9" text-anchor="middle" fill-opacity=".7">receive · delete</text>
    <rect x="256" y="150" width="180" height="48" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>
    <text x="346" y="171" font-size="11" text-anchor="middle">saa-lab-orders-dlq</text>
    <text x="346" y="187" font-size="9" text-anchor="middle" fill-opacity=".7">dead-letter queue</text>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#l7-arrow)">
      <path d="M154 66 L254 66"/>
      <path d="M436 66 L558 66"/>
      <path d="M346 96 L346 148"/>
    </g>
    <g text-anchor="middle" font-size="9" fill-opacity=".8">
      <text x="204" y="58">send-message</text>
      <text x="497" y="58">preleva · poll</text>
      <text x="430" y="126">dopo 3 tentativi falliti</text>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il produttore invia senza attendere; il consumatore preleva al proprio ritmo. Un messaggio che fallisce l'elaborazione oltre la soglia (<code>maxReceiveCount</code>) viene spostato nella dead-letter queue, dove si ispeziona senza bloccare la coda principale.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare coda e dead-letter queue in CloudFormation

Creare in CloudShell il file:

```yaml
# sqs-lab.yaml — coda SQS con dead-letter queue e redrive policy
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 07 - coda SQS con DLQ

Resources:
  DeadLetterQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: saa-lab-orders-dlq

  OrdersQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: saa-lab-orders
      VisibilityTimeout: 30              # secondi di invisibilita durante l'elaborazione
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
        maxReceiveCount: 3               # dopo 3 receive falliti, il messaggio va nella DLQ

Outputs:
  QueueUrl: { Value: !Ref OrdersQueue }
  DlqUrl:   { Value: !Ref DeadLetterQueue }
```

Distribuire lo stack e catturare l'URL della coda:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-07-sqs \
  --template-file sqs-lab.yaml \
  --region eu-west-1 --no-cli-pager

QUEUE_URL=$(aws cloudformation describe-stacks \
  --stack-name saa-lab-07-sqs \
  --query "Stacks[0].Outputs[?OutputKey=='QueueUrl'].OutputValue" \
  --output text --no-cli-pager)

printf 'coda: %s\n' "$QUEUE_URL"
```

## 2 · Inviare messaggi e contare la coda

```bash
aws sqs send-message --queue-url "$QUEUE_URL" \
  --message-body '{"orderId":"1001","amount":42}' --no-cli-pager
aws sqs send-message --queue-url "$QUEUE_URL" \
  --message-body '{"orderId":"1002","amount":17}' --no-cli-pager

aws sqs get-queue-attributes --queue-url "$QUEUE_URL" \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages' \
  --output text --no-cli-pager
```

Il conteggio deve avvicinarsi a `2`: i messaggi restano in coda ad **attendere** un consumatore. Il produttore ha già proseguito, senza sapere né aspettare chi li elaborerà.

## 3 · Prelevare ed elaborare un messaggio

Prelevare un messaggio e memorizzarne il *receipt handle*, il gettone che serve per cancellarlo:

```bash
RECEIPT=$(aws sqs receive-message --queue-url "$QUEUE_URL" \
  --query 'Messages[0].ReceiptHandle' --output text --no-cli-pager)

printf 'ricevuto (receipt handle catturato)\n'
```

Da questo momento, per i 30 secondi del visibility timeout, quel messaggio è **invisibile** agli altri consumatori: nessun altro lo elaborerà in parallelo. Portata a termine l'elaborazione, lo si cancella per confermare il completamento:

```bash
aws sqs delete-message --queue-url "$QUEUE_URL" --receipt-handle "$RECEIPT" --no-cli-pager
```

Se **non** lo si cancellasse entro il timeout, il messaggio ridiventerebbe visibile e verrebbe riprovato: è così che SQS evita di perdere lavoro quando un consumatore va in errore.

## Failure drill · oltre il limite del batch

`receive-message` preleva al massimo **dieci** messaggi per volta. Chiederne di più è un errore controllato:

```bash
aws sqs receive-message --queue-url "$QUEUE_URL" \
  --max-number-of-messages 20 --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (InvalidParameterValue) when calling the ReceiveMessage operation:
Value 20 for parameter MaxNumberOfMessages is invalid. Reason: must be between 1 and 10.
```

Il limite protegge da richieste fuori scala; nulla viene consumato o modificato.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-07-sqs --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-07-sqs --region eu-west-1
```

Verificare che la coda non esista più:

```bash
aws sqs get-queue-url --queue-name saa-lab-orders --region eu-west-1 --no-cli-pager
```

Il comando deve fallire con `AWS.SimpleQueueService.NonExistentQueue`: coda e dead-letter queue sono sparite con lo stack.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-07-sqs` creato, coda e DLQ presenti |
| Invio | `ApproximateNumberOfMessages` si avvicina a `2` |
| Ricezione | `receive-message` restituisce un messaggio e un receipt handle |
| Cancellazione | `delete-message` completa senza errore |
| Failure drill | `--max-number-of-messages 20` restituisce `InvalidParameterValue` |
| Teardown | stack eliminato, `get-queue-url` restituisce `NonExistentQueue` |

## Exam lens

- Una coda **disaccoppia**: il produttore invia e prosegue, il consumatore preleva quando può. Uno scenario in cui un picco di richieste travolge un backend sincrono si risolve mettendo **SQS** in mezzo.
- Il **visibility timeout** dà al consumatore il tempo di elaborare senza che altri tocchino lo stesso messaggio; se fallisce, il messaggio torna disponibile ed è riprovato.
- La **dead-letter queue** con `maxReceiveCount` isola i messaggi che falliscono di continuo, così un singolo messaggio malformato non blocca l'intera coda.

## Fonti

- [`AWS::SQS::Queue` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-sqs-queue.html) - verificato 2026-09-04
- [Amazon SQS dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) - verificato 2026-09-04
- [Amazon SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) - verificato 2026-09-04
- [`sqs receive-message` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/sqs/receive-message.html) - verificato 2026-09-04
- [`sqs send-message` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/sqs/send-message.html) - verificato 2026-09-04
