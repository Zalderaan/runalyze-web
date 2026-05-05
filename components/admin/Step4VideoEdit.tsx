import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateVideoThumbnail } from "@/utils/video-utils";
import { useState } from "react";

export function Step4VideoEdit({ video_url, thumbnail_url }: { video_url: string | null | undefined, thumbnail_url: string | null | undefined }) {
    const { control, setValue } = useFormContext();
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <div className="space-y-6">
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
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                field.onChange(file);
                                                
                                                // Auto-generate thumbnail
                                                try {
                                                    setIsGenerating(true);
                                                    const thumbnailBlob = await generateVideoThumbnail(file);
                                                    const thumbnailFile = new File([thumbnailBlob], "thumbnail.jpg", { type: "image/jpeg" });
                                                    setValue("thumbnail", thumbnailFile);
                                                } catch (error) {
                                                    console.error("Failed to generate thumbnail:", error);
                                                } finally {
                                                    setIsGenerating(false);
                                                }
                                            }
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

            <FormField
                control={control}
                name="thumbnail"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Thumbnail Image (Optional)</FormLabel>
                        <FormControl>
                            <div className="flex flex-col space-y-4 pb-2">
                                {thumbnail_url ? (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">Current Thumbnail</span>
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={thumbnail_url}
                                                alt="Thumbnail"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-24 rounded-xl border border-dashed text-sm text-muted-foreground">
                                        No thumbnail uploaded yet
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">
                                        {thumbnail_url ? "Replace Thumbnail" : "Upload Thumbnail"}
                                    </span>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            field.onChange(e.target.files?.[0]);
                                        }}
                                    />
                                    {isGenerating && <p className="text-xs text-muted-foreground animate-pulse">Generating preview from video...</p>}
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}