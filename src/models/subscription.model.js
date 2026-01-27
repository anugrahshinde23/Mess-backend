import mongoose from 'mongoose'

const subsSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess",
        required : true
    },

    plan : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Plan",
        required : true
    },

    startDate : {
        type : Date,
        required : false,
        default : null
    },

    endDate : {
        type : Date,
        required : false,
        default : null
    },

    status : {
        type : String,
        enum : ["PENDING", "ACTIVE", "REJECTED","EXPIRED"],
        default : "PENDING"
    },

    approvedBy : {
        type : mongoose.Schema.Types.ObjectId,
        required : false
    },

    approvedAt : {
        type : Date,
        default : null
    }
}, {
    timestamps : true
})

export default mongoose.model("Subscription", subsSchema)