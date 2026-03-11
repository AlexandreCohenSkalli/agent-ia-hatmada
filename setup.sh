#!/bin/bash
# setup.sh - Script d'initialisation du projet

echo "🚀 ProspectAI - Setup Script"
echo "=============================="

# Check if Node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Installez Node.js 18+ et réessayez."
  exit 1
fi

echo "✅ Node.js détecté: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm n'est pas installé."
  exit 1
fi

echo "✅ npm détecté: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de l'installation des dépendances"
  exit 1
fi

echo "✅ Dépendances installées"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo ""
  echo "📝 Création du fichier .env.local..."
  cp .env.local.example .env.local
  echo "✅ Fichier .env.local créé"
  echo "⚠️  Veuillez remplir les variables d'environnement dans .env.local"
else
  echo "✅ Fichier .env.local existe déjà"
fi

# Generate Prisma client
echo ""
echo "🔧 Génération du client Prisma..."
npm run db:generate

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de la génération du client Prisma"
  exit 1
fi

echo "✅ Client Prisma généré"

# Push Prisma schema to database
echo ""
echo "🗄️  Synchronisation de la base de données..."
npm run db:push

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de la synchronisation de la base"
  exit 1
fi

echo "✅ Base de données synchronisée"

echo ""
echo "=============================="
echo "✅ Setup terminé avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Remplissez les variables dans .env.local"
echo "2. Lancez 'npm run dev'"
echo "3. Visitez http://localhost:3000"
echo ""
