const { User } = require("../mongo")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Fonction pour créer un nouvel utilisateur dans la base de données
async function createUser(req, res) {
  try {
    //Récupérations de l'email et du password a partir du corps de la requête.
    const { email, password } = req.body;

    // Hash du mot de passe avant de l'enregistrer dans la base de données
    const hashedPassword = await hashPassword(password);

    // Création d'une nouvelle instance de l'utilisateur avec le mot de passe hashé 
    const user = new User({ email, password: hashedPassword });

    // Enregistrement de l'utilisateur dans la base de données
    await user.save();

    // Réponse indiquant que l'utilisateur a été enregistré avec succès
    res.status(201).send({ message: "Utilisateur enregistré !" });
  } catch (err) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    res.status(409).send({ message: "User pas enregistré : " + err });
  }
}

// Fonction pour hasher le mot de passe avec bcrypt
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Fonction pour authentifier un utilisateur et générer un token JWT
async function logUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Recherche de l'utilisateur dans la base de données par email
    const user = await User.findOne({ email: email });

    // Vérification du mot de passe hashé
    const isPasswordOK = await bcrypt.compare(password, user.password);
    if (!isPasswordOK) {
      // Réponse en cas de mot de passe incorrect
      res.status(403).send({ message: "Mot de passe incorrect" });
    }

// Création d'un token JWT avec le userId et envoi de la réponse au client 
const token = createToken(user._id);
res.status(200).send({ userId: user._id, token: token });

  } catch (err) {
    // Gestion des erreurs et envoi d'une réponse d'erreur au client
    console.error(err);
    res.status(500).send({ message: "Erreur interne" });
  }
}

// Fonction pour créer un token JWT en utilisant le userId de l'utilisateur
function createToken(userId) {
  // Le JWT sont signé numériquement à l'aide d'une clé secrète
  const jwtPassword = process.env.JWT_PASSWORD;
  // Création du token JWT en incluant le userId de l'utilisateur et en spécifiant une expiration de 24 heures.
  return jwt.sign({ userId: userId }, jwtPassword, { expiresIn: "24h" });
  // Les JWT ne stockent pas de mot de passe ou d'informations sensibles, ils ne font que fournir une preuve d'authentification. 
}


// Exportation des fonctions pour les utiliser dans d'autres fichiers
module.exports = { createUser, logUser };
