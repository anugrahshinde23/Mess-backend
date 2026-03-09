import { Document } from '@langchain/core/documents'
import Menu from '../src/models/menu.model.js'
import Plan from '../src/models/plan.model.js'
import Mess from '../src/models/mess.model.js'

export const createDocuments = async () => {

    const docs = [];
  
    const menus = await Menu.find().populate("mess"); 
    const plans = await Plan.find();
    const messes = await Mess.find().populate("plan.plan");


    messes.forEach((mess) => {
        // 1. Format the plans and their specific prices for THIS mess
        const planInfo = mess.plan.map(p => {
          return `- ${p.plan?.type }: ₹${p.price}`;
        }).join("\n");
      
        // 2. Create a rich text description
        const text = `
      Mess Name: ${mess.name}
      Description: ${mess.description }
      Address: ${mess.address}, Pincode: ${mess.pincode}
      Contact: ${mess.contact || 'N/A'}
      Service Type: ${mess.deliveryType === 'DELIVERY' ? 'Home Delivery Available' : 'Self Pickup Only'}
      Subscription Pricing:
      ${planInfo}
      Status: ${mess.isActive ? 'Open for new subscriptions' : 'Currently Closed'}
      `.trim();
      
        docs.push(new Document({
          pageContent: text,
          metadata: { 
            type: "mess", 
            id: mess._id.toString(),
            pincode: mess.pincode 
          }
        }));
      });
  
    menus.forEach((menu) => {
        // Get the actual Mess Name from the populated object
        const messName = menu.mess?.name || "Unknown Mess";
        const messAddress = menu.mess?.address || "";
    
        // Helper to format each meal from your mealSchema
        const formatMeal = (meal, type) => {
          if (!meal || !meal.items || meal.items.length === 0) return "";
          return `${type}: ${meal.items.join(", ")} (Time: ${meal.startTime} - ${meal.endTime})`;
        };
    
        const text = `
    Mess Name: ${messName}
    Address: ${messAddress}
    Day: ${menu.day}
    Menu Details:
    ${formatMeal(menu.breakfast, "Breakfast")}
    ${formatMeal(menu.lunch, "Lunch")}
    ${formatMeal(menu.dinner, "Dinner")}
    `.trim();
    
        docs.push(new Document({
          pageContent: text,
          metadata: { type: "menu", id: menu._id.toString(), messId: menu.mess?._id.toString() }
        }));
      });
    
      // --- PLAN PROCESSING ---
      plans.forEach((plan) => {
        const text = `
    Subscription Plan
    Type: ${plan.type}
    Duration: ${plan.durationInDays} days
    Included Meals: ${plan.mealsIncluded.join(", ")}
    `.trim();
    
        docs.push(new Document({
          pageContent: text,
          metadata: { type: "plan", id: plan._id.toString() }
        }));
      });
    
      return docs;
    };