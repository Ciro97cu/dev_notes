# Alias

## Concetto
Un alias è un soprannome per un comando Git. Abbrevia comandi lunghi o frequenti.
Può essere globale (tutti i repo) o locale (un solo repo).

## Creare
```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.last "log -1 HEAD"
```
Poi: `git co main`, `git st`, `git last`, ...

## Dove finiscono
Gli alias globali stanno nel file `~/.gitconfig` (Unix-like) o
`C:\Users\<utente>\.gitconfig` (Windows), nella sezione `[alias]`. Si possono
scrivere anche a mano:
```ini
[alias]
    co = checkout
    st = status
    last = log -1 HEAD
```
Comodo quando si gestiscono molti alias o alias complessi.

## Locale vs globale
Senza `--global` l'alias vale solo per il repo corrente (salvato in `.git/config`).
Per le abbreviazioni di uso comune si preferisce di solito la config globale.

## Collegamenti
- [Interni di Git](12-interni-git.md) — il file `config`
