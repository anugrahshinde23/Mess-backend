import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";
import { createStructure } from "./createStructure.js";
import path from "path"
import { runProject } from "./runProjects.js";
import getPort from "get-port";

export const handleProjectFlow = async (chat, message) => {
  const step = chat.projectSetup.step;

  switch (step) {

    case 0:
      chat.projectSetup.data.projectName = message.trim();
      chat.projectSetup.step = 1;
      await chat.save();
      return "Which frontend do you want? (React, Next, Flutter etc)";


    case 1:
      chat.projectSetup.data.frontend = message.trim();
      chat.projectSetup.step = 2;
      await chat.save();
      return "Which backend?";


    case 2:
      chat.projectSetup.data.backend = message.trim();
      chat.projectSetup.step = 3;
      await chat.save();
      return "Which database?";


    case 3:
      chat.projectSetup.data.database = message.trim();
      chat.projectSetup.step = 4;
      await chat.save();
      return "Tell main features of your project (comma separated).";


    case 4:
      try {

        // ✅ Format features into array
        const featuresArray = message
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0);

        chat.projectSetup.data.features = featuresArray;

        // ✅ Create Project
        const newProject = await Project.create({
          user: chat.user,
          name: chat.projectSetup.data.projectName,
          frontend: chat.projectSetup.data.frontend,
          backend: chat.projectSetup.data.backend,
          database: chat.projectSetup.data.database,
          features: featuresArray,
          status: "generated"
        });

        // ✅ Generate Architecture Prompt
        const architecturePrompt = `
Create a clean production-ready folder structure in VALID JSON format.

Project Name: ${newProject.name}
Frontend: ${newProject.frontend}
Backend: ${newProject.backend}
Database: ${newProject.database}
Features: ${featuresArray.join(", ")}

Rules:
- Return ONLY pure JSON
- No explanation
- No markdown
- No text outside JSON
`;

        // ✅ Call AI
        const aiResponse = await askVerity({
          history: [{ role: "user", content: architecturePrompt }]
        });

        let parsedStructure;

        // ✅ Extract and clean the AI response
let rawContent = aiResponse.choices[0].message.content;

// Remove markdown backticks if they exist
const cleanedJSON = rawContent.replace(/```json|```/g, "").trim();

try {
  parsedStructure = JSON.parse(cleanedJSON);
} catch (parseError) {
  console.error("JSON Parse Error:", parseError);
  // Log the raw content to see exactly what failed
  console.log("Raw AI Output was:", rawContent);
  parsedStructure = { error: "Failed to parse structure" };
}


        // ✅ Save architecture in project
        newProject.fileStructure = parsedStructure;
        await newProject.save();

        const safeName = newProject.name.replace(/[^a-z0-9-]/gi, "-");

        const projectRoot = path.join(
          process.cwd(),
          "generated-projects",
          safeName
        );

        if (
          !parsedStructure ||
          typeof parsedStructure !== "object" ||
          Object.keys(parsedStructure).length === 0
        ) {
          throw new Error("Invalid AI structure");
        }
        
        const rootKey = Object.keys(parsedStructure)[0];

createStructure(
  projectRoot,
  parsedStructure[rootKey]
);


         console.log("Project folders created at:", projectRoot);

const frontendPort = await getPort();
const backendPort = await getPort();

const processes = runProject(projectRoot, newProject.stackType || "node", frontendPort, backendPort);

newProject.execution = {
  frontendPort,
  backendPort,
  status: "running"
};
await newProject.save();
        // ✅ Link project to chat
        chat.projectId = newProject._id;
        chat.projectSetup.step = 5;

        await chat.save();

        return `Project created successfully 🚀

Here is your architecture:

${JSON.stringify(parsedStructure, null, 2)}`;

      } catch (error) {
        console.error("Project Creation Error:", error);
        return "Project created but architecture generation failed. Try regenerating.";
      }


    default:
      return "Project setup completed.";
  }
};