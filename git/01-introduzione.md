# Introduzione a Git

Git è un sistema di controllo di versione **distribuito** (DVCS, *Distributed Version Control System*): uno strumento che registra l'evoluzione di un progetto nel tempo, tenendo traccia di ogni modifica ai file. Grazie a questa storia si può tornare a una versione precedente, capire chi ha cambiato cosa e quando, e lavorare in più persone sullo stesso codice senza sovrascriversi a vicenda. La parola "distribuito" è il cuore della faccenda: ogni copia del progetto è un repository completo, con l'intera storia dentro di sé. Non esiste quindi un unico server indispensabile, si lavora anche offline, e il proprio computer contiene già tutto il necessario per consultare il passato e creare nuove versioni.

## Git vs GitHub
Git e GitHub vengono spesso confusi, ma sono due cose distinte. **Git** è lo strumento di versionamento vero e proprio e gira sul proprio computer: è lui a registrare i commit e a custodire la storia del progetto. **GitHub** è invece una piattaforma online che *ospita* i repository Git remoti e vi costruisce sopra dei servizi di collaborazione, come l'issue tracking, le pull request, la revisione del codice e le integrazioni automatiche. In altre parole Git è il motore, mentre GitHub è uno dei tanti posti dove parcheggiare e condividere ciò che quel motore produce: Git funziona benissimo anche senza GitHub, mentre GitHub senza Git non avrebbe ragione di esistere. Allo stesso ruolo di GitHub rispondono anche alternative equivalenti come GitLab e Bitbucket.

## Strumento da terminale
Git nasce come strumento da **riga di comando**: ci si interagisce scrivendo comandi testuali come `git add`, `git commit` e `git push`. Le interfacce grafiche (quelle integrate negli editor o nelle app dedicate) sono arrivate in un secondo momento e rendono comode le operazioni di tutti i giorni, ma sono soltanto un guscio costruito sopra gli stessi comandi. La potenza piena di Git, e soprattutto la comprensione di cosa stia realmente accadendo, si raggiungono dal terminale: è lì che questi appunti ragioneranno. Le basi del terminale in sé — muoversi tra le cartelle, capire la shell (bash/zsh), il PATH — sono raccolte nel vault dedicato <a href="../terminale/" target="_blank" rel="noopener">Terminale</a>.

## Configurare nome ed email
Prima di registrare qualsiasi commit conviene dire a Git chi ne è l'autore, perché ogni commit porta con sé un nome e un'email che restano incisi per sempre nella storia del progetto. Questa email ha un ruolo preciso e limitato: è l'**etichetta di attribuzione** del commit, quella con cui una piattaforma come GitHub riconosce *chi* l'ha scritto (avatar, link al profilo, grafico dei contributi). Non ha invece nulla a che vedere con i **permessi**: poter fare `push` dipende dalle credenziali, cioè da una <a href="../glossario/#/docs/ssh" target="_blank" rel="noopener">chiave SSH</a> o da un token, non dall'email. Sono due cose separate: l'email dice *chi ha firmato*, la chiave dice *chi può scrivere*.

La configurazione vive su due livelli, e quello più specifico vince. Con `--global` vale per tutti i repository dell'utente (e finisce in `~/.gitconfig`); **senza** `--global` vale solo per il repository corrente (finisce in `.git/config`) e ha la **precedenza** su quella globale. È esattamente ciò che serve quando si usano identità diverse su progetti diversi: si tiene una globale come default e la si **sovrascrive localmente** dove serve un'altra email, per esempio quella aziendale su un repo di lavoro.

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `git config --global user.email "…"` | imposta l'email di **default** per tutti i repo |
| `git config user.email "…"` | imposta l'email **solo per questo repo** (vince sulla globale) |
| `git config user.email` | mostra l'email **effettiva** qui (la locale se c'è, altrimenti la globale) |
| `git config --local --list` | elenca **solo** la configurazione locale di questo repo |
| `git config --local --unset user.email` | **rimuove** l'override locale (si torna alla globale) |

## Esempi
```bash
# default globale, valido ovunque
git config --global user.name "Mario Rossi"
git config --global user.email "mario.rossi@example.com"

# in un repo di lavoro: si sovrascrive SOLO qui con l'email aziendale
git config user.email "mario.rossi@azienda.com"
git config user.email          # mario.rossi@azienda.com  (l'override locale vince)

# repo sbagliato? si toglie l'override e si torna alla globale
git config --local --unset user.email
git config user.email          # mario.rossi@example.com  (di nuovo la globale)
```

> [!tip]
> Cambiare la config vale solo per i commit **futuri**: quelli già fatti tengono l'email con cui sono stati creati. Se `--unset` dà «has multiple values», usare `--unset-all`. E per non impostare l'email a mano in ogni repo, Git può sceglierla **in automatico per cartella** con un `includeIf` in `~/.gitconfig` (es. tutto ciò che sta sotto `~/lavoro/` usa l'identità aziendale): vedi <a href="https://git-scm.com/docs/git-config#_conditional_includes" target="_blank" rel="noopener">git-config · Conditional includes</a>.

## Collegamenti
- [Repository](02-repository.md)
- [Interni di Git](12-interni-git.md) — dove finisce la config (`.git/config` locale vs `~/.gitconfig` globale)
- [GitHub](14-github.md)
