"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, type File, X, CheckCircle, AlertTriangle, ImageIcon, Box } from "lucide-react"
import { api } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import type { ModelMeta } from "@/lib/types"

interface FileUploaderProps {
  onUploadComplete?: (model: ModelMeta) => void
  onUploadError?: (error: string) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
  error?: string
  result?: ModelMeta
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "model/stl",
  "application/octet-stream", // STL files sometimes have this MIME type
  "text/plain", // OBJ files
  "model/gltf-binary", // GLB files
  "model/gltf+json", // GLTF files
]

const MAX_FILE_SIZE_MB = 100

export function FileUploader({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = MAX_FILE_SIZE_MB,
  className,
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const { setIsUploading, setUploadProgress } = useAppStore()

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    // Check file type by extension since MIME types can be unreliable
    const extension = file.name.toLowerCase().split(".").pop()
    const validExtensions = ["jpg", "jpeg", "png", "webp", "stl", "obj", "glb", "gltf"]

    if (!extension || !validExtensions.includes(extension)) {
      return `Unsupported file type. Supported: ${validExtensions.join(", ")}`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: "uploading",
    }

    setUploadingFiles((prev) => [...prev, uploadingFile])
    setIsUploading(true)

    try {
      const result = await api.uploadFile(file, (progress) => {
        setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, progress } : f)))
        setUploadProgress(progress)
      })

      // Update status to processing
      setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, status: "processing" } : f)))

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark as complete
      setUploadingFiles((prev) => prev.map((f) => (f.file === file ? { ...f, status: "complete", result } : f)))

      onUploadComplete?.(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setUploadingFiles((prev) =>
        prev.map((f) => (f.file === file ? { ...f, status: "error", error: errorMessage } : f)),
      )
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          onUploadError?.(error)
          return
        }
        uploadFile(file)
      })
    },
    [onUploadComplete, onUploadError],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "model/*": [".stl", ".obj", ".glb", ".gltf"],
      "application/octet-stream": [".stl"],
      "text/plain": [".obj"],
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
  })

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop()
    if (["jpg", "jpeg", "png", "webp"].includes(extension || "")) {
      return <ImageIcon className="h-8 w-8" />
    }
    return <Box className="h-8 w-8" />
  }

  const getFileTypeLabel = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop()
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "webp":
        return "Image"
      case "stl":
        return "STL Model"
      case "obj":
        return "OBJ Model"
      case "glb":
      case "gltf":
        return "GLB Model"
      default:
        return "File"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-colors border-2 border-dashed ${
          isDragActive
            ? isDragReject
              ? "border-destructive bg-destructive/5"
              : "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 mb-4 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />

          {isDragActive ? (
            isDragReject ? (
              <div>
                <p className="text-lg font-medium text-destructive mb-2">Invalid file type</p>
                <p className="text-sm text-muted-foreground">
                  Please upload images (JPG, PNG) or 3D models (STL, OBJ, GLB)
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-primary mb-2">Drop files here</p>
                <p className="text-sm text-muted-foreground">Release to upload</p>
              </div>
            )
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">Drag & drop files here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Images: JPG, PNG</Badge>
                <Badge variant="secondary">3D Models: STL, OBJ, GLB</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Max file size: {maxFileSize}MB</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Uploading Files</h3>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getFileIcon(uploadingFile.file.name)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getFileTypeLabel(uploadingFile.file.name)}
                        </Badge>
                        {uploadingFile.status === "complete" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {uploadingFile.status === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeUploadingFile(uploadingFile.file)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{(uploadingFile.file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <span className="capitalize">{uploadingFile.status}</span>
                    </div>

                    {uploadingFile.status === "uploading" && (
                      <Progress value={uploadingFile.progress} className="h-2" />
                    )}

                    {uploadingFile.status === "processing" && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
                        </div>
                        <span className="text-xs">Processing...</span>
                      </div>
                    )}

                    {uploadingFile.status === "error" && uploadingFile.error && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{uploadingFile.error}</AlertDescription>
                      </Alert>
                    )}

                    {uploadingFile.status === "complete" && uploadingFile.result && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                        <p className="text-green-700 dark:text-green-300">
                          Successfully uploaded as "{uploadingFile.result.name}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
