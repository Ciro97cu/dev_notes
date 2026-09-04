# LAB 12 · Un budget di costo con AWS Budgets

Questo laboratorio conclusivo crea un **budget di costo** con **AWS Budgets**, lo strumento di governo della spesa del modulo [12](../docs/12-cost-optimization-architecture-review.md), e ne osserva la struttura. I budget sono **gratuiti**, quindi il costo è zero. Chiude il percorso pratico tornando al tema del [LAB 01](01-bootstrap-account.md): tenere la spesa sotto controllo.

> [!info|label:SAA-C03 · D4T1-D4T4]
> Esercita AWS Budgets, la definizione di una soglia di costo e la differenza fra un budget (avvisa) e Cost Explorer (analizza). È la governance del costo come dimensione di progetto.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` (AWS Budgets è un servizio globale) |
| Risorse create | un budget di costo mensile (senza sottoscrittori) |
| Costo intenzionale | **0 USD** (i budget non hanno costo) |
| Servizi da non attivare | notifiche via SMS, azioni di budget a pagamento |
| Durata indicativa | 20-25 minuti |

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 170" role="img" aria-label="Un budget di costo mensile di 10 USD sorveglia la spesa dell'account e, superata la soglia, farebbe scattare una notifica." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="l12-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="30" y="52" width="200" height="66" rx="10" fill="var(--link,#9a4d00)" fill-opacity=".14" stroke="var(--link,#9a4d00)" stroke-width="1.6"/>
    <text x="130" y="80" font-size="12" text-anchor="middle" font-weight="700">AWS Budgets</text>
    <text x="130" y="98" font-size="9.5" text-anchor="middle" fill-opacity=".8">saa-lab-budget · 10 USD/mese</text>
    <rect x="360" y="52" width="200" height="66" rx="10" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>
    <text x="460" y="80" font-size="12" text-anchor="middle" font-weight="700">spesa dell'account</text>
    <text x="460" y="98" font-size="9.5" text-anchor="middle" fill-opacity=".72">costo mensile</text>
    <path d="M230 85 L358 85" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#l12-arrow)"/>
    <text x="294" y="77" font-size="9" text-anchor="middle" fill-opacity=".8">sorveglia</text>
    <text x="636" y="70" font-size="9" text-anchor="middle" fill-opacity=".75">notifica se supera</text>
    <path d="M560 96 L636 96" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#l12-arrow)"/>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il budget definisce una <strong>soglia</strong> di costo e la confronta con la spesa reale. In questo laboratorio non si aggiungono sottoscrittori, quindi nessuna notifica viene inviata: si osserva soltanto la struttura del budget.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Creare il budget in CloudFormation

Creare in CloudShell il file:

```yaml
# budget-lab.yaml — un budget di costo mensile
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 12 - budget di costo con AWS Budgets

Resources:
  MonthlyBudget:
    Type: AWS::Budgets::Budget
    Properties:
      Budget:
        BudgetName: saa-lab-budget
        BudgetType: COST
        TimeUnit: MONTHLY
        BudgetLimit:
          Amount: 10
          Unit: USD
```

Distribuire:

```bash
aws cloudformation deploy \
  --stack-name saa-lab-12-budget \
  --template-file budget-lab.yaml \
  --region eu-west-1 --no-cli-pager
```

## 2 · Leggere il budget

I budget sono legati all'account, quindi serve l'account ID:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --no-cli-pager)

aws budgets describe-budget \
  --account-id "$ACCOUNT_ID" \
  --budget-name saa-lab-budget \
  --query 'Budget.{Nome:BudgetName, Tipo:BudgetType, Periodo:TimeUnit, Limite:BudgetLimit.Amount, Valuta:BudgetLimit.Unit}' \
  --output table --no-cli-pager
```

La tabella mostra `saa-lab-budget`, tipo `COST`, periodo `MONTHLY`, limite `10` `USD`. Il budget confronta questa soglia con la spesa reale dell'account; per essere avvisati si aggiungerebbero uno o più sottoscrittori (email o SNS), qui omessi per restare a zero.

## Failure drill · un periodo non valido

Un budget di costo ammette periodi come `DAILY`, `MONTHLY`, `QUARTERLY` o `ANNUALLY`, non `HOURLY`. Provarlo è un errore controllato:

```bash
aws budgets create-budget \
  --account-id "$ACCOUNT_ID" \
  --budget '{
    "BudgetName": "saa-lab-orario",
    "BudgetType": "COST",
    "TimeUnit": "HOURLY",
    "BudgetLimit": { "Amount": "10", "Unit": "USD" }
  }' --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (InvalidParameterException) when calling the CreateBudget operation:
Unable to create budget: ... TimeUnit HOURLY is not supported
```

Il periodo `HOURLY` non è previsto per un budget di costo: AWS rifiuta. Nessun budget viene creato.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-12-budget --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-12-budget --region eu-west-1
```

Verificare che il budget non esista più:

```bash
aws budgets describe-budget \
  --account-id "$ACCOUNT_ID" \
  --budget-name saa-lab-budget --no-cli-pager
```

Il comando deve fallire con `NotFoundException`: il budget è sparito con lo stack. Nessuna risorsa fatturabile è mai stata creata.

> [!tip|label:Il budget «vero» resta il LAB 01]
> Questo laboratorio crea e distrugge un budget di studio. Il budget di allerta impostato nel [LAB 01](01-bootstrap-account.md) (`saa-zero-spend`) è invece pensato per **restare attivo** e sorvegliare l'account durante tutto il percorso: non va eliminato.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-12-budget` creato |
| Budget | `describe-budget` mostra tipo `COST`, periodo `MONTHLY`, limite `10 USD` |
| Failure drill | il periodo `HOURLY` restituisce un errore di parametro |
| Teardown | stack eliminato, `describe-budget` restituisce `NotFoundException` |

## Exam lens

- **AWS Budgets** **avvisa** al superamento di una soglia; **Cost Explorer** **analizza** e prevede la spesa. Una domanda che chiede di «essere notificati» punta a Budgets, una che chiede di «analizzare dove va la spesa» a Cost Explorer.
- Un budget **non blocca** la spesa: è una notifica (come già visto nel LAB 01). Per fermare davvero il consumo servono le **budget action** o, meglio, il teardown delle risorse.
- Il costo è una **dimensione di progetto**: gli strumenti di questo modulo governano ciò che le scelte architetturali dei moduli precedenti hanno determinato.

## Fonti

- [`AWS::Budgets::Budget` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-budgets-budget.html) - verificato 2026-09-04
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) - verificato 2026-09-04
- [`budgets describe-budget` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/budgets/describe-budget.html) - verificato 2026-09-04
- [`budgets create-budget` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/budgets/create-budget.html) - verificato 2026-09-04
