import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function readJson<T>(relativePath: string): T {
  const absolutePath = path.join(root, relativePath);
  return JSON.parse(readFileSync(absolutePath, "utf-8")) as T;
}

export function readText(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf-8");
}
