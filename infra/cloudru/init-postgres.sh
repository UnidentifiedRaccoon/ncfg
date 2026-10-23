#!/usr/bin/env bash
set -euo pipefail

# Runs only when the data directory is empty. Passwords never become CLI arguments.
psql --username "$POSTGRES_USER" --dbname postgres --set ON_ERROR_STOP=1 <<'SQL'
\getenv app_password STRAPI_DB_PASSWORD
SELECT format('CREATE ROLE strapi LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE', :'app_password') \gexec
CREATE DATABASE strapi OWNER strapi;
REVOKE ALL ON DATABASE strapi FROM PUBLIC;
SQL
