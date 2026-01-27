import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
    type : {
        type : String,
        enum : ["ONE_TIME", "ONE_DAY", "WEEKLY", "MONTHLY"],
        required : true,
    },

    durationInDays : {
        type : Number,
        required : true
    },

    mealsIncluded : {
        type : [String],
        enum : ["Breakfast", "lunch", "dinner"],
        required : true
    }
}, {
    timestamps : true
})

export default mongoose.model("Plan", planSchema)