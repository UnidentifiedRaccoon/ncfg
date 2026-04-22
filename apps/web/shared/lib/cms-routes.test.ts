import assert from "node:assert/strict";
import test from "node:test";
import {
  isCmsDrivenPath,
  isInternalHref,
  shouldUseNativeDocumentNavigation,
} from "./cms-routes";

test("isCmsDrivenPath matches the CMS allowlist families", () => {
  assert.equal(isCmsDrivenPath("/"), true);
  assert.equal(isCmsDrivenPath("/about"), true);
  assert.equal(isCmsDrivenPath("/blog"), true);
  assert.equal(isCmsDrivenPath("/blog?category=news"), true);
  assert.equal(isCmsDrivenPath("/blog/novost"), true);
  assert.equal(isCmsDrivenPath("/companies"), true);
  assert.equal(isCmsDrivenPath("/companies/service-a"), true);
  assert.equal(isCmsDrivenPath("/rekomendacii"), true);
  assert.equal(isCmsDrivenPath("/vacancies"), true);
  assert.equal(isCmsDrivenPath("/vacancies/editor"), true);
  assert.equal(isCmsDrivenPath("/diagnostika/financial-wellbeing"), true);
});

test("isCmsDrivenPath ignores non-CMS routes", () => {
  assert.equal(isCmsDrivenPath("/individuals"), false);
  assert.equal(isCmsDrivenPath("/portfolio"), false);
  assert.equal(isCmsDrivenPath("/history"), false);
  assert.equal(isCmsDrivenPath("/politika-konfidencialnosti"), false);
  assert.equal(isCmsDrivenPath("/diagnostika"), false);
});

test("isInternalHref distinguishes app routes from external URLs", () => {
  assert.equal(isInternalHref("/blog"), true);
  assert.equal(isInternalHref("/blog?category=news"), true);
  assert.equal(isInternalHref("https://ncfg.ru/blog"), false);
  assert.equal(isInternalHref("mailto:hello@ncfg.ru"), false);
  assert.equal(isInternalHref("#lead-form"), false);
});

test("shouldUseNativeDocumentNavigation bypasses router cache only where required", () => {
  assert.equal(shouldUseNativeDocumentNavigation("/blog"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/blog?category=news"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/companies#services-1"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/#lead-form"), true);
  assert.equal(shouldUseNativeDocumentNavigation("/politika-konfidencialnosti"), false);
  assert.equal(shouldUseNativeDocumentNavigation("/individuals"), false);
  assert.equal(shouldUseNativeDocumentNavigation("#lead-form"), true);
  assert.equal(shouldUseNativeDocumentNavigation("tel:+79990000000"), true);
  assert.equal(shouldUseNativeDocumentNavigation("https://example.com"), true);
});
