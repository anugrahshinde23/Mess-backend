import mongoose from 'mongoose'





const mealSchema = new mongoose.Schema({
    items : [String],

    startTime : {
        type : String,
        required : true
    },

    endTime : {
        type : String,
        required : true
    }
}) 

const menuSchema = new mongoose.Schema({
    mess : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mess",
        required : true,
        
    },

    day : {
        type : String,
        enum : [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],

        required : true
    },

    breakfast : mealSchema,
    lunch : mealSchema,
    dinner : mealSchema
}, {
    timestamps : true
})

export default mongoose.model("Menu", menuSchema)