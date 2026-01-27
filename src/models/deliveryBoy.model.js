import mongoose from 'mongoose'

const deliveryBoySchema = new mongoose.Schema({

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    servicePinCodes : {
        type : [String],
        required : true
    },

    workingMesses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Mess"
        }
    ],

    availabilityStatus : {
        type : String,
        enum : ["AVAILABLE", "BUSY", "OFFLINE"],
        default : "OFFLINE"
    },

    activeOrder : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        default : null
    }
}, {
    timestamps : true
})

export default mongoose.model("DeliveryBoy", deliveryBoySchema)