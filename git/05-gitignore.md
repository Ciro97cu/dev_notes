# .gitignore

Il file `.gitignore` indica a Git quali file o cartelle **non** deve tracciare, come i file temporanei, le configurazioni personali dell'ambiente o gli output di build: serve a tenere fuori dal repository tutto ciò che non ha senso versionare, evitando così di aggiungerlo per errore.

Ogni riga del file è una regola espressa come pattern. Un aspetto importante da tenere presente è che `.gitignore` agisce **solo sui file non ancora tracciati**: se un file è già stato aggiunto al repository, elencarlo qui non basta a farlo ignorare, e occorre prima rimuoverlo dal tracking come mostrato più avanti.

## Dove scrivere le regole
Le regole possono stare in tre posti diversi, a seconda di quanto devono valere. Il file `.gitignore` posto nella cartella del progetto viene versionato e condiviso con tutti i collaboratori, ed è il posto giusto per le esclusioni comuni al progetto. Il file `.git/info/exclude` contiene invece regole locali, valide solo sulla propria copia e non condivise con gli altri. Infine un file di ignore globale dell'utente permette di ignorare gli stessi file in tutti i propri progetti, tipicamente quelli generati dal proprio editor.

## Sintassi dei pattern
| Pattern | Significato |
|---------|-------------|
| riga vuota | nessun effetto (separatore visivo) |
| `# commento` | commento (per ignorare un file che inizia con `#` usare `\#`) |
| `*.log` | `*` = qualsiasi sequenza di caratteri, tranne `/` |
| `file?.txt` | `?` = un singolo carattere, tranne `/` |
| `[a-zA-Z]` | intervallo di caratteri |
| `!regola` | annulla un'esclusione precedente (re-include un file) |
| `cartella/` | la barra finale limita la regola alle sole cartelle, non ai file |
| `/file` | la barra iniziale o intermedia rende la regola relativa alla posizione del `.gitignore` |
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
Quando un file è già tracciato e lo si vuole ignorare da ora in poi, va prima aggiunto a `.gitignore` e poi rimosso dal tracking; il file rimane comunque sul disco, viene solo tolto dal controllo di versione:
```bash
git rm --cached <file>
```

## Collegamenti
- [Commit](03-commit.md)
- Ricetta pronta: [Playbook](playbook.md)
