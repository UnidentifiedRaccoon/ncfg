import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const APP_ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SOURCE_ROOTS = [
  "app",
  "widgets",
  "features",
  "entities",
  "shared",
  "public/content",
].map((segment) => path.join(APP_ROOT, segment));
const NBSP = "\u00A0";
const EXCLUDED_FILES = new Map<string, string>([
  ["shared/api/services.ts", "Contains service metadata and technical defaults."],
  ["shared/lib/contact-sink.ts", "Contains internal operator notifications, not frontend copy."],
  ["shared/lib/structured-data.ts", "Contains structured data payload values without UI rendering."],
  ["widgets/Team/team-utils.ts", "Contains data filters and comparisons rather than displayed copy."],
]);

type Fragment = {
  file: string;
  line: number | null;
  text: string;
};

const ORPHAN_RE = /(^|[\s«"(\[{—–-])([АаИиКкСсУуОоВв]) (?=[0-9А-ЯЁа-яё])/u;
const NUMBER_SIGN_RE = /№ (?=\d)/u;
const PERCENT_RE = /\d %/u;

function normalizeRuntimeText(value: string): string {
  return value.replace(/[ \t\r\n]+/g, " ").trim();
}

function splitRuntimeText(value: string): string[] {
  if (value.includes("<") && value.includes(">")) {
    return value
      .replace(/<[^>]+>/g, "\n")
      .split(/\n+/)
      .map(normalizeRuntimeText)
      .filter(Boolean);
  }

  const text = normalizeRuntimeText(value);
  return text ? [text] : [];
}

function isRuntimeFile(file: string): boolean {
  if (file.includes(`${path.sep}node_modules${path.sep}`)) {
    return false;
  }

  const ext = path.extname(file);
  if (![".json", ".ts", ".tsx"].includes(ext)) {
    return false;
  }

  if (/\.(test|spec)\.[jt]sx?$/.test(file) || file.endsWith(".md")) {
    return false;
  }

  return true;
}

function walkFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(file));
      continue;
    }

    if (isRuntimeFile(file)) {
      files.push(file);
    }
  }

  return files;
}

function getRelativeFile(file: string): string {
  return path.relative(APP_ROOT, file).replace(/\\/g, "/");
}

function hasRelevantText(text: string): boolean {
  return /[А-Яа-яЁё]/u.test(text) || NUMBER_SIGN_RE.test(text) || PERCENT_RE.test(text);
}

function findLineInRawText(rawText: string, value: string): number | null {
  const probe = value.slice(0, Math.min(value.length, 40));

  if (!probe) {
    return null;
  }

  const index = rawText.indexOf(probe);
  if (index === -1) {
    return null;
  }

  return rawText.slice(0, index).split("\n").length;
}

function collectJsonFragments(file: string): Fragment[] {
  const rawText = fs.readFileSync(file, "utf8");
  const json = JSON.parse(rawText) as unknown;
  const fragments: Fragment[] = [];

  const visit = (value: unknown): void => {
    if (typeof value === "string") {
      for (const text of splitRuntimeText(value)) {
        if (!hasRelevantText(text)) {
          continue;
        }

        fragments.push({
          file,
          line: findLineInRawText(rawText, value),
          text,
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  };

  visit(json);
  return fragments;
}

function collectTsFragments(file: string): Fragment[] {
  const rawText = fs.readFileSync(file, "utf8");
  const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, rawText, ts.ScriptTarget.Latest, true, scriptKind);
  const fragments: Fragment[] = [];

  const pushFragment = (position: number, value: string): void => {
    for (const text of splitRuntimeText(value)) {
      if (!hasRelevantText(text)) {
        continue;
      }

      fragments.push({
        file,
        line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
        text,
      });
    }
  };

  const visit = (node: ts.Node): void => {
    if (isTypographyWrapped(node)) {
      return;
    }

    if (ts.isStringLiteralLike(node)) {
      pushFragment(node.getStart(sourceFile), node.text);
    } else if (
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      pushFragment(node.getStart(sourceFile), node.text);
    } else if (node.kind === ts.SyntaxKind.JsxText) {
      pushFragment(node.getStart(sourceFile), node.getText(sourceFile));
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return fragments;
}

function isTypographyWrapped(node: ts.Node): boolean {
  const parent = node.parent;
  if (!parent) {
    return false;
  }

  return (
    ts.isCallExpression(parent) &&
    ts.isIdentifier(parent.expression) &&
    parent.expression.text === "applyRussianTypographyRules"
  );
}

function detectViolations(text: string): string[] {
  const violations: string[] = [];

  if (ORPHAN_RE.test(text)) {
    violations.push("orphan");
  }

  if (NUMBER_SIGN_RE.test(text)) {
    violations.push("number-sign");
  }

  if (PERCENT_RE.test(text)) {
    violations.push("percent");
  }

  return violations;
}

test("runtime russian copy uses NBSP for anti-orphans and core typography rules", () => {
  const violations: string[] = [];

  for (const root of SOURCE_ROOTS) {
    for (const file of walkFiles(root)) {
      const relativeFile = getRelativeFile(file);

      if (EXCLUDED_FILES.has(relativeFile)) {
        continue;
      }

      const fragments = file.endsWith(".json")
        ? collectJsonFragments(file)
        : collectTsFragments(file);

      for (const fragment of fragments) {
        const kinds = detectViolations(fragment.text);
        if (!kinds.length) {
          continue;
        }

        const location = fragment.line ? `${relativeFile}:${fragment.line}` : relativeFile;
        violations.push(`${location} [${kinds.join(", ")}] ${fragment.text}`);
      }
    }
  }

  assert.equal(
    violations.length,
    0,
    [
      "Found runtime typography issues.",
      `Rule: one-letter words must use NBSP (${NBSP}), plus '№${NBSP}N' and 'N${NBSP}%'.`,
      ...violations,
    ].join("\n")
  );
});
