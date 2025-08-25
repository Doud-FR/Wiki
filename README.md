# Wiki App - Documentation Collaborative

Une application web moderne inspirée de Wiki.js pour la gestion collaborative de documentation avec support d'arborescence, gestion d'utilisateurs avancée et édition Markdown.

## 🚀 Fonctionnalités

### ✨ Gestion de documents
- **Organisation hiérarchique** : Structurez vos documents avec des dossiers et sous-dossiers
- **Édition Markdown** : Interface d'édition moderne avec prévisualisation en temps réel
- **Support DOCX** : Intégration OnlyOffice pour les documents Word (optionnel)
- **Versioning** : Historique des modifications avec possibilité de restauration

### 👥 Gestion des utilisateurs
- **Authentification** : Connexion sécurisée par email/mot de passe
- **Groupes d'utilisateurs** : Organisation flexible des utilisateurs
- **Permissions granulaires** : Contrôle d'accès par document, dossier, utilisateur ou groupe
- **Emails de bienvenue** : SMTP configurable pour l'envoi automatique d'emails

### 🔍 Recherche et navigation
- **Recherche full-text** : Recherche avancée dans le contenu et les métadonnées
- **Navigation intuitive** : Interface moderne et responsive
- **Filtrage** : Par tags, auteur, date, type de contenu

### 🛡️ Sécurité
- **Chiffrement JWT** : Authentification sécurisée
- **HTTPS** : Communication chiffrée
- **Validation des données** : Protection contre les injections
- **Rate limiting** : Protection contre les attaques par déni de service

## 🏗️ Architecture

### Backend (Node.js)
- **Express.js** : Framework web
- **PostgreSQL** : Base de données relationnelle
- **Sequelize** : ORM pour la gestion des données
- **JWT** : Authentification
- **Nodemailer** : Envoi d'emails
- **Multer** : Upload de fichiers

### Frontend (Vue.js)
- **Vue 3** : Framework JavaScript moderne
- **Vuetify 3** : Composants Material Design
- **Pinia** : Gestion d'état
- **Vue Router** : Navigation
- **Axios** : Communication avec l'API

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- Git

### Installation rapide avec Docker

```bash
# Cloner le repository
git clone https://github.com/Doud-FR/Wiki.git
cd Wiki

# Démarrer avec Docker Compose
docker-compose up -d
```

L'application sera accessible sur :
- **Production** : http://localhost:3000 (application complète)
- **Développement** : http://localhost:8080 (frontend) + http://localhost:3000 (API)

### Installation manuelle

1. **Cloner le repository**
```bash
git clone https://github.com/Doud-FR/Wiki.git
cd Wiki
```

2. **Installer les dépendances**
```bash
npm run install:all
```

3. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb wiki_db

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
```

4. **Configurer les variables d'environnement**
Éditer `backend/.env` avec vos paramètres :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wiki_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your-super-secret-jwt-key

SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

5. **Démarrer l'application**
```bash
# Mode développement (backend + frontend)
npm run dev

# Ou séparément
npm run dev:backend  # Port 3000
npm run dev:frontend # Port 8080
```

## 📝 Configuration SMTP

Pour activer l'envoi d'emails de bienvenue, configurez les paramètres SMTP dans le fichier `.env` :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourwiki.com
```

## 🎯 Utilisation

### Premier démarrage
1. **En développement**: Accéder à http://localhost:8080 (frontend) et http://localhost:3000 (API)
2. **En production**: Accéder à http://localhost:3000 (application complète)
3. Créer un compte administrateur
3. Configurer les groupes d'utilisateurs
4. Créer la structure de dossiers
5. Inviter des utilisateurs

### Gestion des permissions
- **Read** : Lecture seule
- **Write** : Lecture + écriture
- **Admin** : Tous les droits + gestion des permissions
- **Deny** : Accès refusé (prioritaire)

### Organisation des documents
```
📁 Racine
├── 📁 Documentation
│   ├── 📁 API
│   │   ├── 📄 Guide d'authentification
│   │   └── 📄 Référence des endpoints
│   └── 📁 Utilisateurs
│       └── 📄 Guide de démarrage
└── 📁 Projets
    ├── 📁 Projet A
    └── 📁 Projet B
```

## 🛠️ Développement

### Structure du projet
```
Wiki/
├── backend/              # API Node.js
│   ├── config/          # Configuration (DB, etc.)
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── middleware/      # Middlewares (auth, permissions)
│   ├── services/        # Services métier
│   └── app.js           # Point d'entrée
├── frontend/            # Application Vue.js
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── views/       # Pages de l'application
│   │   ├── store/       # Gestion d'état Pinia
│   │   ├── services/    # Services API
│   │   └── router/      # Configuration des routes
│   └── public/
├── docker-compose.yml   # Configuration Docker
└── package.json         # Dépendances racine
```

### Scripts disponibles
```bash
npm run dev              # Développement (backend + frontend)
npm run dev:backend      # Backend seul
npm run dev:frontend     # Frontend seul
npm run build           # Build de production
npm run start           # Démarrage production
npm run install:all     # Installation toutes dépendances
```

### Tests
```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test
```

## 🚀 Déploiement en production

### Avec Docker
```bash
# Build et déploiement
docker-compose up -d --build

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

L'application sera accessible sur http://localhost:3000

### Manuel
```bash
# Build frontend
npm run build

# Démarrer en production
NODE_ENV=production npm start
```

## 📋 Roadmap

- [x] Authentification et gestion des utilisateurs
- [x] Système de permissions granulaires
- [x] Gestion des groupes
- [x] Structure de dossiers hiérarchique
- [x] Édition Markdown basique
- [ ] Éditeur Markdown avancé avec prévisualisation
- [ ] Recherche full-text avancée
- [ ] Intégration OnlyOffice pour DOCX
- [ ] Versioning des documents
- [ ] API pour intégrations externes
- [ ] Thèmes personnalisables
- [ ] Notifications en temps réel
- [ ] Export en PDF
- [ ] Mode hors-ligne

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/Doud-FR/Wiki/issues)
- Consulter la documentation
- Contacter l'équipe de développement

---

**Wiki App** - Documentation collaborative moderne et intuitive 🚀