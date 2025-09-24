"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BulkUploadDropzone } from "@/components/bulk-upload-dropzone"
import { DataPreviewTable } from "@/components/data-preview-table"
import { toast } from "sonner"
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface UploadedProduct {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: "valid" | "warning" | "error"
  errors: string[]
  warnings: string[]
}

const sampleData = [
  {
    id: "1",
    name: "MacBook Pro 16-inch",
    sku: "MBP-16-001",
    category: "Laptops",
    price: 1200000,
    stock: 5,
    status: "valid" as const,
    errors: [],
    warnings: [],
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    sku: "IP15-PRO-001",
    category: "Smartphones",
    price: 850000,
    stock: 0,
    status: "warning" as const,
    errors: [],
    warnings: ["Low stock quantity"],
  },
  {
    id: "3",
    name: "",
    sku: "INVALID-001",
    category: "Laptops",
    price: 0,
    stock: 10,
    status: "error" as const,
    errors: ["Product name is required", "Price must be greater than 0"],
    warnings: [],
  },
]

export default function BulkUploadPage() {
  const [uploadedData, setUploadedData] = useState<UploadedProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"upload" | "preview" | "processing" | "complete">("upload")

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setCurrentStep("processing")
    setUploadProgress(0)

    try {
      // Simulate file processing
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Simulate data parsing and validation
      setUploadedData(sampleData)
      setCurrentStep("preview")
      toast.success("File processed successfully!")
    } catch (error) {
      toast.error("Failed to process file")
      setCurrentStep("upload")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkImport = async () => {
    setIsProcessing(true)
    setCurrentStep("processing")
    setUploadProgress(0)

    try {
      const validProducts = uploadedData.filter((product) => product.status === "valid")

      // Simulate bulk import
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      setCurrentStep("complete")
      toast.success(`Successfully imported ${validProducts.length} products!`)
    } catch (error) {
      toast.error("Failed to import products")
      setCurrentStep("preview")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    // In a real app, this would download a CSV template
    const csvContent = `name,sku,category,brand,price,comparePrice,stock,description,tags\nMacBook Pro 16-inch,MBP-16-001,Laptops,Apple,1200000,1300000,5,"High-performance laptop","laptop,apple,pro"\niPhone 15 Pro,IP15-PRO-001,Smartphones,Apple,850000,900000,12,"Latest iPhone model","smartphone,apple,5g"`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "product-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Template downloaded successfully!")
  }

  const resetUpload = () => {
    setUploadedData([])
    setCurrentStep("upload")
    setUploadProgress(0)
  }

  const validCount = uploadedData.filter((p) => p.status === "valid").length
  const warningCount = uploadedData.filter((p) => p.status === "warning").length
  const errorCount = uploadedData.filter((p) => p.status === "error").length

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button variant="outline" onClick={downloadTemplate} className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Download Template</span>
          </Button>
          {currentStep !== "upload" && (
            <Button variant="outline" onClick={resetUpload} className="flex items-center space-x-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
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
                    : ["preview", "processing", "complete"].includes(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted"
                }`}
              >
                {["preview", "processing", "complete"].includes(currentStep) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  "1"
                )}
              </div>
              <span className="font-medium">Upload File</span>
            </div>

            <div
              className={`flex items-center space-x-2 ${currentStep === "preview" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "preview"
                    ? "bg-primary text-primary-foreground"
                    : ["processing", "complete"].includes(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted"
                }`}
              >
                {["processing", "complete"].includes(currentStep) ? <CheckCircle className="w-4 h-4" /> : "2"}
              </div>
              <span className="font-medium">Preview & Validate</span>
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
                {currentStep === "complete" ? <CheckCircle className="w-4 h-4" /> : "3"}
              </div>
              <span className="font-medium">Import Products</span>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {currentStep === "processing" && uploadProgress < 100
                  ? "Processing file..."
                  : currentStep === "processing" && uploadProgress === 100
                    ? "Importing products..."
                    : "Processing..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Step */}
      {currentStep === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your File</CardTitle>
                <CardDescription>Upload a CSV or Excel file containing your product data</CardDescription>
              </CardHeader>
              <CardContent>
                <BulkUploadDropzone onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>
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
                  <p className="font-medium">Required columns:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>name</li>
                    <li>sku</li>
                    <li>category</li>
                    <li>price</li>
                    <li>stock</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Make sure your data is clean and follows the template format to avoid import errors.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === "preview" && uploadedData.length > 0 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{uploadedData.length}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                    <p className="text-sm text-muted-foreground">Valid</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>Review and validate your product data before importing</CardDescription>
                </div>
                <Button
                  onClick={handleBulkImport}
                  disabled={validCount === 0 || isProcessing}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import {validCount} Products</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataPreviewTable data={uploadedData} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complete Step */}
      {currentStep === "complete" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Import Complete!</h3>
                <p className="text-muted-foreground">Successfully imported {validCount} products to your catalog.</p>
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
