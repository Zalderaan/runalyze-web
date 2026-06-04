'use client';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Upload,
    Video,
    CheckCircle2,
    AlertCircle,
    FileVideo,
    Clock,
    Zap,
    Target,
    Info,
    Camera
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from "react";
import { Results } from "@/components/analyze/results";
import { useAuth } from "@/context/user_context";
import { useHistory } from "@/hooks/use-history";
import Link from "next/link";
import { SampleDialog } from "@/components/sample/sample-dialog";
import { Progress } from "@/components/ui/progress";
import { CameraCapture } from "@/components/analyze/CameraCapture";
import { RoleGuard } from "@/components/RoleGuard";
import { VideoTrimmer } from "@/components/VideoTrimmer";

interface DatabaseRecords {
    success: boolean;
    video_id: number;
    feedback_id: number;
    analysis_id: number;
}

interface AnalysisMetric {
    median_score: number;
    raw_median_score: number;
    typical_angle: number;
    average_score: number;
    min_score: number;
    max_score: number;
    frames_analyzed: number;
    angle_range: string;
    ideal_range: string;
    consistency_score: number;
}

interface AnalysisSummary {
    head_position: AnalysisMetric;
    back_position: AnalysisMetric;
    arm_flexion: AnalysisMetric;
    left_knee: AnalysisMetric;
    right_knee: AnalysisMetric;
    foot_strike: AnalysisMetric;
    overall_score: number;
}

