import { createSession, deleteSession } from '@/lib/auth/session';
import { LoginUser, RegisterUser } from '../definitions';
// import { cookies } from 'next/headers';

export async function signIn({ email, password }: LoginUser) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Invalid credentials');
    const { userId, username, user_role, is_active } = await res.json();
    await createSession(userId, user_role) ;
    // console.log("user details: ", userId, email, username, user_role);
    return { 
        id: userId, 
        email: email, 
        username: username,
        user_role: user_role,
        is_active: is_active
    };
}

export async function signUp({ username, email, password }: RegisterUser) {
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) throw new Error('Sign up failed');
    const { userId, user_role } = await res.json();
    await createSession(userId, user_role);
    return { id: userId };
}

export async function signOut() {
    // console.log("logout accessed!")
    await deleteSession();
}
