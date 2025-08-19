'use client';
import { LoginForm } from '@/components/login/login-form';

export default function LoginPage() {
    return (
        <>
            <div className="flex-1 flex flex-col gap-4 h-full w-full justify-center items-center p-4">
                <LoginForm className='w-full max-w-md' />
            </div >
        </>

    );
}