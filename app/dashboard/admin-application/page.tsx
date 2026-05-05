'use client'

import { useState } from 'react'
import { Upload, X, FileText, Loader2, AlertCircle, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { useGetApplication } from '@/hooks/admin-application/use-get-application'
import { useGetSubmitted } from '@/hooks/admin-application/use-get-submited'
import { RoleGuard } from '@/components/RoleGuard'

const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function AdminApplicationPage() {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [fileToDelete, setFileToDelete] = useState<number | null>(null)

    const confirmDelete = async () => {
        if (!fileToDelete) return

        const fileId = fileToDelete
        setFileToDelete(null)
        setDeletingId(fileId)

        const deleteToast = toast.loading('Deleting file...')
        try {
            const response = await fetch(`/api/admin-application/submitted-docs/${fileId}`, {
                method: 'DELETE'
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete file')
            }
            toast.success('File deleted successfully', { id: deleteToast })
            refetch() // Refresh submitted files list
            refetchApp() // Refresh application status
        } catch (error) {
            console.error('Delete error:', error)
            toast.error(error instanceof Error ? error.message : 'Delete failed', { id: deleteToast })
        } finally {
            setDeletingId(null)
        }
    }

    const { application, loading: appLoading, refetch: refetchApp } = useGetApplication()
    const { files: submittedFiles, loading: filesLoading, refetch } = useGetSubmitted(application?.applicationId ?? null)

    const validateFiles = (fileList: File[]) => {
        return fileList.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} exceeds 10MB limit`)
                return false
            }
            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                toast.error(`${file.name} has invalid type`)
                return false
            }
            return true
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const validFiles = validateFiles([e.target.files[0]])
            if (validFiles.length > 0) {
                setFiles(validFiles)
                toast.success(`File added`)
            }
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const validFiles = validateFiles([e.dataTransfer.files[0]])
            if (validFiles.length > 0) {
                setFiles(validFiles)
                toast.success(`File added`)
            }
        }
    }

    const removeFile = (index: number) => {
        const fileName = files[index].name
        setFiles(prev => prev.filter((_, i) => i !== index))
        toast.info(`${fileName} removed`)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('Please select files to upload')
            return
        }

        setUploading(true)
        setUploadProgress(10)
        const uploadToast = toast.loading('Uploading files...')

        try {
            const formData = new FormData()
            files.forEach(file => formData.append('files', file))

            // Simulating upload progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return prev
                    }
                    return prev + 10
                })
            }, 200)

            const response = await fetch('/api/admin-application/submit-forms', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            clearInterval(interval)
            setUploadProgress(100)

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            setTimeout(() => {
                toast.success('Files uploaded successfully!', { id: uploadToast })
                setFiles([])
                setUploadProgress(0)
                refetch() // Refresh submitted files list
                refetchApp() // Refresh application status
            }, 500)

        } catch (error) {
            console.error('Upload error:', error)
            setUploadProgress(0)
            toast.error(error instanceof Error ? error.message : 'Upload failed', { id: uploadToast })
        } finally {
            setTimeout(() => setUploading(false), 500)
        }
    }

    if (appLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const isRejected = application?.status === "rejected";
    const isNeedsInfo = application?.status === "needs_info";
    const isUnderReview = application?.status === "for_review";

    // Show read-only view when application is rejected
    if (isRejected) {
        return (
            <div className='flex flex-col space-y-6 w-full max-w-4xl mx-auto py-8'>
                {/* Stepper */}
                <div className="flex items-center space-x-2 md:space-x-4 justify-center mb-2 text-xs md:text-sm">
                    <div className="flex items-center text-primary font-medium">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">✓</span>
                        Account Created
                    </div>
                    <div className="h-px w-4 md:w-8 bg-primary"></div>
                    <div className="flex items-center text-primary font-medium">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">✓</span>
                        Documents Uploaded
                    </div>
                    <div className="h-px w-4 md:w-8 bg-primary"></div>
                    <div className="flex items-center font-medium text-red-500">
                        <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 border-red-500 text-red-500">3</span>
                        Rejected
                    </div>
                </div>

                <Card className="shadow-sm border-red-500/20 bg-red-50/10 dark:bg-red-950/10">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                            Application Rejected
                        </CardTitle>
                        <CardDescription className="text-base">
                            Unfortunately, your application has not been approved at this time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : submittedFiles.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No documents uploaded yet
                            </p>
                        ) : (
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-2">
                                    {submittedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {file.url && (
                                                <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4" />
                                                        <span>Preview</span>
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
                <div className='flex flex-col gap-1 items-center px-4'>
                    <p className="text-sm font-medium text-center text-red-500">
                        You can reach out to support if you believe this was a mistake.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={["admin_applicant"]}>
            <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto py-8">
                {/* Stepper */}
                <div className="flex items-center space-x-2 md:space-x-4 justify-center mb-2 text-xs md:text-sm">
                    <div className="flex items-center text-primary font-medium">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">✓</span>
                        Account Created
                    </div>
                    <div className="h-px w-4 md:w-8 bg-primary"></div>
                    <div className={`flex items-center font-medium ${isUnderReview ? 'text-primary' : (isNeedsInfo ? 'text-amber-500' : 'text-primary')}`}>
                        <span className={`w-6 h-6 rounded-full ${isUnderReview ? 'bg-primary text-primary-foreground' : 'border-2'} flex items-center justify-center mr-2 ${isUnderReview ? '' : (isNeedsInfo ? 'border-amber-500 text-amber-500' : 'border-primary text-primary')}`}>
                            {isUnderReview ? '✓' : '2'}
                        </span>
                        {isNeedsInfo ? 'Update Documents' : 'Upload Documents'}
                    </div>
                    <div className={`h-px w-4 md:w-8 ${isUnderReview ? 'bg-primary' : (isNeedsInfo ? 'bg-amber-200 dark:bg-amber-900' : 'bg-muted border-b border-border')}`}></div>
                    <div className={`flex items-center font-medium ${isNeedsInfo ? 'text-amber-500' : (isUnderReview ? 'text-primary' : 'text-muted-foreground')}`}>
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${isNeedsInfo ? 'border-amber-500 text-amber-500' : (isUnderReview ? 'border-primary text-primary animate-pulse' : 'border-border text-muted-foreground')}`}>3</span>
                        {isNeedsInfo ? 'Needs Info' : 'In Review'}
                    </div>
                </div>

                <Card className={`shadow-sm ${isNeedsInfo ? 'border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10' : 'border-primary/20'}`}>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            {isNeedsInfo && <AlertCircle className="h-6 w-6 text-amber-500" />}
                            {isNeedsInfo ? 'Additional Information Required' : (isUnderReview ? 'Application Under Review' : 'Coach Registration')}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            {isNeedsInfo ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                    The administration has requested additional documents or corrections. Please upload the required files below to continue your application process.
                                </span>
                            ) : (isUnderReview ? (
                                'We have received your documents and are currently reviewing your application. You can still replace your file below if needed.'
                            ) : (
                                <>
                                    Please upload a <span className="font-semibold text-primary">compiled PDF</span> containing your:
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                                        <li>Coaching experience / resume</li>
                                        <li>Certificates of attended seminars</li>
                                        <li>Medical certificates</li>
                                        <li>Certificate of accreditation or license</li>
                                    </ul>
                                </>
                            ))}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Show previously uploaded files or upload zone */}
                        {submittedFiles.length > 0 ? (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Uploaded Document
                                </h3>
                                <div className="space-y-2 border rounded-md p-3 bg-card">
                                    {submittedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {file.url && (
                                                    <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Preview</span>
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    onClick={() => setFileToDelete(file.id)}
                                                    disabled={deletingId === file.id}
                                                    title="Delete and replace file"
                                                >
                                                    {deletingId === file.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    If you need to make changes, delete the current file to upload a new one.
                                </p>
                            </div>
                        ) : (
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <label className="cursor-pointer">
                                    <span className="text-primary hover:underline font-medium">
                                        Click to upload
                                    </span>
                                    <span className="text-muted-foreground"> or drag and drop</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm text-muted-foreground mt-2">
                                    PDF, DOC, DOCX up to 10MB
                                </p>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Selected File
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                                        Clear All
                                    </Button>
                                </div>

                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div
                                                key={`${file.name}-${index}`}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFile(index)}
                                                    className="flex-shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <Button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full relative overflow-hidden"
                                    size="lg"
                                >
                                    <div
                                        className="absolute left-0 top-0 h-full bg-white/20 dark:bg-black/20 transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%`, opacity: uploading ? 1 : 0 }}
                                    />
                                    <span className="relative z-10 flex items-center">
                                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
                                    </span>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {isUnderReview && (
                    <div className='flex flex-col gap-1 items-center px-4'>
                        <p className={`text-sm font-medium text-center text-primary`}>
                            Your application is being reviewed. We'll notify you via email once it's processed.
                        </p>
                        <p className='text-sm text-center text-muted-foreground'>
                            Once approved, you will need to log out and log back in to access your coach dashboard.
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={fileToDelete !== null} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete uploaded document?</DialogTitle>
                        <DialogDescription>
                            This will remove you from the for-review list until you've uploaded another document. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </RoleGuard>
    )
}