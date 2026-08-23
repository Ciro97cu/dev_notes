# Indice completo

Appunti di studio sul **terminale** e la **shell**: come muoversi nella riga di comando, capire la differenza tra bash e zsh, il filesystem, le variabili d'ambiente e il **PATH**, e — soprattutto — dove finiscono i pacchetti installati **globalmente** e perché diventano eseguibili. Otto capitoli, ognuno con un Ripasso lampo.

> Appunti personali di studio. Ambiente di riferimento: **macOS con zsh**; le differenze rilevanti con Linux e con bash sono segnalate lungo il testo. Comandi verificati sulle *man page* e sulla documentazione ufficiale.

## Capitoli

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 01 | [Cos'è il terminale](docs/01-cos-e-il-terminale.md) | Terminal emulator, shell e prompt; anatomia di una riga di comando |
| 02 | [Le shell: sh, bash, zsh](docs/02-shell-sh-bash-zsh.md) | Cos'è una shell, la famiglia POSIX, perché macOS usa zsh, differenze pratiche |
| 03 | [Navigare nel filesystem](docs/03-navigare-filesystem.md) | L'albero, `/` e `~`, path assoluti/relativi, `pwd` · `ls` · `cd` |
| 04 | [File e cartelle](docs/04-file-e-cartelle.md) | `touch` · `mkdir` · `cp` · `mv` · `rm`, wildcard, `cat` · `open` |
| 05 | [Variabili d'ambiente e PATH](docs/05-variabili-ambiente-path.md) | env var, `export`, come la shell trova un comando lungo il PATH |
| 06 | [File di configurazione della shell](docs/06-file-configurazione-shell.md) | `.zshrc`/`.bashrc`, login vs interactive, `source`, alias |
| 07 | [Installare pacchetti globali](docs/07-pacchetti-globali.md) | `npm -g` e Homebrew: dove finiscono, il PATH, perché evitare `sudo` |
| 08 | [Comandi di tutti i giorni](docs/08-comandi-di-tutti-i-giorni.md) | pipe e redirezione, `grep` · `find`, permessi, scorciatoie da tastiera |
