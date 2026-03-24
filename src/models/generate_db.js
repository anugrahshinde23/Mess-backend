import mongoose from "mongoose";
import fs from 'fs'

import verityModel from "./verity/verity.model.js";
import deliveryBoyModel from "./deliveryBoy.model.js";
import feedbackModel from "./feedback.model.js";
import menuModel from "./menu.model.js";
import messModel from "./mess.model.js";
import notificationModel from "./notification.model.js";
import orderModel from "./order.model.js";
import orderRequestModel from "./orderRequest.model.js";
import paymentModel from "./payment.model.js";
import planModel from "./plan.model.js";
import subscriptionModel from "./subscription.model.js";
import userModel from "./user.model.js";
import walletModel from "./wallet.model.js";

async function generateStructuredDoc() {
    const models = mongoose.modelNames();
    let doc = "# 🏗️ Database Architecture Specification\n\n";
    
    // 1. High-Level Summary
    doc += "## 1. System Overview\n| Collection | Fields | Indexes | Description |\n| :--- | :--- | :--- | :--- |\n";
    models.forEach(name => {
        const m = mongoose.model(name);
        doc += `| **${name}** | ${Object.keys(m.schema.paths).length} | ${m.schema.indexes().length} | Primary ${name} storage |\n`;
    });
    doc += "\n---\n\n";

    // 2. Detailed Collection Breakdown
    doc += "## 2. Collection Definitions\n\n";
    models.forEach(name => {
        const schema = mongoose.model(name).schema;
        doc += `### 📁 Collection: ${name}\n`;
        
        // Fields Table
        doc += "#### Fields Structure\n";
        doc += "| Field | Type | Validation | Ref | Default |\n";
        doc += "| :--- | :--- | :--- | :--- | :--- |\n";

        Object.keys(schema.paths).forEach(path => {
            const f = schema.paths[path];
            const type = f.instance;
            const req = f.options.required ? "REQUIRED" : "Optional";
            const unique = f.options.unique ? "UNIQUE" : "";
            const ref = f.options.ref ? `🔗 ${f.options.ref}` : "-";
            const def = f.options.default !== undefined ? `\`${f.options.default}\`` : "-";

            doc += `| **${path}** | \`${type}\` | ${req} ${unique} | ${ref} | ${def} |\n`;
        });

        // Index Summary
        const indexes = schema.indexes();
        if (indexes.length > 0) {
            doc += "\n#### Performance Indexes\n";
            indexes.forEach(idx => {
                doc += `- \`${JSON.stringify(idx[0])}\` (Unique: ${!!idx[1].unique})\n`;
            });
        }

        doc += "\n---\n";
    });

    fs.writeFileSync('DATABASE_STRUCTURE.md', doc);
    console.log("🚀 Well-structured design generated in DATABASE_STRUCTURE.md");
}

generateStructuredDoc();