"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BulkUploadDropzone } from "@/components/bulk-upload-dropzone"
import { toast } from "sonner"
import { useBulkUploadProducts, useDownloadBulkTemplate } from "@/hooks/use-products"
import { ArrowLeft, Download, CheckCircle, AlertTriangle, FileSpreadsheet, RefreshCw, Upload } from "lucide-react"
import Link from "next/link"

export default function BulkUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "complete">("upload")
  const [importedCount, setImportedCount] = useState(0)

  const bulkUploadMutation = useBulkUploadProducts()
  const downloadTemplateMutation = useDownloadBulkTemplate()

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    toast.success(`File "${file.name}" selected. Click "Upload & Import" to proceed.`)
  }

  const handleUploadClick = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file first")
      return
    }

    setCurrentStep("processing")
    setUploadProgress(0)

    try {
      setUploadProgress(20)

      const response = await bulkUploadMutation.mutateAsync(uploadedFile)

      setUploadProgress(100)

      const successCount = response.successful || 0
      setImportedCount(successCount)

      setCurrentStep("complete")

      if (response.failed && response.failed > 0) {
        toast.warning(`${response.failed} products failed to import`)
      }
    } catch (error: any) {
      console.error("[v0] Bulk upload error:", error)
      setCurrentStep("upload")
    }
  }

  const downloadTemplate = () => {
    downloadTemplateMutation.mutate()
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setCurrentStep("upload")
    setUploadProgress(0)
    setImportedCount(0)
  }

  const isProcessing = bulkUploadMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bulk Product Upload</h1>
            <p className="text-muted-foreground">Import multiple products from CSV or Excel files</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={downloadTemplateMutation.isPending}
            className="flex items-center space-x-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            <span>{downloadTemplateMutation.isPending ? "Downloading..." : "Download Template"}</span>
          </Button>
          {currentStep !== "upload" && (
            <Button variant="outline" onClick={resetUpload} className="flex items-center space-x-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center space-x-2 ${currentStep === "upload" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "upload"
                    ? "bg-primary text-primary-foreground"
                    : ["processing", "complete"].includes(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted"
                }`}
              >
                {["processing", "complete"].includes(currentStep) ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              <span className="font-medium">Upload File</span>
            </div>

            <div
              className={`flex items-center space-x-2 ${currentStep === "processing" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "processing"
                    ? "bg-primary text-primary-foreground"
                    : currentStep === "complete"
                      ? "bg-green-500 text-white"
                      : "bg-muted"
                }`}
              >
                {currentStep === "complete" ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <span className="font-medium">Import Products</span>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress < 100 ? "Uploading and processing file..." : "Importing products..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStep === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your File</CardTitle>
                <CardDescription>Upload a CSV or Excel file containing your product data</CardDescription>
              </CardHeader>
              <CardContent>
                <BulkUploadDropzone onFileUpload={handleFileSelect} />
              </CardContent>
            </Card>

            {uploadedFile && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={() => setUploadedFile(null)} disabled={isProcessing}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUploadClick}
                        disabled={isProcessing}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isProcessing ? "Uploading..." : "Upload & Import"}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>File Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)
                  </p>
                  <p>
                    <strong>Maximum file size:</strong> 10MB
                  </p>
                  <p>
                    <strong>Maximum products:</strong> 1,000 per file
                  </p>
                </div>
                <Separator />
                <div className="text-sm space-y-2">
                  <p className="font-medium">Column Mapping:</p>
                  <p className="text-muted-foreground">
                    The system will automatically detect and use all columns from your CSV file. Make sure your column
                    headers match the field names expected by your backend.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Upload a CSV or Excel file with any columns. The first row will be used as column headers, and all data
                will be imported as-is.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {currentStep === "complete" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Import Complete!</h3>
                <p className="text-muted-foreground">Successfully imported {importedCount} products to your catalog.</p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Link href="/products">
                  <Button>View Products</Button>
                </Link>
                <Button variant="outline" onClick={resetUpload}>
                  Import More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
