import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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