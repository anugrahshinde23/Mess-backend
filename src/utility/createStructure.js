import fs from "fs";
import path from "path";

export const createStructure = (basePath, structure) => {

  if (!structure || typeof structure !== "object") {
    throw new Error("Invalid structure format");
  }

  fs.mkdirSync(basePath, { recursive: true });
  console.log("Base path:", basePath);

  const createRecursive = (currentPath, obj) => {

    for (const key of Object.keys(obj)) {

      const newPath = path.join(currentPath, key);
      const value = obj[key];
      console.log("Creating:", newPath);

      // 🔹 If value is array → create folder
      if (Array.isArray(value)) {
        fs.mkdirSync(newPath, { recursive: true });
      }

      // 🔹 If value is empty string → create file
      else if (typeof value === "string") {
        fs.writeFileSync(newPath, value);
      }

      // 🔹 If value is empty object → file or folder
      else if (typeof value === "object" && Object.keys(value).length === 0) {

        if (key.includes(".")) {
          fs.writeFileSync(newPath, "");
        } else {
          fs.mkdirSync(newPath, { recursive: true });
        }
      }

      // 🔹 If value is object with content → folder OR JSON file
      else if (typeof value === "object") {

        if (key.includes(".json")) {
          fs.writeFileSync(newPath, JSON.stringify(value, null, 2));
        } else {
          fs.mkdirSync(newPath, { recursive: true });
          createRecursive(newPath, value);
        }
      }
    }
  };

  createRecursive(basePath, structure);

  

};