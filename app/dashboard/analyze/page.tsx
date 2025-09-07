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
    Info
} from 'lucide-react';
import { useState } from "react";
import { Results } from "@/components/analyze/results";
import { useAuth } from "@/context/user_context";

export default function AnalyzePage() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<{
            download_url: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            analysis_summary: any;
        } | null>(null);
    const { user } = useAuth();

    // TODO: validate file size and length
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
        const file = e.target.files?.[0]
        
        // Clear previous errors when selecting new file
        setError(null);
        setResults(null);
        
        // Validate file
        if (file) {
            const maxSize = 50 * 1024 * 1024; // 50MB
            const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/x-msvideo'];
            
            if (file.size > maxSize) {
                setError(`File size too large. Please select a video under 50MB. Current size: ${formatFileSize(file.size)}`);
                setVideoFile(null);
                return;
            }
            
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                setError(`Unsupported file type. Please use MP4, MOV, or AVI format. Current type: ${file.type}`);
                setVideoFile(null);
                return;
            }
        }
        
        setVideoFile(file || null);
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    async function handleAnalyze() {
        if (!videoFile) return;
        if (!user) {
            setError("Please sign in to analyze videos");
            return;
        }
        
        // Clear previous errors and results
        setError(null);
        setResults(null);
        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append("file", videoFile);  // Key must match FastAPI's `UploadFile` param name
            formData.append("user_id", user.id.toString());

            // Send directly to FastAPI
            // const response = await fetch('http://localhost:8000/process-video/', {
            const response = await fetch('https://runalyze-python.onrender.com/process-video/', {
                method: 'POST',
                body: formData,  // Headers are auto-set to `multipart/form-data`
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = "Analysis failed. Please try again.";
                
                // Handle specific error cases
                switch (response.status) {
                    case 400:
                        errorMessage = "Invalid video file. Please check the file format and try again.";
                        break;
                    case 413:
                        errorMessage = "Video file is too large. Please use a smaller file (under 50MB).";
                        break;
                    case 422:
                        errorMessage = "Video format not supported or no body landmarks detected. Please use MP4, MOV, or AVI format.";
                        break;
                    case 500:
                        errorMessage = "Server error during analysis. Please try again in a few minutes.";
                        break;
                    case 503:
                        errorMessage = "Analysis service is temporarily unavailable. Please try again later.";
                        break;
                    default:
                        errorMessage = `Analysis failed (${response.status}): ${errorText}`;
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            setResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setError("Unable to connect to analysis service. Please check your internet connection and try again.");
            } else {
                setError(error instanceof Error ? error.message : 'An unexpected error occurred during analysis.');
            }
        } finally {
            setIsProcessing(false);
        }
    }

    return (
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
                                <li>• Record 6-10 seconds of side-view running footage</li>
                                <li>• Ensure good lighting and stable camera position</li>
                                <li>• Keep the runner in frame throughout the video</li>
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
                                border-2 border-dashed rounded-lg p-8 text-center transition-colors
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
                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                videoFile ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    videoFile ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {videoFile ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">1</span>}
                                </div>
                                <div>
                                    <div className="font-medium">Upload Video</div>
                                    <div className="text-sm text-muted-foreground">Securely upload your running footage</div>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                error ? 'bg-red-50 border border-red-200' :
                                isProcessing ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                            }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    error ? 'bg-red-100 text-red-600' :
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

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                results ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    results ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
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
                    <CardContent>
                        <Results download_url={results.download_url} analysis_summary={results.analysis_summary}/>
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
    );
}