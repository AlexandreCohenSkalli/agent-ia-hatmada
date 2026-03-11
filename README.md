# ProspectAI - Plateforme de Prospection Intelligente avec Claude

Une plateforme SaaS complète pour automatiser votre prospection B2B et vendre HATMADA + vos services de coaching avec l'IA Claude.

## 🎯 Fonctionnalités

### Dashboard Multi-Utilisateur
- ✅ Authentification sécurisée (Login/Register)
- ✅ 2 sections distinctes : **Prospection HATMADA** & **Coaching**
- ✅ Multi-utilisateur avec tokens JWT

### Agent IA Claude
- ✅ Génère automatiquement des emails personnalisés
- ✅ Analyse le type d'entreprise et adapte le message
- ✅ Comprend les offres HATMADA et Coaching
- ✅ Rédige des emails hyper-personnalisés

### Gestion des Campagnes
- ✅ Upload de fichiers XLSX (listes d'emails)
- ✅ Génération d'emails en batch
- ✅ Aperçu des emails avant envoi
- ✅ Suivi complet des envois

### Suivi & Analytics
- ✅ Timestamp d'envoi précis
- ✅ Statuts: En attente / Envoyé / Répondu
- ✅ Détection des réponses
- ✅ Dashboard avec analytics

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **IA**: Claude API (Anthropic)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Hosting**: Vercel
- **Files**: XLSX parsing

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL
- Clé API Anthropic (Claude)

## 🚀 Installation

### 1. Cloner/Initialiser le projet

```bash
cd hatmada
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` basé sur `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Remplir les variables:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
DATABASE_URL=postgresql://user:password@localhost:5432/prospect_ai
JWT_SECRET=your_super_secret_key_here
NEXTAUTH_SECRET=another_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup de la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'app sera disponible sur `http://localhost:3000`

## 📝 Guide d'Utilisation

### 1. Créer un compte

Accédez à `http://localhost:3000/register` et créez un compte.

### 2. Se connecter

Allez sur `http://localhost:3000/login` et entrez vos identifiants.

### 3. Créer une campagne de prospection

1. Allez sur **Prospection HATMADA**
2. Uploadez un fichier XLSX avec les colonnes:
   - `Nom` (prospect name)
   - `Email` (prospect email)
   - `Entreprise` (company name)
   - `Secteur` (industry) - optionnel

3. Les emails seront générés automatiquement par Claude
4. Consultez l'aperçu et envoyez

### 4. Créer une campagne de coaching

1. Allez sur **Coaching**
2. Même processus qu'en prospection
3. Les emails seront adaptés à la vente de Coaching.com

## 📊 Format du fichier XLSX

Pour que le système fonctionne bien, votre fichier Excel doit avoir:

| Nom | Email | Entreprise | Secteur |
|-----|-------|-----------|---------|
| Jean Dupont | jean@company.com | Tech Solutions | SaaS |
| Marie Bernard | marie@startup.com | Growth Startup | E-commerce |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/verify` - Vérifier le token

### Emails
- `POST /api/emails/generate` - Générer des emails avec Claude
- `POST /api/emails/send` - Envoyer un email
- `GET /api/emails/list` - Lister les emails
- `GET /api/emails/track` - Tracker les emails

### Files
- `POST /api/files/upload` - Uploader un fichier XLSX
- `DELETE /api/files/:id` - Supprimer un fichier

## 🤖 Comment fonctionne l'IA Claude?

1. **Analyse du prospect**: Le système reçoit les données du prospect (nom, email, entreprise, secteur)
2. **Détection du service**: Basé sur le type d'entreprise, Claude détermine le meilleur pitch (HATMADA ou Coaching)
3. **Génération d'email**: Claude génère un email hyper-personnalisé avec:
   - Un sujet accrocheur
   - Un opening spécifique à l'entreprise
   - Une proposition de valeur adaptée
   - Un call-to-action clair
4. **Validation**: L'email est validé puis présenté pour validation avant envoi

## 📧 Configuration d'Email

Par défaut, le système affiche une interface d'aperçu. Pour envoyer réellement des emails:

1. Configurez un service SMTP:
   - Gmail SMTP
   - SendGrid
   - Amazon SES
   - Autre service de votre choix

2. Mettez à jour le `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password
SENDER_EMAIL=noreply@votredomaine.com
```

3. Créez une route `/api/emails/send` pour envoyer réellement

## 🚀 Déploiement sur Vercel

### 1. Préparer le projet

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Créer un repo GitHub

Créez un nouveau repo sur GitHub et pushez:

```bash
git remote add origin https://github.com/votre-user/prospect-ai.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez "New Project"
3. Importez votre repo GitHub
4. Configurez les variables d'environnement
5. Déployez!

## 🔐 Sécurité

- ✅ Passwords hashées avec bcrypt
- ✅ JWT tokens pour l'authentification
- ✅ Validation des inputs
- ✅ CORS configuré
- ✅ Variables d'environnement sécurisées

## 📖 Documentation Claude AI

Pour générer les meilleurs emails:

- Utilisez des hooks intéressants basés sur le secteur
- Adaptez le message HATMADA/Coaching au type d'entreprise
- Utilisez des statistiques réelles (45 RDV/mois pour HATMADA, 1800+ coachs pour Coaching)
- Gardez les emails courts et directs (max 5 paragraphes)

## 🐛 Troubleshooting

### Erreur "ANTHROPIC_API_KEY not found"
- Assurez-vous d'avoir copié votre clé API dans `.env.local`
- Vérifiez que vous l'avez obtenue sur [console.anthropic.com](https://console.anthropic.com)

### Erreur "Database connection failed"
- Vérifiez que PostgreSQL est lancé
- Vérifiez la DATABASE_URL
- Lancez `npm run db:push` pour créer les tables

### Fichiers XLSX ne se chargent pas
- Vérifiez que le fichier a les bonnes colonnes
- Utilisez le format `.xlsx` (pas `.xls`)
- Maximun 500 lignes pour les tests

## 📞 Support

Pour des questions ou des bugs, créez un issue sur GitHub ou contactez le support.

## 📄 Licence

MIT - Libre d'utilisation et de modification

---

**Créé par**: ProspectAI Team
**Année**: 2026
**Version**: 0.1.0
