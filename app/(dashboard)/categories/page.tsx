"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, Trash2, Edit, FolderTree, Package, Upload } from "lucide-react"
import {
  useCategories,
  useCategoryTree,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useSubcategories,
  useCategoryProducts,
} from "@/hooks/use-categories"
import type { Category, CreateCategoryData, CreateSubcategoryData, CategoryTree } from "@/types/category"
import Image from "next/image"
import { CategoryImageUploadModal } from "@/components/category-image-upload-modal"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showProductsDialog, setShowProductsDialog] = useState(false)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("list")

  // Queries
  const { data: categoriesData, isLoading } = useCategories({ page, per_page: 20 })
  const { data: treeData } = useCategoryTree()
  const { data: categoryDetail } = useCategory(selectedCategory?.id || "")
  const { data: subcategories } = useSubcategories(selectedParentId)
  const { data: categoryProducts } = useCategoryProducts({
    category_id: selectedCategory?.id || "",
    page: 1,
    per_page: 10,
  })

  // Mutations
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()
  const createSubcategoryMutation = useCreateSubcategory()

  // Form states
  const [categoryForm, setCategoryForm] = useState<CreateCategoryData>({
    name: "",
    description: "",
    sort_order: 0,
    is_featured: false,
  })

  const [subcategoryForm, setSubcategoryForm] = useState<CreateSubcategoryData>({
    name: "",
    description: "",
    sort_order: 0,
  })

  const handleCreateCategory = () => {
    createCategoryMutation.mutate(categoryForm, {
      onSuccess: () => {
        setShowAddDialog(false)
        setCategoryForm({
          name: "",
          description: "",
          sort_order: 0,
          is_featured: false,
        })
      },
    })
  }

  const handleCreateSubcategory = () => {
    if (!selectedParentId) return
    createSubcategoryMutation.mutate(
      { parentId: selectedParentId, data: subcategoryForm },
      {
        onSuccess: () => {
          setShowAddSubcategoryDialog(false)
          setSubcategoryForm({
            name: "",
            description: "",
            sort_order: 0,
          })
          setSelectedParentId("")
        },
      },
    )
  }

  const handleUpdateCategory = () => {
    if (!selectedCategory) return
    updateCategoryMutation.mutate(
      {
        categoryId: selectedCategory.id,
        data: categoryForm,
      },
      {
        onSuccess: () => {
          setShowEditDialog(false)
          setSelectedCategory(null)
          setCategoryForm({
            name: "",
            description: "",
            sort_order: 0,
            is_featured: false,
          })
        },
      },
    )
  }

  const handleDeleteCategory = () => {
    if (!selectedCategory) return
    deleteCategoryMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
        setSelectedCategory(null)
      },
    })
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      sort_order: category.sort_order,
      is_featured: category.is_featured,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
      meta_keywords: category.meta_keywords,
    })
    setShowEditDialog(true)
  }

  const filteredCategories = categoriesData?.data.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories and subcategories</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="tree">Tree View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories && filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.image_url ? (
                          <Image
                            src={category.image_url || "/placeholder.svg"}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {category.level}</Badge>
                      </TableCell>
                      <TableCell>{category.product_count}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.is_featured && <Badge variant="secondary">Featured</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowViewDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowImageUploadModal(true)
                            }}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedParentId(category.id)
                              setShowAddSubcategoryDialog(true)
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowProductsDialog(true)
                            }}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {categoriesData && categoriesData.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {categoriesData.pages} ({categoriesData.total} total categories)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(categoriesData.pages, p + 1))}
                  disabled={page === categoriesData.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <div className="border rounded-lg p-6">
            {treeData?.data.map((category) => (
              <CategoryTreeNode key={category.id} category={category} level={0} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new main category for your products</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={categoryForm.description || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={categoryForm.is_featured}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Featured Category</Label>
            </div>
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={categoryForm.meta_title || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, meta_title: e.target.value })}
                placeholder="SEO meta title"
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={categoryForm.meta_description || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, meta_description: e.target.value })}
                placeholder="SEO meta description"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={showAddSubcategoryDialog} onOpenChange={setShowAddSubcategoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
            <DialogDescription>Create a new subcategory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sub_name">Name *</Label>
              <Input
                id="sub_name"
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                placeholder="Subcategory name"
              />
            </div>
            <div>
              <Label htmlFor="sub_description">Description</Label>
              <Textarea
                id="sub_description"
                value={subcategoryForm.description || ""}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                placeholder="Subcategory description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="sub_sort_order">Sort Order</Label>
              <Input
                id="sub_sort_order"
                type="number"
                value={subcategoryForm.sort_order}
                onChange={(e) =>
                  setSubcategoryForm({
                    ...subcategoryForm,
                    sort_order: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubcategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubcategory} disabled={createSubcategoryMutation.isPending}>
              {createSubcategoryMutation.isPending ? "Creating..." : "Create Subcategory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {categoryDetail && (
            <div className="space-y-4">
              {categoryDetail.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={categoryDetail.image_url || "/placeholder.svg"}
                    alt={categoryDetail.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{categoryDetail.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <p className="font-medium">Level {categoryDetail.level}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product Count</Label>
                  <p className="font-medium">{categoryDetail.product_count}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={categoryDetail.is_active ? "default" : "secondary"}>
                    {categoryDetail.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Featured</Label>
                  <Badge variant={categoryDetail.is_featured ? "default" : "secondary"}>
                    {categoryDetail.is_featured ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              {categoryDetail.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{categoryDetail.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Name *</Label>
              <Input
                id="edit_name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={categoryForm.description || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_featured"
                checked={categoryForm.is_featured}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_featured: checked })}
              />
              <Label htmlFor="edit_is_featured">Featured Category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Products Dialog */}
      <Dialog open={showProductsDialog} onOpenChange={setShowProductsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Products in {selectedCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {categoryProducts?.data && categoryProducts.data.length > 0 ? (
              <div className="space-y-2">
                {categoryProducts.data.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url || "/placeholder.svg"}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.price}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock_available}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No products in this category</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dedicated Image Upload Modal */}
      <CategoryImageUploadModal
        open={showImageUploadModal}
        onOpenChange={setShowImageUploadModal}
        categoryId={selectedCategory?.id || ""}
        categoryName={selectedCategory?.name || ""}
        currentImageUrl={selectedCategory?.image_url}
      />
    </div>
  )
}

function CategoryTreeNode({ category, level }: { category: CategoryTree; level: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {category.children && category.children.length > 0 && <FolderTree className="w-4 h-4 text-muted-foreground" />}
        <span className="font-medium">{category.name}</span>
        <Badge variant="outline" className="ml-2">
          {category.product_count} products
        </Badge>
        {category.is_featured && <Badge variant="secondary">Featured</Badge>}
      </div>
      {expanded &&
        category.children?.map((child) => <CategoryTreeNode key={child.id} category={child} level={level + 1} />)}
    </div>
  )
}
