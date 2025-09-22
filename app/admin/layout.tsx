import { cookies } from "next/headers";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
    
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AdminSidebar />
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