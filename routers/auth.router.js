// Importation des fonctions createUser et logUser depuis le fichier controllers/user
const { createUser, logUser } = require("../controllers/user");

// Importation du module express
const express = require("express");

// Création d'un routeur express
const authRouter = express.Router();

// Définition des routes avec les fonctions correspondantes
authRouter.post("/signup", createUser);  // Route pour l'inscription d'un utilisateur
authRouter.post("/login", logUser);      // Route pour la connexion d'un utilisateur

// Exportation du routeur
module.exports = { authRouter };
