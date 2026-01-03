import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function Step2TrainingParameters() {
    const { control } = useFormContext();

    return (
        <>
            <FormField
                control={control}
                name="sets"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sets</FormLabel>
                        <FormDescription className="text-xs">Number of sets in the training session.</FormDescription>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="e.g., 3"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="reps"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormDescription className="text-xs">Number of repetitions per set.</FormDescription>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="e.g., 30"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="rep_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reps Type</FormLabel>
                        <FormDescription className="text-xs">Unit for measuring repetitions or time/distance.</FormDescription>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select unit, e.g., sec/s" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rep/s">rep/s</SelectItem>
                                    <SelectItem value="sec/s">sec/s</SelectItem>
                                    <SelectItem value="min/s">min/s</SelectItem>
                                    <SelectItem value="meter/s">meter/s</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Frequency per week</FormLabel>
                        <FormDescription className="text-xs">How many times per week to perform this training.</FormDescription>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="e.g., 4"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

        </>
    )
}