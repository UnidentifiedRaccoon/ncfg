import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, cp, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { retainNextStatic } from "./retain-next-static.mjs";

const DAY = 86_400_000;

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ncfg-static-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const currentDir = path.join(root, "current");
  const previousDir = path.join(root, "previous");
  const manifestFile = path.join(root, "manifest.json");
  await mkdir(currentDir);
  await mkdir(previousDir);
  const put = async (filename, value) => {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, value);
  };
  return { root, currentDir, previousDir, manifestFile, put };
}

test("first build works without history and inventories its own files", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.currentDir, "chunks/new.css"), "new css");
  assert.deepEqual(await retainNextStatic({ ...f, now: 100 * DAY }), {
    current: 1, retained: 0, expired: 0,
  });
  assert.deepEqual(JSON.parse(await readFile(f.manifestFile, "utf8")), {
    version: 1, current: ["chunks/new.css"], retired: {},
  });
});

test("migration keeps old CSS, fonts and images; the current build wins a path collision", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.currentDir, "chunks/shared.js"), "new code");
  await f.put(path.join(f.previousDir, "static/chunks/shared.js"), "old code");
  for (const name of ["chunks/old.css", "media/old.woff2", "media/old.webp"]) {
    await f.put(path.join(f.previousDir, "static", name), name);
  }
  assert.deepEqual(await retainNextStatic({ ...f, now: 100 * DAY }), {
    current: 1, retained: 3, expired: 0,
  });
  assert.equal(await readFile(path.join(f.currentDir, "chunks/shared.js"), "utf8"), "new code");
  assert.equal(await readFile(path.join(f.currentDir, "media/old.woff2"), "utf8"), "media/old.woff2");
});

test("retention starts at retirement, survives later releases and expires after 21 days", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.previousDir, "static/chunks/old.css"), "old");
  await f.put(path.join(f.previousDir, "static/media/ancient.woff2"), "expired");
  await f.put(path.join(f.previousDir, "manifest.json"), JSON.stringify({
    version: 1, current: ["chunks/old.css"], retired: { "media/ancient.woff2": DAY },
  }));
  await f.put(path.join(f.currentDir, "chunks/new.css"), "new");
  assert.deepEqual(await retainNextStatic({ ...f, now: 100 * DAY }), {
    current: 1, retained: 1, expired: 1,
  });
  for (const day of [110, 121, 122]) {
    await rm(f.previousDir, { recursive: true });
    await cp(f.currentDir, path.join(f.previousDir, "static"), { recursive: true });
    await cp(f.manifestFile, path.join(f.previousDir, "manifest.json"));
    await rm(f.currentDir, { recursive: true });
    await f.put(path.join(f.currentDir, "chunks/new.css"), "new");
    const result = await retainNextStatic({ ...f, now: day * DAY });
    assert.equal(result.retained, day <= 121 ? 1 : 0);
    const manifest = JSON.parse(await readFile(f.manifestFile, "utf8"));
    assert.equal(manifest.retired["chunks/old.css"], day <= 121 ? 100 * DAY : undefined);
  }
});

test("an asset brought back by rollback becomes current again", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.currentDir, "chunks/old.css"), "restored");
  await f.put(path.join(f.previousDir, "static/chunks/old.css"), "archived");
  await f.put(path.join(f.previousDir, "manifest.json"), JSON.stringify({
    version: 1, current: [], retired: { "chunks/old.css": DAY },
  }));
  await retainNextStatic({ ...f, now: 100 * DAY });
  const manifest = JSON.parse(await readFile(f.manifestFile, "utf8"));
  assert.deepEqual(manifest.current, ["chunks/old.css"]);
  assert.deepEqual(manifest.retired, {});
  assert.equal(await readFile(path.join(f.currentDir, "chunks/old.css"), "utf8"), "restored");
});

test("corrupt or incomplete history fails instead of silently dropping assets", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.previousDir, "manifest.json"), "invalid json");
  await assert.rejects(retainNextStatic(f), SyntaxError);
  await f.put(path.join(f.previousDir, "manifest.json"), JSON.stringify({
    version: 1, current: ["../outside.css"], retired: {},
  }));
  await assert.rejects(retainNextStatic(f), /Invalid static history manifest/);
  await f.put(path.join(f.previousDir, "manifest.json"), JSON.stringify({
    version: 1, current: ["chunks/missing.css"], retired: {},
  }));
  await assert.rejects(retainNextStatic(f), { code: "ENOENT" });
  await f.put(path.join(f.previousDir, "static/chunks/other.css"), "present");
  await assert.rejects(retainNextStatic(f), /history is incomplete/);
});

test("symlinks are rejected before copying external files into the image", async (t) => {
  const f = await fixture(t);
  await f.put(path.join(f.root, "outside.css"), "not a static asset");
  await mkdir(path.join(f.previousDir, "static"));
  await symlink(path.join(f.root, "outside.css"), path.join(f.previousDir, "static/link.css"));
  await assert.rejects(retainNextStatic(f), /regular files only/);
});
