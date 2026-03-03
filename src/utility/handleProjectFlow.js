import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";
import path from "path";
import fs from "fs";
import { createGithubRepo, pushToGithub } from "./github.services.js";
import {copyTemplate} from './copyTemplate.js'

/**
 * Safely extract JSON from AI response
 */
function extractJSON(rawContent) {
  let text = rawContent.replace(/```json|```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("Invalid AI JSON format");
  }

  text = text.substring(first, last + 1);

  // Remove trailing commas
  text = text.replace(/,(\s*[}\]])/g, "$1");

  return text;
}

/**
 * Inject AI-generated files into copied template
 */
function injectFiles(basePath, filesObject = {}) {
  for (const key in filesObject) {
    const fullPath = path.join(basePath, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, filesObject[key], "utf-8");
  }
}

export const handleProjectFlow = async (chat, message) => {
  const step = chat.projectSetup.step;

  switch (step) {
    case 0:
      chat.projectSetup.data.projectName = message.trim();
      chat.projectSetup.step = 1;
      await chat.save();
      return "Which frontend do you want? (react / html)";

    case 1:
      chat.projectSetup.data.frontend = message.trim().toLowerCase();
      chat.projectSetup.step = 2;
      await chat.save();
      return "Which backend? (express / flask)";

    case 2:
      chat.projectSetup.data.backend = message.trim().toLowerCase();
      chat.projectSetup.step = 3;
      await chat.save();
      return "Which database? (mongo / none)";

    case 3:
      chat.projectSetup.data.database = message.trim().toLowerCase();
      chat.projectSetup.step = 4;
      await chat.save();
      return "Tell main features (comma separated).";

    case 4:
      try {
        const featuresArray = message
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0);

        chat.projectSetup.data.features = featuresArray;

        const { frontend, backend, database } = chat.projectSetup.data;

        const newProject = await Project.create({
          user: chat.user,
          name: chat.projectSetup.data.projectName,
          frontend,
          backend,
          database,
          features: featuresArray,
          status: "generated",
        });

        const safeName = newProject.name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");

        const projectRoot = path.join(
          process.cwd(),
          "generated-projects",
          safeName + "-" + Date.now()
        );

        // ✅ 1️⃣ Copy template
        const templateName = `${frontend}-${backend}-${database}`;
        copyTemplate(templateName, projectRoot);

        // ✅ 2️⃣ Ask AI only for feature files
        const featurePrompt = `
Generate only feature implementation files.

Stack:
Frontend: ${frontend}
Backend: ${backend}
Database: ${database}

Features:
${featuresArray.join(", ")}

Return STRICT JSON only:

{
  "frontendFiles": {
     "src/App.jsx": "complete code"
  },
  "backendFiles": {
     "routes/features.js": "complete code"
  }
}

Rules:
- No explanations
- No markdown
- Each file content must be a single string
`;

        const aiResponse = await askVerity({
          history: [{ role: "user", content: featurePrompt }],
        });

        const rawContent = aiResponse.choices[0].message.content;

        let parsed;

        try {
          const cleaned = extractJSON(rawContent);
          parsed = JSON.parse(cleaned);
        } catch (err) {
          console.error("AI JSON parse failed:", err);
          console.log("Raw output:", rawContent);
          throw new Error("AI returned invalid JSON");
        }

        // ✅ 3️⃣ Inject AI files
        injectFiles(
          path.join(projectRoot, "frontend"),
          parsed.frontendFiles || {}
        );

        injectFiles(
          path.join(projectRoot, "backend"),
          parsed.backendFiles || {}
        );

        // ✅ 4️⃣ Push to GitHub
        const repoName = safeName + "-" + Date.now();
        const repoUrl = await createGithubRepo(repoName);

        const authenticatedUrl = repoUrl.replace(
          "https://",
          `https://${process.env.GITHUB_TOKEN}@`
        );

        await pushToGithub(projectRoot, authenticatedUrl);

        newProject.github = {
          repoName,
          repoUrl,
          branch: "main",
        };

        await newProject.save();

        chat.projectId = newProject._id;
        chat.projectSetup.step = 5;
        await chat.save();

        return `Project created successfully 🚀

✅ GitHub Repo: ${repoUrl}

Template copied and AI features injected successfully.
`;
      } catch (error) {
        console.error("Project Creation Error:", error);
        return "Project creation failed. Please try again.";
      }

    default:
      return "Project setup completed.";
  }
};