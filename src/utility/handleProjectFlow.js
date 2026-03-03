import Project from "../models/verity/projects.model.js";
import { askVerity } from "../services/verity.service.js";
import path from "path";
import fs from "fs";
import { createGithubRepo, pushToGithub } from "./github.services.js";

/**
 * Sanitize AI JSON output
 */
function sanitizeAIJSON(rawContent) {
  let text = rawContent.replace(/```json|```/g, "").trim();

  const firstBrace = text.indexOf("{");
  if (firstBrace >= 0) text = text.slice(firstBrace);

  text = text.replace(/,(\s*[}\]])/g, "$1");
  text = text.replace(/[\u0000-\u001F]+/g, "");

  return text;
}

/**
 * Write files with content
 */
function writeFiles(projectRoot, filesObject, currentPath = "") {
  for (const key in filesObject) {
    const value = filesObject[key];
    const newPath = path.join(currentPath, key);
    const fullPath = path.join(projectRoot, newPath);

    if (typeof value === "object" && value !== null) {
      // It's a folder → go deeper
      fs.mkdirSync(fullPath, { recursive: true });
      writeFiles(projectRoot, value, newPath);
    } else {
      // It's a file → write content
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, String(value), "utf-8");
    }
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

        const newProject = await Project.create({
          user: chat.user,
          name: chat.projectSetup.data.projectName,
          frontend: chat.projectSetup.data.frontend,
          backend: chat.projectSetup.data.backend,
          database: chat.projectSetup.data.database,
          features: featuresArray,
          status: "generated",
        });

        // 🧠 NEW PROMPT — FILES WITH CONTENT
        const architecturePrompt = `
Generate a minimal runnable full-stack project.

Project Name: ${newProject.name}
Frontend: ${newProject.frontend}
Backend: ${newProject.backend}
Database: ${newProject.database}
Features: ${featuresArray.join(", ")}

Rules:
- Return ONLY valid JSON
- No explanations
- No markdown
- Format must be:

{
  "files": {
     "filePath": "complete file content"
  }
}

- Include package.json if required
- Backend must run
- Frontend must render basic UI
`;

        const aiResponse = await askVerity({
          history: [{ role: "user", content: architecturePrompt }],
        });

        const rawContent = aiResponse.choices[0].message.content;

        let parsed;
        try {
          const cleaned = sanitizeAIJSON(rawContent);
          parsed = JSON.parse(cleaned);
        } catch (err) {
          console.error("AI JSON parse failed:", err);
          console.log("Raw output:", rawContent);
          throw new Error("AI returned invalid JSON");
        }

        if (!parsed.files || typeof parsed.files !== "object") {
          throw new Error("AI did not return files object");
        }

        // 📁 Create local project folder
        const safeName = newProject.name.replace(/[^a-z0-9-]/gi, "-");
        const projectRoot = path.join(
          process.cwd(),
          "generated-projects",
          safeName
        );

        // ✍ Write all files
        writeFiles(projectRoot, parsed.files);

        console.log("Files created at:", projectRoot);

        // 🚀 Create GitHub repo
        const repoName = safeName + "-" + Date.now();
        const repoUrl = await createGithubRepo(repoName);

        const authenticatedUrl = repoUrl.replace(
          "https://",
          `https://${process.env.GITHUB_TOKEN}@`
        );

        // 📤 Push to GitHub
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

Your project has been generated and pushed with working code.
`;
      } catch (error) {
        console.error("Project Creation Error:", error);
        return "Project creation failed. Please try again.";
      }

    default:
      return "Project setup completed.";
  }
};