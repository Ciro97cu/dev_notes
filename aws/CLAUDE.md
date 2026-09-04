# aws/ - regole specifiche

Vault docsify dedicato alla preparazione di **AWS Certified Solutions Architect - Associate**, attualmente **SAA-C03**. Il percorso parte da zero, mantiene la certificazione al centro e costruisce competenze pratiche trasferibili. Si applicano anche le regole comuni di [../CLAUDE.md](../CLAUDE.md).

## Fonti e accuratezza

1. **Fonti primarie obbligatorie**: Exam Guide e pagine di AWS Certification per il perimetro; AWS User Guide, Developer Guide, API/CLI Reference, Architecture Center, Well-Architected Framework e pagine Pricing/Free Tier per i dettagli.
2. **Fonti commerciali secondarie escluse**: corsi, blog di preparazione ed exam dump non determinano contenuti o risposte. Le domande d'esame del vault sono originali.
3. **Claim variabili datati**: prezzi, crediti, quote, Region supportate, interfacce della Console e stato della certificazione riportano `*(verificato: AAAA-MM-GG)*` accanto alla fonte.
4. **Nessuna falsa equivalenza**: distinguere sempre high availability da disaster recovery, durability da availability, authentication da authorization, Multi-AZ da read replica e alert di budget da hard spending cap.
5. **Matrice come contratto**: ogni modulo o laboratorio nuovo aggiorna [exam/matrice-saa-c03.md](exam/matrice-saa-c03.md), indicando i task statement coperti e lo stato reale. Non dichiarare coperto un task sulla sola base di una menzione.

## Lingua e registro

Vale la voce "professore" del root: prosa italiana narrativa, autosufficiente e impersonale, con definizione semplice prima del dettaglio. Nomi di servizi, feature, API, metriche, policy, Domain e Task Statement restano in inglese e in `backtick` quando sono costrutti tecnici.

L'esame verrà sostenuto in inglese. Alla prima occorrenza si introduce il termine inglese e se ne scioglie il significato in italiano; non si inventano traduzioni che renderebbero irriconoscibile il lessico dell'Exam Guide.

## Linea didattica

- **Requirement-first**: si parte dal requisito e dai vincoli, poi si confrontano le alternative AWS. Un servizio non viene presentato come una scheda isolata.
- **Trade-off espliciti**: ogni scelta importante chiarisce che cosa migliora, che cosa costa e in quale scenario smette di essere adatta.
- **Exam lens**: il capitolo evidenzia i segnali linguistici che distinguono risposte plausibili, senza promettere scorciatoie o usare domande reali trafugate.
- **Una fonte di verità**: un meccanismo viene spiegato per esteso in un solo modulo; gli altri punti rimandano a quello.
- **Progressione da zero**: rete, identità, crittografia, sistemi distribuiti e costi si introducono prima di usarli come prerequisiti.

## Visual-first

Architetture, confini di responsabilità, scope global/Regional/zonal, flussi di rete, replica e failover richiedono una rappresentazione visiva. Si usa:

- SVG inline per topologie, confini, confronti spaziali e flussi compatti;
- Mermaid per sequenze e grafi non banali;
- tabelle soltanto per confronti realmente tabulari.

Gli SVG usano `currentColor`, `var(--bg)` e `var(--link)`, poche etichette e una `figcaption` esplicativa. Non si copiano diagrammi o icone proprietarie: si costruiscono schemi originali con forme e nomi dei servizi. Ogni SVG non banale si valida e si ispeziona con `python3 scripts/svg-preview.py`.

## Struttura

```text
README.md                 indice e stato del percorso
_coverpage.md             copertina "architecture blueprint"
_sidebar.md               sole pagine realmente disponibili
docs/                     moduli teorici NN-kebab-italiano.md
exam/matrice-saa-c03.md   copertura ufficiale e registro fonti
labs/                     laboratori NN-kebab-italiano.md
project/                  applicazione ordini progressiva (quando disponibile)
assets/                   configurazione, stile e immagini
index.html                app docsify zero-build
```

