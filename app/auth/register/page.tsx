'use client';
import { RegisterForm } from '@/components/register/register-form';

export default function RegisterPage() {
    return (
        <div className="flex flex-col gap-4 h-full w-full justify-center items-center p-4">
            <RegisterForm className="w-full max-w-md"/>
        </div>
    );
}