# Security & safety

## Secrets
- Never request or read: .env, .env.*, secrets/, private keys (*.pem, *.key), credentials.
- If an operation needs a secret, ask the user to provide it safely (or use placeholders).

## Safe execution
- Don’t run destructive commands (rm -rf, dropping DB, mass deletes) unless explicitly asked.
- Be cautious with network calls / external downloads; prefer explaining what will be fetched and why.

## Configuration hardening (recommended)
- Use `.claude/settings.json` permissions deny rules to block reading sensitive files.
  (Keep this file in repo; per-user additions can live in user settings.)
