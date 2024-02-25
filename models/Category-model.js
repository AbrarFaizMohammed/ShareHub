const { default: mongoose } = require("mongoose");


const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        unique:true
    },
    imageData:{
        type:Buffer
    }
});

const  categoryCollection = new mongoose.model('CategoryImages',categorySchema);

module.exports=categoryCollection;