// 1 MESS = 1 OWNER

import mongoose from 'mongoose'


const messPlanSchema = new mongoose.Schema({
    plan : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Plan",
        required : true
    }, 

    price : {
        type : Number,
        required : true
    }
})

const messSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    address : {
        type : String,
        required : true
    },

    pincode : {
        type : Number,
        required : true
    },

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        unique : true
    },


    deliveryPartners : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "DeliveryBoy"
        }
    ],


    plan : [messPlanSchema],

    isActive : {
        type : Boolean,
        default : true
    },

    description : {
        type : String,
        
    },

    contact : {
        type :String,
        
    },

    deliveryType : {
        type : String,
        enum : ["SELF_PICK","DELIVERY"],
        default : "SELF_PICK"
    }
}, {
    timestamps : true
})

export default mongoose.model("Mess", messSchema)