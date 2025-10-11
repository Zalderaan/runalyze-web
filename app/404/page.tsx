'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFoundPage() {
    const router = useRouter();
    
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-8xl font-bold text-slate-900 dark:text-slate-100">
                        404
                    </h1>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                            Page Not Found
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                        variant="default" 
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Button>
                </div>
            </div>
        </main>
    )
}