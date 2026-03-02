import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WWW_HOST = "www.ncfg.ru";
const APEX_HOST = "ncfg.ru";

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host")?.toLowerCase();

  if (hostHeader === WWW_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.hostname = APEX_HOST;
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}
