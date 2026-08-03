import { NextResponse } from "next/server";

import { getStrapiSourceOrThrow } from "@/shared/lib/strapi-config";
import { fetchAPI, type StrapiResponse } from "@/shared/lib/strapi";

export const dynamic = "force-dynamic";

interface StrapiHealthItem {
  documentId?: string;
}

export async function GET() {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetchAPI<StrapiResponse<StrapiHealthItem[]>>(
        "/service-categories?pagination%5BpageSize%5D=1",
        { revalidate: 0 }
      );

      return NextResponse.json({
        status: "ok",
        source: getStrapiSourceOrThrow(),
        reachable: Array.isArray(response.data),
      });
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 250));
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  console.error(`[health/strapi] ${message}`);
  return NextResponse.json(
    { status: "error", source: process.env.STRAPI_SOURCE ?? "default" },
    { status: 503 }
  );
}
