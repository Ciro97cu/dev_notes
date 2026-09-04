# LAB 04 · Launch template e Auto Scaling group a costo zero

Questo laboratorio costruisce lo scheletro del compute elastico del modulo [04](../docs/04-compute-ec2-autoscaling.md): un **launch template** che descrive come lanciare un'istanza e un **Auto Scaling group** distribuito su due Availability Zone. Il gruppo nasce con **`DesiredCapacity: 0`**, quindi **non lancia alcuna istanza**: si osserva il contratto min/desired/max, la distribuzione sulle AZ e il comportamento dei limiti, senza accendere nulla di fatturabile. Il launch template, l'Auto Scaling group vuoto, la VPC e le subnet non hanno costo.

> [!info|label:SAA-C03 · D3T2 e D4T2]
> Esercita la costruzione di un launch template e di un Auto Scaling group multi-AZ, il significato di min/desired/max e la validazione dei limiti di capacità. È la base pratica del pattern «ALB + ASG» che rende un'applicazione elastica e resiliente.

## Cost guardrail

| Voce | Vincolo del laboratorio |
|---|---|
| Piano | **Free Plan**, account inizializzato nel [LAB 01](01-bootstrap-account.md) |
| Region operativa | `eu-west-1` · Europe (Ireland) |
| Risorse create | VPC, 2 subnet, launch template, Auto Scaling group **a desired 0** (nessuna istanza) |
| Costo intenzionale | **0 USD** |
| Servizi da non attivare | istanze EC2 (desired resta 0), load balancer, NAT Gateway |
| Durata indicativa | 30-40 minuti |

> [!warning|label:Perché desired resta 0]
> Portare il desired sopra zero **lancerebbe istanze EC2**, che hanno un costo e resterebbero attive. Questo laboratorio tiene `DesiredCapacity: 0` per restare a costo zero: si studia la struttura dell'Auto Scaling, non il traffico reale. Per provare lo scaling con istanze vive, farlo in una finestra breve e con costo dichiarato, o in un sandbox gestito. *(verificato: 2026-09-04)*

## Architettura

<figure style="margin:1.3rem 0;text-align:center">
<svg viewBox="0 0 720 250" role="img" aria-label="Un launch template alimenta un Auto Scaling group con min 0, desired 0 e max 2, distribuito su due subnet in due Availability Zone; con desired 0 nessuna istanza viene lanciata." style="width:100%;max-width:720px;height:auto;color:inherit">
  <defs>
    <marker id="lab4-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="currentColor"/></marker>
  </defs>
  <g font-family="system-ui,Arial,sans-serif" fill="currentColor">
    <rect x="24" y="100" width="162" height="66" rx="8" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.5"/>
    <text x="105" y="128" font-size="12" text-anchor="middle" font-weight="700">launch template</text>
    <text x="105" y="148" font-size="10" text-anchor="middle" fill-opacity=".72" font-family="ui-monospace,Menlo,monospace">t3.micro · AL2023</text>
    <rect x="224" y="46" width="470" height="184" rx="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="9 6"/>
    <text x="240" y="68" font-size="11" font-weight="700">Auto Scaling group · min 0 / desired 0 / max 2</text>
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <rect x="250" y="86" width="200" height="120" rx="9"/>
      <rect x="470" y="86" width="200" height="120" rx="9"/>
    </g>
    <g font-size="10.5" fill-opacity=".8">
      <text x="266" y="108">AZ eu-west-1a</text>
      <text x="486" y="108">AZ eu-west-1b</text>
    </g>
    <g font-size="9" fill-opacity=".6" font-family="ui-monospace,Menlo,monospace">
      <text x="266" y="124">10.30.1.0/24</text>
      <text x="486" y="124">10.30.2.0/24</text>
    </g>
    <g stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4" fill="none">
      <rect x="286" y="140" width="128" height="46" rx="7"/>
      <rect x="506" y="140" width="128" height="46" rx="7"/>
    </g>
    <g font-size="10" text-anchor="middle" fill-opacity=".6">
      <text x="350" y="168">0 istanze</text>
      <text x="570" y="168">0 istanze</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#lab4-arrow)">
      <path d="M186 132 L220 132"/>
    </g>
  </g>
</svg>
<figcaption style="font-size:.82rem;opacity:.72;margin-top:.3rem">Il gruppo conosce due AZ e sa lanciare fino a <code>max 2</code> istanze dal launch template, ma con <code>desired 0</code> non ne accende nessuna: la struttura esiste, la spesa no.</figcaption>
</figure>

## Prerequisiti

- Il [LAB 01](01-bootstrap-account.md) completato e una sessione **AWS CloudShell** come `study-admin` in `eu-west-1`.

## 1 · Descrivere il compute in CloudFormation

Creare in CloudShell il file:

```yaml
# asg-lab.yaml — launch template + Auto Scaling group a desired 0 (nessuna istanza)
AWSTemplateFormatVersion: '2010-09-09'
Description: SAA LAB 04 - launch template e Auto Scaling group multi-AZ a costo zero

Parameters:
  LatestAmi:                          # l'AMI Amazon Linux 2023 piu recente, risolta da SSM
    Type: 'AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>'
    Default: '/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64'

Resources:
  LabVpc:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.30.0.0/16
      Tags: [{ Key: Name, Value: saa-lab-asg-vpc }]

  SubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref LabVpc
      CidrBlock: 10.30.1.0/24
      AvailabilityZone: eu-west-1a
      Tags: [{ Key: Name, Value: saa-lab-asg-a }]

  SubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref LabVpc
      CidrBlock: 10.30.2.0/24
      AvailabilityZone: eu-west-1b
      Tags: [{ Key: Name, Value: saa-lab-asg-b }]

  AppLaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateName: saa-lab-lt
      LaunchTemplateData:
        ImageId: !Ref LatestAmi
        InstanceType: t3.micro

  AppAsg:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      AutoScalingGroupName: saa-lab-asg
      MinSize: '0'
      MaxSize: '2'
      DesiredCapacity: '0'            # nessuna istanza: costo zero
      VPCZoneIdentifier: [!Ref SubnetA, !Ref SubnetB]
      LaunchTemplate:
        LaunchTemplateId: !Ref AppLaunchTemplate
        Version: !GetAtt AppLaunchTemplate.LatestVersionNumber

Outputs:
  AsgName:            { Value: !Ref AppAsg }
  LaunchTemplateId:   { Value: !Ref AppLaunchTemplate }
```

