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



import { Document } from '@langchain/core/documents';
import { createEmbeddingsAndSendToDB } from '../../rag/embeddings.js';
import { deleteFromVectorDB } from '../../rag/embeddings.js';

// This hook triggers when you use Mess.findByIdAndDelete()
messSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await deleteFromVectorDB(doc._id.toString());
    }
});


menuSchema.post('save', async function(doc) {
    try {
        await doc.populate("mess");
        const messName = doc.mess?.name || "Unknown Mess";
        const messAddress = doc.mess?.address || "";
    
        const formatMeal = (meal, type) => {
          if (!meal || !meal.items || meal.items.length === 0) return "";
          return `${type}: ${meal.items.join(", ")} (Time: ${meal.startTime} - ${meal.endTime})`;
        };
    
        const text = `
    Mess Name: ${messName}
    Address: ${messAddress}
    Day: ${doc.day}
    Menu Details:
    ${formatMeal(doc.breakfast, "Breakfast")}
    ${formatMeal(doc.lunch, "Lunch")}
    ${formatMeal(doc.dinner, "Dinner")}
    `.trim();

        const langchainDoc = new Document({
          pageContent: text,
          metadata: { type: "menu", id: doc._id.toString(), messId: doc.mess?._id.toString() }
        });

        await createEmbeddingsAndSendToDB([langchainDoc]);
        console.log(`✅ Vector Store updated for Menu: ${doc.day}`);
    } catch (error) {
        console.error("❌ Error syncing Menu to Vector Store:", error);
    }
});

export default mongoose.model("Menu", menuSchema)

