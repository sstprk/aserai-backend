#!/usr/bin/env bash
#
# One-time server preparation for the Aserai backend. Idempotent: safe to
# re-run.
#
#   sudo ./bootstrap-server.sh              # prepare, keep existing database
#   sudo RECREATE_DB=1 ./bootstrap-server.sh  # DROP and recreate aserai_prod
#
# This box is shared: HestiaCP, Docker with other projects, MySQL, exim4,
# nginx and apache all live here. So this script deliberately does NOT:
#   - touch /usr/bin/node (other projects may run on v18)
#   - touch Docker, MySQL, Hestia or any of their data
#   - run apt-get autoremove/upgrade
#   - delete anything outside /srv/aserai
#
# Node 20 is installed under its own prefix and addressed by absolute path.

set -euo pipefail

NODE_VERSION="${NODE_VERSION:-20.19.0}"
NODE_PREFIX="${NODE_PREFIX:-/opt/node-20}"
ROOT="${ASERAI_ROOT:-/srv/aserai}"
SERVICE="${ASERAI_SERVICE:-aserai-backend}"
RUN_USER="${ASERAI_USER:-aserai}"
DB_NAME="${DB_NAME:-aserai_prod}"
DB_USER="${DB_USER:-aserai}"
RECREATE_DB="${RECREATE_DB:-0}"

# Domains. Override before running; they end up in .env CORS settings.
API_DOMAIN="${API_DOMAIN:-}"
STORE_DOMAIN="${STORE_DOMAIN:-}"

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }

say() { printf '\n==> %s\n' "$*"; }

say "disk before"
df -h / | awk 'NR==1 || NR==2'

avail_mb=$(df -Pm / | awk 'NR==2 {print $4}')
if [ "$avail_mb" -lt 1200 ]; then
  echo "Only ${avail_mb} MB free. Free space first (docs §12)." >&2
  exit 1
fi

# ---------------------------------------------------------------- Node 20 ---
if [ -x "$NODE_PREFIX/bin/node" ] \
   && [ "$("$NODE_PREFIX/bin/node" -p 'process.versions.node')" = "$NODE_VERSION" ]; then
  say "Node $NODE_VERSION already at $NODE_PREFIX"
else
  say "installing Node $NODE_VERSION to $NODE_PREFIX (system node untouched)"
  tarball="node-v${NODE_VERSION}-linux-x64.tar.xz"
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -fsSL -o "$tmp/$tarball" "https://nodejs.org/dist/v${NODE_VERSION}/${tarball}"
  # Verify against the release manifest rather than trusting the download.
  curl -fsSL -o "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"
  ( cd "$tmp" && grep " $tarball\$" SHASUMS256.txt | sha256sum -c - )
  mkdir -p "$NODE_PREFIX"
  tar xJf "$tmp/$tarball" -C "$NODE_PREFIX" --strip-components=1
  rm -rf "$tmp"; trap - EXIT
fi
"$NODE_PREFIX/bin/node" -v
echo "system node still: $(/usr/bin/node -v 2>/dev/null || echo none)"

# ------------------------------------------------------------ service user ---
if id "$RUN_USER" >/dev/null 2>&1; then
  say "user $RUN_USER exists"
else
  say "creating system user $RUN_USER"
  useradd --system --home-dir "$ROOT" --shell /usr/sbin/nologin "$RUN_USER"
fi

# ---------------------------------------------------------------- layout ----
say "layout at $ROOT"
mkdir -p "$ROOT"/{releases,shared/static,scripts}
chown -R "$RUN_USER":"$RUN_USER" "$ROOT"

# -------------------------------------------------------------- database ----
db_exists() {
  sudo -u postgres psql -tAc \
    "select 1 from pg_database where datname='$DB_NAME'" | grep -q 1
}

if [ "$RECREATE_DB" = "1" ]; then
  say "recreating database $DB_NAME (existing data is discarded)"
  sudo -u postgres psql -q -c \
    "select pg_terminate_backend(pid) from pg_stat_activity
       where datname='$DB_NAME' and pid <> pg_backend_pid();" >/dev/null
  sudo -u postgres dropdb --if-exists "$DB_NAME"
elif db_exists; then
  say "database $DB_NAME already exists; leaving it alone"
  echo "    (re-run with RECREATE_DB=1 to start clean)"
fi

if ! sudo -u postgres psql -tAc \
      "select 1 from pg_roles where rolname='$DB_USER'" | grep -q 1; then
  DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
  say "creating role $DB_USER"
  sudo -u postgres psql -q -c \
    "create role $DB_USER login password '$DB_PASS';"
  echo "$DB_PASS" > "$ROOT/shared/.db-password"
  chmod 600 "$ROOT/shared/.db-password"
  echo "    password written to $ROOT/shared/.db-password"
else
  say "role $DB_USER exists"
  if [ -f "$ROOT/shared/.db-password" ]; then
    DB_PASS="$(cat "$ROOT/shared/.db-password")"
  else
    echo "    role exists but no saved password; rotating it"
    DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
    sudo -u postgres psql -q -c \
      "alter role $DB_USER password '$DB_PASS';"
    echo "$DB_PASS" > "$ROOT/shared/.db-password"
    chmod 600 "$ROOT/shared/.db-password"
  fi
fi

if ! db_exists; then
  say "creating database $DB_NAME owned by $DB_USER"
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

# ------------------------------------------------------------------- .env ----
if [ -f "$ROOT/shared/.env" ]; then
  say ".env already present; not overwriting"
else
  if [ -z "$API_DOMAIN" ] || [ -z "$STORE_DOMAIN" ]; then
    echo "Set API_DOMAIN and STORE_DOMAIN to write .env, e.g." >&2
    echo "  sudo API_DOMAIN=api.example.com STORE_DOMAIN=magaza.example.com \\" >&2
    echo "       $0" >&2
    exit 1
  fi
  say "writing $ROOT/shared/.env"
  umask 077
  cat > "$ROOT/shared/.env" <<ENV
NODE_ENV=production

DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}

JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

STORE_CORS=https://${STORE_DOMAIN}
AUTH_CORS=https://${STORE_DOMAIN},https://${API_DOMAIN}
ADMIN_CORS=https://${API_DOMAIN}

DEFAULT_TENANT_ID=tenant_default
ENV
  chown "$RUN_USER":"$RUN_USER" "$ROOT/shared/.env"
  echo "    generated fresh JWT/COOKIE secrets"
fi

# ---------------------------------------------------------------- systemd ---
say "installing $SERVICE unit"
cat > "/etc/systemd/system/${SERVICE}.service" <<UNIT
[Unit]
Description=Aserai Commerce backend
After=network.target postgresql.service

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${ROOT}/current
Environment=NODE_ENV=production
Environment=PATH=${NODE_PREFIX}/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=${NODE_PREFIX}/bin/node ${ROOT}/current/node_modules/.bin/medusa start
Restart=always
RestartSec=5

# Other projects share this host; keep the service inside its own tree.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=${ROOT}/shared/static

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
echo "    not started yet — no release is deployed"

say "done. disk now"
df -h / | awk 'NR==1 || NR==2'
cat <<NEXT

Next:
  1. Put a bundle on this box and run:
       sudo ${ROOT}/scripts/deploy-release.sh /tmp/aserai-backend-<sha>.tar.gz
  2. systemctl enable ${SERVICE}
  3. Point nginx at 127.0.0.1:9000 (docs §5) and issue TLS for ${API_DOMAIN:-your api domain}
NEXT
