import assert from "node:assert/strict";
import test from "node:test";

import { LEGACY_HR_DIAGNOSTIC_TEST } from "./legacy-survey";
import {
  getHrDiagnosticVisibleQuestions,
  validateHrDiagnosticSubmission,
} from "./validation";
import type { HrDiagnosticAnswerInput } from "./types";

const baseTargetAnswers: HrDiagnosticAnswerInput[] = [
  { questionKey: "role", selectedOptionKeys: ["hr_director"] },
  { questionKey: "company_size", selectedOptionKeys: ["100_300"] },
  { questionKey: "has_wellbeing_program", selectedOptionKeys: ["comprehensive"] },
  { questionKey: "financial_stress_impact", selectedOptionKeys: ["5"] },
  { questionKey: "importance_of_methods", selectedOptionKeys: ["4"] },
];

test("validateHrDiagnosticSubmission marks HR in 100+ company as target", () => {
  const result = validateHrDiagnosticSubmission(LEGACY_HR_DIAGNOSTIC_TEST, baseTargetAnswers);

  assert.equal(result.valid, true);
  assert.equal(result.targetSegment, "target");
  assert.equal(result.fieldValues.role, "HR-директор / CHRO");
});

test("validateHrDiagnosticSubmission routes under-100 companies to non-target", () => {
  const result = validateHrDiagnosticSubmission(
    LEGACY_HR_DIAGNOSTIC_TEST,
    [
      ...baseTargetAnswers.filter((answer) => answer.questionKey !== "company_size"),
      { questionKey: "company_size", selectedOptionKeys: ["under_100"] },
    ]
  );

  assert.equal(result.valid, true);
  assert.equal(result.targetSegment, "non_target");
});

test("getHrDiagnosticVisibleQuestions hides metrics when wellbeing program is absent", () => {
  const visibleQuestions = getHrDiagnosticVisibleQuestions(
    LEGACY_HR_DIAGNOSTIC_TEST,
    [{ questionKey: "has_wellbeing_program", selectedOptionKeys: ["no_not_planning"] }]
  );

  assert.equal(
    visibleQuestions.some((question) => question.key === "wellbeing_metrics"),
    false
  );
});

test("validateHrDiagnosticSubmission enforces checkbox max selections", () => {
  const result = validateHrDiagnosticSubmission(
    LEGACY_HR_DIAGNOSTIC_TEST,
    [
      ...baseTargetAnswers,
      {
        questionKey: "barriers",
        selectedOptionKeys: ["no_budget", "roi_hard", "no_provider"],
      },
    ]
  );

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /не больше 2/);
});

test("validateHrDiagnosticSubmission uses question and option labels from the provided test", () => {
  const editedTest = {
    ...LEGACY_HR_DIAGNOSTIC_TEST,
    groups: LEGACY_HR_DIAGNOSTIC_TEST.groups.map((group) => ({
      ...group,
      questions: group.questions.map((question) =>
        question.key === "role"
          ? {
              ...question,
              title: "Edited role title",
              options: question.options?.map((option) =>
                option.key === "hr_director"
                  ? { ...option, label: "Edited HR label" }
                  : option
              ),
            }
          : question
      ),
    })),
  };

  const result = validateHrDiagnosticSubmission(editedTest, baseTargetAnswers);
  const roleAnswer = result.normalizedAnswers.find(
    (answer) => answer.questionKey === "role"
  );

  assert.equal(result.valid, true);
  assert.equal(roleAnswer?.questionTitle, "Edited role title");
  assert.equal(roleAnswer?.answerLabel, "Edited HR label");
});

test("validateHrDiagnosticSubmission ignores hidden question answers", () => {
  const result = validateHrDiagnosticSubmission(
    LEGACY_HR_DIAGNOSTIC_TEST,
    [
      { questionKey: "role", selectedOptionKeys: ["hr_director"] },
      { questionKey: "company_size", selectedOptionKeys: ["100_300"] },
      { questionKey: "has_wellbeing_program", selectedOptionKeys: ["no_not_planning"] },
      { questionKey: "financial_stress_impact", selectedOptionKeys: ["5"] },
      { questionKey: "importance_of_methods", selectedOptionKeys: ["4"] },
      { questionKey: "wellbeing_metrics", selectedOptionKeys: ["unknown_hidden_value"] },
    ]
  );

  assert.equal(result.valid, true);
  assert.equal(
    result.normalizedAnswers.some((answer) => answer.questionKey === "wellbeing_metrics"),
    false
  );
});
