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

  frontend: String,
  backend: String,
  database: String,

  features: {
    type: [String],
    default: []
  },

  architecture: {
    type: Object,
    default: {}
  },

  fileStructure: {
    type: Object,
    default: {}
  },

  github: {
    repoName: String,
    repoUrl: String,
    branch: { type: String, default: "main" },
    lastCommit: String
  },

  deployment: {
    provider: String,
    url: String,
    status: {
      type: String,
      enum: ["pending", "deployed", "failed"],
      default: "pending"
    }
  },

  version: {
    type: Number,
    default: 1
  },

  errorMessage: String,

  status: {
    type: String,
    enum: ["draft", "generated", "completed", "failed"],
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

}, { timestamps: true });

export default mongoose.model("Project", projectSchema);