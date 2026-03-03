import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  frontend: {
    type: String,
    default: null
  },

  backend: {
    type: String,
    default: null
  },

  database: {
    type: String,
    default: null
  },

  features: {
    type: [String],   // 👈 ARRAY better than string
    default: []
  },

  architecture : {
    type : String
  },

  fileStructure : {
    type : Object,
    default : {}
  },

  status: {
    type: String,
    enum: ["draft", "generated", "completed"],
    default: "draft"
  },

  execution: {
    frontendPort: Number,
    backendPort: Number,
    status: {
      type: String,
      enum: ["running", "stopped"],
      default: "stopped"
    }
  },

  outputPreference: {
    type: String,
    enum: ["vscode", "download"],
    default: "download"
  }

}, {
  timestamps: true
});

export default mongoose.model("Project", projectSchema);