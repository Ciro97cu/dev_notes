# Alias

Un alias è un soprannome che si assegna a un comando Git, un modo per abbreviare i comandi più lunghi o più frequenti e digitarli con poche lettere. Come per la configurazione, un alias può essere globale, e quindi valere in tutti i repository, oppure locale a un singolo repo.

## Creare
```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.last "log -1 HEAD"
```
Da quel momento bastano `git co main`, `git st`, `git last` e così via.

## Dove finiscono
Gli alias globali vengono salvati nel file `~/.gitconfig` (sui sistemi Unix-like) o `C:\Users\<utente>\.gitconfig` (su Windows), all'interno della sezione `[alias]`. Oltre che con `git config`, si possono anche scrivere direttamente a mano:
```ini
[alias]
    co = checkout
    st = status
    last = log -1 HEAD
```
Scriverli direttamente nel file è comodo quando gli alias sono molti o piuttosto complessi.

## Locale vs globale
Senza l'opzione `--global` l'alias vale solo per il repository corrente, dove viene salvato in `.git/config`. Per le abbreviazioni di uso comune, però, si preferisce di solito la configurazione globale, così da averle a disposizione ovunque.

## Collegamenti
- [Interni di Git](12-interni-git.md) — il file `config`
