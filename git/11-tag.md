# Tag

## Concetto
Un tag assegna un nome fisso a un commit. Usato per marcare le release (es.
`v1.0.0`). Non si muove quando arrivano nuovi commit. Convenzione: [SemVer](16-semver.md)
con prefisso `v` (es. `v2.3.1`).

## Tipi
- **Lightweight** → solo un nome che punta a un commit. Veloce, senza metadati.
- **Annotated** → contiene autore, data, messaggio, firma opzionale. Consigliato per
  le release ufficiali.

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
git checkout v1.0.0                     # → entra in detached HEAD

# confrontare versioni
git diff v1.0.0 v2.0.0
```
Rinominare un tag = cancellare il vecchio e ricrearlo con il nuovo nome.

## Collegamenti
- [SemVer](16-semver.md) — come numerare le release
- [GitHub](14-github.md) — `git push origin --tags`
- [Annullare](08-annullare.md) — detached HEAD dopo il checkout di un tag
