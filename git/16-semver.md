# SemVer (Semantic Versioning)

## Concetto
SemVer è uno schema per numerare le versioni di un software in modo che il numero
stesso dica cosa è cambiato. Formato: **`MAJOR.MINOR.PATCH`** (es. `2.3.1`). Si usa
spesso con i [tag](11-tag.md) Git, con prefisso `v` (es. `v2.3.1`).

Fonte: [semver.org](https://semver.org/) (versione 2.0.0).

## Quando incrementare ogni numero
Dato `MAJOR.MINOR.PATCH`, si incrementa:

| Numero | Quando | Esempio |
|--------|--------|---------|
| **MAJOR** | cambiamenti **non** compatibili con le versioni precedenti (breaking) | `1.4.2 → 2.0.0` |
| **MINOR** | nuove funzionalità **compatibili** con il passato | `1.4.2 → 1.5.0` |
| **PATCH** | correzioni di bug **compatibili** con il passato | `1.4.2 → 1.4.3` |

Quando si incrementa MAJOR, MINOR e PATCH tornano a 0. Quando si incrementa MINOR,
PATCH torna a 0. (Es: `1.4.2` + breaking → `2.0.0`.)

## Versione 0.y.z (sviluppo iniziale)
`0.y.z` indica sviluppo iniziale: tutto può cambiare in qualsiasi momento, l'API
pubblica non è stabile. La versione `1.0.0` definisce l'API pubblica come stabile.

## Pre-release
Una versione di pre-rilascio si indica con un **trattino** dopo PATCH, seguito da
identificatori separati da punti: `MAJOR.MINOR.PATCH-identificatori`.
- Solo caratteri alfanumerici e trattini; nessun identificatore vuoto; i numerici
  senza zeri iniziali.
- Una pre-release ha precedenza **minore** della versione normale corrispondente.

```
1.0.0-alpha
1.0.0-alpha.1
1.0.0-0.3.7
1.0.0-beta
1.0.0-rc.1
```

## Build metadata
Si indica con un **`+`** dopo PATCH (o dopo la pre-release):
```
1.0.0+20130313144700
1.0.0-beta+exp.sha.5114f85
```
⚠️ Il build metadata viene **ignorato** nel calcolo della precedenza.

## Precedenza (ordine tra versioni)
Si confrontano nell'ordine: MAJOR, poi MINOR, poi PATCH, poi pre-release.
- MAJOR, MINOR, PATCH si confrontano come numeri: `1.0.0 < 2.0.0`.
- Una pre-release vale **meno** della versione normale: `1.0.0-alpha < 1.0.0`.
- Tra pre-release: gli identificatori numerici valgono meno di quelli non numerici;
  a parità di prefisso, l'insieme più lungo vale di più.

Esempio di ordine crescente:
```
1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

## Collegamenti
- [Tag](11-tag.md) — taggare le release con SemVer
- Spec ufficiale: https://semver.org/
