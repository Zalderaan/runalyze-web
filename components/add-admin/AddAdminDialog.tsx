import { useUpdateRole } from "@/hooks/users/use-updateRole";
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

export function AddAdminConfrimationDialog({ isAdmin = false, userId, refreshUsers }: { isAdmin: boolean, userId: number | string, refreshUsers: () => void }) {
    const { updateUserRole } = useUpdateRole();
    
    async function handleMakeAdmin() {
        await updateUserRole(userId, "admin");
        refreshUsers();
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant={'outline'} disabled={isAdmin}>Make admin</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This will grant admin privileges to this user. Continue?
                    </DialogDescription>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleMakeAdmin}>Yes, make them an admin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}