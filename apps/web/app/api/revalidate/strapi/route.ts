import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  asTrimmedString,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";

export const dynamic = "force-dynamic";

const NEWS_ARTICLE_MODELS = new Set([
  "api::news-article.news-article",
  "news-article",
]);
const SUPPORTED_NEWS_ARTICLE_EVENTS = new Set([
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
]);

interface StrapiWebhookPayload {
  event?: unknown;
  model?: unknown;
  entry?: {
    slug?: unknown;
  } | null;
}

function getProvidedToken(request: Request): string | null {
  const headerToken = asTrimmedString(request.headers.get("x-revalidate-token"));
  if (headerToken) return headerToken;

  const authorization = asTrimmedString(request.headers.get("authorization"));
  if (!authorization) return null;

  const bearerMatch = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!bearerMatch) return null;

  return asTrimmedString(bearerMatch[1]);
}

function parsePayload(input: unknown): StrapiWebhookPayload {
  if (typeof input !== "object" || input === null) return {};
  return input as StrapiWebhookPayload;
}

function isNewsArticleModel(model: string | null): boolean {
  if (!model) return false;
  if (NEWS_ARTICLE_MODELS.has(model)) return true;
  return model.endsWith(".news-article");
}

function isSupportedNewsArticleEvent(event: string | null): boolean {
  return Boolean(event && SUPPORTED_NEWS_ARTICLE_EVENTS.has(event));
}

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const responseHeaders = { "x-request-id": requestId };

  const expectedToken = asTrimmedString(process.env.REVALIDATE_TOKEN);
  if (!expectedToken) {
    console.error(`[${requestId}] REVALIDATE_TOKEN is not configured`);
    return NextResponse.json(
      { ok: false, error: "Revalidation is not configured" },
      { status: 500, headers: responseHeaders }
    );
  }

  const providedToken = getProvidedToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers: responseHeaders }
    );
  }

  const rawBody = await readJsonSafe(request);
  if (!rawBody.ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400, headers: responseHeaders }
    );
  }

  const payload = parsePayload(rawBody.data);
  const event = asTrimmedString(payload.event);
  const model = asTrimmedString(payload.model);
  const slug = asTrimmedString(payload.entry?.slug);

  if (!isSupportedNewsArticleEvent(event) || !isNewsArticleModel(model)) {
    return NextResponse.json(
      {
        ok: true,
        revalidated: [],
        reason: `no-op: unsupported event/model (${event ?? "unknown"}/${model ?? "unknown"})`,
      },
      { headers: responseHeaders }
    );
  }

  const revalidated: string[] = [];

  revalidateTag("news", "max");
  revalidated.push("tag:news");

  revalidatePath("/blog");
  revalidated.push("path:/blog");

  // Delete/unpublish webhooks may not always include slug in payload.
  // Revalidate all article page routes to avoid stale post pages.
  revalidatePath("/blog/[slug]", "page");
  revalidated.push("path:/blog/[slug]");

  if (slug) {
    const slugTag = `news-${slug}`;
    revalidateTag(slugTag, "max");
    revalidated.push(`tag:${slugTag}`);

    const slugPath = `/blog/${slug}`;
    revalidatePath(slugPath);
    revalidated.push(`path:${slugPath}`);
  }

  return NextResponse.json(
    {
      ok: true,
      revalidated,
    },
    { headers: responseHeaders }
  );
}
