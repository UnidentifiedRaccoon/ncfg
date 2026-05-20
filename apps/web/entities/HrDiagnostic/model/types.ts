export type HrDiagnosticQuestionType = "radio" | "checkbox" | "likert" | "email";

export type HrDiagnosticSegment = "target" | "non_target";

export interface HrDiagnosticOption {
  key: string;
  label: string;
  exclusive?: boolean;
}

export interface HrDiagnosticVisibilityCondition {
  questionKey: string;
  operator: "not_in";
  optionKeys: string[];
}

export interface HrDiagnosticQuestion {
  key: string;
  title: string;
  description?: string;
  type: HrDiagnosticQuestionType;
  required: boolean;
  options?: HrDiagnosticOption[];
  maxSelections?: number;
  allowOther?: boolean;
  showWhen?: HrDiagnosticVisibilityCondition;
}

export interface HrDiagnosticGroup {
  title: string;
  questions: HrDiagnosticQuestion[];
}

export interface HrDiagnosticCompletionScreen {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryText?: string;
}

export interface HrDiagnosticTest {
  documentId?: string;
  slug: string;
  title: string;
  projectTitle: string;
  introLead?: string;
  introBody?: string;
  introGiftText?: string;
  anonymousNotice?: string;
  groups: HrDiagnosticGroup[];
  targetCompletion?: HrDiagnosticCompletionScreen;
  nonTargetCompletion?: HrDiagnosticCompletionScreen;
}

export interface HrDiagnosticAnswerInput {
  questionKey: string;
  selectedOptionKeys?: string[];
  otherText?: string;
  text?: string;
}

export interface HrDiagnosticNormalizedAnswer {
  questionKey: string;
  questionTitle: string;
  answerLabel: string;
  selectedOptionKeys: string[];
  otherText?: string;
  text?: string;
}

export interface HrDiagnosticValidationResult {
  valid: boolean;
  errors: string[];
  normalizedAnswers: HrDiagnosticNormalizedAnswer[];
  targetSegment: HrDiagnosticSegment;
}
