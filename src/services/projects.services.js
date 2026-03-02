import Project from "../models/verity/projects.model.js"


export const createProject = async (userId,projectData) => {

    const {projectName, frontend, backend, database, outputPreference} = projectData

    const project = await Project.create({
        user : userId,
        projectName,
        frontend,
        backend,
        database,
        outputPreference
    })

    return project

}