'use client'
import { useAuth } from "@/context/user_context"
import Image from 'next/image'
import { Button } from "../ui/button"
import Link from "next/link"

export function LandingHeader() {
    const { user, logout, isLoggingOut } = useAuth();
    const isAdmin = user?.user_role === "admin" || user?.user_role === "owner";
    const isApplicant = user?.user_role === "admin_applicant";

    return (
        <>
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* <Activity className="h-8 w-8 text-blue-600" /> */}
                        <Image src="/runalyze-new-logo.png" alt="Runalyze logo" height={50} width={50}/> 
                        <h1 className="text-2xl font-bold text-gray-900">Runalyze</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span>Hello, {user.username}!</span>
                                <Button asChild variant="default">
                                    <Link href={isAdmin ? "/dashboard/admin" : isApplicant ? "/dashboard/admin-application" : "/dashboard/home"}
                                    >Proceed to dashboard</Link>
                                </Button>
                                <Button variant={"outline"} onClick={logout} disabled={isLoggingOut}>
                                    {
                                        isLoggingOut ? "Logging Out" : "Logout"
                                    }
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Button asChild variant="outline">
                                    <Link href="/auth/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/auth/register">Get Started</Link>
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
            </header>
        </>
    )
}