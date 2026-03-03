import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";
import path from "path";
import fs from "fs";
import { createGithubRepo, pushToGithub } from "./github.services.js";
import { copyTemplate } from "./copyTemplate.js";

/**
 * Safe JSON parser (no dirty hacks)
 */
function safeParseAIResponse(raw) {
  let text = raw.replace(/```json|```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("No valid JSON found");
  }

  text = text.substring(first, last + 1);

  return JSON.parse(text);
}

/**
 * Inject base64 decoded files
 */
function injectFiles(basePath, filesObject = {}) {
  for (const key in filesObject) {
    const fullPath = path.join(basePath, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    const decoded = Buffer.from(filesObject[key], "base64").toString("utf-8");

    fs.writeFileSync(fullPath, decoded, "utf-8");
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
          .map((f) => f.trim())
          .filter((f) => f.length > 0);

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

        const timestamp = Date.now();

        const projectRoot = path.join(
          process.cwd(),
          "generated-projects",
          `${safeName}-${timestamp}`
        );

        // ✅ 1️⃣ Copy template
        const templateName = `${frontend}-${backend}-${database}`;
        copyTemplate(templateName, projectRoot);

        // ✅ 2️⃣ Ask AI for base64 files
        const featurePrompt = `
Generate feature implementation files.

Stack:
Frontend: ${frontend}
Backend: ${backend}
Database: ${database}

Features:
${featuresArray.join(", ")}

Return STRICT JSON only.

All file contents MUST be base64 encoded.

Format:

{
  "frontendFiles": {
     "src/App.jsx": "base64_string_here"
  },
  "backendFiles": {
     "routes/features.js": "base64_string_here"
  }
}

Rules:
- No explanations
- No markdown
- No raw code
`;

        const aiResponse = await askVerity({
          history: [{ role: "user", content: featurePrompt }],
        });

        const rawContent = aiResponse.choices[0].message.content;

        let parsed;

        // ✅ Retry system (2 attempts)
        for (let i = 0; i < 2; i++) {
          try {
            parsed = safeParseAIResponse(rawContent);
            break;
          } catch (err) {
            if (i === 1) {
              throw new Error("AI returned invalid JSON twice");
            }
          }
        }

        // ✅ 3️⃣ Inject files
        injectFiles(
          path.join(projectRoot, "frontend"),
          parsed.frontendFiles || {}
        );

        injectFiles(
          path.join(projectRoot, "backend"),
          parsed.backendFiles || {}
        );

        // ✅ 4️⃣ Push to GitHub
        const repoName = `${safeName}-${timestamp}`;
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