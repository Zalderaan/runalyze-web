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

export function RemoveAdminConfirmationDialog({ 
    isAdmin = false, 
    userId, 
    refreshUsers,
    currentUserId
}: { 
    isAdmin: boolean, 
    userId: number | string, 
    refreshUsers: () => void,
    currentUserId: number | string
}) {
    const { updateUserRole } = useUpdateRole();

    async function handleMakeAdmin() {
        await updateUserRole(userId, "user");
        refreshUsers();
    }

    const isSelf = userId === currentUserId;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'destructive'} disabled={isSelf}>
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
                        disabled={isSelf || isAdmin}
                    >
                        Yes, remove their admin privileges
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}