const jwt = require("jsonwebtoken")

function authenticateUser(req, res, next){
    console.log("authenticate user")
    const header = req.header("Authorization")
    if (header == null) return res.status(403).send({message: "Invalid"})
    const token = header.split(" ")[1]
    if (token == null) return res.status(403).send({message: "Token cannot be null"})

        jwt.verify(token, process.env.JWT_PASSWORD, (err,decoded)=> {
        if(err) return res.status(403).send({message: "Token invalid" + err})
        console.log("Le Token est bien valide, nous pouvons donc continué")
        next()
    })
}

module.exports = {authenticateUser}