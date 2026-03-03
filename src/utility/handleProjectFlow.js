import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";

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

        try {
          parsedStructure = JSON.parse(
            aiResponse.choices[0].message.content
          );
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          parsedStructure = {};
        }

        // ✅ Save architecture in project
        newProject.fileStructure = parsedStructure;
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