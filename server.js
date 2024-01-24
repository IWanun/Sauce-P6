// Chargement des variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importation du framework Express
const express = require('express');
const app = express();

// Importation des routeurs
const { saucesRouter } = require('./routers/sauce.router');
const { authRouter } = require('./routers/auth.router');

// Middleware
// Configurer CORS pour permettre les requêtes depuis n'importe quelle origine
const cors = require('cors');
app.use(cors());

// Analyser les requêtes JSON
app.use(express.json());

// Analyser les requêtes URL encodées
app.use(express.urlencoded({ extended: true }));

// Utilisation des routeurs pour les différentes parties de l'API
app.use('/api/sauces', saucesRouter);
app.use('/api/auth', authRouter);

// Routes
// Route de test pour vérifier si le serveur fonctionne
app.get('/', (req, res) => res.send('Hello World!'));

// Middleware pour servir les images statiques depuis le répertoire "images"
app.use('/images', express.static('images'));

// Configuration du port d'écoute
const port = process.env.PORT || 3000;

// Lancement du serveur
app.listen(port, () => console.log(`Listening on port ${port}`));
