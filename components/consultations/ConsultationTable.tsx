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
import { Archive, ArrowUpDown, Check, CheckCircle, ChevronDown, MoreHorizontal, Trash2, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"  // Add this import
import { ArchiveDialog } from "./ArchiveDialog"

export type ConsultationStatus = 'pending' | 'declined' | 'in-progress' | 'completed' | 'cancelled';

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
    is_archived: boolean;
}

interface ConsultationTableProps {
    consultations: Consultation[],
    onUpdateStatus?: (id: string, status: ConsultationStatus, is_archived?: boolean) => void,
    onArchiveConsultation?: (id: string) => void,
    isLoading?: boolean
}

export function ConsultationTable({ consultations, onUpdateStatus, onArchiveConsultation, isLoading }: ConsultationTableProps) {
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

    const validStatuses = isCoach
        ? ['pending', 'in-progress', 'completed', 'declined', 'cancelled']
        : ['completed', 'cancelled'];  // Updated: Allow non-coaches to select 'completed' or 'cancelled'

    const columns: ColumnDef<Consultation>[] = [
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as ConsultationStatus;
                const consultation = row.original;
                const getBadgeVariant = (status: ConsultationStatus) => {
                    switch (status) {
                        case 'pending': return 'secondary';
                        case 'in-progress': return 'secondary';
                        case 'completed': return 'default';
                        case 'declined': return 'destructive';
                        case 'cancelled': return 'destructive';
                        default: return 'outline';
                    }
                };

                const getBadgeClassName = (status: ConsultationStatus) => {
                    switch (status) {
                        case 'pending': return 'bg-muted border-1 border-gray-200';
                        case 'in-progress': return 'bg-yellow-200 border-1 border-yellow-400';
                        case 'completed': return 'bg-green-600 border-1 border-green-300';
                        case 'declined': return 'bg-red-700 border-1 border-red-500';
                        case 'cancelled': return 'bg-red-700 border-1 border-red-500';
                        default: return 'outline';
                    }
                }

                if (!isCoach && (status === 'pending' || status === 'in-progress')) {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Badge variant={getBadgeVariant(status)} className={`${getBadgeClassName(status)} w-full cursor-pointer`}>
                                    {status}
                                </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => onUpdateStatus && onUpdateStatus(consultation.id, 'cancelled', true)}
                                >
                                    Cancel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                }

                return <Badge variant={getBadgeVariant(status)} className={`${getBadgeClassName(status)} w-full`}>{status}</Badge>;
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
                const canArchive = isCoach && (status === 'cancelled' || status === 'declined' || status === 'completed');

                // if (!isCoach) {
                //     if (status === 'pending' || status === 'in-progress') {
                //         return (
                //             <Button
                //                 variant="destructive"
                //                 size="sm"
                //                 // onClick={() => onUpdateStatus(consultation.id, 'declined')}
                //                 title="Cancel"
                //                 className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                //             >
                //                 <X className="h-4 w-4 text-red-300" />
                //             </Button>
                //         )
                //     }
                // }
                if (!isCoach) {
                    if (status === 'completed' || status === 'declined' || status === 'cancelled') {
                        return (
                            <ArchiveDialog
                                coach_email={consultation.coach_email}
                                consultationDate={consultation.created_at}
                                onConfirm={() => console.log("Confirm archive clicked!")}
                            />
                        )
                    }

                    if (status === 'pending') {
                        return (
                            <Button>
                                test
                            </Button>
                        )
                    }
                }

                return (
                    <div className="flex space-x-2">
                        {isCoach && status === 'pending' && onUpdateStatus && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onUpdateStatus(consultation.id, 'in-progress')}
                                    title="Accept"
                                    className="bg-green-200 border-green-600 border-1"
                                >
                                    <Check className="h-4 w-4 text-green-800" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onUpdateStatus(consultation.id, 'declined', true)}
                                    title="Decline"
                                    className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                                >
                                    <X className="h-4 w-4 text-red-300" />
                                </Button>
                            </>
                        )}
                        {isCoach && status === 'in-progress' && onUpdateStatus && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onUpdateStatus(consultation.id, 'completed', true)}
                                    title="Mark as Complete"
                                    className="bg-green-200 border-green-600 border-1"
                                >
                                    <CheckCircle className="h-4 w-4 text-green-800" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onUpdateStatus(consultation.id, 'declined', true)}
                                    title="Cancel"
                                    className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                                >
                                    <XCircle className="h-4 w-4 text-red-300" />
                                </Button>
                            </>
                        )}
                        {canArchive && onArchiveConsultation && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to archive this consultation?")) {
                                        onArchiveConsultation(consultation.id);
                                    }
                                }}
                                title="Archive"
                                className="bg-red-800 hover:bg-red-600/80 border-red-400 border-1"
                            >
                                <Archive className="h-4 w-4 text-red-300" />
                            </Button>
                        )}
                    </div>
                );
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