import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Drill Sets"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="reps"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Reps"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="rep_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reps Type</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type of reps" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rep/s">rep/s</SelectItem>
                                    <SelectItem value="sec/s">sec/s</SelectItem>
                                    <SelectItem value="min/s">min/s</SelectItem>
                                    <SelectItem value="meter/s">meter/s</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />


            <FormField
                control={control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Frequency per week</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="Frequency/week"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                                onChange={(e) => field.onChange(e.target.valueAsNumber)} // ensures number
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </>
    )
}