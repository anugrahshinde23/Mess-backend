import mongoose from "mongoose";

const orderRequestSchema = new mongoose.Schema({
    dBoy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "DeliveryBoy"
    },

    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess"
    },

    order : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order"
    },

    status : {
        type : String,
        enum : ["PENDING", "REJECTED", "ACCEPTED", "EXPIRED"],
        default : "PENDING"
    },

    expiresAt : {
        type : Date,
    }
}, {
    timestamps : true
})

export default mongoose.model("OrderRequest",orderRequestSchema)