#!/usr/bin/env node

/**
 * Import diagnostic insight data from a Google Sheet into Strapi.
 *
 * Fetches the sheet as CSV, parses it, matches rows to existing test options,
 * and updates insight fields atomically.
 *
 * Usage:
 *   cd apps/cms && node scripts/import-insights-sheet.mjs
 *   cd apps/cms && node scripts/import-insights-sheet.mjs --sheet-url=... --gid=616668951 --code=financial-wellbeing --version=1
 *
 * CSV format expected (Google Sheet columns):
 *   question_num,question,answer_text,answer_score,insight_title,insight_text,practice_step
 */

import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createStrapi } = require("@strapi/strapi");

const TEST_UID = "api::diagnostic-test.diagnostic-test";

const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1odYnUltF56T1LvizBg0y2SzXnF2hL-Hu";
const DEFAULT_GID = "616668951";

/* ------------------------------------------------------------------ */
/*  CLI args                                                           */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  let sheetUrl = DEFAULT_SHEET_URL;
  let gid = DEFAULT_GID;
  let code = "financial-wellbeing";
  let version = 1;

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--sheet-url=")) {
      sheetUrl = arg.slice("--sheet-url=".length);
    } else if (arg.startsWith("--gid=")) {
      gid = arg.slice("--gid=".length);
    } else if (arg.startsWith("--code=")) {
      code = arg.slice("--code=".length);
    } else if (arg.startsWith("--version=")) {
      version = Number(arg.slice("--version=".length));
    }
  }

  return { sheetUrl, gid, code, version };
}

/* ------------------------------------------------------------------ */
/*  Fetch Google Sheet as CSV                                          */
/* ------------------------------------------------------------------ */

async function fetchSheetCsv(sheetUrl, gid) {
  const exportUrl = `${sheetUrl}/export?format=csv&gid=${gid}`;
  console.log(`[import-insights-sheet] Fetching ${exportUrl}`);

  const res = await fetch(exportUrl, { redirect: "follow" });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Google Sheet: ${res.status} ${res.statusText}`
    );
  }

  return res.text();
}

/* ------------------------------------------------------------------ */
/*  CSV parsing (simple, handles quoted fields with commas/newlines)   */
/* ------------------------------------------------------------------ */

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  fields.push(current);
  return fields;
}

function parseCsv(text) {
  // Handle BOM
  const clean = text.replace(/^\uFEFF/, "");

  // Split respecting quoted newlines
  const rows = [];
  let current = "";
  let inQuotes = false;

  for (const ch of clean) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (current.trim()) {
        rows.push(current);
      }
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    rows.push(current);
  }

  if (rows.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const header = parseCsvLine(rows[0]);
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const values = parseCsvLine(rows[i]);
    const record = {};

    for (let j = 0; j < header.length; j++) {
      record[header[j].trim()] = (values[j] ?? "").trim();
    }

    data.push(record);
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Normalization: strip trailing " (N)", trim, collapse spaces        */
/* ------------------------------------------------------------------ */

function normalizeAnswerText(text) {
  return text
    .replace(/\s+\(\d+\)\s*$/, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}

/* ------------------------------------------------------------------ */
/*  Main logic                                                         */
/* ------------------------------------------------------------------ */

async function settleDocumentEvents() {
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function main() {
  const { sheetUrl, gid, code, version } = parseArgs(process.argv);

  // Fetch and parse CSV from Google Sheets
  const csvText = await fetchSheetCsv(sheetUrl, gid);
  const csvRows = parseCsv(csvText);
  console.log(`[import-insights-sheet] Parsed ${csvRows.length} CSV rows`);

  // Validate CSV rows
  const seen = new Set();

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const lineNum = i + 2; // 1-indexed, skip header

    const question = row.question?.trim();
    const answerText = normalizeAnswerText(row.answer_text ?? "");
    const insightTitle = row.insight_title?.trim();
    const insightText = row.insight_text?.trim();
    const practiceStep = row.practice_step?.trim();

    if (!question) throw new Error(`Line ${lineNum}: missing question`);
    if (!answerText) throw new Error(`Line ${lineNum}: missing answer_text`);
    if (!insightTitle) throw new Error(`Line ${lineNum}: missing insight_title`);
    if (!insightText) throw new Error(`Line ${lineNum}: missing insight_text`);
    if (!practiceStep) throw new Error(`Line ${lineNum}: missing practice_step`);

    const key = `${question}|||${answerText}`;
    if (seen.has(key)) {
      throw new Error(`Line ${lineNum}: duplicate (question, answer_text) pair`);
    }
    seen.add(key);
  }

  // Load Strapi
  const app = await createStrapi().load();

  try {
    const documents = app.documents(TEST_UID);

    // Find the test
    const test = await documents.findFirst({
      filters: {
        code: { $eq: code },
        version: { $eq: version },
      },
      populate: {
        questions: {
          populate: {
            options: true,
          },
        },
      },
    });

    if (!test) {
      throw new Error(`Test not found: code=${code} version=${version}`);
    }

    const questions = test.questions ?? [];
    console.log(
      `[import-insights-sheet] Found test "${test.title}" with ${questions.length} questions`
    );

    // Build lookup: question title -> question index
    const questionMap = new Map();

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      questionMap.set(q.title, qi);
    }

    // Match CSV rows to options
    let updatedCount = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      const lineNum = i + 2;

      const questionTitle = row.question.trim();
      const answerText = normalizeAnswerText(row.answer_text);

      const qi = questionMap.get(questionTitle);
      if (qi === undefined) {
        throw new Error(
          `Line ${lineNum}: question not found in test: "${questionTitle}"`
        );
      }

      const question = questions[qi];
      const options = question.options ?? [];
      const optionIndex = options.findIndex((o) => o.label === answerText);

      if (optionIndex === -1) {
        throw new Error(
          `Line ${lineNum}: option not found for question "${questionTitle}": "${answerText}"`
        );
      }

      // Write insight fields into the option object (mutate in place for the update)
      options[optionIndex].insightTitle = row.insight_title.trim();
      options[optionIndex].insightText = row.insight_text.trim();
      options[optionIndex].practiceStep = row.practice_step.trim();
      updatedCount++;
    }

    // Validate full coverage
    let totalOptions = 0;

    for (const q of questions) {
      totalOptions += (q.options ?? []).length;
    }

    if (updatedCount !== totalOptions) {
      throw new Error(
        `Coverage mismatch: CSV covers ${updatedCount} options, but test has ${totalOptions}. ` +
          `Every option must have a corresponding CSV row.`
      );
    }

    // Atomic update: rebuild questions array for Strapi
    const updatedQuestions = questions.map((q) => ({
      key: q.key,
      title: q.title,
      description: q.description ?? null,
      order: q.order ?? 0,
      options: (q.options ?? []).map((o) => ({
        key: o.key,
        label: o.label,
        weight: o.weight,
        order: o.order ?? 0,
        insightTitle: o.insightTitle ?? null,
        insightText: o.insightText ?? null,
        practiceStep: o.practiceStep ?? null,
      })),
    }));

    await documents.update({
      documentId: test.documentId,
      data: { questions: updatedQuestions },
    });

    await documents.publish({ documentId: test.documentId });

    console.log(
      `[import-insights-sheet] Updated ${updatedCount} options across ${questions.length} questions`
    );
  } finally {
    await settleDocumentEvents();
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[import-insights-sheet] failed: ${message}`);
  process.exit(1);
});
