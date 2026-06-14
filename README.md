# Application Enchère - Cagnotte Commune

Une application web collaborative pour gérer une cagnotte commune où les utilisateurs peuvent contribuer 5€ à la fois.

## Fonctionnalités

- 🔐 **Création et connexion de compte** - Chaque utilisateur peut créer un compte personnel
- 💰 **Bouton +5€** - Ajouter 5€ à la cagnotte commune
- 📊 **Tableau de bord en temps réel** - Voir la cagnotte totale et le dernier contributeur
- ⏱️ **Limite de temps** - Les utilisateurs ne peuvent contribuer que pendant une période définie
- ⚙️ **Administration** - Réinitialiser la cagnotte et modifier le temps limite
- 🔄 **Mises à jour en temps réel** - WebSocket pour les actualisations instantanées

## Installation

```bash
npm run install-all
```

## Démarrage

### Mode développement

```bash
npm run dev
```

Le client React démarre sur `http://localhost:3000`
Le serveur Express démarre sur `http://localhost:5000`

### Mode production

```bash
npm run build
```

## Structure du projet

```
.
├── client/           # Application React (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── server/           # Serveur Node.js/Express (Backend)
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
├── README.md
└── package.json
```

## Technologies utilisées

- **Frontend**: React, Axios, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, SQLite/MongoDB
- **Authentication**: JWT
- **Database**: SQLite (développement) / MongoDB (production)

## Variables d'environnement

Voir `.env.example` dans les dossiers `client/` et `server/`

## Auteur

Created for collaborative fundraising
