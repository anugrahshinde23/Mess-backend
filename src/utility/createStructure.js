import fs from "fs";
import path from "path";

export const createStructure = (basePath, structure) => {

  if (!structure || typeof structure !== "object") {
    throw new Error("Invalid structure format");
  }

  // ✅ VERY IMPORTANT — create base folder first
  fs.mkdirSync(basePath, { recursive: true });

  const createRecursive = (currentPath, obj) => {

    for (const key of Object.keys(obj)) {

      const newPath = path.join(currentPath, key);
      const value = obj[key];

      // If value is NOT an object → ignore
      if (typeof value !== "object") continue;

      // If empty object
      if (Object.keys(value).length === 0) {

        if (key.includes(".")) {
          fs.writeFileSync(newPath, "");
        } else {
          fs.mkdirSync(newPath, { recursive: true });
        }

      } else {
        // Create folder
        fs.mkdirSync(newPath, { recursive: true });

        // Go deeper
        createRecursive(newPath, value);
      }
    }
  };

  createRecursive(basePath, structure);
};