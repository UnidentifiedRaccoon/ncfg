#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import {
  access,
  chmod,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  createLocalCmsEnvironment,
  createWebEnvironment,
  decideDependencyAction,
  dependencyFingerprint,
  isSupportedNodeVersion,
  isSupportedNpmVersion,
  redactSecrets,
} from "./dev-lib.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const WEB_DIR = path.join(ROOT_DIR, "apps", "web");
const CMS_DIR = path.join(ROOT_DIR, "apps", "cms");
const NEXT_CLI = path.join(WEB_DIR, "node_modules", "next", "dist", "bin", "next");
const STRAPI_CLI = path.join(
  CMS_DIR,
  "node_modules",
  "@strapi",
  "strapi",
  "bin",
  "strapi.js"
);
const CMS_ENV_VALIDATOR = path.join(CMS_DIR, "scripts", "validate-env.mjs");
const COMPOSE_FILE = path.join(ROOT_DIR, "docker", "docker-compose.yml");
const STATE_DIR = path.join(ROOT_DIR, ".dev-state");
const SESSION_FILE = path.join(STATE_DIR, "session.json");
const SESSION_LOCK = path.join(STATE_DIR, "session.lock");
const CONTROL_SOCKET =
  process.platform === "win32"
    ? "\\\\.\\pipe\\ncfg-local-dev"
    : path.join(STATE_DIR, "control.sock");
const PROD_STRAPI_URL = "https://admin.ncfg.ru";
const DEV_SECRET_NAME = "ncfg-dev-secrets";
const DEV_SECRET_KEY = "STRAPI_PROD_API_TOKEN";
const WEB_URL = "http://127.0.0.1:3000";
const CMS_URL = "http://127.0.0.1:1337";
const VALID_COMMANDS = new Set(["web", "cms", "full", "doctor", "verify", "down"]);

const children = new Map();
const transientChildren = new Set();
let sessionId = null;
let sessionProfile = null;
let sessionStartedAt = null;
let stopping = false;
let controlServer = null;

function log(message) {
  console.log(`[dev] ${message}`);
}

