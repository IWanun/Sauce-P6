const jwt = require("jsonwebtoken");

// Middleware pour authentifier l'utilisateur
function authenticateUser(req, res, next) {
    console.log("authenticate user");

    // Récupération de l'en-tête "Authorization" de la requête
    const header = req.header("Authorization");

    // Vérification si l'en-tête est présent
    if (header == null) return res.status(403).send({ message: "Invalid" });

    // Extraction du token 
    const token = header.split(" ")[1];

    // Vérification si le token est présent
    if (token == null) return res.status(403).send({ message: "Token cannot be null" });

    // Vérification et décryptage du token JWT
    jwt.verify(token, process.env.JWT_PASSWORD, (err, decoded) => {
        // Si une erreur survient, le token est invalide
        if (err) return res.status(403).send({ message: "Token invalid" + err });

        // Si le token est valide, affichage d'un message et appel de la fonction suivante (next)
        console.log("Le Token est bien valide, nous pouvons donc continuer");
        next();
    });
}

module.exports = { authenticateUser };
