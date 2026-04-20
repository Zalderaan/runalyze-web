import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function Step4VideoEdit({ video_url }: { video_url: string | null | undefined }) {
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
                                {/* Only render the video element when we have a real URL */}
                                {video_url ? (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">Current Video</span>
                                        <video
                                            src={video_url}
                                            controls
                                            className="w-full rounded-2xl"
                                            muted
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-24 rounded-xl border border-dashed text-sm text-muted-foreground">
                                        No video uploaded yet
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">
                                        {video_url ? "Replace Video" : "Upload Video"}
                                    </span>
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        placeholder="Video file here..."
                                        onChange={(e) => {
                                            field.onChange(e.target.files?.[0]);
                                        }}
                                    />
                                </div>
                            </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                            {video_url ? "Uploading a new file will replace the current video." : "Upload a video demonstration for this drill."}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}