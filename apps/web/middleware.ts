import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveLegacyPath } from "./shared/lib/legacy-routes";

export function middleware(request: NextRequest) {
  const legacyPathResolution = resolveLegacyPath(request.nextUrl.pathname);

  if (legacyPathResolution?.type === "gone") {
    return new NextResponse(null, { status: 410 });
  }

  if (legacyPathResolution?.type === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = legacyPathResolution.destinationPath;
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}
