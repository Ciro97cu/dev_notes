# Tag

Un tag è un'etichetta che assegna un nome fisso e stabile a un commit. Lo si usa tipicamente per marcare le release, cioè le versioni pubblicate di un software (come `v1.0.0`). A differenza di un branch, un tag non si sposta quando arrivano nuovi commit: resta ancorato per sempre a quel preciso punto della storia. Per convenzione i nomi seguono lo schema [SemVer](15-semver.md) preceduto dal prefisso `v`, per esempio `v2.3.1`.

## Tipi
Esistono due tipi di tag. Un tag **lightweight** è poco più di un nome che punta a un commit: si crea in fretta ma non porta con sé alcun metadato. Un tag **annotated** è invece un vero oggetto Git a sé stante, che contiene autore, data, messaggio ed eventualmente una firma; proprio per questo è il tipo consigliato per le release ufficiali.

## Comandi
```bash
# creare
git tag v1.0.0                          # lightweight
git tag -a v1.0.0 -m "Release 1.0.0"    # annotated

# elencare / dettagli
git tag                                 # elenco
git show v1.0.0                         # dettagli del tag

# taggare un commit precedente
git tag -a v1.0.0 a1b2c3d -m "Release 1.0.0"

# rimpiazzare un tag esistente (force)
git tag -f v1.0.0 a1b2c3d               # ⚠️

# inviare al remoto
git push origin v1.0.0                  # un tag
git push origin --tags                  # tutti

# cancellare
git tag -d v1.0.0                       # locale
git push origin --delete v1.0.0         # remoto

# usare un tag (checkout)
git checkout v1.0.0                     # entra in detached HEAD

# confrontare versioni
git diff v1.0.0 v2.0.0
```
Non esiste un comando per rinominare un tag: lo si ottiene cancellando quello vecchio e ricreandolo con il nuovo nome.

## Collegamenti
- [SemVer](15-semver.md) — come numerare le release
- [GitHub](14-github.md) — `git push origin --tags`
- [Annullare](08-annullare.md) — detached HEAD dopo il checkout di un tag
