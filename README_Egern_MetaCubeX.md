# MetaCubeX rules for Egern

This workspace converts rule providers from `MetaCubeX/meta-rules-dat` branch `meta`
into Egern YAML rule-set files.

## Local sync

```bash
npm run sync:metacubex
```

The script reads MetaCubeX rule providers from `MetaCubeX_Providers.json`,
converts the matching `.list` files, and writes:

- `Egern_RuleSets/*.yaml`
- `Egern_MetaCubeX_RuleSources.json`

## GitHub auto sync

After this directory is pushed to GitHub, the workflow at
`.github/workflows/sync-metacubex-egern.yml` runs every day at 00:00 China
Standard Time and can also be started manually from the Actions tab.

GitHub cannot receive update events from another repository unless that upstream
repository sends a webhook to yours, so the workflow uses scheduled polling.
When generated files change, it commits the updated Egern rule sets back to the
same repository.

## Egern URL format

Use the raw URL of the generated file in Egern, for example:

```yaml
- rule_set:
    match: "https://raw.githubusercontent.com/SpeedupMaster/Network/main/Egern_RuleSets/google.yaml"
    policy: "Proxy"
    update_interval: 86400
```
