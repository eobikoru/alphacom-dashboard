"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BulkUploadDropzoneProps {
  onFileUpload: (file: File) => void
}

export function BulkUploadDropzone({ onFileUpload }: BulkUploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          toast.error("File is too large. Maximum size is 10MB.")
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          toast.error("Invalid file type. Please upload CSV or Excel files only.")
        } else {
          toast.error("File upload failed. Please try again.")
        }
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed cursor-pointer transition-colors min-h-[300px]",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{isDragActive ? "Drop your file here" : "Upload your product file"}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Drag and drop your CSV or Excel file here, or click to browse and select a file from your computer.
            </p>
          </div>
          <Button type="button" variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </Button>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Supported: CSV, XLSX, XLS (Max 10MB)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
