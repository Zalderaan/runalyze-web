'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { signIn, signOut } from '@/lib/auth/actions'; // Import signIn and signOut
import { decrypt } from '@/lib/auth/session';
import Cookies from 'js-cookie';

interface User {
    id: string; 
    email: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Load user from session on initial load
    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            try {
                // Call your server action to get the current user
                const user = await getCurrentUser();
                // await getAllCookies();
                // await getEachCookie();
                console.log("user from gcuser: ", user);
                if (user) {
                    setUser(user);
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // login function
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Call your signIn server action
            const userData = await signIn({ email, password });
            if (userData) {
                setUser(userData);
                console.log(user);
                router.push("/dashboard/home");
            } else {
                throw new Error("Login failed");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            // Handle login error (e.g., display an error message)
        } finally {
            setIsLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        setIsLoading(true);
        try {
            // Call your signOut server action
            await signOut();
            setUser(null);
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

async function getCurrentUser() {
    // Example: get session cookie and decrypt
    console.log("gcuser called")
    // const cookie = (typeof window === 'undefined')
    //     ? undefined
    //     : document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
    const cookie = document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];

    console.log("Cookie: ", cookie);
    if (!cookie) return null;
    const session = await decrypt(cookie);
    console.log("session decrypt ", session);

    if (session?.userId) {
        try {
            const response = await fetch(`/api/user/${session.userId}`);
            if (!response.ok){
                console.error("Error fetching user details: ", response.statusText);
                return null;
            }
            const data = await response.json();
            console.log("data from gcuser: ", data);
            return data.user;
        } catch (error) {
            console.error("Error fetching user details: ", error);
            return null;
        }
    }
    return null;
    // return session?.userId ? { id: session.userId } : null;
}

// async function getCurrentUser() {
//     console.log("get curr user called");
    
//     const cookie = Cookies.get('session'); // get session cookie
//     console.log("Cookie: ", cookie);
    
//     if (!cookie) return null;

//     try {
//         const session = await decrypt(cookie); // decrypt cookie
//         console.log("Session: ", session);
//     } catch (error) {
//         console.error("Error occurred in getCurrentUser(): ", error);
//     }

//     return null;
// }

async function getAllCookies() {
    console.log("All cookies: ", document.cookie);
}

async function getEachCookie() {
    console.log("Cookie split result: ", document.cookie.split('; '));
}