# LAB 11 · Drift detection con CloudFormation

Questo laboratorio mostra il **drift detection** del modulo [11](../docs/11-observability-governance-iac.md): si crea uno stack, lo si verifica **allineato** al template, poi si cambia una risorsa **a mano** e si osserva CloudFormation segnalarla come **modificata**. Le risorse dello stack (un topic SNS e una coda SQS, a riposo) non hanno costo: il laboratorio è a zero.

> [!info|label:SAA-C03 · capacità trasversali]
> Esercita l'Infrastructure as Code, il concetto di stack come stato desiderato e il drift detection che scopre le modifiche manuali fuori dal template. È la governance della riproducibilità dell'infrastruttura.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | un topic SNS e una coda SQS (a riposo, senza messaggi) |
| Costo intenzionale | **0 USD** (nessun messaggio, nessuna sottoscrizione) |
| Servizi da non attivare | invii di messaggi, sottoscrizioni a pagamento (SMS) |
| Durata indicativa | 25-30 minuti |

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 190" role="img" aria-label="Un template crea uno stack con un topic SNS e una coda SQS; una modifica manuale al DisplayName del topic fa si che il drift detection segnali il topic come MODIFIED." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l11-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="24" y="60" width="150" height="60" rx="9" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="99" y="86" font-size="11.5" text-anchor="middle" font-weight="700">template</text>
    <text x="99" y="103" font-size="9" text-anchor="middle" fill-opacity=".72">stato desiderato</text>
    <rect x="286" y="40" width="180" height="100" rx="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="8 5"/>
    <text x="376" y="60" font-size="10.5" text-anchor="middle" font-weight="700">stack</text>
    <g fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.4" text-anchor="middle" font-size="10">
      <rect x="300" y="74" width="152" height="26" rx="5"/><text x="376" y="91">SNS topic</text>
      <rect x="300" y="106" width="152" height="26" rx="5"/><text x="376" y="123">SQS queue</text>
    </g>
    <rect x="560" y="70" width="140" height="46" rx="8" fill="var(--link,#9a4d00)" fill-opacity=".14" stroke="var(--link,#9a4d00)" stroke-width="1.5"/>
    <text x="630" y="90" font-size="10.5" text-anchor="middle" font-weight="700">drift detection</text>
    <text x="630" y="106" font-size="9" text-anchor="middle" fill-opacity=".8">topic: MODIFIED</text>
    <path d="M174 90 L284 90" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#l11-arrow)"/>
    <text x="229" y="82" font-size="9" text-anchor="middle" fill-opacity=".8">crea</text>
    <path d="M466 90 L558 90" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#l11-arrow)"/>
    <text x="376" y="164" font-size="9" text-anchor="middle" fill-opacity=".8">modifica manuale al DisplayName del topic → drift</text>
    <path d="M376 140 L376 152" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Finché nessuno tocca le risorse fuori dal template, lo stack è <code>IN_SYNC</code>. Una modifica manuale al topic lo porta a <code>DRIFTED</code>, e il drift detection indica quale risorsa è cambiata.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare lo stack

Creare in CloudShell il file:

```yaml
# drift-lab.yaml — un topic SNS e una coda SQS
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 11 - drift detection

Resources:
  Topic:
    Type: AWS::SNS::Topic
    Properties:
      DisplayName: nome-originale

  Queue:
    Type: AWS::SQS::Queue

Outputs:
  TopicArn: { Value: !Ref Topic }
```

Distribuire:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-11-drift \
  --template-file drift-lab.yaml \
  --region eu-west-1 --no-cli-pager
