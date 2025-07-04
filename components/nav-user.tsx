'use client';
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogOutIcon, UserIcon } from "lucide-react";
// import { signOut } from '@/lib/auth/actions'
import { useAuth } from "@/context/user_context";

export function NavUser({
    user,
}: {
    user: {
        username: string,
        email: string,
        avatar?: string
    }
}) {
    const { isMobile } = useSidebar()
    const router = useRouter();

    const { logout } = useAuth();

    const handleSignOut = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error: ', error)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>

                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="w-8 aspect-square rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback className="rounded-lg bg-amber-200">{user.username.toString().toUpperCase()[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="truncate font-semibold">{user.username}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem 
                            className="flex flex-row items-center justify-start"
                            onClick={() => router.push('/dashboard/user')}
                        >
                            <UserIcon />
                            <span>Go to profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex flex-row items-center justify-start"
                            onClick={handleSignOut}
                        >
                            <LogOutIcon />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}