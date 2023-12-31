import fs from "node:fs";

/**
 * Get all frontend files
 * @returns {Set<string>} All frontend files
 */
export function getAllFrontendFiles(): Set<string> {
  const files = fs.readdirSync("frontend/public").map((file) => `/${file}`);
  return new Set(files);
}
