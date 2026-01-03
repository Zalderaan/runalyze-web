'use client'

import { useState } from 'react'
import { Upload, X, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    const [dragActive, setDragActive] = useState(false)

    const { application, loading: appLoading } = useGetApplication()
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
            // Prevent duplicates
            if (files.some(f => f.name === file.name && f.size === file.size)) {
                toast.error(`${file.name} already added`)
                return false
            }
            return true
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const validFiles = validateFiles(Array.from(e.target.files))
            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles])
                toast.success(`${validFiles.length} file(s) added`)
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

        if (e.dataTransfer.files) {
            const validFiles = validateFiles(Array.from(e.dataTransfer.files))
            if (validFiles.length > 0) {
                setFiles(prev => [...prev, ...validFiles])
                toast.success(`${validFiles.length} file(s) added`)
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
        const uploadToast = toast.loading('Uploading files...')

        try {
            const formData = new FormData()
            files.forEach(file => formData.append('files', file))

            const response = await fetch('/api/admin-application/submit-forms', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            toast.success('Files uploaded successfully!', { id: uploadToast })
            setFiles([])
            refetch() // Refresh submitted files list
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error instanceof Error ? error.message : 'Upload failed', { id: uploadToast })
        } finally {
            setUploading(false)
        }
    }

    if (appLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Show read-only view when application is under review
    if (application?.status === "for_review") {
        return (
            <div className='flex flex-col space-y-2 w-full'>
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Documents</CardTitle>
                        <CardDescription>
                            Application status: Under Review
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
                                                <Button variant="ghost" size="icon" asChild>
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
                    </CardContent>
                </Card>
                <p className='text-xs text-center text-muted-foreground'>
                    Your application is being reviewed. We&apos;ll notify you once it&apos;s processed.
                </p>
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={["admin_applicant"]}>
            <div className="flex flex-col space-y-4 w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Application</CardTitle>
                        <CardDescription>Upload and manage application documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Show previously uploaded files */}
                        {submittedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Previously Uploaded ({submittedFiles.length})
                                </h3>
                                <ScrollArea className="h-[120px] rounded-md border p-3">
                                    <div className="space-y-2">
                                        {submittedFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate">{file.fileName}</span>
                                                </div>
                                                {file.url && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

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
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-muted-foreground mt-2">
                                PDF, DOC, DOCX up to 10MB
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Selected Files ({files.length})
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
                                    className="w-full"
                                    size="lg"
                                >
                                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {uploading ? 'Uploading...' : 'Upload Files'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RoleGuard>
    )
}