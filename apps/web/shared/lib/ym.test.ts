import assert from "node:assert/strict";
import test from "node:test";
import { reachGoal, YM_GOALS } from "./ym";

test("blocked analytics cannot interrupt form submission; experiments remain excluded", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  let called = 0;
  const location = { pathname: "/companies" };
  process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = "123";
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location,
    ym() { called += 1; throw new Error("Tracking blocked"); },
  } });
  try {
    assert.doesNotThrow(() => reachGoal(YM_GOALS.LEAD_FORM_SUBMIT, { form_type: "corporate" }));
    assert.equal(called, 1);
    location.pathname = "/experiments/inquiry";
    reachGoal(YM_GOALS.LEAD_FORM_VIEW);
    assert.equal(called, 1);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (previousId === undefined) delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    else process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = previousId;
  }
});
