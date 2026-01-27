import { addPlanToMess, createPlan, getAllMessPlans, getAllPlans, removePlanFromMess } from "../services/plan.service.js";

export const createOwnerPlan = async(req,res) => {
    try {
        const data = await createPlan(req.body)

        return res.status(200).json({
            success : true,
            message : "Plan created successfully",
            planData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to create the Plan"
        })
        
    }
}


export const addPlanToOwnerMess = async(req,res) => {
    try {
        const ownerId = req.user.id
        const data = await addPlanToMess(req.body, ownerId)

        return res.status(200).json({
            success : true,
            message : "Plan Added to Mess successfully",
            planData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : "Failed to add plan to the mess"
        })
    }
}

export const getAllOwnerPlans = async(req,res) => {
    try {
        const data = await getAllPlans()

        return res.status(200).json({
            success : true,
            message : "Plans fetched successfully",
            plansData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : false,
            message : "Failed to fetch the Plans"
        })
    }
}

export const removePlanFromOwnerMess = async(req,res) => {
    try {
        console.log("BODY : ", req.body);
        const {planId} = req.body
        
        
        const ownerId = req.user.id

        const data = await removePlanFromMess(planId, ownerId)

        return res.status(200).json({
        success : true,
        message : "Plan removed from MESS",
        messData : data
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
        success : false,
        message : "Failed to remove plan from mess"
        })
        
    }
}


export const getAllMessOwnerPlans = async(req,res) => {

    try {
        const {messId} = req.params

        const data = await getAllMessPlans(messId)

        return res.status(200).json({
            success : true,
            message : "Fetched Plans successfully",
            plansData : data.plan 
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success : "false",
            message : "Failed to fetch the Plans"
        })
        
    }
}