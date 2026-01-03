'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/user_context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountDisabledPage() {
    const { user, logout, isLoading, isLoggingOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user becomes active or logs out, redirect
        if (!isLoading && (!user || user.is_active)) {
            router.push("/auth/login");
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold text-red-600">Account Disabled</h1>
            <p className="text-gray-600">Your account has been deactivated by an administrator.</p>
            <p className="text-gray-500 text-sm">Please contact support if you believe this is an error.</p>
            <Button 
                onClick={logout}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                disabled={isLoggingOut}
            >
                {isLoggingOut ? "Signing out... " : "Sign Out"}
            </Button>
        </div>
    );
}