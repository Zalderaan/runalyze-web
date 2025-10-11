import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function Step4VideoEdit({ video_url }: { video_url: string }) {
    const { control } = useFormContext();

    return (
        <>
            <FormField
                control={control}
                name="video"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Video Demonstration</FormLabel>
                        <FormControl>
                            <div className="flex flex-col space-y-4 pb-2">
                                <div className="flex flex-col">
                                    <span>Old Video</span>
                                    <video 
                                        src={video_url} 
                                        controls width={400} 
                                        className="w-full rounded-2xl" 
                                        muted
                                    />
                                </div>
                                <div>
                                    <span>New Video File: </span>
                                    <Input
                                        type="file"
                                        accept='video/*'
                                        placeholder="Video file here..."
                                        onChange={(e) => {
                                            field.onChange(e.target.files?.[0]);
                                        }}
                                    />
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}