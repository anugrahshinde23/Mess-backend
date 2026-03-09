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


import { Document } from '@langchain/core/documents';
import { createEmbeddingsAndSendToDB } from '../../rag/embeddings.js';
import { deleteFromVectorDB } from '../../rag/embeddings.js';

// This hook triggers when you use Mess.findByIdAndDelete()
planSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await deleteFromVectorDB(doc._id.toString());
    }
});


// This triggers whenever a new subscription plan is created or updated
planSchema.post('save', async function(doc) {
    try {
        // Exact same formatting logic from your createDocuments.js
        const text = `
    Subscription Plan
    Type: ${doc.type}
    Duration: ${doc.durationInDays} days
    Included Meals: ${doc.mealsIncluded.join(", ")}
    `.trim();

        const langchainDoc = new Document({
          pageContent: text,
          metadata: { 
            type: "plan", 
            id: doc._id.toString() 
          }
        });

        // Sync this single plan to the Vector Store
        await createEmbeddingsAndSendToDB([langchainDoc]);
        
        console.log(`✅ Vector Store updated for Plan: ${doc.type}`);
    } catch (error) {
        console.error("❌ Error syncing Plan to Vector Store:", error);
    }
});


export default mongoose.model("Plan", planSchema)

