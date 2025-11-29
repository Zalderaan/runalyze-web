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
import { useToggleStatus } from "@/hooks/users/use-toggle-status";
import { cn } from "@/lib/utils";

export function EnableAdminConfirmationDialog({
    userId,
    refreshUsers,
    currentUserId,
    buttonClassName = null,
}: {
    userId: number | string,
    refreshUsers: () => void,
    currentUserId: number | string,
    buttonClassName?: string | null
}) {
    const { updateAdminStatus, isStatusUpdating, statusUpdateError } = useToggleStatus();

    // async function handleToggleAdminStatus() {
    //     await updateAdminStatus(userId,);
    //     refreshUsers();
    // }

    async function handleEnableAdmin() {
        await updateAdminStatus(userId, true);
        refreshUsers();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'default'} className={cn("...", buttonClassName)}>
                    Enable admin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This will enable admin privileges from this user. Continue?
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancel</Button>
                    </DialogClose>
                    <Button
                        variant={'default'}
                        onClick={handleEnableAdmin}
                        disabled={isStatusUpdating}
                    >
                        {
                            isStatusUpdating
                                ? "Enabling admin privileges..."
                                : "Yes, enable their admin privileges"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}