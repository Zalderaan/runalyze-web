import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CancelDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    consultationDate?: string;
    coachEmail?: string;
}

export function CancelDialog({ isOpen, onClose, onConfirm, consultationDate, coachEmail }: CancelDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    title="Cancel Request"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Cancel Consultation Request</DialogTitle>
                    <DialogDescription className="pt-2 text-gray-600">
                        Are you sure you want to cancel your consultation request to <span className="font-semibold text-gray-900">{coachEmail}</span>?
                        {consultationDate && <p className="mt-1 text-sm italic">Requested on: {new Date(consultationDate).toLocaleDateString()}</p>}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-sm text-gray-500 bg-red-50 p-4 rounded-lg border border-red-100">
                    This action will notify the coach and move the request to your archived consultations.
                </div>
                <DialogFooter className="flex gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" className="border-gray-200">
                            Keep Request
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                        Confirm Cancellation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
