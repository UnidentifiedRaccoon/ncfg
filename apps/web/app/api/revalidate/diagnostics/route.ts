import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  asTrimmedString,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";

export const dynamic = "force-dynamic";

const DIAGNOSTIC_MODELS = new Set([
  "api::diagnostic-test.diagnostic-test",
  "api::diagnostic-campaign.diagnostic-campaign",
  "api::diagnostic-organization.diagnostic-organization",
  "diagnostic-test",
  "diagnostic-campaign",
  "diagnostic-organization",
]);

const SUPPORTED_EVENTS = new Set([
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

function isDiagnosticModel(model: string | null): boolean {
  if (!model) return false;
  if (DIAGNOSTIC_MODELS.has(model)) return true;
  return (
    model.endsWith(".diagnostic-test") ||
    model.endsWith(".diagnostic-campaign") ||
    model.endsWith(".diagnostic-organization")
  );
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

  if (!event || !SUPPORTED_EVENTS.has(event) || !isDiagnosticModel(model)) {
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

  revalidateTag("diagnostics", "max");
  revalidated.push("tag:diagnostics");

  revalidatePath("/diagnostika/[campaignSlug]", "page");
  revalidated.push("path:/diagnostika/[campaignSlug]");

  if (slug) {
    const campaignTag = `diagnostic-campaign-${slug}`;
    revalidateTag(campaignTag, "max");
    revalidated.push(`tag:${campaignTag}`);

    const campaignPath = `/diagnostika/${slug}`;
    revalidatePath(campaignPath);
    revalidated.push(`path:${campaignPath}`);
  }

  return NextResponse.json(
    { ok: true, revalidated },
    { headers: responseHeaders }
  );
}
