"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TagManager } from "./tag-manager"
import { DeleteConfirmation } from "./delete-confirmation"
import { ShareDialog } from "./share-dialog"
import { Trash2, Tag, Download, Share2, X } from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { useAppStore } from "@/lib/store"

interface BulkActionsBarProps {
  selectedModels: ModelMeta[]
  onBulkDelete?: (modelIds: string[]) => void
  onBulkTag?: (modelIds: string[], tags: string[]) => void
  onBulkDownload?: (modelIds: string[]) => void
  onClearSelection?: () => void
}

export function BulkActionsBar({
  selectedModels,
  onBulkDelete,
  onBulkTag,
  onBulkDownload,
  onClearSelection,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { clearSelection } = useAppStore()

  if (selectedModels.length === 0) return null

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      await onBulkDelete?.(selectedModels.map((m) => m.id))
      setShowDeleteDialog(false)
      clearSelection()
    } catch (error) {
      console.error("Bulk delete failed:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkTag = (tags: string[]) => {
    onBulkTag?.(
      selectedModels.map((m) => m.id),
      tags,
    )
  }

  const handleBulkDownload = () => {
    onBulkDownload?.(selectedModels.map((m) => m.id))
  }

  const handleClearSelection = () => {
    clearSelection()
    onClearSelection?.()
  }

  // Get common tags from selected models
  const commonTags = selectedModels.reduce((common, model) => {
    if (common.length === 0) return model.tags
    return common.filter((tag) => model.tags.includes(tag))
  }, [] as string[])

  return (
    <>
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-medium">
                  {selectedModels.length} selected
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleClearSelection} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                {/* Tag Management */}
                <TagManager
                  selectedTags={commonTags}
                  onTagsChange={handleBulkTag}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Tags
                    </Button>
                  }
                />

                {/* Download */}
                <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {/* Share (only for single selection) */}
                {selectedModels.length === 1 && (
                  <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Model Summary */}
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <span>{selectedModels.filter((m) => m.printable === "printable").length} print ready</span>
              <span>{selectedModels.filter((m) => m.source === "nano-banana").length} AI generated</span>
              <span>{selectedModels.reduce((sum, m) => sum + (m.volumeCm3 || 0), 0).toFixed(1)} cm³ total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        models={selectedModels}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
      />

      {/* Share Dialog (single model only) */}
      {selectedModels.length === 1 && (
        <ShareDialog model={selectedModels[0]} isOpen={showShareDialog} onOpenChange={setShowShareDialog} />
      )}
    </>
  )
}
