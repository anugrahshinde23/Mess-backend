import axios from "axios";
import { execSync } from "child_process";

export const createGithubRepo = async (repoName) => {
  const response = await axios.post(
    "https://api.github.com/user/repos",
    {
      name: repoName,
      private: false,
    },
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  return response.data.clone_url;
};



export const pushToGithub = async (projectRoot, repoUrl) => {
  execSync("git init", { cwd: projectRoot });
  execSync("git add .", { cwd: projectRoot });
  execSync('git commit -m "Initial commit"', { cwd: projectRoot });
  execSync(`git branch -M main`, { cwd: projectRoot });
  execSync(`git remote add origin ${repoUrl}`, { cwd: projectRoot });
  execSync(`git push -u origin main`, { cwd: projectRoot });
};