# .gitignore

## Concetto
`.gitignore` dice a Git quali file o cartelle **non** tracciare: file temporanei,
config personali, output di build, ecc. Evita di aggiungerli per errore al repo.

Ogni riga è una regola (pattern). Funziona **solo sui file non ancora tracciati**:
se un file è già stato aggiunto, va prima rimosso dal tracking (vedi sotto).

## Dove scrivere le regole
- `.gitignore` nella cartella del progetto → condiviso con tutti, regole comuni.
- `.git/info/exclude` → regole locali, non condivise.
- File globale dell'utente → ignora file in tutti i progetti (es. file dell'editor).

## Sintassi dei pattern
| Pattern | Significato |
|---------|-------------|
| riga vuota | nessun effetto (separatore visivo) |
| `# commento` | commento (per ignorare un file che inizia con `#` usare `\#`) |
| `*.log` | `*` = qualsiasi sequenza di caratteri, tranne `/` |
| `file?.txt` | `?` = un singolo carattere, tranne `/` |
| `[a-zA-Z]` | intervallo di caratteri |
| `!regola` | annulla un'esclusione precedente (re-include un file) |
| `cartella/` | barra finale → vale solo per le cartelle, non per i file |
| `/file` | barra iniziale o in mezzo → regola relativa alla posizione del `.gitignore` |
| `**/foo` | `foo` in qualsiasi cartella |
| `abc/**` | tutto dentro `abc`, a qualsiasi profondità |
| `a/**/b` | `b` dentro `a`, anche con sottocartelle in mezzo |

Note:
- Gli spazi finali in una riga vengono ignorati, salvo se preceduti da `\`.
- Se una cartella è già esclusa, NON si possono re-includere i file al suo interno con `!`.

## Esempi
```gitignore
# log e temporanei
*.log
*.tmp

# dipendenze
node_modules/

# build
/dist
```

## Casi comuni
File già tracciato che ora va ignorato: aggiungerlo a `.gitignore`, poi toglierlo
dal tracking (il file resta sul disco):
```bash
git rm --cached <file>
```

## Collegamenti
- [Commit](03-commit.md)
- Ricetta pronta: [Playbook](playbook.md)
