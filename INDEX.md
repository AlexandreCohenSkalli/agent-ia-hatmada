# 📚 ProspectAI - Index des Fichiers de Documentation

Bienvenue dans ProspectAI! Voici votre guide pour naviguer dans le projet et la documentation.

## 🚀 Pour Commencer

| Document | Objectif | Quand l'utiliser |
|----------|----------|-----------------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Setup complet du projet | Première fois que vous lancez le projet |
| **[README.md](./README.md)** | Documentation exhaustive | Vous avez besoin de détails complets |
| **[30_DAYS_PLAN.md](./30_DAYS_PLAN.md)** | Plan d'action mois 1 | Vous voulez savoir quoi faire chaque semaine |

## 🛠️ Configuration & Déploiement

| Document | Objectif | Quand l'utiliser |
|----------|----------|-----------------|
| **.env.local.example** | Template d'env vars | Vous devez configurer votre environnement |
| **setup.sh** | Script d'installation automatique | `bash setup.sh` pour installer proprement |
| **verify.sh** | Script de vérification | `bash verify.sh` pour checker la config |
| **next.config.js** | Configuration Next.js | Rarement - modification avancée |
| **tsconfig.json** | Configuration TypeScript | Rarement - modification avancée |

## 🤖 L'IA Claude

| Document | Objectif | Quand l'utiliser |
|----------|----------|-----------------|
| **[CLAUDE_OPTIMIZATION.md](./CLAUDE_OPTIMIZATION.md)** | Optimiser les prompts | Vous voulez améliorer la qualité des emails |
| **/app/api/emails/generate/route.ts** | Code de génération | Vous voulez modifier le prompt Claude |

## 💾 Base de Données

| Fichier | Objectif | Quand l'utiliser |
|---------|----------|-----------------|
| **prisma/schema.prisma** | Modèle de base de données | Schema ou migrations |
| **migrate.sql** | Migrations SQL | Modifications avancées |

## 📁 Structure du Projet

```
hatmada/                                 # Racine du projet
├── 📚 Documentation
│   ├── README.md                       # Doc complète
│   ├── GETTING_STARTED.md              # Guide de démarrage
│   ├── CLAUDE_OPTIMIZATION.md          # Optimisation Claude
│   ├── TECHSTACK.md                    # Résumé technique
│   └── 30_DAYS_PLAN.md                 # Plan 30 jours
├── 📝 Configuration
│   ├── .env.local.example              # Template env
│   ├── .env.local                      # Env actuel
│   ├── .gitignore                      # Git ignore
│   ├── package.json                    # Dépendances
│   ├── tsconfig.json                   # TypeScript
│   ├── next.config.js                  # Next.js
│   ├── tailwind.config.ts              # Tailwind
│   └── postcss.config.ts               # PostCSS
├── 🎯 Scripts
│   ├── setup.sh                        # Installation
│   └── verify.sh                       # Vérification
├── 🗂️ app/                             # Application
│   ├── page.tsx                        # Homepage
│   ├── layout.tsx                      # Layout racine
│   ├── globals.css                     # Css globaux
│   ├── 🔐 (auth)/                      # Routes auth
│   │   ├── login/page.tsx              # Page login
│   │   └── register/page.tsx           # Page register
│   ├── 📊 (dashboard)/                 # Routes protégées
│   │   ├── layout.tsx                  # Layout dashboard
│   │   ├── dashboard/page.tsx          # Accueil dashboard
│   │   ├── prospection/page.tsx        # Prospection HATMADA
│   │   └── coaching/page.tsx           # Coaching
│   ├── 🔌 api/                         # API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── emails/
│   │   │   ├── generate/route.ts      # Claude génère
│   │   │   ├── send/route.ts           # Envoie réellement
│   │   │   └── track/route.ts          # Tracking
│   │   └── files/
│   │       └── upload/route.ts         # Upload XLSX
├── 📦 prisma/
│   └── schema.prisma                   # Models DB
├── 📚 lib/
│   └── types.ts                        # Types TypeScript
├── 🔐 middleware.ts                    # Auth middleware
└── 📦 node_modules/                    # Dépendances
```

## 🎯 Workflows rapides

### Situation: Je viens de cloner le projet
```
1. cd hatmada
2. bash setup.sh               # Installation complète
3. Éditer .env.local           # Ajouter vos clés API
4. npm run dev                 # Lancer le développement
5. Visitez http://localhost:3000
```

### Situation: Je veux tester une modification
```
1. Arrêtez npm run dev (Ctrl+C)
2. Modifiez votre fichier
3. npm run dev
4. Le hot reload devrait charger les changements
```

### Situation: Je veux affiner Claude
```
1. Ouvrez CLAUDE_OPTIMIZATION.md
2. Modifiez le prompt dans /app/api/emails/generate/route.ts
3. Sauvegardez
4. Testez avec upload XLSX
```

