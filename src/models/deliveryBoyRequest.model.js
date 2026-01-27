import mongoose from 'mongoose'

const deliveryBoyRequestSchema = new mongoose.Schema({
    deliveryBoy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "DeliveryBoy"
    },

    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess"
    },

    status : {
        type : String,
        enum : ["PENDING", "APPROVED", "REJECTED"],
        default : "PENDING"
    },

    requestedAt : {
        type : Date,
        default : Date.now()
    },

    responsedAt : {
        type : Date
    }


}, {
    timestamps : true
})

export default mongoose.model("DeliveryBoyRequest", deliveryBoyRequestSchema)