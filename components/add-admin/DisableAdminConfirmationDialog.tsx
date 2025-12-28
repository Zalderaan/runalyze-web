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
import { useIsMobile } from "@/hooks/use-mobile";

export function DisableAdminConfirmationDialog({
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

    async function handleDisableAdmin() {
        await updateAdminStatus(userId, false);
        refreshUsers();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'destructive'} className={cn("...", buttonClassName)}>
                    Disable
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    This will disable admin privileges from this user until you re-enable it. Continue?
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Cancel</Button>
                    </DialogClose>
                    <Button
                        variant={'destructive'}
                        onClick={handleDisableAdmin}
                        disabled={isStatusUpdating}
                    >
                        {
                            isStatusUpdating
                                ? "Disabling admin privileges..."
                                : "Yes, disable their admin privileges"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}