interface ProgressUpdate {
    stage: string;
    progress: number;
    message: string;
    frame_progress: {
        current: number;
        total: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

console.log("API_URL: ", API_URL);

export default function AnalyzePage() {
    const [showCamera, setShowCamera] = useState(false);
    const [showTrimmer, setShowTrimmer] = useState(false);
    const [rawVideoFile, setRawVideoFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<ProgressUpdate | null>(null);
    // const [jobId, setJobId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<{
        download_url: string;
        analysis_summary: AnalysisSummary;
        database_records: DatabaseRecords;
    } | null>(null);
    const { user } = useAuth();
    const [promptAnalysisId, setPromptAnalysisId] = useState<number | null>(null);
    const [analysisName, setAnalysisName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);

    const { renameAnalysis, updateFatigueLevel } = useHistory();
    const [fatigueLevel, setFatigueLevel] = useState<number | null>(null);
    const [isSavingFatigue, setIsSavingFatigue] = useState(false);

    // Refs to manage progress stream state across callback updates and prevent stale closures
    const progressStageRef = useRef<string>("");
    const activeEventSourceRef = useRef<EventSource | null>(null);
    const retryCountRef = useRef<number>(0);

    // ✅ NEW: Memoized fetchResults so it can be safely used in callbacks
    const fetchResults = useCallback(async (jobId: string) => {
        try {
            console.log('✅ Processing complete, fetching results...');
            const response = await fetch(`${API_URL}/result/${jobId}`); // ✅ Use API_URL

            // ✅ Handle 202 (still processing)
            if (response.status === 202) {
                const status = await response.json();
                console.log('⏳ Still processing:', status);
                // Retry after a short delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchResults(jobId); // Recursive retry - don't stop processing yet
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch results: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Results received:', result);

            if (result.success) {
                setResults(result);
                setIsProcessing(false); // ✅ Stop loading on success
                setError(null); // ✅ Clear any previous errors

                // Prepare name state
                const currentTimestamp = new Date().toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const defaultName = `Analysis on ${currentTimestamp}`
                setAnalysisName(defaultName);
                setPromptAnalysisId(result.database_records.analysis_id);
                setFatigueLevel(null);
                // Setup default name automatically in the background
                renameAnalysis(result.database_records.analysis_id, defaultName).catch(console.error);

                // Clean up backend storage and local storage
                fetch(`${API_URL}/result/${jobId}`, { method: 'DELETE' })
                    .catch(err => console.warn('Cleanup failed:', err));
                localStorage.removeItem('activeJobId');
            } else {
                setError(result.error || 'Analysis failed');
                setIsProcessing(false); // ✅ Stop loading on error result
            }

        } catch (error) {
            console.error('❌ Error fetching results:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch results');
            setIsProcessing(false);
            localStorage.removeItem('activeJobId');
        }
    }, [API_URL, renameAnalysis]);

    // ✅ NEW: Refactored SSE connection logic with exponential backoff retries and Ref-safe state
    const connectToProgressStream = useCallback((jobId: string) => {
        const sseUrl = `${API_URL}/progress/${jobId}`;
        const MAX_RETRIES = 5;

        // Close any existing active connection cleanly first
        if (activeEventSourceRef.current) {
            activeEventSourceRef.current.close();
            activeEventSourceRef.current = null;
        }

        const connect = () => {
            console.log(`🔌 Connecting to SSE (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES}):`, sseUrl);
            const eventSource = new EventSource(sseUrl);
            activeEventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log("✅ SSE connection opened successfully");
                retryCountRef.current = 0; // Reset retries on successful connection
            };

            eventSource.onmessage = (event) => {
                console.log("📨 SSE message received:", event.data);

                try {
                    const data: ProgressUpdate = JSON.parse(event.data);
                    progressStageRef.current = data.stage;

                    if (data.stage === "error") {
                        console.error("❌ Backend error:", data);
                        setError(data.message || "Analysis failed");
                        localStorage.removeItem('activeJobId');
                        eventSource.close();
                        activeEventSourceRef.current = null;
                        setIsProcessing(false);
                        return;
                    }

                    setProgress(data);

                    if (data.progress >= 100 || data.stage === "complete") {
                        console.log("✅ Processing complete, fetching results...");
                        eventSource.close();
                        activeEventSourceRef.current = null;
                        fetchResults(jobId);
                    }
                } catch (parseError) {
                    console.error("❌ Failed to parse SSE data:", parseError, event.data);
                }
            };

            eventSource.onerror = (error) => {
                console.error('❌ SSE Error:', error);
                eventSource.close();
                activeEventSourceRef.current = null;

                // Handle retries on connection loss if we're not complete/error
                if (progressStageRef.current !== "complete" && progressStageRef.current !== "error") {
                    if (retryCountRef.current < MAX_RETRIES) {
                        const delay = Math.min(2000 * Math.pow(2, retryCountRef.current), 15000);
                        console.log(`🔄 Lost connection. Retrying in ${delay}ms...`);
                        retryCountRef.current++;
                        setTimeout(connect, delay);
                        return;
                    }
                    
                    // Keep the jobId in localStorage so the user can try refreshing manually
                    setError("Lost connection to server. You can try refreshing the page to resume.");
                }
                setIsProcessing(false);
            };
        };

        connect();

        return () => {
            if (activeEventSourceRef.current) {
                activeEventSourceRef.current.close();
                activeEventSourceRef.current = null;
            }
        };
    }, [API_URL, fetchResults]);

    // ✅ NEW: Resume analysis on mount
    useEffect(() => {
        const activeJobId = localStorage.getItem('activeJobId');
        if (activeJobId && !isProcessing && !results) {
            console.log("🔄 Found active job in storage, resuming...", activeJobId);
            setIsProcessing(true);
            connectToProgressStream(activeJobId);
        }
    }, [user, connectToProgressStream, isProcessing, results]); // include deps used inside effect

    const handleNameSubmit = async () => {
        if (!promptAnalysisId) return;
        setIsSavingName(true);
        // It's already defaulted to "Analysis on <timestamp>" if they don't edit
        try {
            await renameAnalysis(promptAnalysisId, analysisName.trim());
        } catch (err) {
            console.error("Failed to set early analysis name", err);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleFatigueSubmit = async (level: number) => {
        setFatigueLevel(level);
        if (promptAnalysisId) {
            setIsSavingFatigue(true);
            try {
                await updateFatigueLevel(promptAnalysisId, level);
            } catch (err) {
                console.error("Failed to save fatigue level", err);
            } finally {
                setIsSavingFatigue(false);
            }
        }
    };

    async function validateVideoDuration(file: File): Promise<{ valid: boolean; duration: number; error?: string }> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;

                const MAX_DURATION = 10; // 10 seconds

                if (duration > MAX_DURATION) {
                    resolve({
                        valid: false,
                        duration,
                        error: `Video too long (${duration.toFixed(1)}s). Maximum ${MAX_DURATION}s allowed. Please trim your video to ${MAX_DURATION} seconds or less.`
                    });
                } else {
                    resolve({ valid: true, duration });
                }
            };

            video.onerror = () => {
                resolve({
                    valid: false,
                    duration: 0,
                    error: 'Unable to read video file. Please ensure it is a valid video format.'
                });
            };

            video.src = URL.createObjectURL(file);
        });
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        // Clear previous errors when selecting new file
        setError(null);
        setResults(null);

        // Validate file
        if (file) {
            const maxSize = 50 * 1024 * 1024; // 50MB
            const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/x-msvideo'];

            // Check file size
            if (file.size > maxSize) {
                setError(`File size too large. Please select a video under 50MB. Current size: ${formatFileSize(file.size)}`);
                setVideoFile(null);
                e.target.value = ''; // Reset input
                return;
            }

            // Check file type
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                setError(`Unsupported file type. Please use MP4, MOV, or AVI format. Current type: ${file.type}`);
                setVideoFile(null);
                e.target.value = ''; // Reset input
                return;
            }

            // ✅ All validations passed
            setRawVideoFile(file);
            setShowTrimmer(true);
        } else {
            setRawVideoFile(null);
            setVideoFile(null);
        }
    }

    async function handleAnalyze() {
        console.log('[AnalyzePage] handleAnalyze called.');
        if (!videoFile) {
            console.warn('[AnalyzePage] handleAnalyze - No videoFile selected!');
            return;
        }
        if (!user) {
            console.warn('[AnalyzePage] handleAnalyze - No user signed in!');
            setError("Please sign in to analyze videos");
            return;
        }

        console.log('[AnalyzePage] Selected videoFile details:', {
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size
        });

        // Clear previous errors and results
        setError(null);
        setResults(null);
        setIsProcessing(true);
        setProgress(null);

        try {
            const formData = new FormData();
            formData.append("file", videoFile);
            formData.append("user_id", user.id.toString());

            console.log('[AnalyzePage] Starting upload POST request to:', `${API_URL}/process-video-async`);

            const response = await fetch(`${API_URL}/process-video-async`, {
                method: 'POST',
                body: formData,
            });

            console.log('[AnalyzePage] Upload response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[AnalyzePage] Error details from response:', errorData);
                throw new Error(errorData.detail || "Failed to start processing");
            }

            const { job_id, status } = await response.json();
            console.log("✅ [AnalyzePage] Received job_id:", job_id, "Status:", status);

            // ✅ Persist job_id
            localStorage.setItem('activeJobId', job_id);

            // ✅ Wait for backend to initialize progress tracker
            console.log("[AnalyzePage] Waiting 1 second for backend to initialize...");
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ✅ Connect to stream
            connectToProgressStream(job_id);

        } catch (error) {
            console.error('❌ [AnalyzePage] Error starting analysis:', error);

            if (error instanceof TypeError && error.message.includes('fetch')) {
                setError("Unable to connect to analysis service. Please check your internet connection and try again.");
            } else {
                setError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis.');
            }
            setIsProcessing(false);
            localStorage.removeItem('activeJobId');
        }
    }

    

    function handleCameraCapture(file: File) {
        console.log('[AnalyzePage] handleCameraCapture received captured file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        setRawVideoFile(file);
        setShowTrimmer(true);
        setShowCamera(false);
        setError(null);
        setResults(null);
    }

    return (
        <RoleGuard allowedRoles={["user"]}>
            <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Video className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Analyze Running Form</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Upload your running video and get AI-powered insights to improve your form and performance
                    </p>
                </div>

                {/* Quick Tips */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-blue-900">Tips for best results:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Allow for 2-3 meters of distance when taking the video</li>
                                    <li>• Record side-view running footage not exceeding 10s</li>
                                    <li>• Ensure good lighting and stable camera position</li>
                                    <li>• Keep the runner in frame throughout the video</li>
                                    <li>• Use 720p or higher quality for your running footage</li>
                                    <li>• Use MP4, MOV, or AVI format (max 50MB)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-semibold text-red-900">Analysis Failed</h3>
                                    <p className="text-sm text-red-800">{error}</p>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setError(null)}
                                            className="text-red-700 border-red-300 hover:bg-red-100"
                                        >
                                            Dismiss
                                        </Button>
                                        {videoFile && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAnalyze}
                                                disabled={isProcessing}
                                                className="text-red-700 border-red-300 hover:bg-red-100"
                                            >
                                                Try Again
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ✅ NEW: Progress Display Card using shadcn Progress */}
                {isProcessing && progress && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                Processing Video
                            </CardTitle>
                            <CardDescription className="text-blue-800">
                                {progress.message}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar using shadcn Progress component */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-blue-900 capitalize">
                                        {progress.stage.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-blue-700">
                                        {Math.round(progress.progress)}%
                                    </span>
                                </div>
                                {/* ✅ Using shadcn Progress component */}
                                <Progress
                                    value={progress.progress}
                                    className="h-2 bg-blue-200"
                                />
                            </div>

                            {/* Frame Progress (only show during processing stage) */}
                            {progress.frame_progress.total > 0 && (
                                <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span>Processing frames</span>
                                        <span className="font-mono">
                                            {progress.frame_progress.current} / {progress.frame_progress.total}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Stage-specific messages */}
                            <div className="text-xs text-blue-700">
                                {progress.stage === 'upload' && '📤 Uploading your video...'}
                                {progress.stage === 'thumbnail' && '🖼️ Extracting thumbnail...'}
                                {progress.stage === 'thumbnail_upload' && '☁️ Uploading thumbnail...'}
                                {progress.stage === 'detection' && '🔍 Analyzing video orientation...'}
                                {progress.stage === 'setup' && '⚙️ Preparing video processing...'}
                                {progress.stage === 'validation' && '✓ Validating running activity...'}
                                {progress.stage === 'processing' && '🏃 Analyzing your running form...'}
                                {progress.stage === 'analyzing' && '📊 Generating analysis summary...'}
                                {progress.stage === 'postprocessing' && '🎬 Finalizing video...'}
                                {progress.stage === 'uploading' && '☁️ Uploading processed video...'}
                                {progress.stage === 'feedback' && '🤖 Generating AI feedback...'}
                                {progress.stage === 'saving' && '💾 Saving results...'}
                                {progress.stage === 'complete' && '✅ Analysis complete!'}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* See Example Button */}
                <SampleDialog />

                {/* Video Trimmer Modal */}
                {showTrimmer && rawVideoFile && (
                    <VideoTrimmer
                        file={rawVideoFile}
                        onTrimComplete={(trimmedFile) => {
                            setVideoFile(trimmedFile);
                            setRawVideoFile(null);
                            setShowTrimmer(false);
                        }}
                        onCancel={() => {
                            setRawVideoFile(null);
                            setVideoFile(null);
                            setShowTrimmer(false);
                        }}
                    />
                )}

                {/* Camera Modal */}
                {showCamera && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 max-w-full h-full">
                        <CameraCapture
                            onCapture={handleCameraCapture}
                            onClose={() => setShowCamera(false)}
                        />
                    </div>
                )}

                {/* Upload Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upload Card */}
                    <Card className="relative">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Video
                            </CardTitle>
                            <CardDescription>
                                Select your running video for analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Camera Button */}
                            <Button
                                onClick={() => setShowCamera(true)}
                                variant="outline"
                                className="w-full gap-2"
                                disabled={isProcessing}
                            >
                                <Camera className="h-4 w-4" />
                                Record with Camera
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>

                            {/* Upload */}
                            <Input
                                id="vid-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                            />
                            <Label htmlFor="vid-upload" className="cursor-pointer">
                                <div className={`
                                    border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full
                                    ${error && !videoFile ? 'border-red-300 bg-red-50' :
                                        videoFile ? 'border-green-300 bg-green-50' :
                                            'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}>
                                    {error && !videoFile ? (
                                        <div className="space-y-3">
                                            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
                                            <div className="space-y-1">
                                                <p className="font-medium text-red-900">Upload Failed</p>
                                                <p className="text-sm text-red-700">Click to select a different file</p>
                                            </div>
                                        </div>
                                    ) : videoFile ? (
                                        <div className="space-y-3">
                                            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                                            <div className="space-y-1">
                                                <p className="font-medium text-green-900">File Selected</p>
                                                <p className="text-sm text-green-700">Click to change file</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                            <div className="space-y-1">
                                                <p className="font-medium">Drop your video here</p>
                                                <p className="text-sm text-muted-foreground">or click to browse</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Label>

                            {/* File Info */}
                            {videoFile && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileVideo className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium text-sm">{videoFile.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Size: {formatFileSize(videoFile.size)}</span>
                                        <span>Type: {videoFile.type}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <Button
                                className="w-full"
                                onClick={handleAnalyze}
                                disabled={!videoFile || isProcessing}
                                size="lg"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing Video...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Analyze Running Form
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Process Steps */}
                    {/* <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Analysis Process
                        </CardTitle>
                        <CardDescription>
                            What happens when you upload your video
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${videoFile ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${videoFile ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {videoFile ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">1</span>}
                                </div>
                                <div>
                                    <div className="font-medium">Upload Video</div>
                                    <div className="text-sm text-muted-foreground">Securely upload your running footage</div>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${error ? 'bg-red-50 border border-red-200' :
                                isProcessing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${error ? 'bg-red-100 text-red-600' :
                                    isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {error ? (
                                        <AlertCircle className="h-4 w-4" />
                                    ) : isProcessing ? (
                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-sm font-medium">2</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">
                                        {error ? 'Analysis Failed' : 'AI Analysis'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {error ? 'Check error message above' : 'Analyze running form and biomechanics'}
                                    </div>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${results ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${results ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {results ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">3</span>}
                                </div>
                                <div>
                                    <div className="font-medium">Get Results</div>
                                    <div className="text-sm text-muted-foreground">Receive detailed insights and recommendations</div>
                                </div>
                            </div>
                        </div>

                        {isProcessing && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm font-medium">Processing typically takes 30-60 seconds</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2 text-red-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Analysis failed - see error details above</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card> */}

                    {/* Process Steps - Updated with progress info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Analysis Process
                            </CardTitle>
                            <CardDescription>
                                What happens when you upload your video
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {/* Step 1 - Upload */}
                                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${videoFile || progress ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                    }`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${videoFile || progress ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {videoFile || progress ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">1</span>}
                                    </div>
                                    <div>
                                        <div className="font-medium">Upload Video</div>
                                        <div className="text-sm text-muted-foreground">Securely upload your running footage</div>
                                    </div>
                                </div>

                                {/* Step 2 - Processing */}
                                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${error ? 'bg-red-50 border border-red-200' :
                                    (progress && progress.stage !== 'complete') ? 'bg-blue-50 border border-blue-200' :
                                        (progress?.stage === 'complete') ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                    }`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${error ? 'bg-red-100 text-red-600' :
                                        (progress && progress.stage !== 'complete') ? 'bg-blue-100 text-blue-600' :
                                            (progress?.stage === 'complete') ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {error ? (
                                            <AlertCircle className="h-4 w-4" />
                                        ) : (progress && progress.stage !== 'complete') ? (
                                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (progress?.stage === 'complete') ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <span className="text-sm font-medium">2</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {error ? 'Analysis Failed' : 'AI Analysis'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {error ? 'Check error message above' :
                                                progress ? progress.message : 'Analyze running form and biomechanics'}
                                        </div>
                                        {/* Mini progress indicator in step */}
                                        {progress && progress.stage !== 'complete' && (
                                            <Progress
                                                value={progress.progress}
                                                className="h-1 mt-2 bg-blue-200"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Step 3 - Results */}
                                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${results ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                    }`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${results ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {results ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">3</span>}
                                    </div>
                                    <div>
                                        <div className="font-medium">Get Results</div>
                                        <div className="text-sm text-muted-foreground">Receive detailed insights and recommendations</div>
                                    </div>
                                </div>
                            </div>

                            {/* Updated timing message */}
                            {isProcessing && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {progress ? `${progress.message}` : 'Processing typically takes 30-60 seconds'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Analysis failed - see error details above</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Troubleshooting Section - Shows when there's an error */}
                {error && (
                    <Card className="bg-orange-50 border-orange-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <Info className="h-5 w-5" />
                                Troubleshooting Tips
                            </CardTitle>
                            <CardDescription className="text-orange-800">
                                Try these solutions if analysis keeps failing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-medium">•</span>
                                    <span className="text-orange-800">Ensure video is under 50MB and in MP4, MOV, or AVI format</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-medium">•</span>
                                    <span className="text-orange-800">Check that the video shows clear side-view running footage</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-medium">•</span>
                                    <span className="text-orange-800">Verify your internet connection is stable</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-medium">•</span>
                                    <span className="text-orange-800">Try uploading a different video or compress your current one</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-orange-200">
                                <p className="text-xs text-orange-700">
                                    Still having issues? Contact support with the error message above.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results Section */}
                {results && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Analysis Complete
                            </CardTitle>
                            <CardDescription>
                                Your running form analysis is ready
                            </CardDescription>
                        </CardHeader>
                        <Results
                            download_url={results.download_url}
                            analysis_summary={results.analysis_summary}
                            analysisName={analysisName}
                            setAnalysisName={setAnalysisName}
                            onSaveName={handleNameSubmit}
                            isSavingName={isSavingName}
                            fatigueLevel={fatigueLevel}
                            onSaveFatigue={handleFatigueSubmit}
                            isSavingFatigue={isSavingFatigue}
                        />
                        <CardContent>
                            <Button asChild><Link href={`/dashboard/history/${results.database_records.analysis_id}`}>See details</Link></Button>
                        </CardContent>
                    </Card>
                )}

                {/* No Results Placeholder */}
                {!results && !isProcessing && (
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                    <Target className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">No Analysis Yet</h3>
                                <p className="text-muted-foreground">
                                    Upload a video to see your detailed running form analysis here
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </RoleGuard>
    );
}