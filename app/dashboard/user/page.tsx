'use client';

import { useAuth } from "@/context/user_context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mail,
    Calendar,
    Edit3,
    Save,
    X
} from "lucide-react";
import { useState } from "react";
import { UpdateProfileData, useUpdateProfile } from "@/hooks/users/user-specific/use-update-profile";

export default function UserPage() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const secsToTime = (totalSeconds: number): string => {
        if (totalSeconds < 0 || !Number.isInteger(totalSeconds)) return '00:00:00';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const timeToSecs = (timeString: string): number => {
        const parts = timeString.split(':');
        if (parts.length === 2) {
            // MM:SS
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);
            if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) return 0;
            return minutes * 60 + seconds;
        } else if (parts.length === 3) {
            // HH:MM:SS
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parseInt(parts[2], 10);
            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return 0;
            return hours * 3600 + minutes * 60 + seconds;
        }
        return 0; // Invalid format
    };

    const [formData, setFormData] = useState<{
        height_cm: string;
        weight_kg: string;
        time_3k: string;
        time_5k: string;
        time_10k: string;
    }>({
        height_cm: user?.height_cm?.toString() || '',
        weight_kg: user?.weight_kg?.toString() || '',
        time_3k: user?.time_3k ? secsToTime(user.time_3k) : '',  // Convert seconds to time string
        time_5k: user?.time_5k ? secsToTime(user.time_5k) : '',  // Convert seconds to time string
        time_10k: user?.time_10k ? secsToTime(user.time_10k) : '',  // Convert seconds to time string
    });

    // Wait until user is loaded before calling the hook
    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
                    <p className="text-muted-foreground">Please wait while we load your profile</p>
                </div>
            </div>
        );
    }

    // Now user.id is guaranteed to exist
    const { updateProfileAsync, isUpdatingProfile, } = useUpdateProfile(user.id);
    const calculateBMI = (height: number, weight: number) => {
        if (height && weight) {
            const heightInMeters = height / 100;
            return (weight / (heightInMeters * heightInMeters)).toFixed(1);
        }
        return '';
    };

    const calculateAvgPace = () => {
        // Mock calculation - replace with real logic based on user's runs
        return '5:30'; // Example pace per km
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            // Convert empty strings to null for numeric fields; times are already strings
            const payload: UpdateProfileData = {
                height_cm: formData.height_cm ? Number(formData.height_cm) : null,
                weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
                time_3k: formData.time_3k ? timeToSecs(formData.time_3k) : null,
                time_5k: formData.time_5k ? timeToSecs(formData.time_5k) : null,
                time_10k: formData.time_10k ? timeToSecs(formData.time_10k) : null,
            };

            console.log('Sending payload:', payload); // Debug log

            await updateProfileAsync(payload);
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            height_cm: user?.height_cm?.toString() || '',
            weight_kg: user?.weight_kg?.toString() || '',
            time_3k: user?.time_3k ? secsToTime(user.time_3k) : '',
            time_5k: user?.time_5k ? secsToTime(user.time_5k) : '',
            time_10k: user?.time_10k ? secsToTime(user.time_10k) : '',
        });
        setIsEditing(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // if (!user) {
    //     return (
    //         <div className="flex items-center justify-center h-full">
    //             <div className="text-center">
    //                 <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
    //                 <p className="text-muted-foreground">Please wait while we load your profile</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="container mx-auto p-6 max-w-2xl space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground">Update your personal running details</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-fit">
                    Sign Out
                </Button>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(user.username)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-xl">{user.username}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                    </CardDescription>
                    <Badge variant="secondary" className="w-fit mx-auto mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined March 2024
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isEditing ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Height (cm)</Label>
                                    <p className="text-lg font-medium">{formData.height_cm || 'Not set'}</p>
                                </div>
                                <div>
                                    <Label>Weight (kg)</Label>
                                    <p className="text-lg font-medium">{formData.weight_kg || 'Not set'}</p>
                                </div>
                                <div>
                                    <Label>BMI</Label>
                                    <p className="text-lg font-medium">{calculateBMI(Number(formData.height_cm), Number(formData.weight_kg)) || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label>Avg Pace/km</Label>
                                    <p className="text-lg font-medium">{calculateAvgPace()}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Best Times</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm">3K</Label>
                                        <p className="text-lg font-medium">{formData.time_3k || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm">5K</Label>
                                        <p className="text-lg font-medium">{formData.time_5k || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm">10K</Label>
                                        <p className="text-lg font-medium">{formData.time_10k || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="height">Height (cm)</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        value={formData.height_cm}
                                        onChange={(e) => handleInputChange('height_cm', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={formData.weight_kg}
                                        onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>BMI</Label>
                                    <p className="text-lg font-medium">{calculateBMI(Number(formData.height_cm), Number(formData.weight_kg)) || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label>Avg Pace/km</Label>
                                    <p className="text-lg font-medium">{calculateAvgPace()}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Best Times</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="time_3k" className="text-sm">3K</Label>
                                        <Input
                                            id="time_3k"
                                            placeholder="e.g., 12:30"
                                            value={formData.time_3k}
                                            onChange={(e) => handleInputChange('time_3k', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="time_5k" className="text-sm">5K</Label>
                                        <Input
                                            id="time_5k"
                                            placeholder="e.g., 20:45"
                                            value={formData.time_5k}
                                            onChange={(e) => handleInputChange('time_5k', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="time_10k" className="text-sm">10K</Label>
                                        <Input
                                            id="time_10k"
                                            placeholder="e.g., 42:10"
                                            value={formData.time_10k}
                                            onChange={(e) => handleInputChange('time_10k', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="flex-1" disabled={isUpdatingProfile}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {
                                        isUpdatingProfile
                                            ? "Saving changes... "
                                            : "Save Changes"
                                    }
                                </Button>
                                <Button onClick={handleCancel} variant="outline" className="flex-1">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}