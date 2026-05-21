"use client"
import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import { Check, CheckCircle, ChevronDown, X, XCircle, Activity, Clock, Hourglass, Ban, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"  // Add this import
import { useAuth } from "@/context/user_context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"  // Add this import
import { ArchiveDialog } from "./ArchiveDialog"
import { CancelDialog } from "./CancelDialog"

export type ConsultationStatus = 'pending' | 'declined' | 'in-progress' | 'completed' | 'cancelled' | 'cancel-requested' | 'complete-requested';

export interface Consultation {
    id: string;
    user_id: number;
    coach_id: number;
    status: ConsultationStatus
    message: string;
    created_at: string; // ISO date string
    updated_at: string;
    user_email: string;
    coach_email: string;
    hidden_by_user: boolean;
    hidden_by_coach: boolean;
    analysis_id?: number;
    analysis_results?: {
        name: string | null;
    } | null;
    cancel_requested_by?: number | null;
    complete_requested_by?: number | null;
}

interface ConsultationTableProps {
    consultations: Consultation[],
    onUpdateStatus?: (id: string, status: ConsultationStatus) => void,
    onDismiss?: (id: string) => void,
    isLoading?: boolean
}

export function ConsultationTable({ consultations, onUpdateStatus, onDismiss, isLoading }: ConsultationTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({});

    // Assume user role from context or prop (adjust as needed)
    const { user } = useAuth();  // Assuming useAuth provides user.role
    const isCoach = user?.user_role === 'admin';

    // const handleUpdateStatus = (consultation: Consultation) => {
    //     setSelectedConsultation(consultation);
    //     setNewStatus(consultation.status);
    //     setDialogOpen(true);
    // };


    const columns: ColumnDef<Consultation>[] = [
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as ConsultationStatus;
                
                const statusConfig: Record<ConsultationStatus, {
                    label: string;
                    icon: React.ReactNode;
                    bg: string;
                    text: string;
                    border: string;
                    dot?: string;
                }> = {
                    'pending': {
                        label: 'Pending',
                        icon: <Clock className="h-3 w-3" />,
                        bg: 'bg-slate-100',
                        text: 'text-slate-700',
                        border: 'border-slate-300',
                    },
                    'in-progress': {
                        label: 'In Progress',
                        icon: <Hourglass className="h-3 w-3" />,
                        bg: 'bg-amber-50',
                        text: 'text-amber-700',
                        border: 'border-amber-300',
                        dot: 'bg-amber-500',
                    },
                    'cancel-requested': {
                        label: 'Cancel Requested',
                        icon: <AlertTriangle className="h-3 w-3" />,
                        bg: 'bg-orange-50',
                        text: 'text-orange-700',
                        border: 'border-orange-300',
                        dot: 'bg-orange-500',
                    },
                    'complete-requested': {
                        label: 'Completion Requested',
                        icon: <AlertTriangle className="h-3 w-3" />,
                        bg: 'bg-blue-50',
                        text: 'text-blue-700',
                        border: 'border-blue-300',
                        dot: 'bg-blue-500',
                    },
                    'completed': {
                        label: 'Completed',
                        icon: <CheckCircle className="h-3 w-3" />,
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-700',
                        border: 'border-emerald-300',
                    },
                    'declined': {
                        label: 'Declined',
                        icon: <Ban className="h-3 w-3" />,
                        bg: 'bg-red-50',
                        text: 'text-red-600',
                        border: 'border-red-200',
                    },
                    'cancelled': {
                        label: 'Cancelled',
                        icon: <XCircle className="h-3 w-3" />,
                        bg: 'bg-gray-100',
                        text: 'text-gray-500',
                        border: 'border-gray-300',
                    },
                };

                const config = statusConfig[status] || statusConfig['pending'];

                return (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}>
                        {config.dot && (
                            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${config.dot}`} />
                        )}
                        {config.icon}
                        {config.label}
                    </div>
                );
            },
        },
        // In columns:
        {
            accessorKey: "email",
            header: isCoach ? "Sender Email" : "Email",
            cell: ({ row }) => {
                const consultation = row.original;
                const senderEmail = isCoach ? consultation.user_email : consultation.coach_email;
                return <div>{senderEmail}</div>;
            },
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => {
                const message = row.getValue("message") as string;
                const truncated = message.length > 50 ? `${message.substring(0, 50)}...` : message;
                return (
                    <div className="space-y-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="truncate max-w-xs cursor-help">
                                        {truncated}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"  // Default to right; adjust dynamically if needed
                                    className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl p-4 bg-white text-black border rounded shadow-lg"                            >
                                    <p>{message}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {row.original.analysis_id && (
                            <Link href={`/dashboard/history/${row.original.analysis_id}`}>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 mt-1 cursor-pointer w-max space-x-1 max-w-xs truncate">
                                    <Activity className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{row.original.analysis_results?.name || `Analysis #${row.original.analysis_id}`}</span>
                                </Badge>
                            </Link>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                const dateValue = row.getValue("created_at") as string;
                const date = new Date(dateValue);
                return <div>{date.toLocaleString()}</div>;  // Shows date and time, e.g., "1/14/2026, 1:33:43 PM"
            },
        },
        {
            id: "actions",
            enableHiding: false,
            header: "Actions",
            cell: ({ row }) => {
                const consultation = row.original;
                const status = consultation.status;
                const myId = user?.id;
                const iRequestedCancel = consultation.cancel_requested_by != null && String(consultation.cancel_requested_by) === String(myId);
                const iRequestedComplete = consultation.complete_requested_by != null && String(consultation.complete_requested_by) === String(myId);

                // --- PENDING ---
                if (status === 'pending') {
                    if (isCoach) {
                        // Coach: Accept / Decline
                        return (
                            <div className="flex space-x-2">
                                {onUpdateStatus && (
                                    <>
                                        <Button variant="default" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'in-progress')}
                                            title="Accept"
                                            className="bg-green-200 border-green-600 border-1">
                                            <Check className="h-4 w-4 text-green-800" />
                                        </Button>
                                        <Button variant="destructive" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'declined')}
                                            title="Decline"
                                            className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1">
                                            <X className="h-4 w-4 text-red-300" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        );
                    } else {
                        // User: Cancel freely
                        return (
                            <div className="flex space-x-2">
                                <CancelDialog
                                    coachEmail={consultation.coach_email}
                                    consultationDate={consultation.created_at}
                                    onConfirm={() => onUpdateStatus && onUpdateStatus(consultation.id, 'cancelled')}
                                />
                            </div>
                        );
                    }
                }

                // --- IN-PROGRESS ---
                if (status === 'in-progress') {
                    return (
                        <div className="flex space-x-2">
                            {onUpdateStatus && (
                                <>
                                    <Button variant="outline" size="sm"
                                        onClick={() => onUpdateStatus(consultation.id, 'complete-requested')}
                                        title="Request Completion"
                                        className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                                    </Button>
                                    <Button variant="outline" size="sm"
                                        onClick={() => onUpdateStatus(consultation.id, 'cancel-requested')}
                                        title="Request Cancellation"
                                        className="text-orange-600 border-orange-300 hover:bg-orange-50">
                                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                }

                // --- CANCEL-REQUESTED ---
                if (status === 'cancel-requested') {
                    if (iRequestedCancel) {
                        return (
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                                <Clock className="h-3 w-3 mr-1" /> Waiting for approval...
                            </Badge>
                        );
                    } else {
                        return (
                            <div className="flex space-x-2">
                                {onUpdateStatus && (
                                    <>
                                        <Button variant="default" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'cancelled')}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs">
                                            Approve Cancel
                                        </Button>
                                        <Button variant="outline" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'in-progress')}
                                            className="text-gray-700 border-gray-300 text-xs">
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        );
                    }
                }

                // --- COMPLETE-REQUESTED ---
                if (status === 'complete-requested') {
                    if (iRequestedComplete) {
                        return (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                                <Clock className="h-3 w-3 mr-1" /> Waiting for confirmation...
                            </Badge>
                        );
                    } else {
                        return (
                            <div className="flex space-x-2">
                                {onUpdateStatus && (
                                    <>
                                        <Button variant="default" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'completed')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                                            Confirm Complete
                                        </Button>
                                        <Button variant="outline" size="sm"
                                            onClick={() => onUpdateStatus(consultation.id, 'in-progress')}
                                            className="text-gray-700 border-gray-300 text-xs">
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        );
                    }
                }

                // --- TERMINAL STATES: completed, cancelled, declined ---
                if (status === 'completed' || status === 'cancelled' || status === 'declined') {
                    return (
                        <div className="flex space-x-2">
                            {onDismiss && (
                                <ArchiveDialog
                                    coach_email={consultation.coach_email}
                                    consultationDate={consultation.created_at}
                                    onConfirm={() => onDismiss(consultation.id)}
                                />
                            )}
                        </div>
                    );
                }
                return null;
            },
        }
    ]

    const table = useReactTable({
        data: consultations,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter by email..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                                </TableRow>
                            ))
                        ) :

                            table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No consultations found.
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}