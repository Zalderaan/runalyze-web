import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import {
    Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, 
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

// Menu items.
const items = [
    {
        title: "Home",
        url: "home",
        icon: Home,
    },
    {
        title: "History",
        url: "history",
        icon: Inbox,
    },
    {
        title: "Analyze",
        url: "analyze",
        icon: Calendar,
    },
    {
        title: "Drills",
        url: "drills",
        icon: Search,
    },
    {
        title: "Profile",
        url: "user", // TODO: user/{userid}
        icon: Settings,
    },
]

const user = {
    name: "test",
    email: "sample@example.com"
}

export function AppSidebar() {

    // const user = useAuth();
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupLabel>Nigga</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg">
                                    <span>Testing</span>
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
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}></NavUser>
            </SidebarFooter>
        </Sidebar>
    )
}
