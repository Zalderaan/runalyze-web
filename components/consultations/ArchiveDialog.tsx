import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

interface ArchiveDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    consultationDate?: string;
    coach_email?: string;
}

export function ArchiveDialog({ isOpen, onClose, onConfirm, consultationDate, coach_email }: ArchiveDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    title="Archive"
                    className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                >
                    <Archive className="h-4 w-4 text-red-300" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive Consultation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to archive the consultation to {coach_email}, made on {consultationDate}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onConfirm}
                        title="Confirm Archive"
                        className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                    >
                        Archive
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}