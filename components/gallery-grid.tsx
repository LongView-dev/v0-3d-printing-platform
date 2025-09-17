"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Tag, Download, Share2, Plus, Upload } from "lucide-react"
import { ModelCard } from "./model-card"
import type { ModelMeta } from "@/lib/types"
import { useAppStore } from "@/lib/store"

interface GalleryGridProps {
  models: ModelMeta[]
  loading?: boolean
  showSelection?: boolean
  emptyState?: React.ReactNode
  onModelPreview?: (model: ModelMeta) => void
  onModelDownload?: (model: ModelMeta) => void
  onModelShare?: (model: ModelMeta) => void
  onBulkDelete?: (modelIds: string[]) => void
  onBulkTag?: (modelIds: string[], tags: string[]) => void
}

export function GalleryGrid({
  models,
  loading = false,
  showSelection = false,
  emptyState,
  onModelPreview,
  onModelDownload,
  onModelShare,
  onBulkDelete,
  onBulkTag,
}: GalleryGridProps) {
  const { selectedModels, setSelectedModels, clearSelection } = useAppStore()
  const [selectAll, setSelectAll] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedModels(models.map((m) => m.id))
      setSelectAll(true)
    } else {
      clearSelection()
      setSelectAll(false)
    }
  }

  const handleBulkDelete = () => {
    if (selectedModels.length > 0) {
      onBulkDelete?.(selectedModels)
      clearSelection()
      setSelectAll(false)
    }
  }

  const handleBulkTag = () => {
    if (selectedModels.length > 0) {
      // This would open a tag selection dialog
      console.log("Bulk tag operation for:", selectedModels)
      onBulkTag?.(selectedModels, ["new-tag"])
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-3" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {emptyState || (
          <>
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No models found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Start by uploading your first 3D model or generating one with AI.
            </p>
            <Button asChild>
              <a href="/upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Model
              </a>
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {showSelection && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            <span className="text-sm font-medium">
              {selectedModels.length > 0 ? `${selectedModels.length} selected` : "Select all"}
            </span>
          </div>

          {selectedModels.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkTag}>
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            showSelection={showSelection}
            onPreview={onModelPreview}
            onDownload={onModelDownload}
            onShare={onModelShare}
          />
        ))}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-center pt-4">
        <Badge variant="secondary" className="text-xs">
          Showing {models.length} models
        </Badge>
      </div>
    </div>
  )
}
