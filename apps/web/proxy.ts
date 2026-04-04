import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSiteUrl } from "@/shared/lib/metadata";
import { buildCanonicalRedirectUrl, isSeoGonePath, isStaticAssetPathname } from "@/shared/lib/seo-redirects";

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .find(Boolean) ?? null;
}

export function proxy(request: NextRequest) {
  if (isStaticAssetPathname(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const redirectUrl = buildCanonicalRedirectUrl(request.url, getSiteUrl(), {
    host: firstHeaderValue(request.headers.get("x-forwarded-host")) ?? firstHeaderValue(request.headers.get("host")),
    protocol: firstHeaderValue(request.headers.get("x-forwarded-proto")),
  });

  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (isSeoGonePath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 410 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
