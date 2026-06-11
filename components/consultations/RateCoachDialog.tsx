"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface RateCoachDialogProps {
    consultationId: string;
    coachEmail: string;
    onRated: () => void;
}

export function RateCoachDialog({ consultationId, coachEmail, onRated }: RateCoachDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5 stars.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/consult/${consultationId}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rating,
                    rating_comment: comment.trim(),
                }),
            });

            if (response.ok) {
                toast.success("Thank you! Your feedback has been submitted.");
                setOpen(false);
                setRating(0);
                setComment("");
                onRated();
            } else {
                const errData = await response.json();
                toast.error(errData.message || "Failed to submit rating.");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 font-semibold"
                >
                    <Star className="h-4 w-4 mr-1 fill-amber-500 text-amber-500" /> Rate Coach
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Rate Your Consultation</DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm">
                        Share your feedback for your session with <span className="font-semibold text-gray-700">{coachEmail}</span>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Star selection */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">How was your coaching experience?</label>
                        <div className="flex items-center gap-1.5 py-2">
                            {[1, 2, 3, 4, 5].map((starValue) => {
                                const isHighlighted = starValue <= (hoveredRating || rating);
                                return (
                                    <motion.button
                                        key={starValue}
                                        type="button"
                                        onClick={() => setRating(starValue)}
                                        onMouseEnter={() => setHoveredRating(starValue)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        whileHover={{ scale: 1.25 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="focus:outline-none p-1 transition-colors duration-150"
                                        title={`${starValue} Stars`}
                                    >
                                        <Star
                                            className={`h-9 w-9 stroke-amber-400 transition-all ${
                                                isHighlighted
                                                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                    : "fill-transparent text-gray-300"
                                            }`}
                                        />
                                    </motion.button>
                                );
                            })}
                        </div>
                        {rating > 0 && (
                            <span className="text-xs font-semibold text-amber-600">
                                {rating === 5 && "Excellent! ★★★★★"}
                                {rating === 4 && "Great! ★★★★☆"}
                                {rating === 3 && "Good! ★★★☆☆"}
                                {rating === 2 && "Fair! ★★☆☆☆"}
                                {rating === 1 && "Poor! ★☆☆☆☆"}
                            </span>
                        )}
                    </div>

                    {/* Review text comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Written Feedback (Optional)</label>
                        <Textarea
                            placeholder="What went well? How could the coach improve?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={300}
                            rows={3}
                            className="w-full bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-lg p-2.5 transition-colors resize-none text-sm text-gray-800"
                        />
                        <p className="text-right text-[10px] text-gray-400">
                            {comment.length}/300 characters
                        </p>
                    </div>

                    {/* Submit buttons */}
                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold rounded-lg px-4 shadow-sm hover:shadow transition-all"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
