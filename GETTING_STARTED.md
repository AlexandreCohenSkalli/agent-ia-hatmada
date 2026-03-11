# ProspectAI - Guide de Démarrage Rapide

## 🎯 Objectif

Créer une plateforme SaaS d'IA pour la prospection automatisée qui vend HATMADA (prospection B2B) et des services de coaching via email personnalisé généré par Claude.

## 📦 Ce qui est déjà créé

### Structure du Projet
```
hatmada/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/         # Pages protégées du dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── prospection/page.tsx
│   │   └── coaching/page.tsx
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── emails/
│   │   │   ├── generate/route.ts
│   │   │   └── track/route.ts
│   │   └── files/
│   │       └── upload/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Homepage
├── prisma/
│   └── schema.prisma        # Database schema
├── lib/
│   └── types.ts             # TypeScript types
├── middleware.ts            # Auth middleware
├── package.json
├── tsconfig.json
└── README.md
```

### Fichiers de Configuration
- ✅ `package.json` - Dépendances
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `next.config.js` - Configuration Next.js
- ✅ `tailwind.config.ts` - Styles Tailwind
- ✅ `postcss.config.ts` - PostCSS
- ✅ `.env.local` - Variables d'environnement
- ✅ `.gitignore` - Git ignore rules
- ✅ `prisma/schema.prisma` - Database models

### Pages Créées
1. **Homepage** (`/`) - Landing page
2. **Login** (`/login`) - Authentification
3. **Register** (`/register`) - Création de compte
4. **Dashboard** (`/dashboard`) - Aperçu
5. **Prospection** (`/dashboard/prospection`) - HATMADA prospection
6. **Coaching** (`/dashboard/coaching`) - Services de coaching

## ⚙️ Prochaines Étapes

### 1. Installation des dépendances
```bash
cd hatmada
npm install
```

### 2. Configuration de la base de données

**Option A: PostgreSQL Local**
```bash
# Installer PostgreSQL si nécessaire
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Démarrer PostgreSQL
brew services start postgresql

# Créer la base de données
createdb prospect_ai

# Mettre à jour .env.local
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/prospect_ai
```

**Option B: Utilisez Supabase (recommandé pour Vercel)**
1. Créer un compte gratuit sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier la DATABASE_URL dans `.env.local`

### 3. Obtenir une clé API Anthropic

1. Aller à [console.anthropic.com](https://console.anthropic.com)
2. Créer un compte et générer une clé API
3. Ajouter dans `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 4. Initialiser la base de données Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push
```

### 5. Lancer le développement

```bash
npm run dev
```

L'app sera sur `http://localhost:3000`

## 🧪 Tester l'Application

### 1. Créer un compte
- Aller à http://localhost:3000/register
- Remplir: Nom, Email, Mot de passe
- Cliquer "S'inscrire"

### 2. Se connecter
- http://localhost:3000/login
- Utiliser vos identifiants

### 3. Tester une campagne de prospection
1. Cliquer "Prospection HATMADA"
2. Uploader un fichier XLSX (créez-en un avec les colonnes: Nom, Email, Entreprise, Secteur)
3. Voir les emails générés
4. Cliquer "Aperçu" pour voir le contenu généré par Claude
5. Cliquer "Envoyer"

### 4. Tester une campagne de coaching
- Même processus dans l'onglet "Coaching"

## 🚀 Déployer sur Vercel

### 1. Préparer le repo GitHub

```bash
git init
git add .
git commit -m "Initial ProspectAI commit"
git remote add origin https://github.com/votre-user/prospect-ai.git
git push -u origin main
```

### 2. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer "New Project"
3. Importer depuis GitHub
4. Configurer les variables d'environnement:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` (Supabase)
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
5. Déployer!

## 📝 Créer un fichier XLSX de test

Pour tester l'upload, créez un fichier Excel avec:

| Nom | Email | Entreprise | Secteur |
|-----|-------|-----------|---------|
| Jean Dupont | jean@company.com | Tech Solutions | SaaS |
| Marie Bernard | marie@startup.com | Growth Startup | E-commerce |
| Pierre Martin | pierre@consulting.com | Consulting Group | Management |

## 🔐 Sécurité

- Ne JAMAIS commiter le `.env.local`
- Changer les valeurs secrets en production
- Utiliser HTTPS en production
- Valider tous les inputs côté serveur

## 📞 Besoin d'aide?

- Consultez le `README.md` pour voir tous les endpoints API
- Vérifiez que PostgreSQL/Supabase est connecté
- Vérifiez votre clé ANTHROPIC_API_KEY
- Vérifiez les logs du terminal

## 🎨 Personnalisations possibles

### Changer les couleurs
Éditer `tailwind.config.ts`:
```js
colors: {
  primary: '#votre_couleur',
}
```

### Modifier les emails Claude
Éditer `/app/api/emails/generate/route.ts`:
- Changer le prompt pour plus de personnalisation
- Ajouter des données de contexte

### Ajouter plus de sections
Créer des dossiers `app/(dashboard)/nom-section/page.tsx`

## 📊 Architecture Données

```
User
├── Email Records
│   ├── Campaign
│   └── File Upload
└── Campaigns
    └── Email Records
```

## 🎯 Prochaines Améliorations à Faire

1. **Intégration Email Réelle**
   - Connecter Gmail/SendGrid/AWS SES
   - Envoyer les emails automatiquement

2. **Analytics Avancées**
   - Taux d'ouverture
   - Taux de clic
   - Taux de conversion
   - Graphiques

3. **Webhooks**
   - Synchroniser les réponses
   - Tracking automatique

4. **Import de listes**
   - LinkedIn
   - Clearbit API pour enrichissement de données

5. **Templating d'emails**
   - Permettre aux users de créer leurs propres templates

6. **Intégration CRM**
   - Pipedrive
   - HubSpot
   - Salesforce

---

**Vous êtes prêt à commencer! 🚀**
