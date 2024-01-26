// Importation des modules nécessaires
const mongoose = require("mongoose");
const unlink = require("fs").promises.unlink;

// Schéma mongoose pour les produits (sauces)
const productSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: { type: Number, min: 1, max: 10 },
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String]
});

// Modèle mongoose pour les produits
const Product = mongoose.model("Product", productSchema);

// Fonction pour obtenir toutes les sauces
function getSauces(req, res) {
  console.log("Le token a été validé, nous sommes dans getSauces");
  Product.find({})
    .then((products) => res.send(products))
    .catch(console.error);
}

// Fonction pour obtenir une sauce spécifique par ID
function getSauce(req, res) {
  const { id } = req.params;
  return Product.findById(id);
}

// Fonction pour obtenir une sauce par ID et envoyer une réponse au client
function getSauceById(req, res) {
  getSauce(req, res)
    .then((product) => sendClientResponse(product, res))
    .catch(console.error);
}

// Fonction pour supprimer une sauce par ID
function deleteSauce(req, res) {
  const { params: { id } } = req;
  const userIdFromRequest = req.body.userId;

  // Vérifier si l'utilisateur est le créateur de la sauce
  getSauce(req, res)
    .then((product) => {
      if (product.userId == userIdFromRequest) {
        return res.status(403).send({ message: "Vous n'avez pas le droit de supprimer cette sauce." });
      }

      return Product.findByIdAndDelete(id)
        .then(product => sendClientResponse(product, res))
        .then((product) => deleteImage(product))
        .then((res) => console.log("FILE DELETED", res))
        .catch(console.error);
    })
    .catch(console.error);
}

// Fonction pour modifier une sauce par ID
function modifySauces(req, res) {
  const { params: { id } } = req;
  const userIdFromRequest = req.body.userId;

  // Vérifier si l'utilisateur est le créateur de la sauce
  getSauce(req, res)
    .then((product) => {
      if (product.userId !== userIdFromRequest) {
        return res.status(403).send({ message: "Vous n'avez pas le droit de modifier cette sauce." });
      }

      const hasNewImage = req.file != null;
      const payload = makePayload(hasNewImage, req);

      return Product.findByIdAndUpdate(id, payload)
        .then((dbResponse) => sendClientResponse(dbResponse, res))
        .then((product) => deleteImage(product))
        .then((res) => console.log("FILE DELETED", res))
        .catch(err => console.error("PROBLEME UPDATING", err));
    })
    .catch(console.error);
}

function deleteImage(product) {
  if (product == null) return
  console.log("DELETE IMAGE", product)
  const imageToDelete = product.imageUrl.split("/").at(-1)
  return unlink("images/" + imageToDelete)
}


// Fonction pour créer le payload en fonction de la présence d'une nouvelle image
function makePayload(hasNewImage, req) {
  // Affichage dans la console pour indiquer si une nouvelle image est présente
  console.log("hasNewImage:", hasNewImage);

  // Si aucune nouvelle image n'est présente, retourne le corps de la requête tel quel
  if (!hasNewImage) return req.body;

  // Si une nouvelle image est présente, parse le JSON du corps de la requête
  const payload = JSON.parse(req.body.sauce);

  // Ajoute l'URL de la nouvelle image au payload en utilisant makeImageUrl
  payload.imageUrl = makeImageUrl(req, req.file.fileName);

  // Affichage dans la console pour indiquer la gestion de la nouvelle image
  console.log("Nouvelle Image à gérer");
  console.log("Voici le payload:", payload);

  // Retourne le payload mis à jour
  return payload;
}


// Fonction pour envoyer une réponse au client
function sendClientResponse(product, res) {
  if (product == null) {
    console.log("NOTHING TO UPDATE");
    return res.status(404).send({ message: "Object not found in the database" });
  }
  console.log("ALL GOOD, UPDATING:", product);
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

// Fonction pour créer une URL d'image
function makeImageUrl(req, fileName) {
  return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

// Fonction pour créer une nouvelle sauce
function createSauces(req, res) {
  // Extraction du corps et du fichier de la requête
  const { body, file } = req;
  // Extraction du nom de fichier du fichier
  const { fileName } = file;
  // Parsage du JSON contenu dans la propriété "sauce" du corps de la requête
  const sauce = JSON.parse(body.sauce);
  // Extraction des propriétés nécessaires de la sauce
  const { name, manufacturer, description, mainPepper, heat, userId } = sauce;

  // Création d'une nouvelle instance de Product (sauce)
  const product = new Product({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  // Sauvegarde de la nouvelle sauce dans la base de données
  product
    .save()
    .then((message) => res.status(201).send({ message: message }))
    .catch((err) => res.status(500).send(err));
}


// Fonction pour gérer les likes/dislikes d'une sauce
function likeSauce(req, res) {
  const { like, userId } = req.body;
  if (![1, -1, 0].includes(like)) return res.status(403).send({ message: "Invalid like value" });

  getSauce(req, res)
    .then((product) => updateVote(product, like, userId, res))
    .then((pr) => pr.save())
    .then((prod) => sendClientResponse(prod, res))
    .catch(console.error);
}

// Fonction pour mettre à jour les votes (likes/dislikes) d'une sauce
function updateVote(product, like, userId, res) {
  if (like === 1 || like === -1) return incrementVote(product, userId, like);
  return resetVote(product, userId, res);
}

// Fonction pour réinitialiser les votes d'une sauce
function resetVote(product, userId, res) {
  // Destructuration des propriétés de l'objet product
  const { usersLiked, usersDisliked } = product;
  
  // Vérification si l'utilisateur a voté dans les deux sens
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    return Promise.reject("User seems to have voted both ways");

  // Vérification si l'utilisateur n'a pas voté du tout
  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    return Promise.reject("User seems to not have voted");

  // Si l'utilisateur a voté "like", ajuster les likes et la liste des votes "like"
  if (usersLiked.includes(userId)) {
    --product.likes;
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  } 
  // Si l'utilisateur a voté "dislike", ajuster les dislikes et la liste des votes "dislike"
  else {
    --product.dislikes;
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }

  // Retour de l'objet modifié
  return product;
}


// Fonction pour incrémenter les votes d'une sauce
function incrementVote(product, userId, like) {
  // Destructuration des propriétés de l'objet product
  const { usersLiked, usersDisliked } = product;

  // Détermination du tableau de votes en fonction de la valeur de like
  const votersArray = like === 1 ? usersLiked : usersDisliked;

  // Vérification si l'utilisateur a déjà voté
  if (votersArray.includes(userId)) return product;

  // Ajout de l'ID de l'utilisateur au tableau de votes
  votersArray.push(userId);

  // Incrémentation des likes ou des dislikes en fonction de la valeur de like
  like === 1 ? ++product.likes : ++product.dislikes;

  // Retour de l'objet modifié
  return product;
}


// Exportation des fonctions pour les rendre disponibles dans d'autres fichiers
module.exports = { sendClientResponse, getSauce, getSauces, createSauces, getSauceById, deleteSauce, modifySauces, likeSauce };
