import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const WWW_HOST = "www.ncfg.ru";
const APEX_HOST = "ncfg.ru";

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host")?.toLowerCase();

  if (hostHeader === WWW_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    redirectUrl.host = APEX_HOST;
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}
