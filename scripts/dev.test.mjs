import assert from "node:assert/strict";
import test from "node:test";

import {
  createLocalCmsEnvironment,
  createWebEnvironment,
  decideDependencyAction,
  dependencyFingerprint,
  isSupportedNodeVersion,
  isSupportedNpmVersion,
  redactSecrets,
} from "./dev-lib.mjs";

test("runtime version ranges match package engines", () => {
  assert.equal(isSupportedNodeVersion("v22.22.1"), false);
  assert.equal(isSupportedNodeVersion("v22.22.2"), true);
  assert.equal(isSupportedNodeVersion("22.99.0"), true);
  assert.equal(isSupportedNodeVersion("v23.0.0"), false);
  assert.equal(isSupportedNpmVersion("9.9.9"), false);
  assert.equal(isSupportedNpmVersion("10.0.0"), true);
});

test("dependency decision installs only for missing or stale dependencies", () => {
  assert.equal(
    decideDependencyAction({
      requiredBinaryExists: false,
      markerHash: "same",
      currentHash: "same",
    }),
    "install"
  );
  assert.equal(
    decideDependencyAction({
      requiredBinaryExists: true,
      markerHash: "same",
      currentHash: "same",
    }),
    "ready"
  );
  assert.equal(
    decideDependencyAction({
      requiredBinaryExists: true,
      markerHash: null,
      currentHash: "new",
      npmListSucceeded: true,
    }),
    "adopt"
  );
  assert.equal(
    decideDependencyAction({
      requiredBinaryExists: true,
      markerHash: "old",
      currentHash: "new",
    }),
    "install"
  );
});

test("dependency fingerprint covers package metadata and lockfile", () => {
  assert.equal(dependencyFingerprint("package", "lock"), dependencyFingerprint("package", "lock"));
  assert.notEqual(dependencyFingerprint("package", "lock"), dependencyFingerprint("package2", "lock"));
  assert.notEqual(dependencyFingerprint("package", "lock"), dependencyFingerprint("package", "lock2"));
});

test("production web environment is read-only and strips external-effect credentials", () => {
  const environment = createWebEnvironment(
    {
      STRAPI_PROD_WRITE_API_TOKEN: "write-secret",
      POSTBOX_API_KEY_SECRET: "mail-secret",
      BITRIX24_WEBHOOK_URL: "https://example.test/secret",
      GETCOURSE_API_KEY: "crm-secret",
      NEXT_PUBLIC_YANDEX_METRIKA_ID: "123",
      KEEP_ME: "yes",
    },
    {
      source: "prod",
      readToken: "read-secret",
      strapiUrl: "https://admin.ncfg.ru",
    }
  );

  assert.equal(environment.STRAPI_SOURCE, "prod");
  assert.equal(environment.DEPLOY_ENV, "local");
  assert.equal(environment.STRAPI_WRITE_MODE, "disabled");
  assert.equal(environment.OUTBOUND_MODE, "disabled");
  assert.equal(environment.STRAPI_PROD_API_TOKEN, "read-secret");
  assert.equal(environment.STRAPI_PROD_WRITE_API_TOKEN, undefined);
  assert.equal(environment.POSTBOX_API_KEY_SECRET, undefined);
  assert.equal(environment.BITRIX24_WEBHOOK_URL, undefined);
  assert.equal(environment.GETCOURSE_API_KEY, undefined);
  assert.equal(environment.NEXT_PUBLIC_YANDEX_METRIKA_ID, "");
  assert.equal(environment.KEEP_ME, "yes");
});

test("local web environment enables only local Strapi writes", () => {
  const environment = createWebEnvironment(
    { STRAPI_PROD_API_TOKEN: "must-not-leak" },
    {
      source: "local",
      readToken: "local-read",
      writeToken: "local-write",
      strapiUrl: "http://127.0.0.1:1337",
    }
  );

  assert.equal(environment.STRAPI_SOURCE, "local");
  assert.equal(environment.STRAPI_LOCAL_API_TOKEN, "local-read");
  assert.equal(environment.STRAPI_LOCAL_WRITE_API_TOKEN, "local-write");
  assert.equal(environment.STRAPI_PROD_API_TOKEN, undefined);
  assert.equal(environment.STRAPI_WRITE_MODE, "enabled");
  assert.equal(environment.OUTBOUND_MODE, "disabled");
});

test("local CMS environment is explicitly development-only and strips inherited bootstrap", () => {
  const environment = createLocalCmsEnvironment({
    NODE_ENV: "production",
    NCFG_LOCAL_TOKEN_BOOTSTRAP: "1",
    NCFG_LOCAL_READ_API_TOKEN: "inherited-read",
    NCFG_LOCAL_WRITE_API_TOKEN: "inherited-write",
  });

  assert.equal(environment.NODE_ENV, "development");
  assert.equal(environment.HOST, "127.0.0.1");
  assert.equal(environment.NCFG_LOCAL_TOKEN_BOOTSTRAP, undefined);
  assert.equal(environment.NCFG_LOCAL_READ_API_TOKEN, undefined);
  assert.equal(environment.NCFG_LOCAL_WRITE_API_TOKEN, undefined);
});

test("full profile enables bootstrap only with its ephemeral local tokens", () => {
  const environment = createLocalCmsEnvironment({}, {
    read: "local-read",
    write: "local-write",
  });

  assert.equal(environment.NCFG_LOCAL_TOKEN_BOOTSTRAP, "1");
  assert.equal(environment.NCFG_LOCAL_READ_API_TOKEN, "local-read");
  assert.equal(environment.NCFG_LOCAL_WRITE_API_TOKEN, "local-write");
});

test("log redaction never preserves a known token", () => {
  assert.equal(
    redactSecrets("before super-secret after", ["super-secret"]),
    "before [REDACTED] after"
  );
});
