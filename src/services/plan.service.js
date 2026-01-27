import Plan from "../models/plan.model.js"
import Mess from "../models/mess.model.js"

export const createPlan = async(planData) => {
    const {type, durationInDays, mealsIncluded} = planData

    if(!type || !durationInDays || !mealsIncluded){
        throw new Error("Required fields")
    }

    const plan = await Plan.create({
        type,
        durationInDays,
        mealsIncluded
    })

    return plan 
}

export const addPlanToMess = async(planData, ownerId) => {
    const {planId, price} = planData

    if(!planId || !price){
        throw new Error("Required fields")
    }

    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess) {
        throw new Error("Mess not found")
    }

    const plan = await Plan.findById(planId)

    if(!plan){
        throw new Error("Plan not found")
    }

    const alreadyAdded = mess.plan.find(
      (p) => p.plan.toString() === planId
    );
    if (alreadyAdded) {
      throw new Error("Plan already added to Mess")
    }

    mess.plan.push({
        plan : planId,
        price
    })

    await mess.save()

    return mess.plan


}

export const getAllPlans = async () => {
    const plans = await Plan.find()

    if(!plans){
        throw new Error("Plans not found")
    }

    return plans
}

export const removePlanFromMess = async (planId, ownerId) => {

    if(!planId){
        throw new Error("plan id is required")
    }

    const mess = await Mess.findOneAndUpdate({
        owner : ownerId
    },

    {
        $pull : {
            plan: {plan: planId}
        }
    },
    {new: true}
)

if(!mess){
    throw new Error("Mess not found")
}

return mess
}



export const getAllMessPlans = async (messId) => {

    
    
    const mess = await Mess.findById(messId).populate({
        path : "plan.plan",
        model : "Plan"
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    return mess

}

