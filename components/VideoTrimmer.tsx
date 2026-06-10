"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Loader2, Play, Pause, Scissors } from "lucide-react";

interface VideoTrimmerProps {
    file: File;
    onTrimComplete: (file: File) => void;
    onCancel: () => void;
}

export function VideoTrimmer({ file, onTrimComplete, onCancel }: VideoTrimmerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ffmpeg, setFfmpeg] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isTrimming, setIsTrimming] = useState(false);
    const [progress, setProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [range, setRange] = useState([0, 10]); // default trim to first 10 seconds
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);


    // Initialize FFmpeg
    useEffect(() => {
        const load = async () => {
            try {
                // Inline toBlobURL to avoid @ffmpeg/util UMD errors
                const toBlobURL = async (url: string, mimeType: string) => {
                    const resp = await fetch(url);
                    const body = await resp.blob();
                    const blob = new Blob([body], { type: mimeType });
                    return URL.createObjectURL(blob);
                };

                // Dynamically load script to bypass Turbopack dynamic import limitations
                const loadScript = (src: string) => {
                    return new Promise((resolve, reject) => {
                        // @ts-expect-error ignore this
                        if (window.FFmpegWASM) {
                            return resolve(true);
                        }

                        const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
                        if (existingScript) {
                            const handleLoad = () => {
                                existingScript.removeEventListener("load", handleLoad);
                                resolve(true);
                            };
                            existingScript.addEventListener("load", handleLoad);
                            existingScript.addEventListener("error", reject);
                            return;
                        }

                        const script = document.createElement("script");
                        script.src = src;
                        script.async = true;
                        script.onload = () => resolve(true);
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                };

                await loadScript("/ffmpeg/ffmpeg.js");

                // @ts-expect-error ignore this
                if (!window.FFmpegWASM) {
                    throw new Error("FFmpegWASM is not defined after loading script.");
                }

                // @ts-expect-error ignore this
                const fm = new window.FFmpegWASM.FFmpeg();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fm.on("progress", ({ progress }: any) => {
                    setProgress(progress * 100);
                });

                // Load ffmpeg-core locally from public directory
                await fm.load({
                    coreURL: await toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript"),
                    wasmURL: await toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm"),
                });

                setFfmpeg(fm);
                setIsLoaded(true);
            } catch (err) {
                console.error("FFmpeg load error:", err);
                setError("Failed to load video processing engine. Please check your connection.");
            }
        };
        load();
    }, []);

    // Create a local URL for the video file
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);



    // Handle video metadata loaded
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            setVideoDuration(duration);

            // Set initial range: 0 to min(duration, 10s)
            setRange([0, Math.min(duration, 10)]);
        }
    };

    // Update video time when playing or dragging slider
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentTime = videoRef.current.currentTime;

        // Loop back to start of range if playing hits the end of range
        if (isPlaying && currentTime >= range[1]) {
            videoRef.current.currentTime = range[0];
            videoRef.current.play();
        }
    };

    // Handle slider change
    const handleRangeChange = (newRange: number[]) => {
        setRange(newRange);
        if (videoRef.current) {
            // Seek to the part of the range being dragged
            // To be precise we'd know which thumb was dragged, but seeking to start is safest
            if (Math.abs(videoRef.current.currentTime - newRange[0]) > 0.5) {
                videoRef.current.currentTime = newRange[0];
            }
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            // If we are at or past the end, start from beginning of range
            if (videoRef.current.currentTime >= range[1] || videoRef.current.currentTime < range[0]) {
                videoRef.current.currentTime = range[0];
            }
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTrim = async () => {
        if (!ffmpeg || !isLoaded) return;
        setIsTrimming(true);
        setError(null);
        setProgress(0);

        try {
            const ext = file.name.substring(file.name.lastIndexOf('.')) || ".mp4";
            const inputFileName = "input" + ext;
            const outputFileName = "output.mp4";  // always mp4

            const fetchFile = async (f: File) => new Uint8Array(await f.arrayBuffer());
            await ffmpeg.writeFile(inputFileName, await fetchFile(file));

            // Fast seek and stream copy without re-encoding
            await ffmpeg.exec([
                "-ss", range[0].toString(),
                "-to", range[1].toString(),
                "-i", inputFileName,
                "-c:v", "copy",
                "-c:a", "copy",
                outputFileName
            ]);

            const fileData = await ffmpeg.readFile(outputFileName);
            const data = new Uint8Array(fileData as ArrayBuffer);

            const trimmedBlob = new Blob([data.buffer], { type: "video/mp4" });
            const trimmedFile = new File([trimmedBlob], `trimmed_${Date.now()}.mp4`, { type: "video/mp4" });

            onTrimComplete(trimmedFile);
        } catch (err) {
            console.error("Trimming failed:", err);
            setError("An error occurred while trimming the video.");
            setIsTrimming(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
    };

    const durationExceeds = videoDuration > 10;
    const selectedDuration = range[1] - range[0];

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !isTrimming && onCancel()}>
            <DialogContent
                className="max-w-3xl sm:max-w-2xl bg-white w-[95vw] p-4 sm:p-6 rounded-lg overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scissors className="w-5 h-5" /> Trim Video
                    </DialogTitle>
                    <DialogDescription>
                        Select the segment of the video you want to analyze.
                    </DialogDescription>
                </DialogHeader>

                {selectedDuration > 10 ? (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm flex gap-2 items-center">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <p>
                            Selected range is <b>{selectedDuration.toFixed(1)}s</b>. Please reduce it to <b>10 seconds or less</b> to enable submission.
                        </p>
                    </div>
                ) : durationExceeds ? (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-md text-sm flex gap-2 items-center">
                        <AlertCircle className="w-4 h-4 shrink-0 text-orange-500" />
                        <p>
                            Your video is <b>{videoDuration.toFixed(1)}s</b> long.
                            You <b>must</b> trim it down to 10 seconds or less to process.
                        </p>
                    </div>
                ) : null}

                <div className="space-y-6 mt-2">
                    {/* Video Player */}
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        {videoUrl && (
                            <video
                                ref={videoRef}
                                src={videoUrl || undefined}
                                className="max-h-full max-w-full"
                                onLoadedMetadata={handleLoadedMetadata}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={() => setIsPlaying(false)}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                playsInline
                            />
                        )}
                        {/* Play/Pause Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="w-12 h-12 rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-auto bg-white/50 backdrop-blur-sm"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                            </Button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                            <span>{formatTime(range[0])}</span>
                            <span className={selectedDuration > 10 ? "text-orange-600 font-bold" : ""}>
                                Selected: {selectedDuration.toFixed(1)}s
                            </span>
                            <span>{formatTime(range[1])}</span>
                        </div>

                        <Slider
                            min={0}
                            max={videoDuration || 100}
                            step={0.1}
                            value={range}
                            onValueChange={handleRangeChange}
                            disabled={isTrimming || videoDuration === 0}
                            className="py-4"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isTrimming}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTrim}
                            disabled={isTrimming || !isLoaded || selectedDuration > 10}
                            className="min-w-[120px]"
                        >
                            {isTrimming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {Math.round(progress)}%
                                </>
                            ) : !isLoaded ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Trim & Use"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
