# Terminale (Mac/Linux)

Comandi base di shell per navigare e gestire file/cartelle. Servono a muoversi nel
filesystem prima e durante l'uso di Git.

## Navigazione
| Comando | Cosa fa |
|---------|---------|
| `ls` | Elenca file e cartelle |
| `ls -a` | Mostra anche i file nascosti (iniziano con `.`) |
| `ls -l` | Dettagli: permessi, proprietario, dimensione, data |
| `cd <cartella>` | Cambia directory |
| `cd ..` | Sale alla cartella superiore |
| `cd ~` | Va alla home dell'utente |
| `pwd` | Mostra il percorso completo della directory corrente |

## File e cartelle
| Comando | Cosa fa |
|---------|---------|
| `touch <file>` | Crea un file vuoto (o aggiorna la data di modifica) |
| `mkdir <cartella>` | Crea una directory |
| `mkdir -p a/b/c` | Crea anche le directory intermedie |
| `rm <file>` | Rimuove un file |
| `rm -r <cartella>` | Rimuove una cartella e il suo contenuto |
| `rm -rf <cartella>` | ⚠️ Rimuove tutto senza chiedere conferma |
| `cp <sorg> <dest>` | Copia file/cartelle |
| `cp -r <cartella> <dest>` | Copia ricorsiva |
| `mv <sorg> <dest>` | Sposta o rinomina |

## Altri utili
| Comando | Cosa fa |
|---------|---------|
| `open <file>` | Apre con l'app predefinita (solo Mac) |
| `cat <file>` | Mostra il contenuto di un file |
| `man <comando>` | Mostra il manuale di un comando |
| `Cmd + Shift + .` | Mostra file/cartelle nascosti nel Finder (Mac) |

⚠️ `rm -rf` è irreversibile: niente cestino, nessuna conferma. Controllare due volte
il percorso prima di premere Invio.

## Collegamenti
- [Introduzione](01-introduzione.md)
