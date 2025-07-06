'use client';

import { useAuth } from '@/context/user_context';
import { Calendar, Home, Inbox, Search } from "lucide-react"
import {
    Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, 
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import Link from "next/link"

// Menu items.
const items = [
    {
        title: "Home",
        url: "/dashboard/home",
        icon: Home,
    },
    {
        title: "History",
        url: "/dashboard/history",
        icon: Inbox,
    },
    {
        title: "Analyze",
        url: "/dashboard/analyze",
        icon: Calendar,
    },
    {
        title: "Drills",
        url: "/dashboard/drills",
        icon: Search,
    },
]

export function AppSidebar() {
    const auth = useAuth();

    // const user = useAuth();
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg">
                                    <span>Runalyze</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
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
