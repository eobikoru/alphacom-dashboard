"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface Product {
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

interface DataPreviewTableProps {
  data: Product[]
}

export function DataPreviewTable({ data }: DataPreviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (₦)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <>
                <TableRow
                  key={product.id}
                  className={
                    product.status === "error" ? "bg-red-50/50" : product.status === "warning" ? "bg-yellow-50/50" : ""
                  }
                >
                  <TableCell>
                    {(product.errors.length > 0 || product.warnings.length > 0) && (
                      <Button variant="ghost" size="sm" onClick={() => toggleRow(product.id)} className="p-0 h-auto">
                        {expandedRows.has(product.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(product.status)}
                      {getStatusBadge(product.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name || <span className="text-muted-foreground italic">No name</span>}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.price > 0 ? (
                      product.price.toLocaleString()
                    ) : (
                      <span className="text-muted-foreground italic">No price</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "default" : "secondary"}>{product.stock}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {product.errors.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {product.errors.length} error{product.errors.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {product.warnings.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
                          {product.warnings.length} warning{product.warnings.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {expandedRows.has(product.id) && (product.errors.length > 0 || product.warnings.length > 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <div className="px-4 py-3 bg-muted/30 space-y-2">
                        {product.errors.length > 0 && (
                          <Alert className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium text-red-800">Errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-red-700">
                                  {product.errors.map((error, index) => (
                                    <li key={index} className="text-sm">
                                      {error}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {product.warnings.length > 0 && (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium text-yellow-800">Warnings:</p>
                                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                  {product.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm">
                                      {warning}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
