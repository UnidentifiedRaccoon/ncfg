import assert from "node:assert/strict";
import test from "node:test";
import { buildInquiryMessage, createInquiryDiagnostics } from "./diagnostics";
import type { InquiryContext } from "./types";

const context: InquiryContext = { formType: "corporate", programId: "program-hr", companyProvided: true };

function setup() {
  const events: { goal: string; params: Record<string, unknown> }[] = [];
  let id = 0;
  const diagnostics = createInquiryDiagnostics(
    (goal, params) => events.push({ goal, params }),
    () => "/companies/season-offer?email=private@example.test#lead-form",
    () => `form-${++id}`
  );
  return { diagnostics, events };
}

test("visibility, focus and actual input remain separate, once per inquiry", () => {
  const { diagnostics, events } = setup();
  diagnostics.view(context);
  diagnostics.view(context);
  diagnostics.focus(context);
  diagnostics.focus(context);
  assert.deepEqual(events.map((event) => event.goal), ["lead_form_view", "lead_form_start"]);
  diagnostics.input(context);
  diagnostics.input(context);
  assert.equal(events.filter((event) => event.goal === "lead_form_input").length, 1);
});

test("retries share an inquiry id and have distinct attempt numbers", () => {
  const { diagnostics, events } = setup();
  diagnostics.input(context);
  diagnostics.attempt(context);
  diagnostics.error(context, { code: "consent_required", fields: ["consent"] });
  diagnostics.attempt(context);
  diagnostics.error(context, { code: "server_error", httpStatus: 503, requestId: "request-0001" });
  diagnostics.attempt(context);
  diagnostics.success(context, "request-0002");
  diagnostics.success(context, "request-0002");
  assert.deepEqual(events.map((event) => event.params.sequence), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(events.map((event) => event.params.attempt), [0, 1, 1, 2, 2, 3, 3]);
  assert.equal(new Set(events.map((event) => event.params.form_instance_id)).size, 1);
  assert.equal(events.filter((event) => event.goal === "lead_form_submit").length, 1);
  assert.equal(events.at(-1)?.params.request_id, "request-0002");
});

test("a second inquiry resets one-time events and correlation id", () => {
  const { diagnostics, events } = setup();
  diagnostics.view(context);
  diagnostics.success(context);
  diagnostics.reset();
  diagnostics.view(context);
  assert.equal(events[0].params.form_instance_id, "form-1");
  assert.equal(events[2].params.form_instance_id, "form-2");
  assert.equal(events[2].params.sequence, 1);
  assert.equal(events[2].params.attempt, 0);
});

test("diagnostics allow only metadata, not contact fields, text or URL parameters", () => {
  const { diagnostics, events } = setup();
  const withPrivateValues = { ...context, name: "Private Person", email: "private@example.test", message: "Private message" };
  diagnostics.input(withPrivateValues);
  diagnostics.error(context, { code: "network_error", requestId: "private@example.test" });
  const serialized = JSON.stringify(events);
  assert.ok(!serialized.includes("Private"));
  assert.ok(!serialized.includes("private@example.test"));
  assert.equal(events[0].params.page_path, "/companies/season-offer");
  assert.equal(events[1].params.request_id, undefined);
});

test("program changes are reflected in later events without resetting the inquiry", () => {
  const { diagnostics, events } = setup();
  diagnostics.select(context);
  diagnostics.select({ ...context, programId: undefined });
  diagnostics.attempt({ ...context, programId: undefined });
  assert.equal(events[0].params.program_id, "program-hr");
  assert.equal(events[2].params.program_id, "unspecified");
  assert.equal(events[0].params.form_instance_id, events[2].params.form_instance_id);
});

test("the selected program reaches the existing delivery message without losing the inquiry text", () => {
  const program = { id: "program-hr", title: "Вебинар для HR" };
  assert.equal(buildInquiryMessage("  Нужна программа на осень  ", program), "Программа: Вебинар для HR\n\nНужна программа на осень");
  assert.equal(buildInquiryMessage("", program), "Программа: Вебинар для HR");
  assert.equal(buildInquiryMessage("  Помогите выбрать  "), "Помогите выбрать");
});
