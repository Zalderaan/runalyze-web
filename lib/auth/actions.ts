import { createSession, deleteSession, decrypt } from '@/lib/auth/session';
import { LoginUser, RegisterUser, User } from '../definitions';
import { redirect } from 'next/navigation';

export async function signIn({ email, password }: LoginUser) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Invalid credentials');
    const { userId } = await res.json();
    await createSession(userId);
    console.log(userId)
    return { id: userId };
}

export async function signUp({ username, email, password }: RegisterUser) {
    const res = await fetch('api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) throw new Error('Sign up failed');
    const { userId } = await res.json();
    await createSession(userId);
    return { id: userId };
}

export async function signOut() {
    console.log("logout accessed!")
    await deleteSession();
}

export async function getCurrentUser() {
    // Example: get session cookie and decrypt
    const cookie = (typeof window === 'undefined')
        ? undefined
        : document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
    if (!cookie) return null;
    const session = await decrypt(cookie);
    return session?.userId ? { id: session.userId } : null;
}