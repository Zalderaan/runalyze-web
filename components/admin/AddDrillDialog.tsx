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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Icons
import { Plus } from "lucide-react";

// Forms imports
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";

const formSchema = z.object({
    drill_name: z.string().min(1, "Drill name is required"),
    area: z.enum(["head_position", "back_position", "arm_swing", "right_knee", "left_knee", "foot_strike"], {
        errorMap: () => ({ message: "Please select a valid area" }),
    }),
    // performance_level: z.string().min(1, "Performance level is required").optional(),
    // video: z
    //     .any()
    //     .refine((file) => file instanceof File, { message: "A video file is required" })
    //     .optional()
});

export function AddDrillDialog() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            drill_name: "",
            area: undefined,
            // performance_level: "",
            // video: undefined
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="flex flex-row items-center justify-center w-fit">
                    <Plus />
                    Add Drill
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add Drill</DialogTitle>
                            <DialogDescription>Add a new drill to be suggested for users</DialogDescription>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="drill_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Drill Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex. A-Skips" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Name of the drill you're adding
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Area</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="head_position">Head Position</SelectItem>
                                                <SelectItem value="back_position">Back Position</SelectItem>
                                                <SelectItem value="arm_swing">Arm Swing</SelectItem>
                                                <SelectItem value="right_knee">Right Knee</SelectItem>
                                                <SelectItem value="left_knee">Left Knee</SelectItem>
                                                <SelectItem value="foot_strike">Foot Strike</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Focus area of this drill
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex flex-row items-center">
                            <Button asChild variant={'outline'}>
                                <DialogClose>
                                    Cancel
                                </DialogClose>
                            </Button>
                            <Button type="submit">Add drill</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}