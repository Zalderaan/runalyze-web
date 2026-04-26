import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    consultationDate?: string;
    coachEmail?: string;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, consultationDate, coachEmail }: DeleteDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    title="Delete Permanently"
                    className="bg-red-900 hover:bg-red-700 border-red-500 border-1"
                >
                    <Trash2 className="h-4 w-4 text-red-200" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-600">Delete Consultation Permanently</DialogTitle>
                    <DialogDescription className="pt-2 text-gray-600">
                        Are you sure you want to <span className="font-bold text-red-600 uppercase">permanently delete</span> the consultation with <span className="font-semibold text-gray-900">{coachEmail}</span>?
                        {consultationDate && <p className="mt-1 text-sm italic text-gray-500">From: {new Date(consultationDate).toLocaleDateString()}</p>}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="font-semibold">Warning: This action cannot be undone.</p>
                    <p className="mt-1">All data associated with this consultation request will be removed from your history.</p>
                </div>
                <DialogFooter className="flex gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-gray-200">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-red-700 hover:bg-red-800 text-white font-semibold"
                    >
                        Delete Forever
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
