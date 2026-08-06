# Merge

## Concetto
Il merge è l'operazione con cui Git unisce in un solo branch le modifiche sviluppate su due rami distinti. È il modo naturale per integrare un lavoro portato avanti in isolamento, come una feature completata sul proprio ramo che si vuole riportare dentro il branch principale.

```bash
git switch main          # branch che riceve
git merge sviluppo       # unisce "sviluppo" dentro "main"
```

## Merge commit vs Fast-forward
Un merge può concludersi in due modi diversi, a seconda di come sono messi i due branch. Si ha un **merge commit** quando i due rami hanno sviluppi separati, cioè entrambi possiedono commit che l'altro non conosce: in questo caso Git crea un nuovo commit apposito, il "merge commit", che ha due genitori e riunisce le due storie. Si ha invece un **fast-forward** quando il branch attivo non ha commit propri ed è semplicemente "dietro" rispetto all'altro: non essendoci storie divergenti da conciliare, Git si limita a far avanzare il puntatore del branch fino all'altro, senza creare alcun commit.

## Merge conflict
Un merge conflict si verifica quando le stesse righe di un file sono state modificate in modo diverso sui due branch. Git non può decidere da solo quale versione sia quella giusta, così invece di scegliere a caso si ferma e segnala un conflitto che va risolto a mano.

I punti in conflitto vengono marcati dentro il file con `<<<<<<<`, `=======` e `>>>>>>>`, che delimitano le due versioni contrapposte. Si modifica il file scegliendo cosa tenere e rimuovendo i marcatori, poi si completa il merge:
```bash
git add <file-risolto>
git commit            # completa il merge
```

## Collegamenti
- [Branch](06-branch.md)
- [Rebase](10-rebase.md) — alternativa al merge per una storia lineare
- Ricetta pronta: [Playbook](playbook.md)
