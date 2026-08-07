# Glossario

Termini Git (in inglese) spiegati in italiano semplice. Fonte unica della
terminologia: se un termine è qui, si usa sempre questa parola negli appunti.

## Formato

`**termine**` — spiegazione breve in linguaggio comune.

## Termini

- **repository (repo)** — è la cartella di un progetto tracciata da Git, che ne conserva i file insieme all'intera storia delle modifiche.
- **working directory** — sono i file del progetto così come si vedono e si modificano sul disco in un dato momento.
- **staging area (index)** — è la zona intermedia in cui si preparano le modifiche da includere nel prossimo commit.
- **commit** — è una fotografia salvata dei file tracciati in un dato momento, identificata da un id (hash).
- **hash (SHA-1)** — è la stringa di 40 caratteri esadecimali che identifica in modo univoco un oggetto Git.
- **HEAD** — è il puntatore al branch (o al commit) su cui si sta lavorando in quel momento.
- **branch** — è una linea di sviluppo separata, che procede in parallelo rispetto alle altre.
- **main / master** — è il branch principale di un repository (`main` è il nome standard di oggi, `master` quello storico).
- **detached HEAD** — è lo stato in cui HEAD punta direttamente a un commit anziché a un branch.
- **merge** — è l'unione delle modifiche di due branch in uno solo.
- **fast-forward** — è un merge senza nuovo commit, in cui il puntatore del branch si limita ad avanzare.
- **merge conflict** — si verifica quando le stesse righe vengono cambiate in modo diverso su due branch, e vanno riconciliate a mano.
- **rebase** — consiste nel riapplicare i commit di un branch su un'altra base, riscrivendone la storia.
- **stash** — è un deposito temporaneo delle modifiche non ancora committate.
- **tag** — è un nome fisso assegnato a un commit, di solito per marcare una release (es. `v1.0.0`).
- **SemVer (Semantic Versioning)** — è lo schema di versionamento `MAJOR.MINOR.PATCH`, con regole precise su quando incrementare ciascun numero.
- **remote** — è una copia del repository ospitata su un altro server (per esempio GitHub).
- **origin** — è il nome di default del remoto principale.
- **upstream** — è il branch remoto a cui un branch locale è collegato.
- **remote tracking branch** — è un branch locale (come `origin/main`) che riflette lo stato di un branch sul remoto.
- **clone** — è la copia locale di un repository remoto.
- **fetch** — scarica gli aggiornamenti dal remoto senza però unirli al branch locale.
- **pull** — è un `fetch` seguito da un `merge`: scarica gli aggiornamenti e li unisce.
- **push** — invia i commit locali al remoto.
- **SSH key** — è la coppia di chiavi (privata + pubblica) con cui ci si autentica al remoto senza password: la pubblica si carica su GitHub, la privata resta sul computer e non si condivide mai. La chiave si crea con `ssh-keygen`.
- **fork** — è una copia indipendente di un repository remoto creata sul proprio account.
- **pull request (PR)** — è la richiesta di unire un branch in un altro, sottoponendo le modifiche a una review del codice.
- **blob** — è l'oggetto Git che contiene il contenuto di un file.
- **tree** — è l'oggetto Git che rappresenta una directory.
- **reflog** — è il registro locale delle posizioni passate di HEAD, utile a recuperare lavoro che sembra perso.
- **blame** — è il comando che mostra, riga per riga, l'ultimo commit che ha toccato un file.
- **ORIG_HEAD** — è il riferimento al punto in cui si trovava HEAD prima di un'operazione rischiosa (merge, reset), utile per tornare indietro.
