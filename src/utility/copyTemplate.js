import fs from "fs";
import path from "path";

export const copyTemplate = (templateName, projectRoot) => {
  const templatePath = path.join(process.cwd(), "templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template not found");
  }

  fs.cpSync(templatePath, projectRoot, {
    recursive: true,
  });
}