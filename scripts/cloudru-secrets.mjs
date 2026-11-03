// Values returned by this module must remain in memory and must never be logged.
const IAM_URL = "https://iam.api.cloud.ru/api/v1/auth/token";
const PAYLOAD_ORIGIN = "https://secretmanager.api.cloud.ru";

class SecretAccessError extends Error {
  constructor(code) {
    super(`Cloud.ru Secret Management: ${code}.`);
    this.name = "SecretAccessError";
  }
}

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function requestJson(url, options, fetchImpl) {
  try {
    const response = await fetchImpl(url, {
      ...options,
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new SecretAccessError(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof SecretAccessError) throw error;
    // Do not retain cause, response body, request headers, or transport messages.
    throw new SecretAccessError("request failed");
  }
}

export async function readCloudruSecret(settings, { fetchImpl = fetch } = {}) {
  const { projectId, path, version, credentials } = settings;
  if (!nonempty(projectId) || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(path ?? "") ||
      !Number.isSafeInteger(version) || version < 1 ||
      !nonempty(credentials?.keyId) || !nonempty(credentials?.secret)) {
    throw new SecretAccessError("invalid configuration");
  }
  const auth = await requestJson(IAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyId: credentials.keyId, secret: credentials.secret }),
  }, fetchImpl);
  if (!nonempty(auth?.access_token)) throw new SecretAccessError("empty access token");
  const url = new URL(`/v2/version/${path.split("/").map(encodeURIComponent).join("/")}`, PAYLOAD_ORIGIN);
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("version", String(version));
  const response = await requestJson(url, {
    method: "GET", headers: { Authorization: `Bearer ${auth.access_token}` },
  }, fetchImpl);
  // The live v2 API emits snake_case; its published schema also permits camelCase.
  const projects = [response?.secret?.project_id, response?.secret?.projectId].filter(value => value !== undefined);
  if (!projects.length || projects.some(value => value !== projectId) || response?.secret?.path !== path ||
      response?.version?.id !== version || response?.version?.state !== "ENABLED") {
    throw new SecretAccessError("secret identity or version mismatch");
  }
  try {
    if (!nonempty(response.payload)) throw new Error();
    const bytes = Buffer.from(response.payload, "base64");
    if (bytes.toString("base64") !== response.payload) throw new Error();
    const result = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!object(result)) throw new Error();
    return result;
  } catch {
    throw new SecretAccessError("invalid secret payload");
  }
}

export function developmentReadToken(payload) {
  if (!object(payload) || Object.keys(payload).length !== 1 ||
      !nonempty(payload.STRAPI_PROD_API_TOKEN)) {
    throw new SecretAccessError("development secret must contain only STRAPI_PROD_API_TOKEN");
  }
  return payload.STRAPI_PROD_API_TOKEN.trim();
}


export async function developmentCredentials({ environment, platform, runCapture }) {
  const keyId = environment.NCFG_CLOUDRU_KEY_ID;
  const secret = environment.NCFG_CLOUDRU_KEY_SECRET;
  if (keyId !== undefined || secret !== undefined) {
    if (!nonempty(keyId) || !nonempty(secret)) throw new SecretAccessError("incomplete credentials");
    return { keyId, secret };
  }
  if (platform !== "darwin") throw new SecretAccessError("configure NCFG_CLOUDRU_KEY_ID and NCFG_CLOUDRU_KEY_SECRET");
  try {
    const { stdout } = await runCapture("security", ["find-generic-password", "-s", "ncfg-cloudru-dev-reader", "-w"]);
    const result = JSON.parse(stdout);
    if (!nonempty(result?.keyId) || !nonempty(result?.secret)) throw new Error();
    return { keyId: result.keyId, secret: result.secret };
  } catch {
    throw new SecretAccessError("development credential unavailable in macOS Keychain");
  }
}


export async function loadDevelopmentReadToken({ environment, platform, runCapture, fetchImpl = fetch }) {
  const inherited = environment.STRAPI_PROD_API_TOKEN?.trim();
  if (inherited) return inherited;
  const credentials = await developmentCredentials({ environment, platform, runCapture });
  const payload = await readCloudruSecret({
    projectId: environment.NCFG_CLOUDRU_PROJECT_ID?.trim() || "edb1a7fd-05b9-41c3-a5b9-a727b7cc977c",
    path: environment.NCFG_CLOUDRU_DEV_SECRET?.trim() || "ncfg/development",
    version: Number(environment.NCFG_CLOUDRU_DEV_VERSION?.trim() || "1"),
    credentials,
  }, { fetchImpl });
  return developmentReadToken(payload);
}
