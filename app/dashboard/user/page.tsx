'use client';

import { useAuth } from "@/context/user_context";

interface UserPageProps {
    user: {
        username: string,
        email: string,
        avatar?: string
    }
}

// export default function UserPage({...props} : UserPageProps) {
export default function UserPage() {

    const { user } = useAuth();
    return (
        <div className="flex flex-col justify-center items-center gap-4 w-full h-full">
            <p>{user?.username}</p>
            <p>{user?.email}</p>            
        </div>
    );
}