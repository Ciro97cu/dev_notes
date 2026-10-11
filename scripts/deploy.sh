#!/usr/bin/env bash
# Pubblica l'hub su GitHub Pages dal terminale, al posto di Actions › «Deploy Pages» › Run workflow.
# Fa tre cose in fila: push di main con i tag, avvio del workflow, attesa dell'esito.
# Richiede la GitHub CLI autenticata, una volta sola: brew install gh && gh auth login
set -euo pipefail

WORKFLOW=deploy-pages.yml
cd "$(git rev-parse --show-toplevel)"

command -v gh >/dev/null || { echo "Manca la GitHub CLI: brew install gh && gh auth login" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "GitHub CLI non autenticata: gh auth login" >&2; exit 1; }
[ "$(git branch --show-current)" = main ] || { echo "Il deploy parte solo da main." >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || echo "⚠️  Ci sono modifiche non committate: non verranno pubblicate."

version=$(sed -n 's/.*DN_VERSION = "\(.*\)".*/\1/p' assets/version.js)

# 1. push: commit e tag annotati (il footer dell'hub linka i tag)
git push --follow-tags origin main

# 2. avvio del workflow; gh stampa l'URL della run quando GitHub lo restituisce
before=$(gh run list --workflow "$WORKFLOW" --limit 1 --json databaseId --jq '.[0].databaseId // 0')
out=$(gh workflow run "$WORKFLOW" --ref main 2>&1); echo "$out"
run_id=$(grep -oE 'actions/runs/[0-9]+' <<<"$out" | grep -oE '[0-9]+$' || true)

# altrimenti si aspetta che compaia una run più recente di quella vista prima
for _ in $(seq 1 15); do
  [ -n "$run_id" ] && break
  sleep 2
  latest=$(gh run list --workflow "$WORKFLOW" --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId // 0')
  [ "$latest" != "$before" ] && run_id=$latest
done
[ -n "$run_id" ] || { echo "Run non trovata: controllare su GitHub › Actions." >&2; exit 1; }

# 3. attesa dell'esito (codice d'uscita diverso da zero se il deploy fallisce)
gh run watch "$run_id" --exit-status
echo "✅ Pubblicata la v$version: hard refresh sull'hub e controllare il numero nel footer."
