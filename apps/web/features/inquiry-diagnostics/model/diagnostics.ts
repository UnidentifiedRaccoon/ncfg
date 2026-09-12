import { YM_GOALS, type YmGoal } from "@/shared/lib/ym";
import type { InquiryContext, InquiryErrorDetail, InquiryProgram } from "./types";

type EmitGoal = (goal: YmGoal, params: Record<string, unknown>) => void;

export function buildInquiryMessage(message: string, program?: InquiryProgram) {
  const text = message.trim();
  if (!program) return text;
  return [`Программа: ${program.title}`, text].filter(Boolean).join("\n\n");
}

export function createInquiryDiagnostics(
  emit: EmitGoal,
  getPath: () => string,
  createId: () => string
) {
  let instanceId: string | undefined;
  let sequence = 0;
  let attempt = 0;
  const seen = new Set<YmGoal>();

  function send(goal: YmGoal, context: InquiryContext, detail: Record<string, unknown> = {}) {
    instanceId ??= createId();
    // Only named metadata is allowed here. Never spread form values or URL params.
    const path = getPath().split(/[?#]/, 1)[0];
    emit(goal, {
      schema_version: 2,
      form_type: context.formType,
      form_id: "lead-form",
      form_instance_id: instanceId,
      sequence: ++sequence,
      attempt,
      page_path: path,
      program_id: context.programId ?? "unspecified",
      company_provided: context.companyProvided,
      ...detail,
    });
  }

  function once(goal: YmGoal, context: InquiryContext) {
    if (seen.has(goal)) return;
    seen.add(goal);
    send(goal, context);
  }

  function requestDetail(requestId?: string | null) {
    // The API returns its opaque request id. Reject arbitrary header contents.
    return requestId && /^[a-zA-Z0-9-]{8,64}$/.test(requestId)
      ? { request_id: requestId }
      : {};
  }

  return {
    view: (context: InquiryContext) => once(YM_GOALS.LEAD_FORM_VIEW, context),
    focus: (context: InquiryContext) => once(YM_GOALS.LEAD_FORM_START, context),
    input: (context: InquiryContext) => once(YM_GOALS.LEAD_FORM_INPUT, context),
    select: (context: InquiryContext) => send(YM_GOALS.LEAD_PROGRAM_SELECT, context),
    attempt(context: InquiryContext) {
      attempt += 1;
      send(YM_GOALS.LEAD_FORM_ATTEMPT, context);
    },
    error(context: InquiryContext, detail: InquiryErrorDetail) {
      send(YM_GOALS.LEAD_FORM_ERROR, context, {
        error_code: detail.code,
        ...(detail.fields?.length ? { invalid_fields: detail.fields.join(",") } : {}),
        ...(detail.httpStatus ? { http_status: detail.httpStatus } : {}),
        ...requestDetail(detail.requestId),
      });
    },
    success(context: InquiryContext, requestId?: string | null) {
      if (seen.has(YM_GOALS.LEAD_FORM_SUBMIT)) return;
      seen.add(YM_GOALS.LEAD_FORM_SUBMIT);
      send(YM_GOALS.LEAD_FORM_SUBMIT, context, requestDetail(requestId));
    },
    reset() {
      seen.clear();
      instanceId = undefined;
      sequence = 0;
      attempt = 0;
    },
  };

}
