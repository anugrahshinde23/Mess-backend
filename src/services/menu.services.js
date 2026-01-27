import Menu from "../models/menu.model.js"
import Mess from "../models/mess.model.js"
import { getTodaysDay } from "../utility/getTodaysDay.js"

export const createMenu = async(ownerId, menuData) => {
    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    const messId = mess._id

    const today = getTodaysDay()

    const menu = await Menu.findOneAndUpdate({
        mess : messId, day : today
    },{
        mess : messId,
        day : today,
        breakfast : menuData.breakfast,
        lunch : menuData.lunch,
        dinner : menuData.dinner
    },{
        new : true, upsert : true
    })
    

    return menu
}

export const getTodaysMenu = async(ownerId) => {
    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    const messId = mess._id

    const today = getTodaysDay()

    const menu = await Menu.findOne({
        mess : messId,
        day : today
    })

    if(!menu){
        throw new Error("Menu for this Mess is not available")
    }

    return menu
}

export const getTodaysMenuById = async (messId) => {


   const today = getTodaysDay()

    const menu = await Menu.findOne({
        mess : messId,
        day : today
    })

    if(!menu){
        throw new Error("Menu doesnt exist")
    }

    return menu
}