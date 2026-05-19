export type HrDiagnosticQuestionType = "radio" | "checkbox" | "likert" | "email";

export type HrDiagnosticSegment = "target" | "non_target";

export interface HrDiagnosticOption {
  key: string;
  label: string;
  order?: number;
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
  order?: number;
  maxSelections?: number;
  allowOther?: boolean;
  otherLabel?: string;
  showWhen?: HrDiagnosticVisibilityCondition;
}

export interface HrDiagnosticGroup {
  key: string;
  title: string;
  order?: number;
  questions: HrDiagnosticQuestion[];
}

export interface HrDiagnosticCompletionScreen {
  title?: string;
  body?: string;
  giftTitle?: string;
  giftBody?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryText?: string;
}

export interface HrDiagnosticTest {
  documentId?: string;
  slug: string;
  title: string;
  testTitle: string;
  projectTitle: string;
  contactEmail?: string;
  interviewHref?: string;
  guideHref?: string;
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
  fieldValues: {
    role?: string;
    roleOther?: string;
    companySize?: string;
    industry?: string;
    industryOther?: string;
    region?: string;
    email?: string;
    subscribeMaterials?: string;
  };
}
