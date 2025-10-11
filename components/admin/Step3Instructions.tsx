import { useFormContext, useFieldArray } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";

export function Step3Instructions() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instructions.steps"
    });

    return (
        <div>
            {fields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={control}
                    name={`instructions.steps.${index}`}
                    render={({ field }) => (
                        <FormItem className="mb-2">
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={`Step ${index + 1}`}
                                    {...field}
                                    value={field.value ?? ""} // empty string avoids React warning
                                />
                            </FormControl>
                            <FormMessage />
                            <Button type="button" variant={"destructive"} size={"sm"} className="mt-1" onClick={() => remove(index)}>
                                Remove
                            </Button>
                        </FormItem>
                    )}
                />
            ))}
            <Button type="button" variant={"outline"} onClick={() => append("")}>
                + Add Step
            </Button>
        </div>
    )
}