import { useFormContext, useFieldArray } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";

export function Step3Instructions() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instructions.steps"
    });

    return (
        <div className="">
            {fields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={control}
                    name={`instructions.steps.${index}`}
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel>Step {index + 1}</FormLabel>
                            <FormDescription className="text-xs">Describe the instruction for this step.</FormDescription>
                            <div className="flex flex-row space-x-2">
                                <FormControl>
                                    <Textarea
                                        placeholder={`Describe step ${index + 1} in detail`}
                                        {...field}
                                        value={field.value ?? ""} // empty string avoids React warning
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant={"destructive"}
                                    size={"sm"}
                                    className="mt-1 h-full"
                                    onClick={() => remove(index)}
                                >
                                    <Trash />
                                </Button>
                            </div>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
            ))}
            <Button type="button" variant={"outline"} onClick={() => append("")} className="w-full">
                + Add Step
            </Button>
        </div>
    )
}