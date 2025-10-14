import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateRole } from "@/hooks/users/use-updateRole";
import { cn } from "@/lib/utils";

export function RemoveAdminConfirmationDialog({ 
    isAdmin = false, 
    userId, 
    refreshUsers,
    currentUserId,
    buttonClassName = null,
}: { 
    isAdmin: boolean, 
    userId: number | string, 
    refreshUsers: () => void,
    currentUserId: number | string,
    buttonClassName?: string | null
}) {
    const { updateUserRole, isRoleUpdating } = useUpdateRole();

    async function handleMakeAdmin() {
        await updateUserRole(userId, "user");
        refreshUsers();
    }

    const isSelf = userId === currentUserId;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'destructive'} disabled={isSelf} className={cn("...", buttonClassName)}>
                    Remove admin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This will revoke admin privileges from this user. Continue?
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancel</Button>
                    </DialogClose>
                    <Button 
                        variant={'destructive'} 
                        onClick={handleMakeAdmin}
                        disabled={isSelf || !isAdmin || isRoleUpdating}
                    >
                        {
                            isRoleUpdating 
                            ? "Removing admin privileges..."
                            : "Yes, remove their admin privileges"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}