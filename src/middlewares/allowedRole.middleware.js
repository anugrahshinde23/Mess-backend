export const allowedRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return res.status(400).json({
                success : false,
                message : "Access denied"
            })
        }

        
        next()
     
    }
    
}