import { useCallback, useEffect, useState } from "react";

export interface Application {
    id: string;
    email: string;
    username: string;
    applicationId: number | null;
    submittedAt: string | null;
    status: string | null;
    is_active: boolean;
}

export function useApplications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [applicationsError, setApplicationsError] = useState<string | null>(null);

    const fetchApplications = useCallback(() => {
        setApplicationsLoading(true);
        fetch("/api/admin-application")
            .then((res) => res.json())
            .then((data) => {
                // Transform nested data to flat structure
                const transformed = (data.data || []).map((user: any) => {
                    const application = user.admin_applications?.[0] || null;
                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        applicationId: application?.application_id ?? null,
                        submittedAt: application?.submitted_at ?? null,
                        status: application?.status ?? null,
                        isActive: user.is_active ?? true,
                    };
                });
                setApplications(transformed);
                setApplicationsError(null);
            })
            .catch((err) => setApplicationsError(err.message))
            .finally(() => setApplicationsLoading(false));
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return { applications, applicationsLoading, applicationsError, refreshApplications: fetchApplications };
}