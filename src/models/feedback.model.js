import mongoose from 'mongoose'


const feedbackSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        unique : true
    },
    name : {
        type : String
    },

    email : {
        type : String
    },

    phone : {
        type : String
    },

    message : {
        type : String
    },

    status : {
        type : String,
        enum : ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
        default : 'OPEN'
    }
},
{
    timestamps : true
}
)



export default mongoose.model('Feedback', feedbackSchema)