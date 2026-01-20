'use client';

import { useState, useEffect } from 'react';
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

    const { admins, usersLoading, usersError, refreshUsers } = useAdmins();

    // TODO: Get consultations
    const { consultations, consultationsLoading, consultationsError, refetchConsultations } = useGetConsultations();

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
                }),
            });

            if (response.ok) {
                toast.success('Message sent successfully!');
                setMessage('');  // Clear the message
                setSelectedCoach('');  // Reset selection
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
            // Replace with your actual API endpoint/logic
            const response = await fetch(`/api/consult/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                toast.success('Status updated successfully!');
                refetchConsultations();  // Refresh the table data
            } else {
                toast.error('Failed to update status.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('An error occurred while updating.');
        }
    };

    const onDeleteConsultation = async (id: string) => {
        try {
            console.log("onDeleteConsultation called!");

            const response = await fetch(`/api/consult/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                toast.success('Consultation deleted successfully!');
                refetchConsultations();  // Refresh the table data
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error deleting consultation");
            toast.error("An error occurred while deleting the consultation")
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Contact a Coach</h1>
            <p className="text-gray-600">Select a coach and send your message via email.</p>

            <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">Contact Coach</TabsTrigger>
                    <TabsTrigger value="history">My Consultations</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className='space-y-2'>
                    {/* Existing Contact Coach UI */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select a Coach</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {usersLoading ? (
                                <p>Loading coaches...</p>
                            ) : admins.length > 0 ? (
                                <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a coach" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {admins.filter(admin => admin.is_active).map((admin) => (
                                            <SelectItem key={admin.id} value={admin.id}>
                                                {admin.username} - {admin.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p>No coaches available at the moment.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Send Your Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your message here..."
                                    rows={6}
                                    required
                                    className="w-full"
                                />
                                <Button type="submit" disabled={isSubmitting || !selectedCoach} className="w-full">
                                    {isSubmitting ? 'Sending...' : 'Send Email'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Consultations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Placeholder for history; implement with API fetch */}
                            <ConsultationTable consultations={consultations} onUpdateStatus={handleUpdateStatus} />
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}