import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        unique : true
    },

    balance : {
        type : Number,
        default : 0
    },

    isActive : {
        type : Boolean,
        default : true
    },
    walletDetails: {
        upiId: String,
        bankAccount: String,
        ifsc: String
      }
}, {
    timestamps : true
})

export default mongoose.model("Wallet", walletSchema)