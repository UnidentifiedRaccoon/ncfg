import assert from "node:assert/strict";
import test from "node:test";

import { withCmsFallback } from "./cms-fallback";

test("withCmsFallback returns loaded data when CMS call succeeds", async () => {
  const result = await withCmsFallback(async () => ["live"], {
    label: "home news",
    fallback: [],
    onError: () => {
      throw new Error("logger should not be called");
    },
  });

  assert.deepEqual(result, ["live"]);
});

test("withCmsFallback returns fallback and logs compact error summary", async () => {
  const messages: string[] = [];

  const result = await withCmsFallback(
    async () => {
      throw new Error("Strapi API error (502)");
    },
    {
      label: "home recommendations",
      fallback: [],
      onError: (message) => messages.push(message),
    }
  );

  assert.deepEqual(result, []);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /home recommendations failed/u);
  assert.match(messages[0], /Error: Strapi API error \(502\)/u);
});
