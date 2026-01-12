'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/user_context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  // For layout structure
import { toast } from 'sonner';  // Assuming sonner for toasts
import { User } from "@/context/user_context"
import { useAdmins } from '@/hooks/users/use-admins';

// TODO: endpoint for sending email

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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Contact a Coach</h1>
            <p className="text-gray-600">Select a coach and send your message via email.</p>

            {/* Coach Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Select a Coach</CardTitle>
                </CardHeader>
                <CardContent>
                    { usersLoading ? (
                        <p>Loading coaches...</p>
                    ) : admins.length > 0 ? (
                        <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a coach" />
                            </SelectTrigger>
                            <SelectContent>
                                {admins.map((admin) => (
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

            {/* Message Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Send Your Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={() => console.log(message)} className="space-y-4">
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
        </div>
    );
}