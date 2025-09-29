import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function Step4Video() {
    const { control } = useFormContext();

    return (
        <>
            <FormField
                control={control}
                name="video"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept='video/*'
                                placeholder="Video file here..."
                                onChange={(e) => {
                                    field.onChange(e.target.files?.[0]);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}