import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Step3Instructions() {
    const { control } = useFormContext();
    
    return (
        <>
            <FormField
                control={control}
                name="instructions"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Instructions"
                                {...field}
                                value={field.value ?? ""} // empty string avoids React warning
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}