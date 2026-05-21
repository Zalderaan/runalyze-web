'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/user_context';
import { useUpdateProfile, UpdateProfileData } from '@/hooks/users/user-specific/use-update-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Activity, Ruler, Timer, ArrowRight, SkipForward, CheckCircle2 } from 'lucide-react';

const secsToTime = (totalSeconds: number): string => {
    if (totalSeconds <= 0 || !Number.isInteger(totalSeconds)) return '';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const timeToSecs = (timeString: string): number | null => {
    if (!timeString.trim()) return null;
    const parts = timeString.split(':');
    if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) return null;
        return minutes * 60 + seconds;
    } else if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
        return hours * 3600 + minutes * 60 + seconds;
    }
    return null;
};

const calculateBMI = (height: number, weight: number): string => {
    if (!height || !weight || height <= 0 || weight <= 0) return '';
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
};

const getBMILabel = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-500' };
};

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        height_cm: user?.height_cm?.toString() || '',
        weight_kg: user?.weight_kg?.toString() || '',
        time_3k: user?.time_3k ? secsToTime(user.time_3k) : '',
        time_5k: user?.time_5k ? secsToTime(user.time_5k) : '',
        time_10k: user?.time_10k ? secsToTime(user.time_10k) : '',
    });

    const { updateProfileAsync, isUpdatingProfile } = useUpdateProfile(user?.id ?? "");

    // Guard: must have user to call hook
    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm text-slate-500">Loading your profile…</p>
                </div>
            </div>
        );
    }

    const bmi = calculateBMI(Number(formData.height_cm), Number(formData.weight_kg));
    const bmiNum = parseFloat(bmi);
    const bmiInfo = bmi && !isNaN(bmiNum) ? getBMILabel(bmiNum) : null;

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const payload: UpdateProfileData = {
            height_cm: formData.height_cm ? Number(formData.height_cm) : null,
            weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
            time_3k: formData.time_3k ? timeToSecs(formData.time_3k) : null,
            time_5k: formData.time_5k ? timeToSecs(formData.time_5k) : null,
            time_10k: formData.time_10k ? timeToSecs(formData.time_10k) : null,
        };

        try {
            await updateProfileAsync(payload);
            toast.success(
                <div className="flex flex-col">
                    <strong>Profile saved!</strong>
                    <span className="text-xs text-gray-500">{"You're all set to start analysing your runs."}</span>
                </div>,
                { duration: 4000 }
            );
            router.push('/dashboard/home');
        } catch {
            toast.error('Failed to save profile. You can update it later in Settings.');
            router.push('/dashboard/home');
        }
    };

    const handleSkip = () => {
        router.push('/dashboard/home');
    };

    const hasAnyInput = Object.values(formData).some(v => v.trim() !== '');

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            {/* Card */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="px-8 pt-8 pb-10 space-y-7">

                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Profile Setup</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome to Runalyze, {user.username}! 👋</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Your stats help us give you more accurate analysis and personalised drill recommendations.
                            You can always update these later in your profile settings.
                        </p>
                    </div>

                    {/* Physical Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Physical Info</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="height_cm" className="text-sm text-slate-600">Height (cm)</Label>
                                <Input
                                    id="height_cm"
                                    type="number"
                                    placeholder="e.g. 175"
                                    min={100}
                                    max={250}
                                    value={formData.height_cm}
                                    onChange={(e) => handleChange('height_cm', e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="weight_kg" className="text-sm text-slate-600">Weight (kg)</Label>
                                <Input
                                    id="weight_kg"
                                    type="number"
                                    placeholder="e.g. 70"
                                    min={30}
                                    max={300}
                                    value={formData.weight_kg}
                                    onChange={(e) => handleChange('weight_kg', e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* BMI preview */}
                        {bmi && bmiInfo && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-600">
                                    BMI: <span className="font-semibold text-slate-800">{bmi}</span>
                                    {' '}—{' '}
                                    <span className={`font-medium ${bmiInfo.color}`}>{bmiInfo.label}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Race Times Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Personal Best Times</span>
                        </div>
                        <p className="text-xs text-slate-400 -mt-2">Use MM:SS format (e.g. 24:30) or HH:MM:SS for longer runs</p>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="time_3k" className="text-sm text-slate-600">3K</Label>
                                <Input
                                    id="time_3k"
                                    placeholder="12:30"
                                    value={formData.time_3k}
                                    onChange={(e) => handleChange('time_3k', e.target.value)}
                                    className="h-11 text-center font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="time_5k" className="text-sm text-slate-600">5K</Label>
                                <Input
                                    id="time_5k"
                                    placeholder="24:30"
                                    value={formData.time_5k}
                                    onChange={(e) => handleChange('time_5k', e.target.value)}
                                    className="h-11 text-center font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="time_10k" className="text-sm text-slate-600">10K</Label>
                                <Input
                                    id="time_10k"
                                    placeholder="51:00"
                                    value={formData.time_10k}
                                    onChange={(e) => handleChange('time_10k', e.target.value)}
                                    className="h-11 text-center font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-1">
                        <Button
                            onClick={handleSave}
                            disabled={isUpdatingProfile}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        >
                            {isUpdatingProfile ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white mr-2" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    {hasAnyInput ? 'Save & Continue' : 'Continue'}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isUpdatingProfile}
                            className="w-full h-10 text-slate-400 hover:text-slate-600 text-sm"
                        >
                            <SkipForward className="h-4 w-4 mr-1.5" />
                            Skip for now
                        </Button>
                    </div>

                </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
                You can update your stats anytime from <span className="font-medium text-slate-500">Profile Settings</span>.
            </p>
        </div>
    );
}
