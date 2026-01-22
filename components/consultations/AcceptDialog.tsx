import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

interface AcceptDialogProps {
    username: string;
    onConfirm?: () => void;
}

export function AcceptDialog({ username, onConfirm }: AcceptDialogProps) {
    return (
        <Dialog>
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
                    <DialogTitle>Accept Consultation</DialogTitle>
                    <DialogDescription>Accept consultation from USER NAME HERE</DialogDescription>
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
                        title="Confirm accept consultation"
                        className="bg-green-800 hover:bg-green-600/80 border-green-400 border-1"
                    >
                        Yes, accept consultation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}