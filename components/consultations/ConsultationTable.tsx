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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react"
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

export type ConsultationStatus = 'pending' | 'declined' | 'in-progress' | 'completed' | 'accepted' | 'cancelled';

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
}

interface ConsultationTableProps {
    consultations: Consultation[],
    onUpdateStatus?: (id: string, status: ConsultationStatus) => void,
    isLoading?: boolean
}

export function ConsultationTable({ consultations, onUpdateStatus, isLoading }: ConsultationTableProps) {
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
        ? ['pending', 'accepted', 'in-progress', 'completed', 'declined', 'cancelled']
        : ['completed', 'cancelled'];  // Updated: Allow non-coaches to select 'completed' or 'cancelled'

    const columns: ColumnDef<Consultation>[] = [
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as ConsultationStatus;
                const getBadgeVariant = (status: ConsultationStatus) => {
                    switch (status) {
                        case 'pending': return 'secondary';
                        case 'accepted': return 'default';
                        case 'in-progress': return 'secondary';
                        case 'completed': return 'default';
                        case 'declined': return 'destructive';
                        case 'cancelled': return 'destructive';
                        default: return 'outline';
                    }
                };

                // Always render dropdown if onUpdateStatus is provided (role-based options via validStatuses)
                if (onUpdateStatus) {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-full justify-start">
                                    <Badge variant={getBadgeVariant(status)}>{status}</Badge>
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <RadioGroup
                                    value={status}
                                    onValueChange={(newStatus: ConsultationStatus) => {
                                        onUpdateStatus(row.original.id, newStatus);
                                    }}
                                >
                                    {validStatuses.map((validStatus) => (
                                        <div key={validStatus} className="flex items-center space-x-2 p-2">
                                            <RadioGroupItem value={validStatus} id={validStatus} />
                                            <label htmlFor={validStatus} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {validStatus}
                                            </label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                } else {
                    // Fallback: Read-only badge if no update callback (shouldn't happen in your setup)
                    return <Badge variant={getBadgeVariant(status)}>{status}</Badge>;
                }
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
        // {    
        // TODO: onDeleteConsultations
        //     id: "actions",
        //     enableHiding: false,
        //     cell: ({ row }) => {
        //         const consultation = row.original
        //         const canDelete = isCoach && (consultation.status === 'cancelled' || consultation.status === 'declined');
        //         return (
        //             <DropdownMenu>
        //                 <DropdownMenuTrigger asChild>
        //                     <Button variant="ghost" className="h-8 w-8 p-0">
        //                         <span className="sr-only">Open menu</span>
        //                         <MoreHorizontal className="h-4 w-4" />
        //                     </Button>
        //                 </DropdownMenuTrigger>
        //                 <DropdownMenuContent align="end">
        //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
        //                     <DropdownMenuItem onClick={() => navigator.clipboard.writeText(consultation.id)}>
        //                         Copy consultation ID
        //                     </DropdownMenuItem>
        //                     <DropdownMenuSeparator />
        //                     {canDelete && onDeleteConsultation && (
        //                         <DropdownMenuItem
        //                             onClick={() => {
        //                                 if (window.confirm("Are you sure you want to delete this consultation?")) {
        //                                     onDeleteConsultation(consultation.id);
        //                                 }
        //                             }}
        //                             className="text-destructive"
        //                         >
        //                             <Trash2 className="mr-2 h-4 w-4" />
        //                             Delete Consultation
        //                         </DropdownMenuItem>
        //                     )}
        //                 </DropdownMenuContent>
        //             </DropdownMenu>
        //         )
        //     },
        // },
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