const { default: mongoose, Schema } = require("mongoose");


const productSchema = new mongoose.Schema({
    Name:{
        type:String,
        unique:true
    },
    category:{
        type:Schema.Types.ObjectId, ref:'CategoryImages'
    },
    location:{
        type:String
    },
    imageData:{
        type:Buffer
    },
    user:{
        type:Schema.Types.ObjectId, ref:'users'
    }
});

const productCollection = new mongoose.model('ProductImages',productSchema);

module.exports = productCollection;