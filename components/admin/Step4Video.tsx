import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateVideoThumbnail } from "@/utils/video-utils";
import { useState } from "react";

export function Step4Video() {
    const { control, setValue } = useFormContext();
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <>
            <FormField
                control={control}
                name="video"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Video Demonstration</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept='video/*'
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
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="thumbnail"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Thumbnail Image</FormLabel>
                        <FormControl>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="file"
                                    accept='image/*'
                                    onChange={(e) => {
                                        field.onChange(e.target.files?.[0]);
                                    }}
                                />
                                {isGenerating && <p className="text-xs text-muted-foreground animate-pulse">Generating preview from video...</p>}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}