I moduli pianificati restano nel `README.md` come "In preparazione", senza link. La sidebar non deve puntare a file inesistenti.

## Template di un modulo

```markdown
# NN · <Titolo>

<Definizione semplice e utilità architetturale.>

> [!info|label:SAA-C03 · DnTm]
> <Task statement e motivo della pertinenza.>

## <Problema o concetto>

<Prosa, decisioni e trade-off.>

<figure>... SVG ...<figcaption>...</figcaption></figure>

## Exam lens

<Segnali nel requisito, alternativa corretta e distrattori motivati.>

## Ripasso lampo

<details>
<summary><domanda con eventuale <code>keyword</code>></summary>

<risposta concisa ma motivata>

</details>

**In sintesi:** <2-4 punti realmente riepilogativi.>

## Fonti

- [Titolo ufficiale AWS](URL) - verificato AAAA-MM-GG
```

## Protocollo dei laboratori

Ogni laboratorio dichiara e rispetta questo ordine:

1. **Obiettivo e task SAA-C03**.
2. **Architettura** con diagramma originale.
3. **Cost guardrail**: piano AWS richiesto, Region, risorse, prezzo da verificare e tempo massimo.
4. **Prerequisiti** e convenzioni di naming/tag.
5. **Console** per osservare relazioni e configurazioni.
6. **AWS CLI** per interrogare e verificare lo stato.
7. **CloudFormation** per rendere ripetibile lo scenario, quando il servizio è supportato e l'automazione ha valore didattico.
8. **Expected result** con output o proprietà verificabili.
9. **Failure drill** sicuro, reversibile e intenzionale.
10. **Teardown** obbligatorio, seguito da una verifica che non restino risorse fatturabili.

Il bootstrap dell'account è l'eccezione naturale: identità root, MFA e impostazioni iniziali non vengono forzate dentro CloudFormation.

### Guardrail duri

- Region predefinita dei lab: `eu-west-1`; per servizi globali si dichiara esplicitamente che la Region non governa la risorsa.
- Prefisso risorse: `saa-lab-`; tag minimi quando supportati: `Project=dev-notes-saa`, `Environment=lab`, `ManagedBy=cloudformation` per risorse di stack.
- Non si creano access key del root e non si pubblicano password, token, account ID, ARN personali o output contenenti credenziali.
- Non si usa `aws configure` con credenziali statiche come percorso predefinito. CloudShell viene prima; il terminale locale usa in seguito credenziali temporanee.
- Un comando distruttivo o fatturabile è preceduto da un `> [!warning]` che descrive esattamente effetto e costo.
- Ogni comando viene verificato sull'AWS CLI Command Reference. Placeholder come `<ACCOUNT_ID>` sono dichiarati e non vengono presentati come testo da copiare letteralmente.
- NAT Gateway, load balancer, RDS Multi-AZ, ambienti multi-Region, Direct Connect, Transit Gateway ed EKS non restano attivi per esercizio: si simulano, si eseguono per una finestra breve con costo esplicito o si demandano a un sandbox gestito.

## Domande e simulatore

Il **Ripasso lampo** verifica il capitolo con `<details>` nativi. Le domande scenario-based appartengono invece a set separati: una risposta corretta o più risposte corrette, requisiti non ambigui e spiegazione di ogni distrattore.

Il simulatore client-side verrà introdotto soltanto dopo la revisione dei contenuti teorici. Il suo risultato sarà dichiarato "punteggio didattico": non replicherà né predirà lo scaled score AWS.

## Checklist di manutenzione

- [ ] Fonte ufficiale e data di verifica per ogni claim non ovvio o variabile.
- [ ] Task statement aggiornati nella matrice.
- [ ] Diagramma presente dove il concetto è spaziale e verificato in WebKit.
- [ ] Lab con costo, expected result, failure drill e teardown.
- [ ] Link aggiunto a `_sidebar.md` e `README.md` solo quando il file esiste.
- [ ] Quiz originali, senza contenuto proveniente da exam dump.
