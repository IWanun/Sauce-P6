require ('dotenv').config()
const express = require ("express")
const app = express()
const {saucesRouter} = require ("./routers/sauce.router")
const {authRouter} = require ("./routers/auth.router")
const bodyParser = require("body-parser")
const cors = require('cors')
const port = 3000
const path = require("path")

//Connection to database
require("./mongo")

// Middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/api/sauces", saucesRouter)
app.use("/api/auth", authRouter)

//Routes
app.get("/", (req, res) => res.send("Hello World!"))


//Listen
app.use("/images",express.static("images"))
app.listen(port, () => console.log("Listening on port " + port))



