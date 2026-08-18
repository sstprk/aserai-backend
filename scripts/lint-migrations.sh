#!/bin/bash
# Aserai Commerce — Migration Lint Hook
# Bu script migration dosyalarında yasak operasyonları kontrol eder.
# Kullanım: ./scripts/lint-migrations.sh [migration_file_or_directory]
#
# Pre-commit hook olarak kurulum:
#   cp scripts/lint-migrations.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TARGET="${1:-.}"
ERRORS=0

echo -e "${YELLOW}🔍 Aserai Commerce Migration Lint${NC}"
echo "================================================"

# Yasak operasyonlar (case-insensitive regex)
FORBIDDEN_PATTERNS=(
  "DROP\s+TABLE"
  "DROP\s+COLUMN"
  "ALTER\s+COLUMN\s+.+\s+TYPE"
  "RENAME\s+TABLE"
  "RENAME\s+COLUMN"
  "DROP\s+PRIMARY\s+KEY"
  "ALTER\s+PRIMARY\s+KEY"
  "DROP\s+CONSTRAINT.*PRIMARY"
)

FORBIDDEN_LABELS=(
  "DROP TABLE"
  "DROP COLUMN"
  "ALTER COLUMN TYPE"
  "RENAME TABLE"
  "RENAME COLUMN"
  "DROP PRIMARY KEY"
  "ALTER PRIMARY KEY"
  "DROP CONSTRAINT (PRIMARY)"
)

# Migration dosyalarını bul
MIGRATION_FILES=$(find "$TARGET" -name "*.sql" -o -name "*.ts" | grep -i "migrat" || true)

if [ -z "$MIGRATION_FILES" ]; then
  echo -e "${GREEN}✅ Migration dosyası bulunamadı, kontrol atlandı.${NC}"
  exit 0
fi

for file in $MIGRATION_FILES; do
  if [[ "$file" == *.ts ]]; then
    CONTENT=$(sed -n '/override async up/,/override async down/p' "$file" | sed '$d')
  else
    CONTENT=$(cat "$file")
  fi
  for i in "${!FORBIDDEN_PATTERNS[@]}"; do
    pattern="${FORBIDDEN_PATTERNS[$i]}"
    label="${FORBIDDEN_LABELS[$i]}"
    
    matches=$(printf '%s\n' "$CONTENT" | grep -inE "$pattern" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      echo -e "${RED}❌ YASAK OPERASYON: ${label}${NC}"
      echo "   Dosya: $file"
      echo "   Satır: $matches"
      echo ""
      ERRORS=$((ERRORS + 1))
    fi
  done
done

# NOT NULL kontrolü (migration script olmadan)
for file in $MIGRATION_FILES; do
  if [[ "$file" == *.ts ]]; then
    CONTENT=$(sed -n '/override async up/,/override async down/p' "$file" | sed '$d')
  else
    CONTENT=$(cat "$file")
  fi
  not_null=$(printf '%s\n' "$CONTENT" | grep -inE "SET[[:space:]]+NOT[[:space:]]+NULL|NOT[[:space:]]+NULL" 2>/dev/null || true)
  if [ -n "$not_null" ]; then
    echo -e "${YELLOW}⚠️  DİKKAT: NOT NULL ekleme tespit edildi — migration script gerekli olabilir${NC}"
    echo "   Dosya: $file"
    echo "   Satır: $not_null"
    echo ""
  fi
done

echo "================================================"
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ ${ERRORS} yasak operasyon tespit edildi!${NC}"
  echo -e "${RED}Migration politikasına göre bu değişiklikler izinsiz.${NC}"
  echo ""
  echo "İzinli operasyonlar:"
  echo "  ✅ CREATE TABLE"
  echo "  ✅ ADD COLUMN (nullable/default'lu)"
  echo "  ✅ ADD CONSTRAINT (mevcut veriyi bozmadan)"
  echo "  ✅ CREATE INDEX (CONCURRENTLY)"
  echo "  ✅ CREATE VIEW"
  exit 1
else
  echo -e "${GREEN}✅ Tüm migration'lar politikaya uygun.${NC}"
  exit 0
fi
