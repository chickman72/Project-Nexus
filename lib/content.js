import { promises as fs } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "content.json");

export async function getProjects() {
  const raw = await fs.readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}
