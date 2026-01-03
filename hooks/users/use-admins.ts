import { useCallback, useEffect, useState } from "react";

export function useAdmins() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);

    const fetchUsers = useCallback(() => {
        setUsersLoading(true);
        fetch("/api/admin")
            .then((res) => res.json())
            .then((data) => {
                setAdmins(data.data || []);
                setUsersError(null);
            })
            .catch((err) => setUsersError(err.message))
            .finally(() => setUsersLoading(false));
    }, [])

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { admins, usersLoading, usersError, refreshUsers: fetchUsers };
}