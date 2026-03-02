import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role : {
        type : String,
        enum : ['user', 'ai'],
        required : true
    },

    text : {
        type : String,
        required : true
    },


}, {
    timestamps : true
})

const verityChatSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    title : {
        type : String,
        default : "New Chat"
    },

    messages : [messageSchema]


}, {
    timestamps:true
})

export default mongoose.model("VerityChat", verityChatSchema)