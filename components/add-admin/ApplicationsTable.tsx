'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useApplications } from "@/hooks/users/use-applications"
import { Loader2, AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { RemoveAdminConfirmationDialog } from "./RemoveAdminConfirmationDialog"
import { AddAdminConfrimationDialog } from "./AddAdminDialog"
import { useAuth } from "@/context/user_context"
import { ViewDocumentsDialog } from "./ViewDocumentsDialog"

const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
        case 'for_review':
            return 'bg-yellow-50 text-yellow-700';
        case 'approved':
            return 'bg-green-50 text-green-700';
        case 'rejected':
            return 'bg-red-50 text-red-700';
        case 'upload_docs':
            return 'bg-blue-50 text-blue-700';
        default:
            return 'bg-gray-50 text-gray-700';
    }
};

const formatStatus = (status: string | null) => {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export function ApplicationsTable() {
    const { user } = useAuth();
    const { applications, usersLoading, usersError, refreshUsers } = useApplications();

    console.log("This is applications: ", applications);

    if (usersLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading applications...</p>
                </div>
            </div>
        )
    }

    if (usersError) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load applications. Please try again later.
                </AlertDescription>
            </Alert>
        )
    }

    if (!applications || applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">No applications found</h3>
                <p className="text-sm text-gray-600 mt-1">There are no admin applications to review.</p>
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-0">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Admin Applications</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Review and manage admin applications ({applications.length})
                    </p>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block px-6 pb-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[20%]">Username</TableHead>
                                <TableHead className="w-[25%]">Email</TableHead>
                                <TableHead className="w-[15%]">Status</TableHead>
                                <TableHead className="w-[15%]">Submitted</TableHead>
                                <TableHead className="w-[25%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((applicant) => (
                                <TableRow key={applicant.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{applicant.username}</TableCell>
                                    <TableCell className="text-gray-600">{applicant.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(applicant.status)}`}
                                        >
                                            {formatStatus(applicant.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {applicant.submittedAt
                                            ? new Date(applicant.submittedAt).toLocaleDateString()
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {applicant.applicationId && (
                                                <ViewDocumentsDialog
                                                    applicationId={applicant.applicationId}
                                                    username={applicant.username}
                                                />
                                            )}
                                            <AddAdminConfrimationDialog
                                                userId={applicant.id}
                                                refreshUsers={refreshUsers}
                                                status={applicant.status!}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {applications.map((applicant) => (
                        <div key={applicant.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {applicant.username}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate mt-1">
                                        {applicant.email}
                                    </p>
                                    {applicant.submittedAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Submitted: {new Date(applicant.submittedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ml-3 ${getStatusBadgeClass(applicant.status)}`}
                                >
                                    {formatStatus(applicant.status)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {applicant.applicationId && (
                                    <ViewDocumentsDialog
                                        applicationId={applicant.applicationId}
                                        username={applicant.username}
                                        buttonClassName="w-full"
                                    />
                                )}
                                <AddAdminConfrimationDialog
                                    userId={applicant.id}
                                    status={applicant.status!}
                                    refreshUsers={refreshUsers}
                                    buttonClassName="w-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}