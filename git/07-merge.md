# Merge

Il merge è l'operazione con cui Git unisce in un solo branch le modifiche sviluppate su due rami distinti. È il modo naturale per integrare un lavoro portato avanti in isolamento, come una feature completata sul proprio ramo che si vuole riportare dentro il branch principale.

```bash
git switch main          # branch che riceve
git merge sviluppo       # unisce "sviluppo" dentro "main"
```

## Merge commit vs Fast-forward
Un merge può concludersi in due modi diversi, a seconda di come sono messi i due branch. Si ha un **merge commit** quando i due rami hanno sviluppi separati, cioè entrambi possiedono commit che l'altro non conosce: in questo caso Git crea un nuovo commit apposito, il "merge commit", che ha due genitori e riunisce le due storie. Si ha invece un **fast-forward** quando il branch attivo non ha commit propri ed è semplicemente "dietro" rispetto all'altro: non essendoci storie divergenti da conciliare, Git si limita a far avanzare il puntatore del branch fino all'altro, senza creare alcun commit.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 185" role="img" aria-label="03-merge-ff-vs-commit" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="135" y="26" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Fast-forward</text><circle cx="50" cy="95" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="120" cy="95" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="190" cy="95" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="260" cy="95" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="50" y1="95" x2="120" y2="95" stroke="currentColor" stroke-width="1.6"/><line x1="120" y1="95" x2="190" y2="95" stroke="currentColor" stroke-width="1.6"/><line x1="190" y1="95" x2="260" y2="95" stroke="currentColor" stroke-width="1.6"/><rect x="99" y="109" width="41" height="22" rx="5" fill="var(--link,#059669)" fill-opacity=".16" stroke="currentColor" stroke-width="1.2"/><text x="120" y="124" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">main</text><text x="220" y="150" font-size="10" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">il puntatore</text><text x="220" y="164" font-size="10" text-anchor="middle" font-weight="400" opacity=".75" fill="currentColor">avanza →</text><line x1="300" y1="20" x2="300" y2="175" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/><text x="430" y="26" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">Merge commit</text><circle cx="330" cy="120" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="400" cy="120" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="470" cy="120" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="470" cy="60" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="540" cy="90" r="9" fill="var(--link,#059669)" stroke="currentColor" stroke-width="1.8"/><line x1="330" y1="120" x2="400" y2="120" stroke="currentColor" stroke-width="1.6"/><line x1="400" y1="120" x2="470" y2="120" stroke="currentColor" stroke-width="1.6"/><line x1="400" y1="120" x2="470" y2="60" stroke="currentColor" stroke-width="1.6"/><line x1="470" y1="120" x2="540" y2="90" stroke="currentColor" stroke-width="1.6"/><line x1="470" y1="60" x2="540" y2="90" stroke="currentColor" stroke-width="1.6"/><rect x="516" y="55" width="48" height="22" rx="5" fill="var(--link,#059669)" fill-opacity=".16" stroke="currentColor" stroke-width="1.2"/><text x="540" y="70" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">merge</text><rect x="379" y="133" width="41" height="22" rx="5" fill="var(--link,#059669)" fill-opacity=".16" stroke="currentColor" stroke-width="1.2"/><text x="400" y="148" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">main</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><strong>Fast-forward</strong>: <code>main</code> non ha commit propri, il puntatore avanza e basta. <strong>Merge commit</strong>: le storie divergono, Git crea un commit con <strong>due genitori</strong>.</figcaption>
</figure>

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
