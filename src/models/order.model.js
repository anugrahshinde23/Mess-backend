import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess",
        required : true
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    payment : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Payment"
    },

    mealType : {
        type : String,
        enum : ["breakfast","lunch","dinner"],
        required : true
    },

    items : {
        type : [String],
        required : true
    },

    orderDate : {
        type : Date,
        default : Date.now()
    },

    status : {
        type : String,
        enum : ["PLACED","COMPLETED","CANCELLED"],
        default : "PLACED"
    }
}, {
    timestamps : true
})


export default mongoose.model("Order", orderSchema)