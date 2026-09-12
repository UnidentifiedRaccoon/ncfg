import { constants } from "node:fs";
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RETENTION_MS = 21 * 24 * 60 * 60 * 1000;

async function listFiles(root, relative = "") {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, name));
    else if (entry.isFile()) files.push(name);
    else throw new Error(`Static history must contain regular files only: ${name}`);
  }
  return files.sort();
}

function isValidPath(value) {
  return typeof value === "string" && value !== "" &&
    !value.includes("\\") && !path.posix.isAbsolute(value) &&
    value.split("/").every((part) => part !== ".." && part !== "." && part !== "");
}

async function readManifest(filename) {
  let raw;
  try {
    raw = await readFile(filename, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null; // First migration from an older image.
    throw error;
  }
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Array.isArray(value.current) ||
      !value.current.every(isValidPath) || !value.retired ||
      typeof value.retired !== "object" || Array.isArray(value.retired) ||
      !Object.entries(value.retired).every(([name, time]) =>
        isValidPath(name) && typeof time === "number" && Number.isFinite(time) && time >= 0)) {
    throw new Error("Invalid static history manifest; refusing to discard history.");
  }
  return value;
}

/** Carry immutable Next assets through releases; never overwrite the new build. */
export async function retainNextStatic({ currentDir, previousDir, manifestFile, now = Date.now() }) {
  if (!Number.isFinite(now) || now < 0) throw new Error("Invalid build time");
  const current = await listFiles(currentDir);
  const currentSet = new Set(current);
  const previousManifest = await readManifest(path.join(previousDir, "manifest.json"));
  let previous;
  try {
    previous = await listFiles(path.join(previousDir, "static"));
  } catch (error) {
    if (error.code !== "ENOENT" || previousManifest) throw error;
    previous = []; // Local/preview builds have no production history.
  }

  const previousCurrent = new Set(previousManifest?.current ?? previous);
  if (previousManifest) {
    const available = new Set(previous);
    if ([...previousManifest.current, ...Object.keys(previousManifest.retired)].some((name) => !available.has(name))) {
      throw new Error("Static history is incomplete; refusing to discard recorded assets.");
    }
  }
  const retired = Object.create(null);
  let removed = 0;
  for (const name of previous) {
    if (currentSet.has(name)) continue;
    // A file may have been served for months. Start its retention when it is
    // replaced, not when it was first built. Archived files keep their deadline.
    const retiredAt = previousCurrent.has(name) ? now : previousManifest?.retired[name];
    if (retiredAt === undefined || retiredAt > now) {
      throw new Error(`Missing or future retirement time for ${name}`);
    }
    if (now - retiredAt > RETENTION_MS) {
      removed += 1;
      continue;
    }
    const destination = path.join(currentDir, name);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(previousDir, "static", name), destination, constants.COPYFILE_EXCL);
    retired[name] = retiredAt;
  }

  await mkdir(path.dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, JSON.stringify({ version: 1, current, retired }, null, 2) + "\n");
  return { current: current.length, retained: Object.keys(retired).length, expired: removed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [currentDir, previousDir, manifestFile, epochSeconds] = process.argv.slice(2);
  if (!currentDir || !previousDir || !manifestFile) {
    throw new Error("Usage: retain-next-static.mjs CURRENT_DIR PREVIOUS_DIR MANIFEST_FILE");
  }
  const now = epochSeconds ? Number(epochSeconds) * 1000 : Date.now();
  console.log(await retainNextStatic({ currentDir, previousDir, manifestFile, now }));
}
