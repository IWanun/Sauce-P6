const multer = require("multer");

// Configuration du stockage pour multer
const storage = multer.diskStorage({
    destination: "images/",  // Le dossier où les fichiers seront sauvegardés
    filename: function (req, file, cb) {
        // Utilisation de la fonction makeFileName pour générer le nom de fichier
        cb(null, makeFileName(req, file));
    }
});

// Fonction pour générer le nom de fichier
function makeFileName(req, file) {
    const fileName = `${Date.now()}-${file.originalname}`;
    // Ajout du nom de fichier à l'objet file pour une utilisation ultérieure si nécessaire
    file.fileName = fileName;
    return fileName;
}

// Configuration de l'upload avec multer en utilisant le stockage défini
const upload = multer({ storage: storage });

// Exportation du middleware d'upload configuré
module.exports = { upload };
