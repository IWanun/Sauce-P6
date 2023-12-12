const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator")
const uri = "mongodb+srv://Hamad94:4liGrGv4BVxE3rH8@projet-6.dccvhpb.mongodb.net/?retryWrites=true&w=majority";


mongoose
.connect(uri)
.then((()=> console.log("Connected to Mongo!")))
.catch(err => console.error("Error connecting to Mongo:", err))

//Je crée le Schema mongoose
const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

userSchema.plugin(uniqueValidator)

//Je fabrique mon model en utilisant le Schema
const User = mongoose.model("User",userSchema)

module.exports = {mongoose, User,}