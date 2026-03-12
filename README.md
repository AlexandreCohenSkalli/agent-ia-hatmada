# ProspectAI — Outil de Prospection HATMADA

Outil interne de prospection B2B pour **HATMADA** — permet d'envoyer des emails de prospection personnalisés en masse via deux verticales :
- **Prospection HATMADA** : vente des services d'externalisation commerciale ([hatmadaprospection.com](https://hatmadaprospection.com))
- **Coaching HATMADA** : vente des formations commerciales pour équipes de vente ([hatmadacoaching.com](https://hatmadacoaching.com))

### À propos de HATMADA Coaching

HATMADA forme les équipes commerciales B2B avec une approche 100% terrain et mesurable, animée par **Simon Nabet** (6 entreprises créées, 70 commerciaux managés, 500+ commerciaux formés).

**Programmes :**
- **Cold Call Mastery** — Prospection & prise de RDV
- **De la Découverte au Closing** — Découverte & négociation
- **Coaching à l'heure** — Accompagnement sur-mesure post-formation

**Résultats mesurés :** +32% RDV · +19% CA · +13% marge · 98,7% satisfaction

## 🎯 Fonctionnalités

### Dashboard
- ✅ Authentification sécurisée (Login/Register)
- ✅ 2 sections distinctes : **Prospection HATMADA** & **Coaching HATMADA**
- ✅ Statistiques en temps réel (emails envoyés, réponses, ouvertures)

### Gestion des Campagnes
- ✅ Upload de fichiers XLSX (listes de prospects)
- ✅ Génération automatique d'emails personnalisés (templates intégrés)
- ✅ Aperçu des emails avant envoi
- ✅ Envoi individuel ou en masse (1 à 100 emails)

### Suivi & Analytics
- ✅ Pages Suivi par section avec recherche et filtres
- ✅ Statuts : En attente / Envoyé / Répondu
- ✅ Tracking d'ouverture par pixel (fonctionnel en production)
- ✅ Bouton "Répondu ✓" pour marquer manuellement les réponses
- ✅ Dashboard avec compteurs live

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Inline styles (pas de dépendance CSS externe)
- **Backend**: Next.js API Routes
- **Envoi email**: Nodemailer (Gmail SMTP)
- **Tracking ouvertures**: Pixel 1×1 — route `/api/emails/track/open`
- **Persistence**: localStorage (stats, emails envoyés) + fichier JSON tmp (tracking)
- **Auth**: JWT simple
- **Fichiers**: XLSX parsing (client-side)

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env.local` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password_gmail
SENDER_EMAIL=votre_email@gmail.com
APP_URL=http://localhost:3000   # À changer en production pour le tracking pixel
JWT_SECRET=votre_secret_jwt
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'app sera disponible sur `http://localhost:3000`

## 📊 Format du fichier XLSX

Les colonnes reconnues automatiquement :

| Colonne | Variantes acceptées |
|---------|-------------------|
| Prénom | `Prénom`, `Prenom`, `prénom` |
| Nom | `Nom`, `NOM` |
| Email | `Email 1`, `Email`, `email`, `EMAIL` |
| Société | `Société`, `Societe`, `société`, `SOCIÉTÉ` |
| Fonction | `Fonction`, `fonction`, `FONCTION` |
| LinkedIn | `URL LinkedIn`, `LinkedIn`, `Linkedin` |
| Site web | `Site Internet`, `Site Web`, `Website` |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` — Créer un compte
- `POST /api/auth/login` — Se connecter

### Emails
- `POST /api/emails/send` — Envoyer un email (Nodemailer)
- `POST /api/emails/generate` — Générer un email avec Claude (nécessite API key)

### Tracking
- `GET /api/emails/track/open?id=emailId` — Pixel d'ouverture (retourne GIF 1×1)
- `GET /api/emails/track/status?ids=id1,id2` — Statut d'ouverture des emails

## 📧 Templates Email

### Coaching HATMADA (cibles : directeurs commerciaux, CEO, DRH)

Les deux templates intégrés mettent en avant :
- Les problèmes réels des équipes de vente (peur du téléphone, pipeline vide, cycle trop long)
- Les 3 programmes HATMADA (Cold Call Mastery, Découverte au Closing, Coaching à l'heure)
- Les stats mesurées (+32% RDV, +19% CA, 500+ commerciaux formés)
- CTA : audit offert de 30 min

### Prospection HATMADA

Templates orientés externalisation commerciale — signature `hatmadaprospection.com`.

## 🚀 Déploiement sur Vercel

1. Pushez le repo sur GitHub
2. Importez sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement (dont `APP_URL=https://votre-domaine.vercel.app`)
4. Déployez — le tracking pixel fonctionnera automatiquement en production

## 🐛 Troubleshooting

### Emails non envoyés
- Vérifiez `SMTP_USER` et `SMTP_PASS` dans `.env.local`
- Pour Gmail : utilisez un **mot de passe d'application** (pas votre mot de passe normal) — [Google App Passwords](https://myaccount.google.com/apppasswords)

### Tracking pixel ne fonctionne pas
- Normal en local : Gmail ne peut pas accéder à `localhost`
- Fonctionne automatiquement une fois déployé sur Vercel (mettre à jour `APP_URL`)

### Fichiers XLSX ne se chargent pas
- Vérifiez que le fichier est au format `.xlsx`
- Vérifiez que la colonne email contient bien un `@`

## 📄 Licence

Usage interne HATMADA — 2026

---

**Repo** : [AlexandreCohenSkalli/agent-ia-hatmada](https://github.com/AlexandreCohenSkalli/agent-ia-hatmada)
**Version** : 1.0.0


### 2. Installer les dépendances
