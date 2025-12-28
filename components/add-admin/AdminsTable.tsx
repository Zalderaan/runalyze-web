'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdmins } from "@/hooks/users/use-admins"
import { Loader2, AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/context/user_context"
import { Button } from "../ui/button"
import { DisableAdminConfirmationDialog } from "@/components/add-admin/DisableAdminConfirmationDialog"
import { EnableAdminConfirmationDialog } from "@/components/add-admin/EnableAdminConfirmationDialog"
import { useIsMobile } from "@/hooks/use-mobile"

export function AdminTable() {
    const { user } = useAuth();
    const { admins, usersLoading, usersError, refreshUsers } = useAdmins();
    const isMobile = useIsMobile();

    if (usersLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading users...</p>
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
                    Failed to load users. Please try again later.
                </AlertDescription>
            </Alert>
        )
    }

    if (!admins || admins.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">No users found</h3>
                <p className="text-sm text-gray-600 mt-1">There are no users to display at the moment.</p>
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-0">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Admins</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage and view all admins ({admins.length})
                    </p>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block px-6 pb-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Username</TableHead>
                                <TableHead className="w-[30%]">Email</TableHead>
                                <TableHead className="w-[20%]">Status</TableHead>
                                <TableHead className="w-[25%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((one_user) => (
                                <TableRow key={one_user.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{one_user.username}</TableCell>
                                    <TableCell className="text-gray-600">{one_user.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                one_user.is_active
                                                    ? "inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                    : "inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                                            }
                                        >
                                            {one_user.is_active === true ? "Active" : "Disabled"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {one_user.is_active ? (
                                            <DisableAdminConfirmationDialog
                                                userId={one_user.id}  // Fixed: use the admin's ID
                                                refreshUsers={refreshUsers}  // Fixed: pass function directly
                                                currentUserId={user?.id ?? ""}  // Fixed: current logged-in user
                                            />
                                        ) : (
                                            <EnableAdminConfirmationDialog
                                                userId={one_user.id}  // Fixed: use the admin's ID
                                                refreshUsers={refreshUsers}  // Fixed: pass function directly
                                                currentUserId={user?.id ?? ""}  // Fixed: current logged-in user
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {admins.map((one_user) => (
                        <div key={one_user.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {one_user.username}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate mt-1">
                                        {one_user.email}
                                    </p>
                                </div>
                                <span
                                    className={
                                        one_user.user_role === "admin"
                                            ? "inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ml-3"
                                            : "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ml-3"
                                    }
                                >
                                    {one_user.user_role || 'user'}
                                </span>
                            </div>
                            {
                                one_user.is_active ? (
                                    <DisableAdminConfirmationDialog
                                        userId={one_user.id}  // Fixed: use the admin's ID
                                        refreshUsers={refreshUsers}  // Fixed: pass function directly
                                        currentUserId={user?.id ?? ""}  // Fixed: current logged-in user
                                        buttonClassName={isMobile ? "w-full" : "w-fit"}
                                    />
                                ) : (
                                    <EnableAdminConfirmationDialog
                                        userId={one_user.id}  // Fixed: use the admin's ID
                                        refreshUsers={refreshUsers}  // Fixed: pass function directly
                                        currentUserId={user?.id ?? ""}  // Fixed: current logged-in user
                                        buttonClassName={`bg-blue-500 ${isMobile ? "w-full" : "w-fit"}`}
                                    />
                                )
                            }
                            {/* {one_user.user_role === "admin" ? (
                                <RemoveAdminConfirmationDialog
                                    userId={one_user.id}
                                    isAdmin={one_user.user_role === "admin"}
                                    refreshUsers={refreshUsers}
                                    currentUserId={user?.id ?? ""}
                                    buttonClassName={"w-full"}
                                />
                            ) : <AddAdminConfrimationDialog 
                            userId={one_user.id} 
                            isAdmin={one_user.user_role === "admin"} 
                            refreshUsers={refreshUsers}
                            buttonClassName={"w-full"}
                            />} */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}