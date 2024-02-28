const { default: mongoose } = require("mongoose");

//UsersSchema
const usersSchema = new mongoose.Schema({
    name:{type:String},
    email:{type:String, unique:true},
    password:String
})


const userCollection = new mongoose.model("users",usersSchema);


module.exports = userCollection;