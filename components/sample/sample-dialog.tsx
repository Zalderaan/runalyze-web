import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { Step0 } from "./step0";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { useState } from "react";
import { description } from "../home/chart-area-default";

export function SampleDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    const steps = [
        <Step0 key={0} />,
        <Step1 key={1} />,
        <Step2 key={2} />
    ];

    const titles = [
        'Over Ground', 
        'Camera Setup', 
        'Record Your Run'
    ]

    const descriptions = [
        'Side View Running',
        'How to Position Your Camera',
        'Running in Front of the Camera'
    ]

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) setStep(0);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>Open Steps</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titles[step]}</DialogTitle>
                    <DialogDescription>{descriptions[step]}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-3 w-full">
                    {steps[step]}
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => setStep((s) => Math.max(s - 1, 0))}
                        disabled={step === 0}
                        variant="outline"
                    >
                        Back
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>
                            Next
                        </Button>
                    ) : (
                        <DialogClose asChild>
                            <Button>
                                Start Analyzing
                            </Button>
                        </DialogClose>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}