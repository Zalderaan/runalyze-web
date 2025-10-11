import { useCallback, useEffect, useState } from "react";

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);

    const fetchUsers = useCallback(() => {
        setUsersLoading(true);
        fetch("/api/user")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.user || []);
                setUsersError(null);
            })
            .catch((err) => setUsersError(err.message))
            .finally(() => setUsersLoading(false));
    }, [])

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, usersLoading, usersError, refreshUsers: fetchUsers };
}