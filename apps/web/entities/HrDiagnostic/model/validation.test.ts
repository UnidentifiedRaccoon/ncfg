import assert from "node:assert/strict";
import test from "node:test";

import {
  getHrDiagnosticVisibleQuestions,
  validateHrDiagnosticSubmission,
} from "./validation";
import type { HrDiagnosticAnswerInput, HrDiagnosticTest } from "./types";

const TEST_HR_DIAGNOSTIC: HrDiagnosticTest = {
  slug: "hr",
  title: "HR diagnostic",
  testTitle: "HR diagnostic test",
  projectTitle: "HR project",
  groups: [
    {
      key: "profile",
      title: "Профиль",
      order: 1,
      questions: [
        {
          key: "role",
          title: "Какова ваша роль в компании?",
          type: "radio",
          required: true,
          order: 1,
          options: [
            { key: "hr_director", label: "HR-директор / CHRO", order: 1 },
            { key: "other_employee", label: "Другая роль", order: 2 },
          ],
        },
        {
          key: "company_size",
          title: "Сколько сотрудников в вашей компании?",
          type: "radio",
          required: true,
          order: 2,
          options: [
            { key: "under_100", label: "До 100", order: 1 },
            { key: "100_300", label: "100-300", order: 2 },
          ],
        },
        {
          key: "has_wellbeing_program",
          title: "Есть ли программа благополучия?",
          type: "radio",
          required: true,
          order: 3,
          options: [
            { key: "no_not_planning", label: "Нет и не планируем", order: 1 },
            { key: "comprehensive", label: "Да, комплексная", order: 2 },
          ],
        },
      ],
    },
    {
      key: "methods",
      title: "Методика",
      order: 2,
      questions: [
        {
          key: "wellbeing_metrics",
          title: "Как вы измеряете результаты программ?",
          type: "checkbox",
          required: false,
          order: 1,
          showWhen: {
            questionKey: "has_wellbeing_program",
            operator: "not_in",
            optionKeys: ["no_not_planning"],
          },
          options: [{ key: "engagement", label: "Вовлеченность", order: 1 }],
        },
        {
          key: "financial_stress_impact",
          title: "Финансовый стресс влияет на продуктивность?",
          type: "likert",
          required: true,
          order: 2,
          options: [
            { key: "1", label: "1", order: 1 },
            { key: "2", label: "2", order: 2 },
            { key: "3", label: "3", order: 3 },
            { key: "4", label: "4", order: 4 },
            { key: "5", label: "5", order: 5 },
          ],
        },
        {
          key: "barriers",
          title: "Что мешает внедрению?",
          type: "checkbox",
          required: false,
          order: 3,
          maxSelections: 2,
          options: [
            { key: "no_budget", label: "Нет бюджета", order: 1 },
            { key: "roi_hard", label: "Сложно доказать ROI", order: 2 },
            { key: "no_provider", label: "Нет провайдера", order: 3 },
            { key: "no_barriers", label: "Барьеров нет", order: 4, exclusive: true },
          ],
        },
        {
          key: "importance_of_methods",
          title: "Насколько важны методические материалы?",
          type: "likert",
          required: true,
          order: 4,
          options: [
            { key: "1", label: "1", order: 1 },
            { key: "2", label: "2", order: 2 },
            { key: "3", label: "3", order: 3 },
            { key: "4", label: "4", order: 4 },
            { key: "5", label: "5", order: 5 },
          ],
        },
      ],
    },
  ],
};

const baseTargetAnswers: HrDiagnosticAnswerInput[] = [
  { questionKey: "role", selectedOptionKeys: ["hr_director"] },
  { questionKey: "company_size", selectedOptionKeys: ["100_300"] },
  { questionKey: "has_wellbeing_program", selectedOptionKeys: ["comprehensive"] },
  { questionKey: "financial_stress_impact", selectedOptionKeys: ["5"] },
  { questionKey: "importance_of_methods", selectedOptionKeys: ["4"] },
];

test("validateHrDiagnosticSubmission marks HR in 100+ company as target", () => {
  const result = validateHrDiagnosticSubmission(TEST_HR_DIAGNOSTIC, baseTargetAnswers);

  assert.equal(result.valid, true);
  assert.equal(result.targetSegment, "target");
  assert.equal(result.fieldValues.role, "HR-директор / CHRO");
});

test("validateHrDiagnosticSubmission routes under-100 companies to non-target", () => {
  const result = validateHrDiagnosticSubmission(
    TEST_HR_DIAGNOSTIC,
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
    TEST_HR_DIAGNOSTIC,
    [{ questionKey: "has_wellbeing_program", selectedOptionKeys: ["no_not_planning"] }]
  );

  assert.equal(
    visibleQuestions.some((question) => question.key === "wellbeing_metrics"),
    false
  );
});

test("validateHrDiagnosticSubmission enforces checkbox max selections", () => {
  const result = validateHrDiagnosticSubmission(
    TEST_HR_DIAGNOSTIC,
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

test("validateHrDiagnosticSubmission enforces exclusive checkbox options", () => {
  const exclusiveWithRegular = validateHrDiagnosticSubmission(
    TEST_HR_DIAGNOSTIC,
    [
      ...baseTargetAnswers,
      {
        questionKey: "barriers",
        selectedOptionKeys: ["no_barriers", "no_budget"],
      },
    ]
  );

  assert.equal(exclusiveWithRegular.valid, false);
  assert.match(exclusiveWithRegular.errors.join("\n"), /нельзя выбрать вместе/);

  const onlyExclusive = validateHrDiagnosticSubmission(
    TEST_HR_DIAGNOSTIC,
    [
      ...baseTargetAnswers,
      {
        questionKey: "barriers",
        selectedOptionKeys: ["no_barriers"],
      },
    ]
  );

  assert.equal(onlyExclusive.valid, true);

  const regularOptions = validateHrDiagnosticSubmission(
    TEST_HR_DIAGNOSTIC,
    [
      ...baseTargetAnswers,
      {
        questionKey: "barriers",
        selectedOptionKeys: ["no_budget", "roi_hard"],
      },
    ]
  );

  assert.equal(regularOptions.valid, true);
});

test("validateHrDiagnosticSubmission uses question and option labels from the provided test", () => {
  const editedTest = {
    ...TEST_HR_DIAGNOSTIC,
    groups: TEST_HR_DIAGNOSTIC.groups.map((group) => ({
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
    TEST_HR_DIAGNOSTIC,
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