function warn(message) {
  console.warn(`[dev] WARN: ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function writeAtomic(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, contents, { mode: 0o600 });
  await rename(temporaryPath, filePath);
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      command,
      args,
      {
        cwd: options.cwd ?? ROOT_DIR,
        env: options.env ?? process.env,
        detached: process.platform !== "win32",
        encoding: "utf8",
        maxBuffer: 1024 * 1024,
        timeout: options.timeout ?? 30_000,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        transientChildren.delete(child);
        if (error) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      }
    );
    child.devName = `preflight:${command}`;
    transientChildren.add(child);
  });
}

async function commandSucceeds(command, args, options = {}) {
  try {
    await runCapture(command, args, options);
    return true;
  } catch {
    return false;
  }
}

async function runForeground(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? ROOT_DIR,
    env: options.env ?? process.env,
    detached: process.platform !== "win32",
    stdio: "inherit",
    shell: false,
  });
  child.devName = `preflight:${command}`;
  transientChildren.add(child);

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", (error) => {
      transientChildren.delete(child);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      transientChildren.delete(child);
      resolve(signal ? 1 : (code ?? 1));
    });
  });

  if (exitCode !== 0) {
    fail(`${command} ${args.join(" ")} завершился с кодом ${exitCode}.`);
  }
}

async function getGitSummary() {
  const branch = (await runCapture("git", ["branch", "--show-current"])).stdout.trim();
  const status = (await runCapture("git", ["status", "--porcelain"])).stdout.trim();
  return { branch: branch || "detached HEAD", dirty: Boolean(status) };
}

async function assertRuntimeVersions() {
  if (!isSupportedNodeVersion(process.version)) {
    fail(`Нужен Node >=22.22.2 <23; сейчас ${process.version}.`);
  }

  let npmVersion;
  try {
    npmVersion = (await runCapture("npm", ["--version"])).stdout.trim();
  } catch {
    fail("npm не найден. Установите npm >=10.");
  }

  if (!isSupportedNpmVersion(npmVersion)) {
    fail(`Нужен npm >=10; сейчас ${npmVersion || "неизвестная версия"}.`);
  }

  return npmVersion;
}

async function getDependencyHash(appDir) {
  const [packageJson, packageLock] = await Promise.all([
    readFile(path.join(appDir, "package.json")),
    readFile(path.join(appDir, "package-lock.json")),
  ]);
  return dependencyFingerprint(packageJson, packageLock);
}

async function dependencyStatus(appName, appDir, requiredBinary) {
  const currentHash = await getDependencyHash(appDir);
  const markerPath = path.join(STATE_DIR, "deps", `${appName}.sha256`);
  const markerHash = (await readTextIfExists(markerPath))?.trim() ?? null;
  const requiredBinaryExists = await pathExists(
    path.join(appDir, "node_modules", ".bin", requiredBinary)
  );

  let npmListSucceeded = false;
  if (requiredBinaryExists && !markerHash) {
    npmListSucceeded = await commandSucceeds(
      "npm",
      ["ls", "--depth=0", "--silent"],
      { cwd: appDir, timeout: 60_000 }
    );
  }

  return {
    action: decideDependencyAction({
      requiredBinaryExists,
      markerHash,
      currentHash,
      npmListSucceeded,
    }),
    currentHash,
    markerPath,
  };
}

async function ensureDependencies(appName, appDir, requiredBinary) {
  const status = await dependencyStatus(appName, appDir, requiredBinary);

  if (status.action === "ready") {
    log(`${appName}: зависимости актуальны.`);
    return;
  }

  if (status.action === "adopt") {
    await writeAtomic(status.markerPath, `${status.currentHash}\n`);
    log(`${appName}: существующие зависимости проверены, npm ci пропущен.`);
    return;
  }

  log(`${appName}: lockfile изменился или node_modules отсутствует; запускаю npm ci.`);
  await runForeground("npm", ["ci", "--no-audit", "--no-fund"], { cwd: appDir });
  await writeAtomic(status.markerPath, `${status.currentHash}\n`);
}

async function getProductionReadToken() {
  const inherited = process.env.STRAPI_PROD_API_TOKEN?.trim();
  if (inherited) {
    log("Production Strapi read-token получен из окружения (значение не выводится).");
    return inherited;
  }

  if (!(await commandSucceeds("yc", ["--version"]))) {
    fail("yc CLI не найден. Установите его и выполните `yc init`.");
  }

  try {
    const { stdout } = await runCapture(
      "yc",
      ["lockbox", "payload", "get", "--name", DEV_SECRET_NAME, "--key", DEV_SECRET_KEY],
      { timeout: 30_000 }
    );
    const token = stdout.trim();
    if (!token) fail("Lockbox вернул пустой read-token.");
    log("Production Strapi read-token получен из Lockbox только в память процесса.");
    return token;
  } catch {
    fail(
      `Не удалось получить ${DEV_SECRET_NAME}/${DEV_SECRET_KEY}. ` +
        "Проверьте `yc init` и роль lockbox.payloadViewer."
    );
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15_000) {
  return fetch(url, {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function probeProductionStrapi(token) {
  let lastStatus = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetchWithTimeout(
      `${PROD_STRAPI_URL}/api/service-categories?pagination%5BpageSize%5D=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    lastStatus = response.status;
    await response.body?.cancel();
    if (response.status === 200) return;
    if (response.status < 500 || attempt === 4) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  fail(`Production Strapi read-check вернул HTTP ${lastStatus ?? "unknown"}.`);
}

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function assertPortFree(port, serviceName) {
  if (await isPortOpen(port)) {
    fail(
      `Порт ${port} уже занят (${serviceName}). ` +
        "Остановите чужой процесс или активную dev-сессию через `npm run dev:down`."
    );
  }
}

async function waitFor(label, check, timeoutMs) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    for (const child of children.values()) {
      if (child.exitCode !== null || child.signalCode !== null) {
        fail(`${child.devName} завершился до readiness.`);
      }
    }

    try {
      if (await check()) {
        log(`${label}: ready (${((Date.now() - startedAt) / 1000).toFixed(1)}s).`);
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  const suffix = lastError instanceof Error ? ` Последняя ошибка: ${lastError.message}` : "";
  fail(`${label} не стал ready за ${Math.round(timeoutMs / 1000)}s.${suffix}`);
}

async function checkWebHealth() {
  const response = await fetchWithTimeout(`${WEB_URL}/api/health`, {}, 3_000);
  if (response.status !== 200) return false;
  const payload = await response.json().catch(() => null);
  return payload?.status === "ok";
}

async function checkWebStrapiReadiness(expectedSource = null) {
  const response = await fetchWithTimeout(`${WEB_URL}/api/health/strapi`, {}, 15_000);
  if (response.status !== 200) {
    await response.body?.cancel();
    return false;
  }
  const payload = await response.json().catch(() => null);
  return (
    payload?.status === "ok" &&
    payload?.reachable === true &&
    (!expectedSource || payload?.source === expectedSource)
  );
}

async function checkCmsHealth() {
  const response = await fetchWithTimeout(`${CMS_URL}/_health`, {}, 3_000);
  const isReady = response.status === 200 || response.status === 204;
  await response.body?.cancel();
  return isReady;
}

async function verifyWeb(expectedSource = null) {
  await waitFor("Next.js health", checkWebHealth, 30_000);
  await waitFor(
    "Next.js + Strapi",
    () => checkWebStrapiReadiness(expectedSource),
    30_000
  );
  log("Web: /api/health и /api/health/strapi готовы.");
}

async function verifyCms() {
  if (!(await checkCmsHealth())) fail("Local Strapi /_health не готов.");
  log("CMS: /_health готов.");
}

async function resolveComposeCommand() {
  if (await commandSucceeds("docker-compose", ["version"])) {
    return { command: "docker-compose", prefix: [] };
  }
  if (await commandSucceeds("docker", ["compose", "version"])) {
    return { command: "docker", prefix: ["compose"] };
  }
  fail("Docker Compose не найден. Установите Docker Compose или Colima.");
}

async function runCompose(compose, args, { foreground = false } = {}) {
  const fullArgs = [...compose.prefix, "-f", COMPOSE_FILE, ...args];
  const environment = { ...process.env, COMPOSE_PROGRESS: "plain" };
  if (foreground) {
    await runForeground(compose.command, fullArgs, { env: environment });
    return;
  }
  return runCapture(compose.command, fullArgs, { env: environment, timeout: 120_000 });
}

async function ensureDockerDaemon() {
  if (await commandSucceeds("docker", ["info"], { timeout: 15_000 })) return;

  if (process.platform === "darwin" && (await commandSucceeds("colima", ["version"]))) {
    log("Docker daemon недоступен; запускаю Colima.");
    await runForeground("colima", ["start"]);
  }

  if (!(await commandSucceeds("docker", ["info"], { timeout: 30_000 }))) {
    fail("Docker daemon недоступен. Запустите Docker Desktop или Colima.");
  }
}

async function containerIsHealthy(containerName) {
  try {
    const { stdout } = await runCapture(
      "docker",
      [
        "inspect",
        "--format",
        "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
        containerName,
      ],
      { timeout: 5_000 }
    );
    return stdout.trim() === "healthy";
  } catch {
    return false;
  }
}

async function startLocalInfrastructure(compose) {
  log("Запускаю локальные PostgreSQL и MinIO (данные в volumes сохраняются).");
  await runCompose(compose, ["up", "-d", "postgres", "minio", "minio-init"], {
    foreground: true,
  });
  const minioInit = await runCapture("docker", ["wait", "ncfg-minio-init"], {
    timeout: 60_000,
  });
  if (minioInit.stdout.trim() !== "0") {
    fail(
      `MinIO bucket initialization завершился с кодом ${minioInit.stdout.trim() || "unknown"}.`
    );
  }
  log("MinIO bucket initialization: completed.");
  await waitFor("PostgreSQL", () => containerIsHealthy("ncfg-postgres"), 60_000);
  await waitFor(
    "MinIO",
    async () => {
      const response = await fetchWithTimeout("http://127.0.0.1:9000/minio/health/live", {}, 2_000);
      const ready = response.status === 200;
      await response.body?.cancel();
      return ready;
    },
    60_000
  );
}

function createPrefixedLogger(name, secrets) {
  let stdoutBuffer = "";
  let stderrBuffer = "";

  const writeLines = (chunk, stream, isError, flush = false) => {
    const next = stream === "stdout" ? stdoutBuffer + chunk : stderrBuffer + chunk;
    const parts = next.split(/\r?\n/);
    const remainder = flush ? "" : parts.pop();
    const lines = flush && parts.at(-1) === "" ? parts.slice(0, -1) : parts;
    for (const line of lines) {
      if (!line && !flush) continue;
      const safeLine = redactSecrets(line, secrets);
      (isError ? process.stderr : process.stdout).write(`[${name}] ${safeLine}\n`);
    }
    if (stream === "stdout") stdoutBuffer = remainder;
    else stderrBuffer = remainder;
  };

  return {
    stdout(chunk) {
      writeLines(chunk.toString(), "stdout", false);
    },
    stderr(chunk) {
      writeLines(chunk.toString(), "stderr", true);
    },
    flush() {
      if (stdoutBuffer) writeLines("", "stdout", false, true);
      if (stderrBuffer) writeLines("", "stderr", true, true);
    },
  };
}

function spawnManaged(name, command, args, { cwd, env, secrets = [] }) {
  const logger = createPrefixedLogger(name, secrets);
  const child = spawn(command, args, {
    cwd,
    env,
    detached: process.platform !== "win32",
    shell: false,
    stdio: ["inherit", "pipe", "pipe"],
  });
  child.devName = name;
  child.devCommand = `${command} ${args.join(" ")}`;
  child.stdout.on("data", logger.stdout);
  child.stderr.on("data", logger.stderr);
  child.once("error", (error) => {
    logger.flush();
    if (!stopping) void stopAll(1, `${name} не запустился: ${error.message}`);
  });
  child.once("exit", (code, signal) => {
    logger.flush();
    if (!stopping) {
      const reason = signal ? `signal ${signal}` : `код ${code ?? 1}`;
      void stopAll(1, `${name} неожиданно завершился (${reason}).`);
    }
  });
  children.set(name, child);
  return child;
}

function signalOwnedChild(child, signal) {
  if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") warn(`Не удалось остановить ${child.devName}: ${error.message}`);
  }
}

function activeOwnedChildren() {
  return [...children.values(), ...transientChildren].filter(
    (child) => child.pid && child.exitCode === null && child.signalCode === null
  );
}

async function waitForOwnedChildren(timeoutMs) {
  const startedAt = Date.now();
  while (activeOwnedChildren().length > 0 && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function clearOwnSession() {
  if (!sessionId) return;
  try {
    const current = JSON.parse(await readFile(SESSION_FILE, "utf8"));
    if (current.id === sessionId) await rm(SESSION_FILE, { force: true });
  } catch (error) {
    if (error?.code !== "ENOENT") warn(`Не удалось очистить session state: ${error.message}`);
  }
  if (process.platform !== "win32") await rm(CONTROL_SOCKET, { force: true });
  await rm(SESSION_LOCK, { recursive: true, force: true });
}

async function stopAll(exitCode, reason) {
  if (stopping) return;
  stopping = true;
  if (reason) (exitCode === 0 ? log : warn)(reason);

  controlServer?.close();
  for (const child of activeOwnedChildren()) signalOwnedChild(child, "SIGTERM");
  await waitForOwnedChildren(5_000);
  for (const child of activeOwnedChildren()) signalOwnedChild(child, "SIGKILL");
  await waitForOwnedChildren(1_000);
  await clearOwnSession();
  process.exit(exitCode);
}

function buildSessionState(phase) {
  const state = {
    id: sessionId,
    profile: sessionProfile,
    phase,
    launcherPid: process.pid,
    controlSocket: CONTROL_SOCKET,
    startedAt: sessionStartedAt,
    children: Array.from(children.values()).map((child) => ({
      name: child.devName,
      pid: child.pid,
      command: child.devCommand,
    })),
  };
  return state;
}

async function updateSession(phase) {
  if (!sessionId || !sessionProfile || !sessionStartedAt) return;
  const state = buildSessionState(phase);
  await writeAtomic(SESSION_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function startControlServer() {
  if (!sessionId) fail("Нельзя запустить control socket до записи dev-сессии.");
  if (process.platform !== "win32") await rm(CONTROL_SOCKET, { force: true });

  controlServer = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let request = "";
    socket.on("data", (chunk) => {
      request += chunk;
      if (request.length > 512) socket.destroy();
      if (request.trim() === `ping:${sessionId}`) {
        socket.end("pong\n");
        return;
      }
      if (request.trim() === `stop:${sessionId}`) {
        socket.end("ok\n");
        void stopAll(0, "Получена команда dev:down, останавливаю owned-процессы.");
      }
    });
  });

  await new Promise((resolve, reject) => {
    controlServer.once("error", reject);
    controlServer.listen(CONTROL_SOCKET, resolve);
  });
}

async function readSession() {
  try {
    return JSON.parse(await readFile(SESSION_FILE, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    warn(`Session state повреждён и будет проигнорирован: ${error.message}`);
    return null;
  }
}

function processIsAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function requestControl(session, action, timeoutMs = 1_000) {
  const expectedResponse = action === "ping" ? "pong" : "ok";
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(session.controlSocket ?? CONTROL_SOCKET);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Supervisor не ответил на ${action} за ${timeoutMs}ms.`));
    }, timeoutMs);
    socket.setEncoding("utf8");
    socket.once("connect", () => socket.write(`${action}:${session.id}\n`));
    socket.on("data", (data) => {
      if (data.trim() === expectedResponse) {
        clearTimeout(timeout);
        socket.end();
        resolve();
      }
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function controlIsResponsive(session) {
  try {
    await requestControl(session, "ping", 500);
    return true;
  } catch {
    return false;
  }
}

async function removeStaleSession() {
  await rm(SESSION_FILE, { force: true });
  await rm(SESSION_LOCK, { recursive: true, force: true });
  if (process.platform !== "win32") await rm(CONTROL_SOCKET, { force: true });
}

async function acquireDownCleanupLock(stoppedSessionId) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    try {
      await mkdir(SESSION_LOCK, { mode: 0o700 });
      const current = await readSession();
      if (
        current &&
        current.id !== stoppedSessionId &&
        ((await controlIsResponsive(current)) || processIsAlive(current.launcherPid))
      ) {
        warn(`Новая dev-сессия ${current.profile} уже запущена; cleanup старой сессии пропущен.`);
        await rm(SESSION_LOCK, { recursive: true, force: true });
        return false;
      }
      if (
        current &&
        current.id === stoppedSessionId &&
        processIsAlive(current.launcherPid)
      ) {
        await rm(SESSION_LOCK, { recursive: true, force: true });
        fail(
          `Supervisor ${current.profile} всё ещё жив, но control socket недоступен; ` +
            "state и процессы не затронуты."
        );
      }
      return true;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }

    const current = await readSession();
    const lockStat = await stat(SESSION_LOCK).catch(() => null);
    const lockAgeMs = lockStat ? Date.now() - lockStat.mtimeMs : Number.POSITIVE_INFINITY;
    const recentlyStarted = lockAgeMs < 30_000;

    if (
      current &&
      current.id !== stoppedSessionId &&
      ((await controlIsResponsive(current)) ||
        (processIsAlive(current.launcherPid) && recentlyStarted))
    ) {
      warn(`Новая dev-сессия ${current.profile} уже запущена; Compose cleanup не выполняется.`);
      return false;
    }

    if (recentlyStarted) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      continue;
    }

    warn("Удаляю stale startup lock перед dev:down cleanup; процессы по PID не завершаются.");
    await removeStaleSession();
  }

  fail("Не удалось сериализовать dev:down cleanup за 15s; новая сессия не затрагивалась.");
}

async function acquireSession(profile, retry = true) {
  try {
    await mkdir(SESSION_LOCK, { mode: 0o700 });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;

    const current = await readSession();
    if (current && (await controlIsResponsive(current))) {
      fail(
        `Уже работает управляемая dev-сессия (${current.profile}, phase=${current.phase ?? "unknown"}). ` +
          "Используйте её или выполните `npm run dev:down` в другом терминале."
      );
    }

    const lockStat = await stat(SESSION_LOCK).catch(() => null);
    const lockAgeMs = lockStat ? Date.now() - lockStat.mtimeMs : Number.POSITIVE_INFINITY;
    const recentlyStarted = lockAgeMs < 30_000;
    const launcherMayBeStarting = current && processIsAlive(current.launcherPid) && recentlyStarted;
    if (!current && recentlyStarted) {
      fail("Другая dev-сессия захватывает startup lock. Повторите команду через несколько секунд.");
    }
    if (launcherMayBeStarting) {
      fail(
        `Dev-сессия ${current.profile} ещё запускается (PID ${current.launcherPid}). ` +
          "Повторите команду после READY или остановите её через `npm run dev:down`."
      );
    }

    warn("Удаляю stale dev-session state; процессы по PID не завершаются.");
    await removeStaleSession();
    if (retry) return acquireSession(profile, false);
    fail("Не удалось захватить dev-session lock после очистки stale state.");
  }

  sessionId = randomUUID();
  sessionProfile = profile;
  sessionStartedAt = new Date().toISOString();
  await updateSession("starting");
  await startControlServer();
}

async function prepareProductionWeb() {
  const dependencies = ensureDependencies("web", WEB_DIR, "next");
  const tokenAndProbe = (async () => {
    const token = await getProductionReadToken();
    await probeProductionStrapi(token);
    log("Production Strapi: read-check пройден.");
    return token;
  })();
  const [, token] = await Promise.all([dependencies, tokenAndProbe]);
  return token;
}

async function startWeb({ source, readToken, writeToken = null, strapiUrl }) {
  const environment = createWebEnvironment(process.env, {
    source,
    readToken,
    writeToken,
    strapiUrl,
  });
  spawnManaged("web", process.execPath, [NEXT_CLI, "dev", "--hostname", "127.0.0.1"], {
    cwd: WEB_DIR,
    env: environment,
    secrets: [readToken, writeToken],
  });
  await waitFor("Next.js health", checkWebHealth, 90_000);
  await waitFor(
    "Next.js + Strapi",
    () => checkWebStrapiReadiness(source),
    90_000
  );
}

async function startCms({ localTokens = null } = {}) {
  const environment = createLocalCmsEnvironment(process.env, localTokens);
  await runForeground(process.execPath, [CMS_ENV_VALIDATOR], {
    cwd: CMS_DIR,
    env: environment,
  });
  spawnManaged("cms", process.execPath, [STRAPI_CLI, "develop"], {
    cwd: CMS_DIR,
    env: environment,
    secrets: localTokens ? [localTokens.read, localTokens.write] : [],
  });
  await waitFor("Local Strapi", checkCmsHealth, 180_000);
}

async function runWebProfile() {
  await assertPortFree(3000, "Next.js");
  const token = await prepareProductionWeb();
  await startWeb({ source: "prod", readToken: token, strapiUrl: PROD_STRAPI_URL });
  await updateSession("ready");
  log("READY: http://localhost:3000 — production Strapi read-only; writes/outbound disabled.");
}

async function prepareLocalCms() {
  const compose = await resolveComposeCommand();
  await ensureDockerDaemon();
  await Promise.all([
    ensureDependencies("cms", CMS_DIR, "strapi"),
    startLocalInfrastructure(compose),
  ]);
  return compose;
}

async function runCmsProfile() {
  await assertPortFree(1337, "Strapi");
  await prepareLocalCms();
  await startCms();
  await updateSession("ready");
  log("READY: http://localhost:1337/admin — локальный Strapi; PostgreSQL и MinIO готовы.");
}

async function runFullProfile() {
  await Promise.all([
    assertPortFree(3000, "Next.js"),
    assertPortFree(1337, "Strapi"),
  ]);

  const localTokens = {
    read: randomBytes(64).toString("hex"),
    write: randomBytes(64).toString("hex"),
  };
  await Promise.all([
    ensureDependencies("web", WEB_DIR, "next"),
    prepareLocalCms(),
  ]);
  await startCms({ localTokens });
  await startWeb({
    source: "local",
    readToken: localTokens.read,
    writeToken: localTokens.write,
    strapiUrl: CMS_URL,
  });
  await updateSession("ready");
  log("READY: полностью локальный стек; local Strapi writes включены, outbound disabled.");
}

async function runDoctor() {
  const checks = [];
  const add = (name, ok, details) => checks.push({ name, ok, details });

  add("Node", isSupportedNodeVersion(process.version), process.version);
  try {
    const npmVersion = (await runCapture("npm", ["--version"])).stdout.trim();
    add("npm", isSupportedNpmVersion(npmVersion), npmVersion);
  } catch {
    add("npm", false, "не найден");
  }

  try {
    const git = await getGitSummary();
    add("Git", true, `${git.branch}${git.dirty ? ", dirty (сохраняется)" : ", clean"}`);
  } catch {
    add("Git", false, "не удалось прочитать состояние");
  }

  for (const [label, appName, directory, binary] of [
    ["web deps", "web", WEB_DIR, "next"],
    ["cms deps", "cms", CMS_DIR, "strapi"],
  ]) {
    try {
      const status = await dependencyStatus(appName, directory, binary);
      add(label, status.action !== "install", status.action);
    } catch {
      add(label, false, "не удалось проверить");
    }
  }

  try {
    const token = await getProductionReadToken();
    await probeProductionStrapi(token);
    add("Prod Strapi", true, "Lockbox + read-check");
  } catch (error) {
    add("Prod Strapi", false, error.message);
  }

  const webPortOpen = await isPortOpen(3000);
  const cmsPortOpen = await isPortOpen(1337);
  add("Port 3000", !webPortOpen, webPortOpen ? "занят" : "свободен");
  add("Port 1337", !cmsPortOpen, cmsPortOpen ? "занят" : "свободен");

  const dockerPresent = await commandSucceeds("docker", ["--version"]);
  const dockerRunning = dockerPresent && (await commandSucceeds("docker", ["info"], { timeout: 10_000 }));
  add("Docker (optional)", dockerPresent, dockerRunning ? "готов" : dockerPresent ? "daemon выключен" : "не найден");

  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.name}: ${check.details}`);
  }

  const requiredFailures = checks.filter(
    (check) => !check.ok && !check.name.includes("cms") && !check.name.includes("1337") && !check.name.includes("Docker")
  );
  if (requiredFailures.length > 0) process.exitCode = 1;
}

async function runVerify() {
  const session = await readSession();
  const webOpen = await isPortOpen(3000);
  const cmsOpen = await isPortOpen(1337);

  if (!webOpen && !cmsOpen) {
    fail("Нет запущенных web/CMS сервисов. Сначала выполните `npm run dev` или `npm run dev:full`.");
  }

  const expectedSource = session?.profile === "full" ? "local" : session?.profile === "web" ? "prod" : null;
  if (webOpen) await verifyWeb(expectedSource);
  if (cmsOpen) await verifyCms();
  log(`Readiness подтверждён${session ? ` для профиля ${session.profile}` : ""}.`);
}

async function runDown() {
  const session = await readSession();
  const stoppedSessionId = session?.id ?? null;
  if (session) {
    log(`Прошу supervisor остановить управляемую dev-сессию ${session.profile}.`);
    let stopAcknowledged = false;
    try {
      await requestControl(session, "stop", 2_000);
      stopAcknowledged = true;
    } catch (error) {
      warn(
        `Control socket недоступен (${error.message}); считаю state stale и не завершаю процессы по PID.`
      );
    }

    if (stopAcknowledged) {
      const startedAt = Date.now();
      while (processIsAlive(session.launcherPid) && Date.now() - startedAt < 10_000) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (processIsAlive(session.launcherPid)) {
        fail("Supervisor подтвердил остановку, но не завершился за 10s; SIGKILL не выполнялся.");
      }
    }
  } else {
    log("Активная управляемая dev-сессия не найдена.");
  }

  if (!(await acquireDownCleanupLock(stoppedSessionId))) return;
  const cleanupHeartbeat = setInterval(() => {
    void utimes(SESSION_LOCK, new Date(), new Date()).catch(() => {});
  }, 5_000);
  cleanupHeartbeat.unref();
  try {
    const current = await readSession();
    if (current && current.id !== stoppedSessionId) {
      warn(`Session state уже принадлежит профилю ${current.profile}; cleanup пропущен.`);
      return;
    }
    await rm(SESSION_FILE, { force: true });
    if (process.platform !== "win32") await rm(CONTROL_SOCKET, { force: true });

    try {
      const compose = await resolveComposeCommand();
      if (await commandSucceeds("docker", ["info"], { timeout: 10_000 })) {
        log("Останавливаю локальные Compose-сервисы без удаления volumes.");
        await runCompose(compose, ["down", "--remove-orphans"], { foreground: true });
      } else {
        log("Docker daemon недоступен; Compose-сервисы не затронуты.");
      }
    } catch (error) {
      warn(`Compose cleanup пропущен: ${error.message}`);
    }
  } finally {
    clearInterval(cleanupHeartbeat);
    await rm(SESSION_LOCK, { recursive: true, force: true });
  }
}

function installSignalHandlers() {
  process.once("SIGINT", () => void stopAll(0, "Получен SIGINT, останавливаю owned-процессы."));
  process.once("SIGTERM", () => void stopAll(0, "Получен SIGTERM, останавливаю owned-процессы."));
}

async function main() {
  const command = process.argv[2] ?? "web";
  if (!VALID_COMMANDS.has(command)) {
    fail(`Неизвестный профиль "${command}". Используйте: ${Array.from(VALID_COMMANDS).join(", ")}.`);
  }

  await mkdir(STATE_DIR, { recursive: true, mode: 0o700 });
  await chmod(STATE_DIR, 0o700);
  const git = await getGitSummary();
  log(`Git: ${git.branch}${git.dirty ? ", dirty worktree сохранён" : ""}.`);

  if (command === "doctor") return runDoctor();
  await assertRuntimeVersions();
  if (command === "verify") return runVerify();
  if (command === "down") return runDown();

  installSignalHandlers();
  await acquireSession(command);
  if (command === "web") await runWebProfile();
  if (command === "cms") await runCmsProfile();
  if (command === "full") await runFullProfile();
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  if ((children.size > 0 || sessionId) && !stopping) {
    await stopAll(1, message);
    return;
  }
  console.error(`[dev] ERROR: ${message}`);
  process.exitCode = 1;
});
