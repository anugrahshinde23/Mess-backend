import mongoose, { mongo } from 'mongoose'

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

    orderShippingType : {
        type : String,
        enum : ["SELF_PICK", "DELIVERY", "NOT_DECIDED"],
        default : "NOT_DECIDED"
    },

    orderCompleteCode : {
        type : String,

    },

    source : {
        type: String,
        enum : ["NORMAL", "SUBSCRIPTION"],
        default : "NORMAL"     
    },

    subscription : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Subscription",
        default : null
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