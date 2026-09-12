import assert from "node:assert/strict";
import test from "node:test";
import { createResourceReporter, diagnosticsAllowed, type ResourceFailure } from "./resource-diagnostics";

test("diagnostics run only on the public live site, excluding replay frames and experiments", () => {
  assert.equal(diagnosticsAllowed("https://ncfg.ru/companies", "https://ncfg.ru", true), true);
  assert.equal(diagnosticsAllowed("https://metrika.yandex.ru/inpage/visor-proto", "https://ncfg.ru", false), false);
  assert.equal(diagnosticsAllowed("https://ncfg.ru/", "https://ncfg.ru", false), false);
  assert.equal(diagnosticsAllowed("http://localhost:3000/", "http://localhost:3000", true), false);
  assert.equal(diagnosticsAllowed("https://ncfg.ru/experiments/demo", "https://ncfg.ru", true), false);
  assert.equal(diagnosticsAllowed("https://preview.example/", "https://ncfg.ru", true), false);
});

test("early failures wait for Metrika, deduplicate and contain only a kind and validated release", () => {
  let ready = false;
  const sent: ResourceFailure[] = [];
  const reporter = createResourceReporter("deca0c70", (event) => {
    if (!ready) return false;
    sent.push(event);
    return true;
  });
  reporter.record("css");
  reporter.record("css");
  reporter.record("font");
  assert.equal(sent.length, 0);
  ready = true;
  reporter.flush();
  reporter.flush();
  reporter.record("css");
  assert.deepEqual(sent, [
    { kind: "css", release: "deca0c70" },
    { kind: "font", release: "deca0c70" },
  ]);
});

test("invalid release metadata cannot carry user data and a failing collector does not throw", () => {
  const sent: ResourceFailure[] = [];
  let broken = true;
  const reporter = createResourceReporter("user@example.test?token=private", (event) => {
    if (broken) throw new Error("collector unavailable");
    sent.push(event);
    return true;
  });
  assert.doesNotThrow(() => reporter.record("image"));
  broken = false;
  reporter.flush();
  assert.deepEqual(sent, [{ kind: "image", release: "unknown" }]);
});
