'use client';

import { useState } from 'react';
import { useAuth } from '@/context/user_context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  // For layout structure
import { toast } from 'sonner';  // Assuming sonner for toasts
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';  // Add this import
// import { User } from "@/context/user_context"
import { useAdmins } from '@/hooks/users/use-admins';
import { ConsultationTable } from '@/components/consultations/ConsultationTable';
import { useGetConsultations } from '@/hooks/consultation/use-get-consultations';
import { useHistory } from '@/hooks/use-history';
import { motion } from 'framer-motion';
import { UserIcon, Activity, MessageSquare, Send } from 'lucide-react';

// import {
//     useFormField,
//     Form,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormDescription,
//     FormMessage,
//     FormField,
// } from "@/components/ui/form"




export default function ConsultPage() {
    const { user } = useAuth();
    const [selectedCoach, setSelectedCoach] = useState<string>('');
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>('none');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // // Premium check
    // if (!user?.is_premium) {
    //     return (
    //         <div className="p-6 text-center">
    //             <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
    //             <p>This feature is for premium users only. Upgrade to contact coaches.</p>
    //         </div>
    //     );
    // }

    const { admins, usersLoading } = useAdmins();
    const { history } = useHistory();

    const { consultations, consultationsLoading, refetchConsultations } = useGetConsultations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();  // Prevent default form submission

        if (!selectedCoach || !message.trim()) {
            toast.error('Please select a coach and enter a message.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/consult', {  // Replace with your actual API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coach_id: selectedCoach,
                    message: message.trim(),
                    userId: user?.id,  // Include user ID if needed
                    analysisId: selectedAnalysis === 'none' ? null : Number(selectedAnalysis)
                }),
            });

            if (response.ok) {
                toast.success('Message sent successfully!');
                setMessage('');  // Clear the message
                setSelectedCoach('');  // Reset selection
                setSelectedAnalysis('none');
                refetchConsultations();  // Refresh the table data automatically
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/consult/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });
            if (response.ok) {
                toast.success('Status updated successfully!');
                refetchConsultations();
            } else {
                toast.error('Failed to update status.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('An error occurred while updating.');
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            const response = await fetch(`/api/consult/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dismiss: true }),
            });
            if (response.ok) {
                toast.success('Consultation dismissed from your view.');
                refetchConsultations();
            } else {
                const err = await response.json();
                toast.error(err.message || 'Failed to dismiss.');
            }
        } catch (error) {
            console.error('Error dismissing consultation:', error);
            toast.error('An error occurred while dismissing.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Consultations</h1>
                <p className="text-gray-500 mt-1">Connect with professional coaches or review your past sessions.</p>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">Contact Coach</TabsTrigger>
                    <TabsTrigger value="history">My Consultations</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className='mt-6 outline-none'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/40 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm p-6 sm:p-8"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-100 pb-4 mb-6">New Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Coach Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                    <UserIcon className="w-4 h-4 text-blue-500" />
                                    Select a Coach
                                </label>
                                {usersLoading ? (
                                    <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                                ) : admins.length > 0 ? (
                                    <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                                        <SelectTrigger className="w-full h-12 bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300 rounded-lg transition-colors focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="Choose an available coach..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {admins.filter(a => a.is_active).map((a) => (
                                                <SelectItem key={a.id} value={a.id.toString()}>
                                                    {a.username} ({a.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm text-gray-500 italic py-2">No coaches available at the moment.</p>
                                )}
                            </div>

                            {/* Analysis Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    Attach Analysis (Optional)
                                </label>
                                <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                                    <SelectTrigger className="w-full h-12 bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300 rounded-lg transition-colors focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Select an analysis session to review..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No analysis attached</SelectItem>
                                        {history?.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name || `Analysis #${item.id}`} - {new Date(item.created_at).toLocaleDateString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                                    <MessageSquare className="w-4 h-4 text-purple-500" />
                                    Your Message
                                </label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Hello Coach, I'm struggling with..."
                                    rows={5}
                                    required
                                    className="w-full bg-white/60 hover:bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-lg p-3 transition-colors resize-none shadow-sm"
                                />
                                <p className="text-xs text-gray-500 text-right mt-1">Be specific about your goals and current challenges.</p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !selectedCoach}
                                    className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending Request...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Send className="w-4 h-4" />
                                            Send Consultation Request
                                        </span>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </motion.div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Active Consultations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ConsultationTable
                                consultations={consultations}
                                onUpdateStatus={handleUpdateStatus}
                                onDismiss={handleDismiss}
                                isLoading={consultationsLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    );
}