#!/bin/bash
# verify.sh - Vérifier que tout est correctement configuré

echo "🔍 ProspectAI - Verification Script"
echo "===================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checks_passed=0
checks_failed=0

check_file() {
  local file=$1
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $file existe"
    ((checks_passed++))
  else
    echo -e "${RED}❌${NC} $file MANQUANT"
    ((checks_failed++))
  fi
}

check_env_var() {
  local var=$1
  if grep -q "^$var=" .env.local; then
    echo -e "${GREEN}✅${NC} $var configuré"
    ((checks_passed++))
  else
    echo -e "${YELLOW}⚠️${NC}  $var non configuré"
    ((checks_failed++))
  fi
}

echo ""
echo "📁 Vérification des fichiers..."
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.js"
check_file "tailwind.config.ts"
check_file "postcss.config.ts"
check_file ".env.local"
check_file "prisma/schema.prisma"
check_file "app/page.tsx"
check_file "app/layout.tsx"
check_file "middleware.ts"

echo ""
echo "📦 Vérification des dépendances..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅${NC} node_modules existe"
  ((checks_passed++))
else
  echo -e "${RED}❌${NC} node_modules MANQUANT - Lancez: npm install"
  ((checks_failed++))
fi

echo ""
echo "🔐 Vérification des variables d'environnement..."
if [ -f ".env.local" ]; then
  check_env_var "ANTHROPIC_API_KEY"
  check_env_var "DATABASE_URL"
  check_env_var "JWT_SECRET"
  check_env_var "NEXTAUTH_SECRET"
  check_env_var "NEXTAUTH_URL"
fi

echo ""
echo "🎯 Vérification des pages..."
check_file "app/(auth)/login/page.tsx"
check_file "app/(auth)/register/page.tsx"
check_file "app/(dashboard)/dashboard/page.tsx"
check_file "app/(dashboard)/prospection/page.tsx"
check_file "app/(dashboard)/coaching/page.tsx"

echo ""
echo "🔌 Vérification des API routes..."
check_file "app/api/auth/login/route.ts"
check_file "app/api/auth/register/route.ts"
check_file "app/api/emails/generate/route.ts"
check_file "app/api/emails/track/route.ts"
check_file "app/api/files/upload/route.ts"

echo ""
echo "===================================="
echo -e "Checks passed: ${GREEN}$checks_passed${NC}"
echo -e "Checks failed: ${RED}$checks_failed${NC}"

if [ $checks_failed -eq 0 ]; then
  echo -e ""
  echo -e "${GREEN}✅ Tout est bien configuré!${NC}"
  echo ""
  echo "📋 Prochaines étapes:"
  echo "1. Vérifiez votre .env.local"
  echo "2. Lancez: npm run db:generate && npm run db:push"
  echo "3. Lancez: npm run dev"
  echo "4. Visitez http://localhost:3000"
  exit 0
else
  echo -e ""
  echo -e "${RED}❌ Il y a des problèmes à régler${NC}"
  echo ""
  echo "💡 Solutions:"
  echo "- Si npm install manque: lancez npm install"
  echo "- Si des fichiers manquent: récupérez-les depuis la structure"
  echo "- Si .env.local manque: lancez cp .env.local.example .env.local"
  exit 1
fi
