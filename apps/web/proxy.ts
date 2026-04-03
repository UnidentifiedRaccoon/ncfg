import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSiteUrl } from "@/shared/lib/metadata";
import { buildCanonicalRedirectUrl, isSeoGonePath } from "@/shared/lib/seo-redirects";

export function proxy(request: NextRequest) {
  const redirectUrl = buildCanonicalRedirectUrl(request.url, getSiteUrl());

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
