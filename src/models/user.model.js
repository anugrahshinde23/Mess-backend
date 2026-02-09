import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },

    phone : {
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

    password : {
        type : String,
        required : true
    },

    role : {
        type : String,
        enum : ['CUSTOMER','MESS_OWNER', 'ADMIN','DELIVERY_BOY'],
        default : 'CUSTOMER'
    },

    refreshToken : {
        type : String,
        required : false
    },

    passwordResetOTP : {
        type : String
    },

    passwordResetOTPExpiry : {
        type : Date
    },

    isActive : {
        type : Boolean,
        default : true
    }
}, {
    timestamps : true
})

export default mongoose.model("User", userSchema)