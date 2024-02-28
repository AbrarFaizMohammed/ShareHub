const { default: mongoose, Schema } = require("mongoose");

const messagesSchema = new mongoose.Schema({
    senderUserId:{
        type:Schema.Types.ObjectId, ref:'users'
    },
    Message:{
        type:String
    },
    MessageTimeStamp:{
        type:Date
    },
    receiverUserId:{
        type:Schema.Types.ObjectId, ref:'users'
    }
},{timestamps:true});

const messagesCollection = new mongoose.model('messages',messagesSchema);

module.exports=messagesCollection;