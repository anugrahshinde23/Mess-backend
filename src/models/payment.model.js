import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    order : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true
    },

    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess",
        required : true
    },
    amount : {
        type : Number,
        required : true
    },

    status : {
        type : String,
        enum : ["PAID","FAILED", "PENDING"],
        default : "PENDING"
    },
    paymentMethod : {
        type : String,
        default : "UPI_INTENT"
    },

    utrNumber : {
        type : String,
        required : true,
        unique : true
    },



},{
    timestamps : true
})

export default mongoose.model("Payment", paymentSchema)