# Twitter Clone

Un clone de Twitter construit avec Next.js, MongoDB et TailwindCSS.

## Prérequis

- Node.js (v18 ou supérieur)
- MongoDB
- npm ou yarn

## Configuration de MongoDB

### Installation de MongoDB

#### Sur macOS (avec Homebrew)
```bash
# Installation
brew tap mongodb/brew
brew install mongodb-community

# Démarrer le service
brew services start mongodb-community

# Arrêter le service
brew services stop mongodb-community
```

#### Sur Windows
1. Téléchargez MongoDB Community Server depuis [le site officiel](https://www.mongodb.com/try/download/community)
2. Installez en suivant les instructions
3. Démarrez le service via les Services Windows ou avec:
```bash
net start MongoDB
```
4. Pour arrêter:
```bash
net stop MongoDB
```

#### Sur Linux (Ubuntu/Debian)
```bash
# Installation
sudo apt update
sudo apt install -y mongodb

# Démarrer le service
sudo systemctl start mongodb

# Arrêter le service
sudo systemctl stop mongodb
```

### Configuration de la base de données

1. Créez un fichier `.env.local` à la racine du projet avec:
```
MONGODB_URI=mongodb://localhost:27017/twitter-clone
DATABASE_URL="file:./dev.db"
```

## Installation du projet

```bash
# Installer les dépendances
npm install
# ou
yarn install

# Initialiser Prisma (si nécessaire)
npx prisma generate
```

## Démarrage du projet

```bash
# Mode développement
npm run dev
# ou
yarn dev

# Production
npm run build
npm start
# ou
yarn build
yarn start
```

Le projet sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Arrêt du projet

Pour arrêter le serveur de développement, appuyez simplement sur `Ctrl+C` dans le terminal où il est exécuté.

## Fonctionnalités

- Authentification des utilisateurs
- Création et affichage de tweets
- Système de followers/following
- Profils utilisateurs
- Exploration des tweets

## Structure du projet

- `/src/app` - Pages et routes Next.js
- `/src/components` - Composants React réutilisables
- `/src/lib` - Utilitaires et configuration
- `/src/models` - Modèles Mongoose
- `/prisma` - Configuration Prisma
- `/public` - Ressources statiques
