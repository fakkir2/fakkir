import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Only handles the language prefix. Login protection happens in two places that
 * can actually verify a user: the client guard in AppShell, and Firestore rules
 * plus ID-token checks on the server (Firebase cannot be verified in middleware).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const preferred = request.cookies.get("studymate-locale")?.value;
  const locale = locales.find((l) => l === preferred) ?? defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.svg|.*\\..*).*)"],
};
