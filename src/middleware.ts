import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Exclude public APIs from admin protection
  const publicAdminApis = [
    "/api/admin/login",
    "/api/admin/survey-settings"  // Public survey status check
  ];
  
  if (publicAdminApis.includes(pathname)) {
    return NextResponse.next();
  }
  
  const adminPaths = ["/admin", "/api/admin"];
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isAdmin) {
    const cookie = req.cookies.get("admin_token")?.value;
    const token = process.env.ADMIN_PASSWORD;
    if (!cookie || !token || cookie !== token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};


