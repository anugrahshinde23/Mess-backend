import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role : {
        type : String,
        enum : ['user', 'assistant'],
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

    mode : {
        type : String,
        enum : ["chat", "project"],
        default : "chat"
    },

      projectSetup: {
    step: { type: Number, default: 0 },
    data: { type: Object, default: {} },
  },

    messages : [messageSchema]


}, {
    timestamps:true
})

export default mongoose.model("VerityChat", verityChatSchema)