import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset className="[--parent-radius:theme(borderRadius.xl)]">                
                <main className="flex flex-col h-full w-full">
                    <nav className="bg-red-200 rounded-t-[var(--parent-radius)]">
                        <SidebarTrigger />
                    </nav>
                    <div className="flex flex-col h-full w-full">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}