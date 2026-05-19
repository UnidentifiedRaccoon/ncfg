export type HrDiagnosticQuestionType = "radio" | "checkbox" | "likert" | "email";

export type HrDiagnosticSegment = "target" | "non_target";

export interface HrDiagnosticOption {
  key: string;
  label: string;
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
  otherLabel?: string;
  showWhen?: HrDiagnosticVisibilityCondition;
}

export interface HrDiagnosticGroup {
  key: string;
  title: string;
  questions: HrDiagnosticQuestion[];
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
