import { exec } from "child_process";
import path from "path";

export const runProject = (projectRoot, stack, frontendPort, backendPort) => {
  const frontendPath = path.join(projectRoot, "frontend");
  const backendPath = path.join(projectRoot, "backend");

  // Start frontend on specific port
  const frontendProcess = exec(
    `npm install && PORT=${frontendPort} npm start`,
    { cwd: frontendPath }
  );
  frontendProcess.stdout.on("data", (data) => console.log("Frontend:", data));
  frontendProcess.stderr.on("data", (data) => console.error("Frontend Error:", data));

  // Start backend on specific port
  const backendProcess = exec(
    `npm install && PORT=${backendPort} npm start`,
    { cwd: backendPath }
  );
  backendProcess.stdout.on("data", (data) => console.log("Backend:", data));
  backendProcess.stderr.on("data", (data) => console.error("Backend Error:", data));

  return { frontendProcess, backendProcess };
};