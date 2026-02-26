import mongoose, { Schema } from "mongoose";


const walletSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    amount : {
        type : Number,
        default : 0
    },

    isActive : {
        type : Boolean,
        default : true
    }
}, {
    timestamps : true
})

export default mongoose.model("Wallet", walletSchema)