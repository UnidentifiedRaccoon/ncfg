#!/usr/bin/env node

import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createStrapi } = require("@strapi/strapi");

const TEST_UID = "api::diagnostic-test.diagnostic-test";

const INSIGHT_FIELDS = ["insightTitle", "insightText", "practiceStep"];

function parseArgs() {
  const args = process.argv.slice(2);
  let code = "financial-wellbeing";
  let version = 1;

  for (const arg of args) {
    if (arg.startsWith("--code=")) {
      code = arg.slice("--code=".length);
    } else if (arg.startsWith("--version=")) {
      version = Number(arg.slice("--version=".length));
    }
  }

  return { code, version };
}

async function settleDocumentEvents() {
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
}

async function main() {
  const { code, version } = parseArgs();
  const app = await createStrapi().load();

  try {
    const documents = app.documents(TEST_UID);

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
      console.error(
        `[check-insights] test not found: code="${code}" version=${version}`
      );
      process.exit(1);
    }

    const questions = test.questions ?? [];
    const totalQuestions = questions.length;
    let totalOptions = 0;

    const missingCounts = {
      insightTitle: 0,
      insightText: 0,
      practiceStep: 0,
    };

    const gaps = [];

    for (const question of questions) {
      const options = question.options ?? [];

      for (const option of options) {
        totalOptions++;

        const missingFields = [];

        for (const field of INSIGHT_FIELDS) {
          const value = option[field];
          if (typeof value !== "string" || value.trim() === "") {
            missingCounts[field]++;
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          gaps.push({
            questionTitle: question.title,
            optionLabel: option.label,
            missingFields,
          });
        }
      }
    }

    console.log(`[check-insights] test: "${test.title}" (${code} v${version})`);
    console.log(`[check-insights] questions: ${totalQuestions}`);
    console.log(`[check-insights] options:   ${totalOptions}`);
    console.log(
      `[check-insights] missing insightTitle:  ${missingCounts.insightTitle}`
    );
    console.log(
      `[check-insights] missing insightText:   ${missingCounts.insightText}`
    );
    console.log(
      `[check-insights] missing practiceStep:  ${missingCounts.practiceStep}`
    );

    if (gaps.length === 0) {
      console.log(
        `[check-insights] ✓ 100% insight coverage — all ${totalOptions} options have insightTitle, insightText and practiceStep`
      );
      process.exit(0);
    }

    console.log("");
    console.log(`[check-insights] gaps found (${gaps.length}):`);

    for (const gap of gaps) {
      console.log(`  question: ${gap.questionTitle}`);
      console.log(`  option:   ${gap.optionLabel}`);
      console.log(`  missing:  ${gap.missingFields.join(", ")}`);
      console.log("");
    }

    console.error(
      `[check-insights] ✗ ${gaps.length} option(s) missing insight fields — see details above`
    );
    process.exit(1);
  } finally {
    await settleDocumentEvents();
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[check-insights] failed: ${message}`);
  process.exit(1);
});
