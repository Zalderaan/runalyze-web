import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { useDeleteDrill } from "@/hooks/drills/use-delete-drill";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDrillConfirmDialog({ drill_id }: { drill_id: string | number }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { deleteDrill, drillDeleteError, isDrillDeleteError, isDrillDeleted, isDrillDeleting } = useDeleteDrill(drill_id);

    useEffect(() => {
        if (isDrillDeleted) {
            setOpen(false);
            router.push("/dashboard/drills"); // or your desired route
        }
    }, [isDrillDeleted, router]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Are You Sure?
                        </DialogTitle>

                        <DialogDescription>
                            This action will remove this drill from your catalog
                        </DialogDescription>
                    </DialogHeader>
                    {isDrillDeleteError && (
                        <div className="text-red-600 text-sm mb-2">
                            {`Error deleting drill: ${drillDeleteError}`}
                        </div>
                    )}
                    <DialogFooter className="flex flex-row items-center">
                        <DialogClose asChild>
                            <Button variant={"outline"}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            variant={"destructive"}
                            onClick={deleteDrill}
                            disabled={isDrillDeleting}
                        >
                            {isDrillDeleting ? "Deleting drill..." : "Yes, delete this drill"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}