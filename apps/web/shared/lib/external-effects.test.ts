import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import {
  ExternalEffectDisabledError,
  assertOutboundAllowed,
  assertStrapiWriteAllowed,
  isOutboundAllowed,
  isStrapiWriteAllowed,
} from "./external-effects";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  delete process.env.STRAPI_WRITE_MODE;
  delete process.env.OUTBOUND_MODE;
  delete process.env.DEPLOY_ENV;
  delete process.env.VERCEL_ENV;
});

test("auto allows effects only in an explicitly marked production runtime", () => {
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.DEPLOY_ENV = "production";
  assert.equal(isStrapiWriteAllowed("prod"), true);
  assert.equal(isOutboundAllowed(), true);

  process.env.DEPLOY_ENV = "preview";
  assert.equal(isStrapiWriteAllowed("prod"), false);
  assert.equal(isOutboundAllowed(), false);
});

test("auto stays fail-closed for unmarked production and either preview marker", () => {
  Reflect.set(process.env, "NODE_ENV", "production");
  assert.equal(isStrapiWriteAllowed("prod"), false);
  assert.equal(isOutboundAllowed(), false);

  process.env.VERCEL_ENV = "preview";
  assert.equal(isStrapiWriteAllowed("prod"), false);
  assert.equal(isOutboundAllowed(), false);
});

test("development auto allows local Strapi writes but blocks production writes and outbound", () => {
  Reflect.set(process.env, "NODE_ENV", "development");
  assert.equal(isStrapiWriteAllowed("local"), true);
  assert.equal(isStrapiWriteAllowed("prod"), false);
  assert.equal(isStrapiWriteAllowed("default"), false);
  assert.equal(isOutboundAllowed(), false);
});

test("explicit disabled wins in production", () => {
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.DEPLOY_ENV = "production";
  process.env.STRAPI_WRITE_MODE = "disabled";
  process.env.OUTBOUND_MODE = "disabled";
  assert.equal(isStrapiWriteAllowed("prod"), false);
  assert.equal(isOutboundAllowed(), false);
});

test("explicit enabled allows an intentional development effect", () => {
  Reflect.set(process.env, "NODE_ENV", "development");
  process.env.STRAPI_WRITE_MODE = "enabled";
  process.env.OUTBOUND_MODE = "enabled";
  assert.equal(isStrapiWriteAllowed("prod"), true);
  assert.equal(isOutboundAllowed(), true);
});

test("assertions throw a typed error when effects are disabled", () => {
  Reflect.set(process.env, "NODE_ENV", "development");
  assert.throws(() => assertStrapiWriteAllowed("prod"), ExternalEffectDisabledError);
  assert.throws(() => assertOutboundAllowed(), ExternalEffectDisabledError);
});

test("unknown effect modes fail fast", () => {
  process.env.STRAPI_WRITE_MODE = "maybe";
  process.env.OUTBOUND_MODE = "sometimes";
  assert.throws(() => isStrapiWriteAllowed("local"), /Invalid STRAPI_WRITE_MODE/);
  assert.throws(() => isOutboundAllowed(), /Invalid OUTBOUND_MODE/);
});
