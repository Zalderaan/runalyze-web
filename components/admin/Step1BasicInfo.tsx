import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Step1BasicInfo() {
    const { control } = useFormContext()
    return (
        <>
            <FormField
                control={control}
                name="drill_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Drill Name</FormLabel>
                        <FormControl>
                            <Input placeholder="ex. A-Skips" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
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
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="performance_level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Performance Level</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select athlete's performance level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="poor">Poor</SelectItem>
                                    <SelectItem value="needs improvement">Needs Improvement</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </>
    )
}