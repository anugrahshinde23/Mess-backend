import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { allowedRoles } from '../middlewares/allowedRole.middleware.js'
import { createOwnerPlan, addPlanToOwnerMess, getAllOwnerPlans, removePlanFromOwnerMess, getAllMessOwnerPlans } from '../controllers/plan.controllers.js'
const router = express.Router()

router.post('/create-plan', verifyJWT, createOwnerPlan)
router.post('/add-plan-to-mess', verifyJWT, allowedRoles('MESS_OWNER'), addPlanToOwnerMess)
router.get('/get-all-plans', verifyJWT, allowedRoles('MESS_OWNER','ADMIN'), getAllOwnerPlans)
router.delete('/remove-plan-from-mess', verifyJWT, allowedRoles('MESS_OWNER'), removePlanFromOwnerMess)
router.get('/get-all-mess-plans/:messId', verifyJWT, allowedRoles('CUSTOMER'), getAllMessOwnerPlans)

export default router