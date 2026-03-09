// 1 MESS = 1 OWNER

import mongoose from 'mongoose'


const messPlanSchema = new mongoose.Schema({
    plan : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Plan",
        required : true
    }, 

    price : {
        type : Number,
        required : true
    }
})

const messSchema = new mongoose.Schema({
    name : {
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

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        unique : true
    },


    deliveryPartners : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "DeliveryBoy"
        }
    ],


    plan : [messPlanSchema],

    isActive : {
        type : Boolean,
        default : true
    },

    description : {
        type : String,
        
    },

    contact : {
        type :String,
        
    },

    deliveryType : {
        type : String,
        enum : ["SELF_PICK","DELIVERY"],
        default : "SELF_PICK"
    }
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


// This hook triggers after every .save() or .create()
messSchema.post('save', async function(doc) {
    try {
        // 1. Populate the plan data (same as your createDocuments.js)
        await doc.populate("plan.plan");

        // 2. Exact same logic from your createDocuments.js
        const planInfo = doc.plan.map(p => {
          return `- ${p.plan?.type || 'Plan'}: ₹${p.price}`;
        }).join("\n");
      
        const text = `
      Mess Name: ${doc.name}
      Description: ${doc.description || ''}
      Address: ${doc.address}, Pincode: ${doc.pincode}
      Contact: ${doc.contact || 'N/A'}
      Service Type: ${doc.deliveryType === 'DELIVERY' ? 'Home Delivery Available' : 'Self Pickup Only'}
      Subscription Pricing:
      ${planInfo}
      Status: ${doc.isActive ? 'Open for new subscriptions' : 'Currently Closed'}
      `.trim();
      
        const langchainDoc = new Document({
          pageContent: text,
          metadata: { 
            type: "mess", 
            id: doc._id.toString(),
            pincode: doc.pincode 
          }
        });

        // 3. Sync only this ONE new/updated document
        // We pass it as an array [langchainDoc]
        await createEmbeddingsAndSendToDB([langchainDoc]);
        
        console.log(`✅ Vector Store updated for Mess: ${doc.name}`);
    } catch (error) {
        console.error("❌ Error syncing Mess to Vector Store:", error);
    }
});


export default mongoose.model("Mess", messSchema)

