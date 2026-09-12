export interface InquiryProgram {
  id: string;
  title: string;
}

export interface InquiryContext {
  formType: "general" | "corporate";
  programId?: string;
  companyProvided: boolean;
}

export type InquiryErrorCode =
  | "required_fields"
  | "invalid_email"
  | "consent_required"
  | "request_rejected"
  | "rate_limit"
  | "server_error"
  | "network_error"
  | "invalid_response";

export type InquiryField = "name" | "email" | "consent";

export interface InquiryErrorDetail {
  code: InquiryErrorCode;
  fields?: InquiryField[];
  httpStatus?: number;
  requestId?: string | null;
}
