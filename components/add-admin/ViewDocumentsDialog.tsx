'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, ExternalLink, Loader2, Eye } from 'lucide-react'
import { useGetSubmitted } from '@/hooks/admin-application/use-get-submited'

interface ViewDocumentsDialogProps {
    applicationId: number
    username: string
    buttonClassName?: string
}

export function ViewDocumentsDialog({
    applicationId,
    username,
    buttonClassName
}: ViewDocumentsDialogProps) {
    const [open, setOpen] = useState(false)
    const { files, loading } = useGetSubmitted(open ? applicationId : null)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={buttonClassName}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Documents
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Application Documents</DialogTitle>
                    <DialogDescription>
                        Documents submitted by {username}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : files.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No documents uploaded
                    </p>
                ) : (
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="text-sm font-medium truncate max-w-[200px]">
                                                {file.fileName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {file.url && (
                                        <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}