import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Step1BasicInfo() {
    const { control } = useFormContext()
    return (
        <div className="space-y-3">
            <FormField
                control={control}
                name="drill_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Drill Name</FormLabel>
                        <FormDescription className="text-xs">Name of the drill or exercise.</FormDescription>
                        <FormControl>
                            <Input placeholder="ex. A-Skips" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="area"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormDescription className="text-xs">Body area or aspect being targeted.</FormDescription>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="head_position">Head Position</SelectItem>
                                    <SelectItem value="back_position">Back Position</SelectItem>
                                    <SelectItem value="arm_flexion">Arm Flexion</SelectItem>
                                    <SelectItem value="right_knee">Right Knee</SelectItem>
                                    <SelectItem value="left_knee">Left Knee</SelectItem>
                                    <SelectItem value="foot_strike">Foot Strike</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="performance_level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Performance Level</FormLabel>
                        <FormDescription className="text-xs">Current performance level of the athlete.</FormDescription>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select athlete's performance level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="poor">Poor</SelectItem>
                                    <SelectItem value="needs improvement">Needs Improvement</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
        </div>
    )
}