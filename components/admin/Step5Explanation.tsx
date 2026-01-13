import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function Step5Explanation() {
    const { control } = useFormContext();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="justification"  // Matches schema
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Explanation/Justification</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Provide a detailed explanation or justification for this drill..."
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="reference"  // Added to match schema
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reference</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Provide any references or sources..."
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}