import Mess from "../models/mess.model.js"
import User from "../models/user.model.js"


export const createMess = async(messData, ownerId) => {



   const messExist = await Mess.findOne({
    owner : ownerId
   })

   if(messExist){
    throw new Error("Mess already registered")
   }


    const {name, address, description, contact, pincode} = messData

    if(!name || !address || !description || !contact || !pincode){
        throw new Error("All fields are required")
    }

    

    const mess = await Mess.create({
        name,
        address,
        pincode,
        description,
        contact,
        owner : ownerId
        
    })

    const owner = await User.findById(ownerId)

    if(!owner){
        throw new Error("User not found")
    }

    owner.role = "MESS_OWNER",
    await owner.save()

    return mess

    
}

export const getMess = async (ownerId) => {
    const mess = await Mess.findOne({
        owner : ownerId,
        isActive : true
    })

    const messId = mess._id

    const messInfo = await Mess.findById(messId) 

    if(!messInfo){
        throw new Error("Mess not found")
    }

    return mess
}

export const updateMess = async (messData,ownerId) => {
    const {name, address, description, contact} = messData


     const mess = await Mess.findOne({
        owner : ownerId,
        isActive : true
     })

     if(!mess) {
        throw new Error("Mess not found")
     }


    if(!(name || address || description || contact)){
        throw new Error("Nothing to update")
    }

    if(name) mess.name = name
    if(address) mess.address = address
    if(description) mess.description = description
    if(contact) mess.contact = contact

    await mess.save()


}

export const deleteMess = async(ownerId) => {
    const mess = await Mess.findOne({
        owner : ownerId
    })

    if(!mess){
        throw new Error("Mess not found")
    }

    // softly deactivating the mess : 

    mess.isActive = false
    await mess.save()
}

export const activateMess = async(ownerId) => {
    const mess = await Mess.findOne({
        owner : ownerId
    })


    if(!mess){
        throw new Error("Mess not found")
    }

    mess.isActive = true
    await mess.save()
}


export const getAllMesses = async() => {
    const messes = await Mess.
    find()

    if(!messes){
        throw new Error("No Messes found")
    }

    return messes
}

export const getMessById = async(messId) =>{
    const mess = await Mess.findById(messId)

    if(!mess){
        throw new Error("Mess not found")
    }

    return mess
}