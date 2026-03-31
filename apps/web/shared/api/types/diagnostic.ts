export interface DiagnosticOption {
  key: string;
  label: string;
  weight: number;
  order: number;
  insightTitle?: string;
  insightText?: string;
  practiceStep?: string;
}

export interface DiagnosticQuestion {
  key: string;
  title: string;
  description: string | null;
  order: number;
  options: DiagnosticOption[];
}

export interface DiagnosticTest {
  documentId: string;
  code: string;
  version: number;
  title: string;
  questions: DiagnosticQuestion[];
  resultBands: DiagnosticResultBand[];
}

export interface DiagnosticOrganization {
  documentId: string;
  name: string;
}

export interface DiagnosticCampaign {
  documentId: string;
  title: string;
  slug: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  isNavigationLayoutDisabled: boolean;
  isCtaDisabled: boolean;
  overwriteCtaLabel?: string;
  overwriteCtaHref?: string;
  organization: DiagnosticOrganization | null;
  test: DiagnosticTest | null;
}

export interface DiagnosticPublicOption {
  key: string;
  label: string;
  order: number;
}

export interface DiagnosticPublicQuestion {
  key: string;
  title: string;
  description: string | null;
  order: number;
  options: DiagnosticPublicOption[];
}

export interface DiagnosticResultBand {
  key: string;
  title: string;
  minPercent: number;
  maxPercent: number;
  summary: string;
  ctaLabel?: string;
  ctaHref?: string;
  order: number;
}

export interface DiagnosticResult {
  totalScore: number;
  maxScore: number;
  scorePercent: number;
  ctaLabel?: string;
  ctaHref?: string;
  band: {
    key: string;
    title: string;
    summary: string;
  } | null;
  insights: DiagnosticResultInsight[];
}

export type DiagnosticEmailDeliveryStatus = "sent" | "failed";

export interface DiagnosticSubmitResponse {
  success: boolean;
  message: string;
  data: {
    documentId?: string;
    attemptNumber?: number;
    result: DiagnosticResult;
    emailDeliveryStatus: DiagnosticEmailDeliveryStatus;
  };
}

export interface DiagnosticPreviewResponse {
  success: boolean;
  data: {
    documentId?: string;
    attemptNumber?: number;
    result: DiagnosticResult;
  };
}

export interface DiagnosticSubmissionAnswerSnapshot {
  questionKey: string;
  questionTitle: string;
  answerKey: string;
  answerLabel: string;
  weight: number;
  insightTitle?: string;
  insightText?: string;
  practiceStep?: string;
}

export interface DiagnosticResultInsight {
  questionKey: string;
  questionTitle: string;
  answerKey: string;
  answerLabel: string;
  weight: number;
  insightTitle: string;
  insightText: string;
  practiceStep: string;
}
