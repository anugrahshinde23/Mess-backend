import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";
import { createStructure } from "./createStructure.js";
import path from "path";
import { runProject } from "./runProjects.js";
import getPort from "get-port";
import fs from "fs";

/**
 * Fix broken AI JSON folder structure output
 * - Converts file-only keys to empty string values
 * - Removes extra quotes
 * - Removes trailing commas
 */
export function fixAIJSON(rawContent) {
  let text = rawContent.replace(/```json|```/g, "").trim();

  // Remove all trailing commas before } or ]
  text = text.replace(/,(\s*[}\]])/g, "$1");

  // Fix extra double quotes
  text = text.replace(/""+/g, '"');

  // Convert bare file keys into key: ""
  // This regex finds keys without values like "index.js"
  text = text.replace(/"([\w\-.]+)"(\s*[\},])/g, '"$1": ""$2');

  return text;
}

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
        // Format features into array
        const featuresArray = message
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0);

        chat.projectSetup.data.features = featuresArray;

        // Create Project in DB
        const newProject = await Project.create({
          user: chat.user,
          name: chat.projectSetup.data.projectName,
          frontend: chat.projectSetup.data.frontend,
          backend: chat.projectSetup.data.backend,
          database: chat.projectSetup.data.database,
          features: featuresArray,
          status: "generated",
        });

        // Generate AI prompt
        const architecturePrompt = `
Create a clean production-ready folder structure in VALID JSON format.
Project Name: ${newProject.name}
Frontend: ${newProject.frontend}
Backend: ${newProject.backend}
Database: ${newProject.database}
Features: ${featuresArray.join(", ")}

Rules:
- Return ONLY pure JSON
- Folders are objects
- Files are keys with empty string as value
- No markdown, no explanations, no text outside JSON
`;

        // Call AI
        const aiResponse = await askVerity({
          history: [{ role: "user", content: architecturePrompt }],
        });

        const rawContent = aiResponse.choices[0].message.content;
        let parsedStructure;

        try {
          const cleanedJSON = fixAIJSON(rawContent);
          parsedStructure = JSON.parse(cleanedJSON);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.log("Raw AI Output:", rawContent);
          parsedStructure = { error: "Failed to parse structure" };
        }

        if (!parsedStructure || typeof parsedStructure !== "object") {
          throw new Error("Invalid AI structure");
        }

        // Save structure in DB
        newProject.fileStructure = parsedStructure;
        await newProject.save();

        // Create project folders/files
        const safeName = newProject.name.replace(/[^a-z0-9-]/gi, "-");
        const projectRoot = path.join(process.cwd(), "generated-projects", safeName);
        const rootKey = Object.keys(parsedStructure)[0];

        createStructure(projectRoot, parsedStructure[rootKey]);
        console.log("Project folders created at:", projectRoot);

        // Assign dynamic ports
        const frontendPort = await getPort();
        const backendPort = await getPort();

        // Run project processes
        const processes = runProject(projectRoot, newProject.stackType || "node", frontendPort, backendPort);

        // Save execution info in DB
        newProject.execution = {
          frontendPort,
          backendPort,
          status: "running",
        };
        await newProject.save();

        // Link project to chat
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