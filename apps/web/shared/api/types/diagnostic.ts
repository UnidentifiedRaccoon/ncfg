export interface DiagnosticOption {
  key: string;
  label: string;
  weight: number;
  order: number;
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

export interface DiagnosticSubmissionAnswerSnapshot {
  questionKey: string;
  questionTitle: string;
  answerKey: string;
  answerLabel: string;
  weight: number;
}
