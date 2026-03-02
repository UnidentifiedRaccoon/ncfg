import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveLegacyPath } from "./shared/lib/legacy-routes";

const WWW_HOST = "www.ncfg.ru";
const APEX_HOST = "ncfg.ru";

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host")?.toLowerCase();
  const legacyPathResolution = resolveLegacyPath(request.nextUrl.pathname);

  if (legacyPathResolution?.type === "gone") {
    return new NextResponse(null, { status: 410 });
  }

  if (hostHeader === WWW_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.hostname = APEX_HOST;
    redirectUrl.port = "";

    if (legacyPathResolution?.type === "redirect") {
      redirectUrl.pathname = legacyPathResolution.destinationPath;
    }

    return NextResponse.redirect(redirectUrl, 301);
  }

  if (legacyPathResolution?.type === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = legacyPathResolution.destinationPath;
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}
