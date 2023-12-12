const {createUser, logUser} = require("../controllers/user")

const express = require ("express")
const authRouter = express.Router()

authRouter.post("/signup", createUser)
authRouter.post("/login", logUser)


module.exports = {authRouter}