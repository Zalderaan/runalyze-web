'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Video, StopCircle, RotateCcw, X, SwitchCamera } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const isMobile = useIsMobile();

    const [isRecording, setIsRecording] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Use back camera on mobile
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setError(null);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Could not access camera. Please check permissions.');
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!stream) return;

        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setRecordedVideo(blob);
            setIsPreviewing(true);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);

        // Start timer
        const startTime = Date.now();
        const timer = setInterval(() => {
            setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'recording') {
                stopRecording();
            }
            clearInterval(timer);
        }, 30000);
    }, [stream, stopRecording]);

    const toggleCamera = useCallback(() => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }, [stopCamera]);

    // Update useEffect to restart camera when facingMode changes
    useState(() => {
        startCamera();
        return () => stopCamera();
    });

    // Add effect to restart camera when facingMode changes
    useCallback(() => {
        if (stream) {
            stopCamera();
            startCamera();
        }
    }, [facingMode]);

    // const stopRecording = useCallback(() => {
    //     if (mediaRecorderRef.current?.state === 'recording') {
    //         mediaRecorderRef.current.stop();
    //         setIsRecording(false);
    //         setRecordingTime(0);
    //     }
    // }, []);

    const handleRetake = useCallback(() => {
        setRecordedVideo(null);
        setIsPreviewing(false);
        setRecordingTime(0);
        chunksRef.current = [];
    }, []);

    const handleUseVideo = useCallback(() => {
        if (recordedVideo) {
            const file = new File([recordedVideo], `recording-${Date.now()}.webm`, {
                type: 'video/webm'
            });
            stopCamera();
            onCapture(file);
        }
    }, [recordedVideo, stopCamera, onCapture]);

    // Start camera on mount
    useState(() => {
        startCamera();
        return () => stopCamera();
    });

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Record Running Video
                        </CardTitle>
                        <CardDescription>
                            Record 6-10 seconds of side-view running
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Video Preview */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={!isPreviewing}
                        src={isPreviewing && recordedVideo ? URL.createObjectURL(recordedVideo) : undefined}
                        className="w-full h-full object-contain"
                    />

                    {isMobile && !isRecording && !isPreviewing && (
                        <Button
                            onClick={toggleCamera}
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 left-4"
                        >
                            <SwitchCamera className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Recording Indicator */}
                    {isRecording && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            <span className="text-sm font-medium">
                                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                    {!isPreviewing ? (
                        <>
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    disabled={!stream || !!error}
                                    size="lg"
                                    className="gap-2"
                                >
                                    <Video className="h-4 w-4" />
                                    Start Recording
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    variant="destructive"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <StopCircle className="h-4 w-4" />
                                    Stop Recording
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleRetake}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Retake
                            </Button>
                            <Button
                                onClick={handleUseVideo}
                                size="lg"
                                className="gap-2"
                            >
                                <Camera className="h-4 w-4" />
                                Use This Video
                            </Button>
                        </>
                    )}
                </div>

                {/* Tips */}
                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-gray-50 rounded-lg">
                    <p>• Position camera 2-3 meters away, side view</p>
                    <p>• Ensure good lighting</p>
                    <p>• Keep runner in frame throughout</p>
                    <p>• Recording will auto-stop after 30 seconds</p>
                </div>
            </CardContent>
        </Card>
    );
}