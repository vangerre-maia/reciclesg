import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/")) {
    const dest = role === "GESTOR" ? "/gestor" : "/associacao";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (isLoggedIn && pathname.startsWith("/gestor") && role !== "GESTOR") {
    return NextResponse.redirect(new URL("/associacao", req.url));
  }

  if (isLoggedIn && pathname.startsWith("/associacao") && role !== "ASSOCIACAO") {
    return NextResponse.redirect(new URL("/gestor", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
