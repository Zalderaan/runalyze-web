'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, StopCircle, RotateCcw, X, SwitchCamera, RotateCw } from 'lucide-react';
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

    const streamRef = useRef<MediaStream | null>(null);
    const [isPortrait, setIsPortrait] = useState(false);

    // Track orientation to warn mobile users when they hold the device in portrait mode
    useEffect(() => {
        if (!isMobile) return;

        const checkOrientation = () => {
            const portrait = window.innerHeight > window.innerWidth;
            setIsPortrait(portrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, [isMobile]);

    const stopCamera = useCallback(() => {
        console.log('[CameraCapture] stopCamera called');
        const activeStream = streamRef.current;
        if (activeStream) {
            activeStream.getTracks().forEach(track => {
                console.log('[CameraCapture] stopping track:', track.label);
                track.stop();
            });
            streamRef.current = null;
        }
        setStream(null);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // Consolidated effect to start/stop the camera cleanly based on facingMode state, preventing loop conditions
    useEffect(() => {
        console.log('[CameraCapture] Mount/facingMode change effect - starting camera with facingMode:', facingMode);

        let activeStream: MediaStream | null = null;

        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });

                activeStream = mediaStream;
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                    setError(null);
                    console.log('[CameraCapture] Camera stream successfully acquired and bound.');
                }
            } catch (err) {
                console.error('[CameraCapture] Error accessing camera:', err);
                setError('Could not access camera. Please check permissions.');
            }
        };

        initCamera();

        return () => {
            console.log('[CameraCapture] Cleanup effect - stopping camera for facingMode:', facingMode);
            if (activeStream) {
                activeStream.getTracks().forEach(track => {
                    console.log('[CameraCapture] stopping track:', track.label);
                    track.stop();
                });
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStream(null);
            streamRef.current = null;
        };
    }, [facingMode]);

    const stopRecording = useCallback(() => {
        console.log('[CameraCapture] stopRecording - current state:', mediaRecorderRef.current?.state);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!stream) {
            console.warn('[CameraCapture] Cannot start recording: stream is null');
            return;
        }

        chunksRef.current = [];
        console.log('[CameraCapture] startRecording - Initializing MediaRecorder...');

        // Find the best supported MIME type
        const mimeTypes = [
            'video/mp4;codecs=h264',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm;codecs=h264',
            'video/webm'
        ];

        let selectedMimeType = '';
        for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                selectedMimeType = type;
                break;
            }
        }

        console.log('[CameraCapture] Selected MIME Type for MediaRecorder:', selectedMimeType || 'default');

        const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
            console.log('[CameraCapture] ondataavailable received chunk size:', event.data.size);
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            console.log('[CameraCapture] MediaRecorder stopped. Total chunks collected:', chunksRef.current.length);
            const blob = new Blob(chunksRef.current, {
                type: mediaRecorder.mimeType || 'video/webm'
            });
            console.log('[CameraCapture] Created Blob. Size:', blob.size, 'MIME Type:', blob.type);
            setRecordedVideo(blob);
            setIsPreviewing(true);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        console.log('[CameraCapture] MediaRecorder started.');

        // Start timer
        const startTime = Date.now();
        const timer = setInterval(() => {
            setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (mediaRecorderRef.current?.state === 'recording') {
                console.log('[CameraCapture] Auto-stopping recording after 30 seconds...');
                stopRecording();
            }
            clearInterval(timer);
        }, 30000);
    }, [stream, stopRecording]);

    const toggleCamera = useCallback(() => {
        console.log('[CameraCapture] toggleCamera - switching facingMode...');
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }, []);

    const handleRetake = useCallback(() => {
        console.log('[CameraCapture] handleRetake called. Clearing previous recorded video.');
        setRecordedVideo(null);
        setIsPreviewing(false);
        setRecordingTime(0);
        chunksRef.current = [];
    }, []);

    const handleUseVideo = useCallback(() => {
        if (recordedVideo) {
            const isMp4 = recordedVideo.type.includes('mp4');
            const extension = isMp4 ? 'mp4' : 'webm';
            const file = new File([recordedVideo], `recording-${Date.now()}.${extension}`, {
                type: recordedVideo.type
            });
            console.log('[CameraCapture] handleUseVideo - generated File object:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            stopCamera();
            onCapture(file);
        } else {
            console.warn('[CameraCapture] handleUseVideo - recordedVideo is null!');
        }
    }, [recordedVideo, stopCamera, onCapture]);




    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
            {/* Header / Top Bar */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Record Running Video
                    </h2>
                    <p className="text-xs text-gray-300">
                        Record 6-10 seconds of side-view running
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }} className="text-white hover:bg-white/20">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Camera View */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="p-4 mx-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-center">
                        <p>{error}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={!isPreviewing}
                        src={isPreviewing && recordedVideo ? URL.createObjectURL(recordedVideo) : undefined}
                        className="w-full h-full object-contain"
                    />
                )}

                {/* Overlays */}
                {isMobile && isPortrait && !isPreviewing && !error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm p-3 bg-amber-500/90 backdrop-blur-md rounded-xl text-white text-sm flex items-center gap-3 animate-pulse shadow-lg">
                        <RotateCw className="h-6 w-6 shrink-0" />
                        <div>
                            <p className="font-semibold">Landscape mode required</p>
                            <p className="text-xs text-amber-50">Please rotate your phone to landscape mode before recording.</p>
                        </div>
                    </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium tracking-wider">
                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-4">
                {/* Tips */}
                {!isPreviewing && !isRecording && (
                    <div className="text-xs text-gray-300 space-y-1 p-3 bg-white/10 backdrop-blur-md rounded-lg max-w-md mx-auto w-full">
                        <p className="text-amber-400 font-semibold">• Always record in landscape (horizontal) orientation</p>
                        <p>• Position camera 2-3 meters away, side view</p>
                        <p>• Keep runner in frame throughout</p>
                        <p>• Recording will auto-stop after 30 seconds</p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-6 mt-2">
                    {!isPreviewing ? (
                        <>
                            {isMobile && !isRecording && (
                                <Button
                                    onClick={toggleCamera}
                                    variant="ghost"
                                    size="icon"
                                    className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <SwitchCamera className="h-6 w-6" />
                                </Button>
                            )}

                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    disabled={!stream || !!error}
                                    size="icon"
                                    className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white shadow-xl"
                                >
                                    <Video className="h-8 w-8 text-white" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    variant="destructive"
                                    size="icon"
                                    className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white shadow-xl animate-pulse"
                                >
                                    <StopCircle className="h-8 w-8" />
                                </Button>
                            )}

                            {isMobile && !isRecording && (
                                <div className="h-14 w-14" /> /* spacer to balance switch camera button */
                            )}
                        </>
                    ) : (
                        <div className="flex gap-4 w-full max-w-md mx-auto">
                            <Button
                                onClick={handleRetake}
                                variant="outline"
                                size="lg"
                                className="flex-1 gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Retake
                            </Button>
                            <Button
                                onClick={handleUseVideo}
                                size="lg"
                                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Camera className="h-5 w-5" />
                                Use Video
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}