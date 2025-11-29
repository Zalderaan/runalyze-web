'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ApplicantSidebar } from "@/components/applicant-sidebar";
import { useAuth } from "@/context/user_context";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { user, isLoading } = useAuth();
    const router = useRouter();
    const isAdmin = user?.user_role === "admin" || user?.user_role === "owner";
    const isApplicant = user?.user_role === "admin_applicant";

    useEffect(() => {
        // Read from localStorage on mount
        const savedState = localStorage.getItem("sidebar_state");
        if (savedState !== null) {
            setIsOpen(savedState === "true");
        }
    }, []);

    // Redirect inactive users
    useEffect(() => {
        if (!isLoading && user && !user.is_active) {
            setIsRedirecting(true);
            router.replace("/account-disabled"); // Use replace to prevent back navigation
        }
    }, [user, isLoading, router]);

    // Show loading or block access while checking
    // Show nothing while loading or redirecting (prevents flash of dashboard)
    if (isLoading || isRedirecting || (user && !user.is_active)) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
                    <p className="text-sm text-gray-600">
                        {isRedirecting ? "Redirecting..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                localStorage.setItem("sidebar_state", String(open));
            }}
        >
            {isAdmin ? <AdminSidebar /> : isApplicant ? <ApplicantSidebar /> : <AppSidebar />}
            <main className="flex flex-col h-full w-full">
                <header className="p-4 border-b-2 sticky top-0 bg-white">
                    <SidebarTrigger />
                </header>
                <section className="p-4">
                    {children}
                </section>
            </main>
        </SidebarProvider>
    )
}