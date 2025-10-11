'use client';

import { useAuth } from '@/context/user_context';
import { Home, History, SquareActivity, Dumbbell, LucidePersonStanding, } from "lucide-react"
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
        icon: History,
    },
    {
        title: "Analyze",
        url: "/dashboard/analyze",
        icon: SquareActivity,
    },
]

const admin_items = [
    {
        title: "Drills",
        url: "/dashboard/drills",
        icon: Dumbbell,
    },
    {
        title: "Add Admin",
        url: "/dashboard/new-admin",
        icon: LucidePersonStanding
    }
]

export function AppSidebar() {
    const { user, isLoading } = useAuth();
    console.log("This is user in sidebar: ", user);

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
                <SidebarGroup>
                    {user?.user_role === "admin" && (
                        <>
                            <SidebarGroupLabel>Admin</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {admin_items.map((item) => (
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
                        </>
                    )}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {isLoading ? (
                    <div>Loading user...</div>
                ) : user ? (
                    <NavUser user={user} />
                ) : (
                    <div>Not authenticated</div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
