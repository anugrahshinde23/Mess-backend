import fs from "fs";
import path from "path";

export const createStructure = (basePath, structure) => {

  if (!structure || typeof structure !== "object") {
    throw new Error("Invalid structure format");
  }

  const createRecursive = (currentPath, obj) => {

    for (const key of Object.keys(obj)) {

      const newPath = path.join(currentPath, key);
      const value = obj[key];

      // If empty object
      if (typeof value === "object" && Object.keys(value).length === 0) {

        // If it has file extension → create file
        if (key.includes(".")) {
          fs.writeFileSync(newPath, "");
        } else {
          fs.mkdirSync(newPath, { recursive: true });
        }

      }

      // If nested object → folder
      else if (typeof value === "object") {
        fs.mkdirSync(newPath, { recursive: true });
        createRecursive(newPath, value);
      }
    }
  };

  createRecursive(basePath, structure);
};