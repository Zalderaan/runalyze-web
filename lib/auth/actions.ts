import { createSession, deleteSession, decrypt } from '@/lib/auth/session';
import { LoginUser, RegisterUser, User } from '../definitions';
import { redirect } from 'next/navigation';
// import { cookies } from 'next/headers';

export async function signIn({ email, password }: LoginUser) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Invalid credentials');
    const { userId, username } = await res.json();
    await createSession(userId);
    console.log("user details: ", userId, email, username);
    return { id: userId, email: email, username: username };
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

// export async function getCurrentUser() {
//     const cookieStore = await cookies();
//     const cookie = cookieStore.get("session")?.value;


//     if (!cookie) return null;

//     try {
//         const session = await decrypt(cookie);

//         if (session?.userId) {
//             const res = await fetch(`/api/user/${session.userId}`); // Replace with your API endpoint
//             if (!res.ok) {
//                 console.error("Error fetching user details: ", res.statusText);
//                 return null;
//             }
//             const data = await res.json();
//             console.log("Data from getCurrentUser: ", data);
//             return data.user;
//         }
//     } catch (error) {
//         console.error("Error fetching user details: ", error);
//         return null;
//     }
//     return null;
// }