/**
 * Extracts a thumbnail from a video file at a given time offset.
 * @param videoFile The video file to extract from
 * @param seekTime The time in seconds to seek to (default: 1.0)
 * @returns A Promise that resolves to a Blob (image/jpeg)
 */
export async function generateVideoThumbnail(videoFile: File, seekTime = 1.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(videoFile);
        video.src = url;

        video.onloadedmetadata = () => {
            // Seek to the desired time
            video.currentTime = Math.min(seekTime, video.duration);
        };

        video.onseeked = () => {
            // Create canvas and draw the frame
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob
            canvas.toBlob((blob) => {
                // Cleanup
                URL.revokeObjectURL(url);
                video.remove();
                
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Could not generate blob from canvas"));
                }
            }, "image/jpeg", 0.8);
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
    });
}
