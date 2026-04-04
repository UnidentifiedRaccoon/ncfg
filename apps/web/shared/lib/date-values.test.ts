import assert from "node:assert/strict";
import test from "node:test";
import { pickLatestDate } from "./date-values";

test("pickLatestDate returns the most recent valid date", () => {
  assert.equal(
    pickLatestDate(["2026-01-31", "2026-03-22", "2026-02-28"], "sitemap"),
    "2026-03-22"
  );
});

test("pickLatestDate ignores empty values", () => {
  assert.equal(
    pickLatestDate([undefined, null, "2026-01-31"], "about page"),
    "2026-01-31"
  );
});

test("pickLatestDate throws for invalid dates", () => {
  assert.throws(
    () => pickLatestDate(["not-a-date"], "about page"),
    /Invalid date in about page: not-a-date/
  );
});

test("pickLatestDate throws when all values are missing", () => {
  assert.throws(() => pickLatestDate([], "about page"), /Missing date in about page/);
});
