const express = require ("express")
const {getSauces, createSauces, getSauceById, deleteSauce, modifySauces, likeSauce} = require("../controllers/sauces")
const {upload} = require("../middleware/multer")
const {authenticateUser} = require("../middleware/auth")
const saucesRouter = express.Router()

saucesRouter.get("/", authenticateUser, getSauces)
saucesRouter.post("/", authenticateUser, upload.single("image"), createSauces)
saucesRouter.get("/:id", authenticateUser, getSauceById)
saucesRouter.delete("/:id", authenticateUser, deleteSauce)
saucesRouter.put("/:id", authenticateUser, upload.single("image"), modifySauces)
saucesRouter.post("/:id/like", authenticateUser, likeSauce)

module.exports = {saucesRouter}