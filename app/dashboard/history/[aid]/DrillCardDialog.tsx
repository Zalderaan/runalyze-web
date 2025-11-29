'use client';

import { useState } from "react";
import Link from "next/link";
import { CircleQuestionMark, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDrillHelpful } from "@/hooks/drills/use-drill-helpful";

interface DrillCardDialogProps {
    drillId?: number;
    drillName: string;
    reason: string;
    targetMuscles?: string[];
    sources?: { title: string; url: string }[];
}

export function DrillCardDialog({ 
    drillId, 
    drillName, 
    reason, 
    targetMuscles, 
    sources 
}: DrillCardDialogProps) {
    const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
    const { isLoading, error, markHelpful, markNotHelpful } = useDrillHelpful();

    const handleFeedback = async (isHelpful: boolean) => {
        console.log("handleFeedback called1")
        if (isLoading || !drillId) return;
        
        const feedbackValue = isHelpful ? 'helpful' : 'not_helpful';
        console.log('isHelpful: ', isHelpful)
        setFeedback(feedbackValue);

        try {
            if (isHelpful) {
                await markHelpful(drillId.toString());
            } else {
                await markNotHelpful(drillId.toString());
            }
        } catch (error) {
            console.error('Error submitting drill feedback:', error);
            // Reset feedback state on error
            setFeedback(null);
        }
    };

    console.log("reason: ", reason);

    return (
        <Dialog>
            <DialogTrigger asChild className="w-fit">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <CircleQuestionMark className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg">Why this drill?</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        {drillId} {drillName}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Reason Section */}
                    {reason ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">💡</span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {reason}
                                </p>
                            </div>
                            
                            {/* Target Muscles */}
                            {targetMuscles && targetMuscles.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                                    <span className="text-xs font-medium text-gray-700">🎯 Targets:</span>
                                    {targetMuscles.map((muscle, idx) => (
                                        <span 
                                            key={idx} 
                                            className="text-xs bg-white border border-amber-300 text-gray-700 px-2 py-0.5 rounded-full"
                                        >
                                            {muscle}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 italic">
                                No detailed explanation available for this drill yet.
                            </p>
                        </div>
                    )}

                    {/* Sources */}
                    {sources && sources.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-sm font-semibold text-gray-900">📚 Learn more:</span>
                            </div>
                            <ul className="space-y-2">
                                {sources.map((source, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-600 text-xs mt-0.5">•</span>
                                        <Link 
                                            href={source.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 leading-relaxed"
                                        >
                                            {source.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3 border-t pt-4">
                    {!feedback ? (
                        <div className="w-full space-y-3">
                            <p className="text-sm text-gray-700 font-medium text-center">
                                Was this explanation helpful?
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFeedback(true)}
                                    disabled={isLoading}
                                    className="gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Yes
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFeedback(false)}
                                    disabled={isLoading}
                                    className="gap-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                    No
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full text-center space-y-2 py-2">
                            <div className="flex justify-center">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                Thank you for your feedback!
                            </p>
                            <p className="text-xs text-gray-600">
                                {feedback === 'helpful' 
                                    ? "Glad this was helpful!" 
                                    : "We'll work on improving our explanations"}
                            </p>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}