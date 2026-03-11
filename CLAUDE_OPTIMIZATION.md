# Guide d'Optimisation des Emails avec Claude

## 📧 Comment personnaliser les emails générés

L'agent IA Claude génère des emails depuis `/app/api/emails/generate/route.ts`.

Vous pouvez optimiser les résultats en modifiant le prompt qui est envoyé à Claude.

## 🎯 Structure du Prompt

Le prompt envoyé à Claude contient:

1. **Instructions système** - Qui j'identifie comme (expert B2B, etc.)
2. **Infos du service** - Description de HATMADA ou Coaching
3. **Données du prospect** - Nom, email, entreprise, secteur
4. **Instructions de formation**  - Comment structurer l'email

## 🔧 Modifier le Prompt pour HATMADA

Fichier: `/app/api/emails/generate/route.ts`

Recherchez cette section:

```typescript
const serviceInfo = type === 'prospection' ? `
YOU ARE SELLING: HATMADA Prospection Service
...
```

### Exemples de Modifications:

**Pour être plus agressif:**
```
YOU ARE SELLING: HATMADA - Le top 1% du cold calling français
- Multipliez vos RDV par 10 en 3 mois
- Ou c'est gratuit (garantie de résultat)
...
```

**Pour cibler les startups:**
```
YOU ARE SELLING: HATMADA pour Startups B2B
- Remplissez votre pipe sans embaucher un SDR
- Équipe opérationnelle en 10 jours
...
```

## 🎨 Personnaliser pour Coaching

Cherchez cette section:

```typescript
const serviceInfo = type === 'coaching' ? `
YOU ARE SELLING: Coaching.com Platform
...
```

### Exemples:

**Pour les RH:**
```
YOU ARE SELLING: Coaching.com - Solution d'engagement collectif
- Transformez vos leaders
- Réduisez le burnout
- Augmentez la rétention
```

**Pour les startups:**
```
YOU ARE SELLING: Coaching.com - Plateforme pour leaders
- Développez votre leadership
- Connectez-vous à 1800+ coachs
- Échelle sans risque
```

## 📝 Customiser la Structure de l'Email

Modifiez le prompt principal:

```typescript
const prompt = `You are an expert B2B sales expert ...`
```

### Ajouter des directives:

```typescript
// Ajouter après les instructions de service:

TONE: ${prospect.industry === 'SaaS' ? 'Direct et data-driven' : 'Consultative et empathique'}

OPENING_HOOK: Commencez par un insight pertinent sur [industry]

ACTION_ITEMS:
- Proposez toujours une action claire
- 15 minutes = format standard pour meeting
- Montrez de la flexibilité
```

## 🎯 Meilleurs Pratiques

### ✅ Faites bien:

```
1. Utilisez des data réelles (45 RDV/mois pour HATMADA)
2. Adaptez l'angle selon le secteur
3. Gardez les emails courts (3-5 paragraphes)
4. Terminez par une action claire
5. Utilisez le prénom du prospect
```

### ❌ Éviter:

```
1. ❌ Promesses non vérifiées ("Garantie 100% RDV")
2. ❌ Trop long / trop court
3. ❌ Jargon technique pour les non-tech
4. ❌ Générique (pas de personnalisation)
5. ❌ Trop de demandes (newsletter, etc.)
```

## 🧪 Tester vos modifications

### 1. Modifier le prompt

Éditez `/app/api/emails/generate/route.ts` et changez le `serviceInfo` ou le `prompt` principal.

### 2. Redémarrer le serveur

```bash
# Si le serveur était lancé, arrêtez-le (Ctrl+C)
npm run dev  # Redémarrez
```

### 3. Uploader un fichier de test

Créez un fichier XLSX avec:
- Un prospect de votre secteur cible
- Notez le résultat

### 4. Affiner le prompt

Si le résultat n'est pas bon:
- Rendez plus spécifique (par secteur)
- Ajoutez plus de contexte
- Changez le tone

## 📊 Variables que vous pouvez utiliser

Vous avez accès à ces données du prospect:

```typescript
prospect.name        // Jean Dupont
prospect.email       // jean@company.com
prospect.company     // Tech Solutions Inc
prospect.industry    // SaaS, E-commerce, etc.
```

## 💡 Idées Avancées

### Hook par secteur:

```typescript
const hooks = {
  'SaaS': 'Vous développez votre équipe commerciale...',
  'E-commerce': 'Avec la saisonnalité, l\'acquisition peut être difficile...',
  'Consulting': 'Vous cherchez à atteindre plus de clients...',
  'Startup': 'Vous êtes en phase de croissance...',
};

const hook = hooks[prospect.industry] || 'J\'ai remarqué que votre entreprise...';
```

### Ajouter des statistiques par secteur:

```typescript
const stats = {
  'SaaS': { rdv: '45/mois', conversion: '8.7%', roi: '9x' },
  'E-commerce': { rdv: '35/mois', conversion: '7.2%', roi: '7.5x' },
};
```

### Personnaliser le CTA par industrie:

```typescript
const cta = {
  'SaaS': '15 min pour explorer comment multiplier vos RDV ?',
  'E-commerce': 'On en parle cette semaine ?',
  'Consulting': 'Quel est le meilleur moment pour discuter ?',
};
```

## 🔄 Itération Recommandée

1. **Semaine 1**: Testez la version standard
2. **Semaine 2**: Optimisez par secteur
3. **Semaine 3**: Testez A/B (2 versions différentes)
4. **Semaine 4**: Double down sur ce qui marche

## 📈 Métriques à tracker

```
- Open rate (dépend du sujet)
- Response rate (dépend du contenu)
- Meeting rate (dépend du CTA)
- Conversion rate (dépend de tout)
```

## 🚀 Prochaines étapes

1. Modifiez le prompt pour votre contexte
2. Testez avec 10-20 prospects
3. Mesurez l'impact
4. Affinez basé sur les résultats
5. Scale!

---

**Questions?** Consultez la documentation Claude: https://docs.anthropic.com/

