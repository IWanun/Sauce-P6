const express = require("express");
const { getSauces, createSauces, getSauceById, deleteSauce, modifySauces, likeSauce } = require("../controllers/sauces");
const { upload } = require("../middleware/multer");
const { authenticateUser } = require("../middleware/auth");

// Création d'un routeur express pour les sauces
const saucesRouter = express.Router();

// Définition des routes avec les fonctions correspondantes et le middleware d'authentification
saucesRouter.get("/", authenticateUser, getSauces);                    // Route pour obtenir toutes les sauces
saucesRouter.post("/", authenticateUser, upload.single("image"), createSauces);  // Route pour créer une nouvelle sauce
saucesRouter.get("/:id", authenticateUser, getSauceById);             // Route pour obtenir une sauce spécifique par son ID
saucesRouter.delete("/:id", authenticateUser, deleteSauce);          // Route pour supprimer une sauce
saucesRouter.put("/:id", authenticateUser, upload.single("image"), modifySauces);  // Route pour modifier une sauce
saucesRouter.post("/:id/like", authenticateUser, likeSauce);        // Route pour aimer ou ne pas aimer une sauce

// Exportation du routeur saucesRouter
module.exports = { saucesRouter };
