# Configuration du repository Wiki

## 🎯 Objectif

Ce repository est configuré pour permettre les contributions faciles et les pushes directs vers la branche main.

## ⚙️ Configuration actuelle

### Branche main
- ✅ **Pushes directs autorisés** - Tu peux push dans le main !
- ✅ **Pas de protection de branche** - Contributions rapides facilitées
- ✅ **Workflow de validation** - Vérification automatique des pushes
- ✅ **Documentation complète** - Guide de contribution disponible

### Workflow GitHub Actions
- Validation automatique des pushes vers main
- Vérification de la structure du projet
- Messages de confirmation en français

### Structure du projet
```
Wiki/
├── README.md              # Documentation principale
├── CONTRIBUTING.md        # Guide de contribution
├── .github/
│   └── workflows/
│       └── main-validation.yml  # Workflow de validation
└── docs/
    └── CONFIGURATION.md   # Ce fichier
```

## 🚀 Comment utiliser

1. **Clone le repository**
   ```bash
   git clone https://github.com/Doud-FR/Wiki.git
   ```

2. **Fais tes modifications**
   ```bash
   # Édite les fichiers
   ```

3. **Push directement sur main**
   ```bash
   git add .
   git commit -m "Tes modifications"
   git push origin main
   ```

## ✨ Fonctionnalités activées

- 🔄 **Push direct sur main** - Pas besoin de PR pour les contributeurs autorisés
- 🤖 **Validation automatique** - GitHub Actions vérifie chaque push
- 📚 **Documentation** - Guides clairs pour les contributeurs
- 🎉 **Interface en français** - Messages et workflows en français

## 📞 Support

Si tu as des questions ou des problèmes :
1. Consulte le guide CONTRIBUTING.md
2. Vérifie tes permissions sur le repository
3. Contacte les mainteneurs

---

**🎉 Félicitations ! Tu peux maintenant push dans le main !**