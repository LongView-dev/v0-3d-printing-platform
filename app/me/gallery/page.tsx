"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { GalleryFilters } from "@/components/gallery-filters"
import { GalleryGrid } from "@/components/gallery-grid"
import { BulkActionsBar } from "@/components/bulk-actions-bar"
import { ModelEditDialog } from "@/components/model-edit-dialog"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { api } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import Link from "next/link"

export default function MyGalleryPage() {
  const { filters, sortBy, searchQuery, user, selectedModels } = useAppStore()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showSelection, setShowSelection] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelMeta | null>(null)
  const [sharingModel, setSharingModel] = useState<ModelMeta | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      window.location.href = "/gallery"
    }
  }, [user])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-models", filters, sortBy, searchQuery],
    queryFn: () =>
      api.getModels({
        search: searchQuery || undefined,
        tags: filters.tags,
        fileType: filters.fileType,
        sortBy,
        // In a real app, this would filter by user ID
      }),
    enabled: !!user,
  })

  const handleModelDownload = (model: ModelMeta) => {
    console.log("Download model:", model.name)
    // Implement download logic
  }

  const handleModelShare = (model: ModelMeta) => {
    setSharingModel(model)
  }

  const handleModelEdit = (model: ModelMeta) => {
    setEditingModel(model)
  }

  const handleSaveEdit = async (updates: Partial<ModelMeta>) => {
    if (!editingModel) return

    setIsSaving(true)
    try {
      await api.updateModel(editingModel.id, updates)
      setEditingModel(null)
      refetch()
      console.log("[v0] Model updated successfully")
    } catch (error) {
      console.error("[v0] Failed to update model:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkDelete = async (modelIds: string[]) => {
    try {
      await Promise.all(modelIds.map((id) => api.deleteModel(id)))
      refetch()
      console.log("[v0] Bulk delete completed")
    } catch (error) {
      console.error("[v0] Failed to delete models:", error)
    }
  }

  const handleBulkTag = async (modelIds: string[], tags: string[]) => {
    try {
      await Promise.all(
        modelIds.map((id) => {
          const model = data?.models.find((m) => m.id === id)
          if (model) {
            return api.updateModel(id, { tags })
          }
        }),
      )
      refetch()
      console.log("[v0] Bulk tag update completed")
    } catch (error) {
      console.error("[v0] Failed to update tags:", error)
    }
  }

  const handleBulkDownload = (modelIds: string[]) => {
    console.log("[v0] Bulk download:", modelIds)
    // Implement bulk download logic
  }

  if (!user) {
    return null // Will redirect
  }

  const myModels = data?.models || []
  const selectedModelObjects = myModels.filter((m) => selectedModels.includes(m.id))
  const totalModels = myModels.length
  const printableModels = myModels.filter((m) => m.printable === "printable").length
  const generatedModels = myModels.filter((m) => m.source === "nano-banana").length

  return (
    <div className="min-h-screen">
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedModels={selectedModelObjects}
        onBulkDelete={handleBulkDelete}
        onBulkTag={handleBulkTag}
        onBulkDownload={handleBulkDownload}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Models</h1>
            <p className="text-muted-foreground mt-1">Manage your personal 3D model collection</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSelection(!showSelection)}>
              <Settings className="h-4 w-4 mr-2" />
              {showSelection ? "Done" : "Manage"}
            </Button>
            <Button asChild>
              <Link href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold">{totalModels}</div>
            <div className="text-sm text-muted-foreground">Total Models</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-green-600">{printableModels}</div>
            <div className="text-sm text-muted-foreground">Print Ready</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-blue-600">{generatedModels}</div>
            <div className="text-sm text-muted-foreground">AI Generated</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-orange-600">
              {myModels.reduce((sum, m) => sum + (m.volumeCm3 || 0), 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Total Volume (cm³)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <GalleryFilters view={view} onViewChange={setView} />
        </div>

        {/* Gallery Grid */}
        <GalleryGrid
          models={myModels}
          loading={isLoading}
          showSelection={showSelection}
          onModelDownload={handleModelDownload}
          onModelShare={handleModelShare}
          onBulkDelete={handleBulkDelete}
          onBulkTag={handleBulkTag}
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No models yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Upload your first 3D model or generate one with AI to get started.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Model
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/gallery">Browse Gallery</Link>
                </Button>
              </div>
            </div>
          }
        />

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load your models. Please try again.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingModel && (
        <ModelEditDialog
          model={editingModel}
          isOpen={!!editingModel}
          onOpenChange={(open) => !open && setEditingModel(null)}
          onSave={handleSaveEdit}
          isSaving={isSaving}
        />
      )}

      {/* Share Dialog */}
      {sharingModel && (
        <ShareDialog
          model={sharingModel}
          isOpen={!!sharingModel}
          onOpenChange={(open) => !open && setSharingModel(null)}
        />
      )}
    </div>
  )
}
