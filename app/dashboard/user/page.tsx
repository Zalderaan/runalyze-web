'use client';

import { useAuth } from "@/context/user_context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
    User, 
    Mail, 
    Calendar, 
    Settings, 
    Activity, 
    Trophy, 
    Target,
    Clock,
    Edit3,
    Shield,
    Bell,
    Download
} from "lucide-react";
import { useState } from "react";

interface UserPageProps {
    user: {
        username: string,
        email: string,
        avatar?: string
    }
}

export default function UserPage() {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Mock data for demonstration - replace with real data from your API
    const userStats = {
        totalRuns: 127,
        totalDistance: 892.4,
        averagePace: "6:42",
        lastRun: "3 days ago",
        joinDate: "March 2024",
        streak: 12
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account and running preferences</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="w-fit">
                    Sign Out
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatar} alt={user.username} />
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
                            Joined {userStats.joinDate}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Running Statistics
                        </CardTitle>
                        <CardDescription>Your running journey at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-blue-600">{userStats.totalRuns}</div>
                                <div className="text-sm text-muted-foreground">Total Runs</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-green-600">{userStats.totalDistance}km</div>
                                <div className="text-sm text-muted-foreground">Distance</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-purple-600">{userStats.averagePace}</div>
                                <div className="text-sm text-muted-foreground">Avg Pace</div>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
                                <div className="text-sm text-muted-foreground">Day Streak</div>
                            </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Last run: {userStats.lastRun}
                            </div>
                            <Button variant="ghost" size="sm">
                                View All Activity →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Account Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Account Settings
                        </CardTitle>
                        <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Personal Information
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Privacy & Security
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            Recent Achievements
                        </CardTitle>
                        <CardDescription>Your latest running milestones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">Distance Warrior</div>
                                <div className="text-sm text-muted-foreground">Completed 100km milestone</div>
                            </div>
                            <Badge variant="secondary">New</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">Consistency King</div>
                                <div className="text-sm text-muted-foreground">12-day running streak</div>
                            </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                            View All Achievements
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Activity className="h-6 w-6" />
                            New Analysis
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Target className="h-6 w-6" />
                            Training Plan
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Trophy className="h-6 w-6" />
                            Goals
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Settings className="h-6 w-6" />
                            Preferences
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}