# Utiliser une image Node.js
FROM node:16

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source dans le conteneur
COPY . .

# Installer ts-node-dev pour le mode développement
RUN npm install -g ts-node-dev

# Exposer le port de l'application
EXPOSE 3000

# Démarrer l'application en mode développement
CMD ["npm", "run", "start:dev"]
