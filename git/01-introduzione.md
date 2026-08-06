# Introduzione a Git

Git è un sistema di controllo di versione **distribuito** (DVCS, *Distributed Version Control System*): uno strumento che registra l'evoluzione di un progetto nel tempo, tenendo traccia di ogni modifica ai file. Grazie a questa storia si può tornare a una versione precedente, capire chi ha cambiato cosa e quando, e lavorare in più persone sullo stesso codice senza sovrascriversi a vicenda. La parola "distribuito" è il cuore della faccenda: ogni copia del progetto è un repository completo, con l'intera storia dentro di sé. Non esiste quindi un unico server indispensabile, si lavora anche offline, e il proprio computer contiene già tutto il necessario per consultare il passato e creare nuove versioni.

## Git vs GitHub
Git e GitHub vengono spesso confusi, ma sono due cose distinte. **Git** è lo strumento di versionamento vero e proprio e gira sul proprio computer: è lui a registrare i commit e a custodire la storia del progetto. **GitHub** è invece una piattaforma online che *ospita* i repository Git remoti e vi costruisce sopra dei servizi di collaborazione, come l'issue tracking, le pull request, la revisione del codice e le integrazioni automatiche. In altre parole Git è il motore, mentre GitHub è uno dei tanti posti dove parcheggiare e condividere ciò che quel motore produce: Git funziona benissimo anche senza GitHub, mentre GitHub senza Git non avrebbe ragione di esistere. Allo stesso ruolo di GitHub rispondono anche alternative equivalenti come GitLab e Bitbucket.

## Strumento da terminale
Git nasce come strumento da **riga di comando**: ci si interagisce scrivendo comandi testuali come `git add`, `git commit` e `git push`. Le interfacce grafiche — quelle integrate negli editor o nelle app dedicate — sono arrivate in un secondo momento e rendono comode le operazioni di tutti i giorni, ma sono soltanto un guscio costruito sopra gli stessi comandi. La potenza piena di Git, e soprattutto la comprensione di cosa stia realmente accadendo, si raggiungono dal terminale: è lì che questi appunti ragioneranno.

## Configurare nome ed email
Prima di registrare qualsiasi commit conviene dire a Git chi ne è l'autore, perché ogni commit porta con sé un nome e un'email che restano incisi per sempre nella storia del progetto. Si impostano una volta sola con `git config`; l'opzione `--global` fa valere la configurazione per tutti i repository dell'utente sulla macchina, mentre senza di essa varrebbe solo per il repository corrente.

```bash
git config --global user.name "Mario Rossi"
git config --global user.email "mario.rossi@example.com"
```

## Collegamenti
- [Repository](02-repository.md)
- [Interni di Git](12-interni-git.md) — dove finisce la config
- [GitHub](14-github.md)
