import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function inspectAsset(url, fetchAsset = fetch) {
  try {
    const response = await fetchAsset(url, { signal: AbortSignal.timeout(15_000) });
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";
    return {
      status: response.status,
      contentType,
      bytes: body.length,
      sha256: createHash("sha256").update(body).digest("hex"),
      isCssResponse: response.ok && /^text\/css(?:;|$)/i.test(contentType) && body.length > 0,
    };
  } catch {
    // A failed probe has no HTTP status and is not proof of an origin 404/500.
    return { status: null, error: "request_failed_or_timed_out", isCssResponse: false };
  }
}

export async function compareCss(origin, assetPath, fetchAsset = fetch) {
  const base = new URL(origin);
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    throw new Error("Use a public HTTPS origin without credentials or query parameters");
  }
  if (!/^\/_next\/static\/[a-zA-Z0-9_./-]+\.css$/.test(assetPath) ||
      assetPath.split("/").includes("..")) {
    throw new Error("Use an exact /_next/static/...css path without query parameters");
  }
  const directUrl = new URL(assetPath, base).href;
  const proxyUrl = new URL("https://mtproxy2d.metrika.yandex.net/webvisor/v2/proxy");
  proxyUrl.searchParams.set("url", directUrl);
  const [direct, replayProxy] = await Promise.all([
    inspectAsset(directUrl, fetchAsset), inspectAsset(proxyUrl.href, fetchAsset),
  ]);
  return {
    assetPath, checkedAt: new Date().toISOString(), direct, replayProxy,
    sameCss: direct.isCssResponse && replayProxy.isCssResponse && direct.sha256 === replayProxy.sha256,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [origin, ...assets] = process.argv.slice(2);
  if (!origin || assets.length === 0) {
    throw new Error("Usage: check-webvisor-assets.mjs https://ncfg.ru /_next/static/chunks/HASH.css ...");
  }
  for (const asset of assets) console.log(JSON.stringify(await compareCss(origin, asset)));
}
