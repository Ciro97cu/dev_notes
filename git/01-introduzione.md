# Introduzione a Git

## Concetto
Git è un sistema di controllo di versione distribuito (DVCS). Tiene traccia delle
modifiche ai file, permette di collaborare e di tornare a versioni precedenti.
Ogni modifica viene salvata in un repository, locale o remoto.

## Git vs GitHub
- **Git** → lo strumento di versionamento, gira sul proprio computer.
- **GitHub** → piattaforma online che ospita repository remoti Git, con funzioni
  extra: collaborazione, issue tracking, pull request, integrazioni.

Git funziona anche senza GitHub. GitHub senza Git no.

## Strumento da terminale
Git nasce come strumento da riga di comando: si interagisce scrivendo comandi
testuali (`git add`, `git commit`, `git push`). Le interfacce grafiche (GUI) sono
arrivate dopo e semplificano alcune operazioni, ma la potenza piena di Git si
esprime dal terminale.

## Configurare nome ed email
Si imposta il nome e l'email associati ai commit. Con `--global` la config vale per
tutti i repository dell'utente sulla macchina.

```bash
git config --global user.name "Mario Rossi"
git config --global user.email "mario.rossi@example.com"
```

## Collegamenti
- [Repository](02-repository.md)
- [Interni di Git](12-interni-git.md) — dove finisce la config
- [GitHub](14-github.md)
