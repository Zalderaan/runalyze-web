'use client';

import { useAuth } from '@/context/user_context';
import { File } from "lucide-react"
import {
    Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import Link from "next/link"
import Image from "next/image"

// Menu items.
const items = [
    {
        title: "Upload documents",
        url: "/dashboard/admin-application",
        icon: File,
    },

]

export function ApplicantSidebar() {
    const auth = useAuth();
    const { state } = useSidebar();
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" className='flex flex-row space-x-7'>
                                    <Image
                                        src="/runalyze-new-logo.png"
                                        alt="runalyze-logo"
                                        width={state === "collapsed" ? 20 : 40}
                                        height={state === "collapsed" ? 20 : 40}
                                        className={`transition-all duration-300 ease-in-out ${state === "collapsed" ? "mx-auto" : ""}`}
                                    />
                                    <span className={`font-medium text-xl ${state === "collapsed" ? "pl-2" : ""}`}>Runalyze</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Requirements</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {state !== "collapsed" && (
                    <div className="px-3 pb-1">
                        <Link
                            href="/terms"
                            target="_blank"
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Terms of Use
                        </Link>
                    </div>
                )}
                {auth.isLoading ? (
                    <div>Loading user...</div>
                ) : auth.user ? (
                    <NavUser user={auth.user} />
                ) : (
                    <div>Not authenticated</div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
