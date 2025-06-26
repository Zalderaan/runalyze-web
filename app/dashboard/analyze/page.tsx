'use client';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SquarePlus } from 'lucide-react';
import { useState } from "react";
import { supabase } from '@/lib/supabase'
import { Results } from "@/components/analyze/results";
import { useAuth } from "@/context/user_context";

export default function AnalyzePage() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<{
            download_url: string;
            analysis_summary: any;
        } | null>(null);
    const { user } = useAuth();

    // TODO: validate file size and length
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
        const file = e.target.files?.[0]
        setVideoFile(file || null);
    }

    async function handleUpload() {
        console.log(videoFile)
        if(!videoFile) return;
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(`user-uploads/${videoFile.name}`, videoFile, {
                cacheControl: '3600',
                upsert: false
            });
        if (error) {
            alert('Upload failed: ' + error.message);
            console.log(error);
        } else {
            // TODO: maybe reset the form or something
            alert('Upload successful!');
        }

        console.log("data: ", data);
    }

    async function handleAnalyze() {
        if (!videoFile) return;
        if (!user) return;
        
        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append("file", videoFile);  // Key must match FastAPI's `UploadFile` param name
            formData.append("user_id", user.id.toString());

            // Send directly to FastAPI
            const response = await fetch('http://localhost:8000/process-video/', {
                method: 'POST',
                body: formData,  // Headers are auto-set to `multipart/form-data`
            });

            if (!response.ok) throw new Error(await response.text());
            
            const result = await response.json();
            setResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="flex flex-col justify-start items-center h-full w-full gap-4 py-12 bg-red-200">
            <h1 className="text-4xl font-bold">Analyze Running Form</h1>
            <h3 className="text-xl">Get insights on your running form</h3>
            <Input 
                id="vid-upload" 
                type="file" 
                accept="video/*"
                className="hidden" 
                onChange={handleFileChange}
                disabled={isProcessing}
            />
            <Label htmlFor="vid-upload" className="flex flex-col justify-center cursor-pointer">
                <Card className="flex flex-col border-2 border-dashed">
                    <CardContent className="flex flex-col h-full w-full justify-center items-center" >
                        <SquarePlus />
                    </CardContent>
                </Card>
            </Label>
            <span className="text-xs">
                {videoFile === null ? 'Upload 6-10s running footage' : `${videoFile.name}`}
            </span>
            <Button 
                className={videoFile === null ? 'hidden' : 'block'}
                onClick={handleAnalyze}
                disabled={!videoFile || isProcessing}
            >
                {isProcessing ? 'Processing...' : 'Analyze Video'}
            </Button>

            <div>
                { results ? <Results download_url={results.download_url} analysis_summary={results.analysis_summary}/> : 'Results will appear here: ' }
            </div>
        </div>
    );
}