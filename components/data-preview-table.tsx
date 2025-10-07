"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface Product {
  [key: string]: any // Dynamic columns
  status: "valid" | "warning" | "error"
  errors: string[]
  warnings: string[]
}

interface DataPreviewTableProps {
  data: Product[]
  headers: string[]
}

export function DataPreviewTable({ data, headers }: DataPreviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    const id = index.toString()
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
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium text-sm w-10"></th>
              <th className="p-3 text-left font-medium text-sm">Status</th>
              {headers.map((header, index) => (
                <th key={index} className="p-3 text-left font-medium text-sm whitespace-nowrap">
                  {header}
                </th>
              ))}
              <th className="p-3 text-left font-medium text-sm">Issues</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, rowIndex) => (
              <>
                <tr
                  key={rowIndex}
                  className={`border-b hover:bg-muted/50 ${
                    product.status === "error" ? "bg-red-50/50" : product.status === "warning" ? "bg-yellow-50/50" : ""
                  }`}
                >
                  <td className="p-3">
                    {(product.errors.length > 0 || product.warnings.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(rowIndex)}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        {expandedRows.has(rowIndex.toString()) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(product.status)}
                      {getStatusBadge(product.status)}
                    </div>
                  </td>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-3 text-sm whitespace-nowrap">
                      {product[header] ? (
                        <span>{product[header]}</span>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3">
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
                  </td>
                </tr>

                {expandedRows.has(rowIndex.toString()) &&
                  (product.errors.length > 0 || product.warnings.length > 0) && (
                    <tr>
                      <td colSpan={headers.length + 3} className="p-0">
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
                      </td>
                    </tr>
                  )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