L'AMI non è scritta a mano: il parametro la **risolve da SSM**, così si prende sempre l'ultima Amazon Linux 2023 senza inseguire gli ID. Distribuire lo stack (nessuna capability IAM richiesta):

```bash
aws cloudformation deploy \
  --stack-name saa-lab-04-asg \
  --template-file asg-lab.yaml \
  --region eu-west-1 \
  --no-cli-pager
```

## 2 · Osservare il contratto di capacità

```bash
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names saa-lab-asg \
  --query 'AutoScalingGroups[0].{Min:MinSize, Desired:DesiredCapacity, Max:MaxSize, AZ:AvailabilityZones, Istanze:length(Instances)}' \
  --output json --no-cli-pager
```

L'output mostra `Min 0`, `Desired 0`, `Max 2`, due Availability Zone e `Istanze: 0`. Il gruppo conosce le due AZ e sa scalare fino a due istanze, ma al momento non ne tiene nessuna. Confermare che davvero non esistono istanze del gruppo:

```bash
aws autoscaling describe-auto-scaling-instances \
  --query 'AutoScalingInstances[?AutoScalingGroupName==`saa-lab-asg`]' \
  --output json --no-cli-pager
```

Il risultato atteso è un array vuoto `[]`: nessuna istanza, nessun addebito.

## 3 · Osservare il launch template

```bash
aws ec2 describe-launch-template-versions \
  --launch-template-name saa-lab-lt \
  --versions '$Latest' \
  --query 'LaunchTemplateVersions[0].LaunchTemplateData.{AMI:ImageId, Tipo:InstanceType}' \
  --output table --no-cli-pager
```

Compaiono l'ID dell'AMI risolta e `t3.micro`: è la ricetta con cui l'Auto Scaling group creerebbe ogni istanza quando il desired sale.

## Failure drill · desired oltre il massimo

Il gruppo non permette di superare `MaxSize`. Provare a chiederglielo produce un errore controllato e, soprattutto, **non lancia istanze**:

```bash
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name saa-lab-asg \
  --desired-capacity 5 \
  --no-cli-pager
```

Il comando fallisce con un messaggio simile a:

```text
An error occurred (ValidationError) when calling the SetDesiredCapacity operation:
New SetDesiredCapacity value 5 is greater than the max size of the AutoScalingGroup, 2.
```

È il limite `max` che protegge dal lanciare più capacità (e più spesa) del previsto. Nessuna istanza viene creata: il gruppo resta a zero e non c'è nulla da ripulire.

## Teardown e verifica finale

```bash
aws cloudformation delete-stack --stack-name saa-lab-04-asg --region eu-west-1 --no-cli-pager
aws cloudformation wait stack-delete-complete --stack-name saa-lab-04-asg --region eu-west-1
```

Verificare che l'Auto Scaling group non esista più:

```bash
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names saa-lab-asg \
  --query 'AutoScalingGroups' --output text --no-cli-pager
```

L'output deve essere vuoto. Con lo stack spariscono anche launch template, VPC e subnet. Poiché il desired è sempre rimasto a zero, nessuna istanza è mai stata avviata.

## Criteri di completamento

| Controllo | Risultato richiesto |
|---|---|
| Stack | `saa-lab-04-asg` creato senza capability IAM, poi eliminato |
| Contratto | l'ASG riporta `Min 0 · Desired 0 · Max 2` su due AZ |
| Istanze | `describe-auto-scaling-instances` restituisce `[]` |
| Launch template | riporta l'AMI risolta da SSM e `t3.micro` |
| Failure drill | `set-desired-capacity 5` restituisce `ValidationError` |
| Costo | nessuna istanza EC2 avviata; teardown completato |

## Exam lens

- Un Auto Scaling group **conosce** più AZ anche quando è a zero istanze: l'alta disponibilità nasce dalla distribuzione su AZ diverse più la sostituzione automatica, non dal semplice avere «tante istanze».
- `MinSize` e `MaxSize` sono un contratto rigido: una scaling policy muove il desired **dentro** quei limiti e non può sforarli. Una domanda che chiede di «impedire più di N istanze» punta a `MaxSize`.
- Il launch template disaccoppia il *come* lanciare un'istanza dal *quante*: è ciò che permette all'ASG di ricreare istanze identiche mentre scala.

## Fonti

- [`AWS::AutoScaling::AutoScalingGroup` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-autoscaling-autoscalinggroup.html) - verificato 2026-09-04
- [`AWS::EC2::LaunchTemplate` (CloudFormation)](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-launchtemplate.html) - verificato 2026-09-04
- [`autoscaling set-desired-capacity` (AWS CLI)](https://docs.aws.amazon.com/cli/latest/reference/autoscaling/set-desired-capacity.html) - verificato 2026-09-04
- [Use an SSM parameter for the latest AMI](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ssm-parameter.html) - verificato 2026-09-04
- [Auto Scaling groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html) - verificato 2026-09-04
