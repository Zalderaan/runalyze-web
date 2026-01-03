// ! OWNER ROLE ONLY

import { Application } from "@/hooks/users/use-applications";

interface recentApplicationsProps {
    applications: Application[]
}

export function RecentApplications({ applications }: recentApplicationsProps) {
    console.log("recent applications in RecentApplications(): ", applications)

    if (applications.length === 0) {
        return (
            <div className="text-sm text-gray-500">
                No recent applications.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {applications.map((app) => (
                <div key={app.applicationId ?? app.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{app.email}</span>
                        <span className="text-xs text-gray-600">{app.username}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-xs px-2 py-1 rounded ${app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {app.status ?? 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}