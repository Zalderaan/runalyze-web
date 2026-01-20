'use client';

import { useAuth } from '@/context/user_context';
import { Dumbbell, Home, MessageCircle, PersonStanding } from "lucide-react"
import {
    Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import Link from "next/link"
import Image from "next/image"

// Menu items.
const items = [
    {
        title: "Admin Home",
        url: "/dashboard/admin",
        icon: Home,
    },
    {
        title: "Drills",
        url: "/dashboard/admin/drills",
        icon: Dumbbell,
    },
    {
        title: "Consultations",
        url: "/dashboard/admin/consultations",
        icon: MessageCircle
    }
]

const ownerItems = [
    {
        title: "Admins",
        url: "/dashboard/admin/manage",
        icon: PersonStanding
    }
]

export function AdminSidebar() {
    const auth = useAuth();
    const isOwner = auth.user?.user_role === "owner";
    const { state } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg">
                                    <Image
                                        src="/runalyze-new-logo.png"
                                        alt="runalyze-logo"
                                        width={state === "collapsed" ? 20 : 40}
                                        height={state === "collapsed" ? 20 : 40}
                                        className={state === "collapsed" ? "mx-auto" : ""}
                                    />
                                    <span className={`font-medium text-xl ${state === "collapsed" ? "pl-2" : ""}`}>Runalyze Admin</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Admin</SidebarGroupLabel>
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
                {
                    isOwner && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Owner-exclusive Controls</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {ownerItems.map((item) => (
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
                    )
                }
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