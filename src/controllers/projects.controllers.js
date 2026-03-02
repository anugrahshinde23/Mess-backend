import { createProject } from "../services/projects.services.js"


export const createProjectForUser = async (req,res) => {
    try {
        const userId = req.user.id
        const data = await createProject(userId, req.body)

        return res.status(200).json({
            success : true,
            message : "Successfully created project",
            projectData : data
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}