### Situation: Je veux envoyer vrais emails
```
1. Installez nodemailer: npm install nodemailer
2. Configurez SMTP dans .env.local
3. Testez: GET /api/emails/send
4. Envoyez: POST /api/emails/send avec body
```

### Situation: Je veux déployer sur Vercel
```
1. Poussez votre code sur GitHub
2. Créez repo sur vercel.com
3. Importez depuis GitHub
4. Configurez env vars
5. Déployez!
```

## 📖 Qu'est-ce que chaque Page fait?

### **`/` (Homepage)**
- Présentation du service
- Buttons: Login / Register
- Responsive design moderne

### **`/register` (Inscription)**
- Créer un nouveau compte
- Valide mot de passe (8+ chars)
- Hache les passwords avec bcrypt
- Génère JWT token

### **`/login` (Connexion)**
- Se connecter avec email/password
- Vérifie credentials
- Génère JWT token
- Redirige vers /dashboard

### **`/dashboard` (Accueil)**
- Vue d'ensemble des stats
- Links vers les 2 sections
- Sidebar de navigation

### **`/dashboard/prospection` (HATMADA)**
- Upload fichier XLSX
- Claude génère emails HATMADA
- Liste des emails avec statuts
- Aperçu + Envoi
- Suivi des envois

### **`/dashboard/coaching` (Coaching)**
- Upload fichier XLSX
- Claude génère emails Coaching
- Liste des emails avec statuts
- Aperçu + Envoi
- Suivi des envois

## 🔌 Qu'est-ce que chaque API Route fait?

### **POST `/api/auth/register`**
- Crée un nouveau user
- Hash password
- Génère JWT token
- Retourne token + user data

### **POST `/api/auth/login`**
- Authentifie user
- Vérifie password
- Génère JWT token
- Retourne token + user data

### **POST `/api/emails/generate`**
- Reçoit: liste de prospects + type (prospection/coaching)
- Appelle Claude pour chaque prospect
- Retourne: emails personnalisés

### **POST `/api/emails/send`**
- Envoie un email via SMTP
- Sauvegarde en DB
- Retourne: messageId + timestamp

### **GET/POST `/api/emails/track`**
- Track les événements: sent, opened, clicked, replied
- Retourne: stats par email

### **POST `/api/files/upload`**
- Reçoit: fichier XLSX
- Parse les données
- Retourne: liste de prospects

## 🎨 Comment ça marche: La flow complète

```
User Register → User Login → Dashboard → choose Prospection/Coaching
    ↓            ↓           ↓          ↓
  /api/auth/   /api/auth/  Page      Upload XLSX
  register     login       protected  ↓
              JWT token   middleware sent to /api/files/upload
              in local                ↓
              storage     Redirect    Parse file
                                      ↓
                                      /api/emails/generate
                                      (Claude processes)
                                      ↓
                                      Show emails list
                                      ↓
                                      User clicks "Send"
                                      ↓
                                      /api/emails/send
                                      ↓
                                      Track in /api/emails/track
                                      ↓
                                      Update status
```

## ⚙️ Principales Dépendances

### Frontend
- `react` - UI framework
- `next` - Full-stack framework
- `tailwindcss` - Styling
- `lucide-react` - Icons

### Backend
- `@anthropic-ai/sdk` - Claude API
- `prisma` - Database ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT auth

### Optionnel (pour production)
- `nodemailer` - Email sending

## 🆘 Troubleshooting Rapide

| Problème | Solution | Doc |
|----------|----------|-----|
| Module not found | `npm install` | GETTING_STARTED |
| API Key error | Check .env.local | README |
| DB connection | Check DATABASE_URL | README |
| Port déjà utilisé | Port 3000 en use, changez PORT=3001 | N/A |
| Git push fail | Check .gitignore, pas de .env.local | README |

## 🚦 Commandes Important

```bash
npm install          # Install dependencies
npm run dev          # Start development
npm run build        # Build for production
npm run lint         # Check code quality
npm run db:generate  # Generate Prisma client
npm run db:push      # Sync schema to database
bash setup.sh        # Setup complet
bash verify.sh       # Verify configuration
```

## 📞 Besoin d'aide?

1. Consultez **GETTING_STARTED.md** - 80% des questions répondues
2. Consultez **README.md** - Documentation exhaustive
3. Lancez **verify.sh** - Check votre setup
4. Vérifiez les logs - Lisez les messages d'erreur!

## ✅ Checklist avant de partager

```
[ ] npm install réussi
[ ] .env.local configuré
[ ] npm run db:push réussi
[ ] npm run dev lance sans erreurs
[ ] Créer compte marche
[ ] Login marche
[ ] File upload marche
[ ] Emails se génèrent
[ ] Send/preview marche
```

---

**Vous avez tout ce qu'il faut pour réussir! 🚀**

Commencez par [GETTING_STARTED.md](./GETTING_STARTED.md) →
