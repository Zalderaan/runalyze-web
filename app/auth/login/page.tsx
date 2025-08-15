'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import { LoginForm } from '@/components/login/login-form';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    return (
        <>
            <div className="flex-1 flex flex-col gap-4 h-full w-full justify-center items-center p-4">
                <LoginForm className='w-full max-w-md' />
            </div >
        </>

    );
}