```

## 2 · Una funzione per il drift detection

Anche il drift detection è **asincrono**: si avvia e si attende. Questa funzione lo esegue e restituisce l'esito (`IN_SYNC` o `DRIFTED`):

```bash
detect_drift () {
  local did status
  did=$(aws cloudformation detect-stack-drift --stack-name saa-lab-11-drift \
    --query StackDriftDetectionId --output text --no-cli-pager)
  while :; do
    status=$(aws cloudformation describe-stack-drift-detection-status \
      --stack-drift-detection-id "$did" \
      --query DetectionStatus --output text --no-cli-pager)
    case "$status" in
      DETECTION_COMPLETE) break ;;
      DETECTION_FAILED) printf 'rilevamento fallito\n' >&2; return 1 ;;
      *) sleep 3 ;;
    esac
  done
  aws cloudformation describe-stack-drift-detection-status \
    --stack-drift-detection-id "$did" \
    --query StackDriftStatus --output text --no-cli-pager
}
```

## 3 · Verificare che lo stack sia allineato

```bash
detect_drift
```

Appena creato, lo stack riflette il template: l'esito è `IN_SYNC`. Nessuna risorsa è stata toccata fuori da CloudFormation.

## 4 · Cambiare una risorsa a mano e rilevare il drift

Modificare il `DisplayName` del topic **direttamente**, come se qualcuno lo cambiasse dalla Console, aggirando il template:

```bash
TOPIC_ARN=$(aws cloudformation describe-stacks --stack-name saa-lab-11-drift \
  --query "Stacks[0].Outputs[?OutputKey=='TopicArn'].OutputValue" \
  --output text --no-cli-pager)

aws sns set-topic-attributes --topic-arn "$TOPIC_ARN" \
  --attribute-name DisplayName --attribute-value cambiato-a-mano --no-cli-pager

detect_drift
```

Ora l'esito è `DRIFTED`: lo stato reale si è allontanato dal template. Vedere **quale** risorsa è cambiata:

```bash
aws cloudformation describe-stack-resource-drifts \
  --stack-name saa-lab-11-drift \
  --stack-resource-drift-status-filters MODIFIED \
  --query 'StackResourceDrifts[].{Risorsa:LogicalResourceId, Tipo:ResourceType, Stato:StackResourceDriftStatus}' \
  --output table --no-cli-pager
```

La tabella indica la risorsa `Topic` (`AWS::SNS::Topic`) come `MODIFIED`: il drift detection ha scoperto la modifica fatta fuori dal template.

## Failure drill · ricreare uno stack che esiste già

Uno stack è identificato dal nome: ricrearne uno con lo stesso nome è un errore controllato.

```bash
aws cloudformation create-stack --stack-name saa-lab-11-drift \
  --template-body file://drift-lab.yaml \
  --region eu-west-1 --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (AlreadyExistsException) when calling the CreateStack operation:
Stack [saa-lab-11-drift] already exists
```

Per cambiare uno stack esistente si usa `deploy`/`update-stack`, non `create-stack`. Nulla viene creato in doppio.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-11-drift --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-11-drift --region eu-west-1
```

Verificare che lo stack non esista più:

```bash
aws cloudformation describe-stacks --stack-name saa-lab-11-drift --region eu-west-1 --no-cli-pager
```

Il comando deve fallire con `does not exist`: topic e coda sono spariti con lo stack. Nessuna risorsa fatturabile è mai stata attiva.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-11-drift` creato con topic e coda |
| Allineamento | `detect_drift` restituisce `IN_SYNC` appena creato |
| Drift | dopo la modifica manuale, `detect_drift` restituisce `DRIFTED` |
| Risorsa | `describe-stack-resource-drifts` mostra `Topic` come `MODIFIED` |
| Failure drill | `create-stack` sullo stesso nome restituisce `AlreadyExistsException` |
| Teardown | stack eliminato, `describe-stacks` restituisce `does not exist` |

## Exam lens

- Il **drift** è il divario fra lo stato desiderato (il template) e quello reale: nasce dalle modifiche manuali, che l'Infrastructure as Code scoraggia proprio perché rendono l'infrastruttura non riproducibile.
- Uno **stack** si gestisce come un'unità: create/update/delete valgono per l'insieme delle risorse, non per la singola.
- L'IaC porta l'infrastruttura sotto **controllo di versione e revisione** come il codice: è la risposta a «ripetibile, verificabile, tracciabile».

## Fonti

- [Detecting unmanaged configuration changes (drift)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html) - verificato 2026-09-04
- [`cloudformation detect-stack-drift` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/detect-stack-drift.html) - verificato 2026-09-04
- [`cloudformation describe-stack-resource-drifts` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stack-resource-drifts.html) - verificato 2026-09-04
- [AWS CloudFormation stacks](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html) - verificato 2026-09-04
