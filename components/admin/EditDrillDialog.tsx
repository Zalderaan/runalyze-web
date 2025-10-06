'use client'

// UI Imports
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

// icons
import { Edit } from "lucide-react";
import { useState } from "react";

// forms inputs
import { step1Schema, step2Schema, step3Schema, step4Schema } from "@/schemas/admin/drillFormSchemas";

const stepSchemas = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema
}

const stepDefaults: Record<number, any> = {
    1: { drill_name: "", area: undefined, performance_level: undefined },
    2: { sets: undefined, reps: undefined, frequency: undefined },
    3: { instructions: "" }, // Add step 3 default values when you define the schema
    4: { video: undefined }, // Add step 4 default values when you define the schema
}

export function EditDrillDialog() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={"default"}>
                        <Edit />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Test
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Test
                    </DialogDescription>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"outline"}>Close</Button>
                        </DialogClose>
                        <Button>Next</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}