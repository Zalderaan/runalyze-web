'use client';

import { useAuth } from "@/context/user_context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && !allowedRoles.includes(user.user_role)) {
            // Redirect to their appropriate dashboard
            if (user.user_role === "admin" || user.user_role === "owner") {
                router.push("/dashboard/admin");
            } else if (user.user_role === "admin_applicant") {
                router.push("/dashboard/admin-application");
            } else {
                router.push("/dashboard/home");
            }
        }
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (!user || !allowedRoles.includes(user.user_role)) {
        return <div className="flex items-center justify-center h-full">Access Denied</div>;
    }

    return <>{children}</>;
}