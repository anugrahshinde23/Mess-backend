import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },

    projectName : {
        type : String,
        required : true
    },

    frontend : {
        enabled : {
            type : Boolean,
            default : false
        },

        framework : {
            type : String,
            default : ''
        }
    },

    backend : {
        enabled : {
            type : Boolean,
            default : false
        },

        framework : {
            type : String,
            default : ''
        }
    },

    database : {
        enabled : {
            type : Boolean,
            default : false
        },

        dbType : {
            type : String,
            default : ''
        }
    },

    outputPreference : {
        type : String,
        enum : ['VScode', 'Download'],
        default : 'Download'
    }


}, {
    timestamps : true
})


export default mongoose.model('Project', projectSchema)