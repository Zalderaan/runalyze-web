/**
 * * PURPOSE: middleware files run on each route (client & server).
 * *          this middleware in particular protects routes by redirecting to login
 * *          if there are no existing sessions, and automatically redirects to dashboard/home otherwise.  
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from '@/lib/auth/session';

const protectedRoutes = [
    "/dashboard/home",
    "/dashboard/analyze",
    "/dashboard/drills",
    "/dashboard/new-admin",
    "/dashboard/user",
];
const publicRoutes = ["/auth/login", "/auth/register"];

export default async function middleware(req: NextRequest) {
    console.log("middleware called!")
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    const session = await decrypt(cookie);
    // console.log(session);

    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    if (isPublicRoute && session?.userId) {
        return NextResponse.redirect(new URL("/dashboard/home", req.nextUrl));
    }

    return NextResponse.next();
}

// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for the ones starting with:
//          * - api (API routes)
//          * - _next/static (static files)
//          * - _next/image (image optimization files)
//          * - favicon.ico (favicon file)
//          */
//         '/((?!api|_next/static|_next/image|favicon.ico).*)',
//     ],
// }

