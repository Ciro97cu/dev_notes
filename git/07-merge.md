# Merge

## Concetto
Il merge unisce le modifiche di due branch in uno solo. Serve a integrare il lavoro
fatto su rami separati (es. una feature dentro il branch principale).

```bash
git switch main          # branch che riceve
git merge sviluppo       # unisce "sviluppo" dentro "main"
```

## Merge commit vs Fast-forward
- **Merge commit** → i due branch hanno sviluppi separati. Git crea un nuovo commit
  ("merge commit") che unisce le due storie.
- **Fast-forward** → il branch attivo non ha commit propri ed è "dietro" all'altro.
  Git sposta solo il puntatore in avanti, senza creare un commit.

## Merge conflict
Si verifica quando le stesse righe di un file sono state cambiate in modo diverso
sui due branch. Git non sceglie da solo → conflitto da risolvere a mano.

I file in conflitto vengono marcati con `<<<<<<<`, `=======`, `>>>>>>>`. Si modifica
il file scegliendo cosa tenere, poi:
```bash
git add <file-risolto>
git commit            # completa il merge
```

## Collegamenti
- [Branch](06-branch.md)
- [Rebase](10-rebase.md) — alternativa al merge per una storia lineare
- Ricetta pronta: [Playbook](playbook.md)
