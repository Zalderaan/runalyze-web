/**
 * * PURPOSE: middleware files run on each route (client & server).
 * *          this middleware in particular protects routes by redirecting to login
 * *          if there are no existing sessions, and automatically redirects to dashboard/home otherwise.  
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from '@/lib/auth/session';

// Define route access by role
const routePermissions: Record<string, string[]> = {
    "/dashboard/home": ["user"],
    "/dashboard/analyze": ["user"],
    "/dashboard/drills": ["user"],
    "/dashboard/user": ["user"],
    "/dashboard/admin": ["admin", "owner"],
    "/dashboard/new-admin": ["owner"],
    "/dashboard/admin-application": ["admin_applicant"],
};

const publicRoutes = ["/auth/login", "/auth/register", "/auth/admin-application"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    const session = await decrypt(cookie);

    const userRole = session?.userRole as string | undefined;
    const isProtectedRoute = Object.keys(routePermissions).includes(path);

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    // Check role-based access
    if (isProtectedRoute && userRole) {
        const allowedRoles = routePermissions[path];
        if (!allowedRoles.includes(userRole)) {
            // Redirect to their appropriate dashboard
            const redirectPath = getDefaultRoute(userRole);
            return NextResponse.redirect(new URL(redirectPath, req.nextUrl));
        }
    }

    // Redirect authenticated users from public routes
    if (isPublicRoute && session?.userId) {
        const redirectPath = getDefaultRoute(userRole);
        return NextResponse.redirect(new URL(redirectPath, req.nextUrl));
    }

    return NextResponse.next();
}

function getDefaultRoute(role: string | undefined): string {
    switch (role) {
        case "admin":
        case "owner":
            return "/dashboard/admin";
        case "admin_applicant":
            return "/dashboard/admin-application";
        default:
            return "/dashboard/home";
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};

// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import { decrypt } from '@/lib/auth/session';

// const protectedRoutes = [
//     "/dashboard/home",
//     "/dashboard/analyze",
//     "/dashboard/drills",
//     "/dashboard/new-admin",
//     "/dashboard/user",
//     "/dashboard/admin",
//     "/dashboard/admin-application"
// ];
// const publicRoutes = ["/auth/login", "/auth/register", "/auth/admin-application"];

// export default async function middleware(req: NextRequest) {
//     // console.log("middleware called!")
//     const path = req.nextUrl.pathname;
//     const isProtectedRoute = protectedRoutes.includes(path);
//     const isPublicRoute = publicRoutes.includes(path);

//     const cookieStore = await cookies();
//     const cookie = cookieStore.get("session")?.value;
//     const session = await decrypt(cookie);
//     // console.log(session);

//     if (isProtectedRoute && !session?.userId) {
//         return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
//     }

//     if (isPublicRoute && session?.userId) {
//         // Redirect based on user role
//         const userRole = session?.userRole;
//         if (userRole === "admin") {
//             return NextResponse.redirect(new URL("/dashboard/admin", req.nextUrl));
//         } else if (userRole === "admin_applicant") {
//             return NextResponse.redirect(new URL("/dashboard/admin-application", req.nextUrl));
//         }
//         return NextResponse.redirect(new URL("/dashboard/home", req.nextUrl));
//     }

//     return NextResponse.next();
// }

// // export const config = {
// //     matcher: [
// //         /*
// //          * Match all request paths except for the ones starting with:
// //          * - api (API routes)
// //          * - _next/static (static files)
// //          * - _next/image (image optimization files)
// //          * - favicon.ico (favicon file)
// //          */
// //         '/((?!api|_next/static|_next/image|favicon.ico).*)',
// //     ],
// // }

