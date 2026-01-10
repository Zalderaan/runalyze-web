'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { signIn, signOut, signUp } from '@/lib/auth/actions'; // Import signIn and signOut
import { decrypt } from '@/lib/auth/session';

export interface User {
    id: string;
    email: string;
    username: string;
    user_role: "admin" | "user" | "owner" | "admin_applicant";
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isSigningUp: boolean;
    isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
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
                // console.log("user from gcuser: ", user);
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

    // sign up function
    const signUpHandler = async (username: string, email: string, password: string) => {
        setIsSigningUp(true);
        try {
            await signUp({ username, email, password });
            const fullUser = await getCurrentUser();
            if (fullUser) {
                setUser(fullUser);
                router.push("/dashboard/home");
            } else {
                throw new Error("Failed to loaduser after signup");
            }
        } catch (error: any) {
            console.error("Sign up error: ", error);
            throw new Error("Sign up failed");
        } finally {
            setIsSigningUp(false);
        }
    }

    // login function
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Call your signIn server action
            const userData = await signIn({ email, password });
            // console.log(userData.user_role);
            if (userData) {
                setUser(userData);
                // console.log('this is user in context: ', userData);
                if (userData.user_role === "admin" || userData.user_role === "owner") {
                    router.push("/dashboard/admin");
                } else if (userData.user_role === "admin_applicant") {
                    router.push("/dashboard/admin-application");
                } else {
                    router.push("/dashboard/home");
                }
            } else {
                throw new Error("Login failed");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            throw error;
            // Handle login error (e.g., display an error message)
        } finally {
            setIsLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        setIsLoggingOut(true);
        try {
            // Call your signOut server action
            await signOut();
            setUser(null);
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        signUp: signUpHandler,
        logout,
        isLoading,
        isSigningUp,
        isLoggingOut
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
    // console.log("gcuser called")
    // const cookie = (typeof window === 'undefined')
    //     ? undefined
    //     : document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];
    const cookie = document.cookie.split('; ').find(row => row.startsWith('session='))?.split('=')[1];

    // console.log("Cookie: ", cookie);
    if (!cookie) return null;
    const session = await decrypt(cookie);
    // console.log("session decrypt ", session);

    if (session?.userId) {
        try {
            const response = await fetch(`/api/user/${session.userId}`);
            if (!response.ok) {
                console.error("Error fetching user details: ", response.statusText);
                return null;
            }
            const data = await response.json();
            // console.log("data from gcuser: ", data);
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
    // console.log("All cookies: ", document.cookie);
}

async function getEachCookie() {
    // console.log("Cookie split result: ", document.cookie.split('; '));
}