#!/usr/bin/env bash
#
# Install a backend bundle produced by .github/workflows/release-backend.yml.
# Runs ON THE SERVER. Nothing is installed or compiled here — the bundle from
# CI already contains node_modules built for Linux.
#
#   sudo ./deploy-release.sh /tmp/aserai-backend-abc123def456.tar.gz
#
# Layout it maintains:
#   /srv/aserai/releases/<stamp>/   extracted bundle
#   /srv/aserai/shared/.env         secrets, survives releases
#   /srv/aserai/shared/static/      product image uploads, survives releases
#   /srv/aserai/current -> releases/<stamp>
#
# Uploads live in shared/ because Medusa writes them to the local disk; a
# release directory is disposable and would take them with it.

set -euo pipefail

BUNDLE="${1:?usage: deploy-release.sh <bundle.tar.gz>}"
ROOT="${ASERAI_ROOT:-/srv/aserai}"
SERVICE="${ASERAI_SERVICE:-aserai-backend}"
KEEP="${ASERAI_KEEP:-1}"          # previous releases retained for rollback

# An extracted bundle needs roughly 600 MB. Refuse rather than fill the disk:
# a full disk takes Postgres down with it, which is far worse than a failed
# deploy.
REQUIRED_MB="${ASERAI_REQUIRED_MB:-1300}"

[ -f "$BUNDLE" ] || { echo "no such bundle: $BUNDLE" >&2; exit 1; }

mkdir -p "$ROOT/releases" "$ROOT/shared/static"

avail_mb=$(df -Pm "$ROOT" | awk 'NR==2 {print $4}')
if [ "$avail_mb" -lt "$REQUIRED_MB" ]; then
  echo "Only ${avail_mb} MB free at $ROOT; need ~${REQUIRED_MB} MB." >&2
  echo "Free space first — see docs/Deployment.md §12 'Alan geri kazanma'." >&2
  echo "Current releases:" >&2
  du -sh "$ROOT"/releases/* 2>/dev/null >&2 || true
  exit 1
fi

if [ ! -f "$ROOT/shared/.env" ]; then
  echo "Missing $ROOT/shared/.env — create it before deploying (docs §3)." >&2
  exit 1
fi

stamp="$(date +%Y%m%d-%H%M%S)"
target="$ROOT/releases/$stamp"
echo "==> extracting to $target"
mkdir -p "$target"
tar xzf "$BUNDLE" -C "$target"

# The server reads .env from its working directory; symlink so rotating
# secrets never means editing a release.
ln -sfn "$ROOT/shared/.env" "$target/.env"

# Replace the bundled empty static/ with the persistent one.
rm -rf "$target/static"
ln -sfn "$ROOT/shared/static" "$target/static"

echo "==> applying migrations"
( cd "$target" && NODE_ENV=production npx medusa db:migrate )

# Tenant isolation depends on every module migration having actually run; a
# name collision silently skipped 13 of them once already. Fail loudly here
# rather than serving cross-tenant data.
echo "==> verifying tenant_id columns"
missing=$(
  cd "$target" && set -a && . ./.env && set +a
  psql "$DATABASE_URL" -tAc "
    select t.table_name
    from information_schema.tables t
    where t.table_schema='public'
      and t.table_name in ('company','employee','quote','approval','brand',
          'dealer','audit_log','unit','tax_group','feature_flag',
          'aserai_address','role','permission','setting','webhook_endpoint')
      and not exists (
        select 1 from information_schema.columns c
        where c.table_schema='public' and c.table_name=t.table_name
          and c.column_name='tenant_id')
    order by 1;"
)
if [ -n "$missing" ]; then
  echo "Tables missing tenant_id:" >&2
  echo "$missing" >&2
  echo "Refusing to activate this release." >&2
  exit 1
fi
echo "    all present"

echo "==> switching current -> $stamp"
ln -sfn "$target" "$ROOT/current"

echo "==> restarting $SERVICE"
systemctl restart "$SERVICE"

sleep 4
for _ in $(seq 1 10); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9000/health || true)
  [ "$code" = "200" ] && break
  sleep 2
done
if [ "${code:-}" != "200" ]; then
  echo "Health check failed (last status: ${code:-none})." >&2
  echo "Logs: journalctl -u $SERVICE -n 50 --no-pager" >&2
  exit 1
fi
echo "    healthy"

echo "==> pruning old releases (keeping $KEEP)"
# shellcheck disable=SC2012
ls -1dt "$ROOT"/releases/*/ 2>/dev/null \
  | tail -n +$((KEEP + 2)) \
  | while read -r old; do
      [ "$(readlink -f "$old")" = "$(readlink -f "$ROOT/current")" ] && continue
      echo "    removing $old"
      rm -rf "$old"
    done

echo
echo "Deployed $stamp. Free space now:"
df -h "$ROOT" | awk 'NR==1 || NR==2'
