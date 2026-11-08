import { createHash } from "node:crypto";

export const MIN_NODE_VERSION = [22, 22, 2];
export const MAX_NODE_MAJOR = 23;

const BLOCKED_INHERITED_ENV = [
  "ADMIN_JWT_SECRET", "API_TOKEN_SALT", "APP_KEYS", "JWT_SECRET", "TRANSFER_TOKEN_SALT",
  "NCFG_LOCAL_TOKEN_BOOTSTRAP", "NCFG_LOCAL_READ_API_TOKEN", "NCFG_LOCAL_WRITE_API_TOKEN",
  "NCFG_CLOUDRU_KEY_ID",
  "NCFG_CLOUDRU_KEY_SECRET",
  "STRAPI_API_TOKEN",
  "STRAPI_WRITE_API_TOKEN",
  "STRAPI_LOCAL_API_TOKEN",
  "STRAPI_LOCAL_WRITE_API_TOKEN",
  "STRAPI_PROD_API_TOKEN",
  "STRAPI_PROD_WRITE_API_TOKEN",
  "POSTBOX_API_KEY_ID",
  "POSTBOX_API_KEY_SECRET",
  "POSTBOX_FROM_EMAIL",
  "POSTBOX_SMTP_HOST",
  "POSTBOX_SMTP_PORT",
  "LEADS_RECIPIENT_EMAIL",
  "LEADS_RECIPIENT_EMAILS",
  "GETCOURSE_API_KEY",
  "GETCOURSE_BASE_URL",
  "GETCOURSE_SOURCE_VALUE",
  "BITRIX24_WEBHOOK_URL",
  "NEXT_PUBLIC_YANDEX_METRIKA_ID",
];

export function parseVersion(value) {
  const match = String(value).trim().match(/^v?(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1, 4).map(Number) : null;
}

export function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    const difference = left[index] - right[index];
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

export function isSupportedNodeVersion(value) {
  const version = parseVersion(value);
  return Boolean(
    version &&
      compareVersions(version, MIN_NODE_VERSION) >= 0 &&
      version[0] < MAX_NODE_MAJOR
  );
}

export function isSupportedNpmVersion(value) {
  const version = parseVersion(value);
  return Boolean(version && version[0] >= 10);
}

export function dependencyFingerprint(packageJson, packageLock) {
  return createHash("sha256")
    .update(packageJson)
    .update("\0")
    .update(packageLock)
    .digest("hex");
}

export function decideDependencyAction({
  requiredBinaryExists,
  markerHash,
  currentHash,
  npmListSucceeded = false,
}) {
  if (!requiredBinaryExists) return "install";
  if (markerHash === currentHash) return "ready";
  if (!markerHash && npmListSucceeded) return "adopt";
  return "install";
}

export function withoutProductionCredentials(baseEnvironment) {
  const environment = { ...baseEnvironment };
  for (const name of Object.keys(environment)) {
    if (BLOCKED_INHERITED_ENV.includes(name) || /^(DATABASE_|POSTGRES_|AWS_|SMTP_)/.test(name)) {
      delete environment[name];
    }
  }
  return environment;
}

export function getNextDevFlags(env) {
  const bundler = env.NCFG_DEV_BUNDLER?.trim() || "turbopack";
  if (bundler === "webpack") return ["--webpack"];
  if (bundler !== "turbopack") {
    throw new Error("NCFG_DEV_BUNDLER должен быть turbopack или webpack.");
  }

  const flags = ["--turbopack"];
  if (env.NCFG_DEV_SOURCE_MAPS?.trim() !== "1") flags.push("--disable-source-maps");
  return flags;
}

export function createWebEnvironment(baseEnvironment, {
  source,
  readToken,
  writeToken,
  strapiUrl,
}) {
  const environment = withoutProductionCredentials(baseEnvironment);

  Object.assign(environment, {
    DEPLOY_ENV: "local",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_YANDEX_METRIKA_ID: "",
    NEXT_TELEMETRY_DISABLED: "1",
    OUTBOUND_MODE: "disabled",
    STRAPI_SOURCE: source,
  });

  if (source === "prod") {
    Object.assign(environment, {
      STRAPI_PROD_URL: strapiUrl,
      STRAPI_PROD_API_TOKEN: readToken,
      STRAPI_WRITE_MODE: "disabled",
    });
  } else {
    Object.assign(environment, {
      STRAPI_LOCAL_URL: strapiUrl,
      STRAPI_LOCAL_API_TOKEN: readToken,
      STRAPI_LOCAL_WRITE_API_TOKEN: writeToken,
      STRAPI_WRITE_MODE: "enabled",
    });
  }

  return environment;
}

export function createLocalCmsEnvironment(baseEnvironment, localTokens = null) {
  const environment = withoutProductionCredentials(baseEnvironment);

  Object.assign(environment, {
    OUTBOUND_MODE: "disabled",
    ADMIN_JWT_SECRET: "ncfg-local-admin-jwt-secret",
    API_TOKEN_SALT: "ncfg-local-api-token-salt",
    APP_KEYS: "ncfg-local-key-1,ncfg-local-key-2,ncfg-local-key-3,ncfg-local-key-4",
    AWS_ACCESS_KEY_ID: "minioadmin",
    AWS_BUCKET: "ncfg-uploads",
    AWS_ENDPOINT: "http://127.0.0.1:9000",
    AWS_REGION: "us-east-1",
    AWS_SECRET_ACCESS_KEY: "minioadmin",
    DATABASE_CLIENT: "postgres",
    DATABASE_HOST: "127.0.0.1",
    DATABASE_NAME: "strapi",
    DATABASE_PASSWORD: "strapi_local_password",
    DATABASE_PORT: "5432",
    DATABASE_SSL: "false",
    DATABASE_USERNAME: "strapi",
    HOST: "127.0.0.1",
    JWT_SECRET: "ncfg-local-jwt-secret",
    NODE_ENV: "development",
    PORT: "1337",
    TRANSFER_TOKEN_SALT: "ncfg-local-transfer-token-salt",
  });

  if (localTokens) {
    Object.assign(environment, {
      NCFG_LOCAL_TOKEN_BOOTSTRAP: "1",
      NCFG_LOCAL_READ_API_TOKEN: localTokens.read,
      NCFG_LOCAL_WRITE_API_TOKEN: localTokens.write,
    });
  }

  return environment;
}

export function createCommandEnvironment(baseEnvironment, profile = "generic") {
  return profile === "local-cms"
    ? createLocalCmsEnvironment(baseEnvironment)
    : withoutProductionCredentials(baseEnvironment);
}

export function redactSecrets(value, secrets) {
  let output = String(value);
  for (const secret of secrets) {
    if (secret) output = output.split(secret).join("[REDACTED]");
  }
  return output;
}
