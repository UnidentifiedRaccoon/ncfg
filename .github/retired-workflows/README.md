# Retired Yandex workflows

These workflows are retained as migration history outside `.github/workflows`,
so GitHub Actions cannot run them. Production deploys through Cloud.ru.
Do not move them back without a separate recovery plan: their Registry,
containers and Lockbox resources are being retired.

- `preview.yml`: old Yandex preview creation/cleanup.
- `registry-retention.yml`: old Yandex image retention.
- `coldstart-smoke.yml`: old serverless cold-start probe.
- `seed-hr-diagnostic.yml`: old production-write helper using Yandex Lockbox.

The current development read token and production runtime configuration use
Cloud.ru Secret Management. See `DEVELOPMENT.md` and
`infra/cloudru/autodeploy/README.md` for authentication and version rotation.
