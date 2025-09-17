"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import type { ModelMeta } from "@/lib/types"

interface DeleteConfirmationProps {
  models: ModelMeta[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteConfirmation({
  models,
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationProps) {
  const [confirmChecked, setConfirmChecked] = useState(false)

  const handleConfirm = () => {
    if (confirmChecked) {
      onConfirm()
      setConfirmChecked(false)
    }
  }

  const handleCancel = () => {
    setConfirmChecked(false)
    onOpenChange(false)
  }

  const isMultiple = models.length > 1
  const modelNames = models.map((m) => m.name).join(", ")

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete {isMultiple ? "Models" : "Model"}
          </DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `You are about to delete ${models.length} models. This action cannot be undone.`
              : `You are about to delete "${models[0]?.name}". This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>All model files (STL, OBJ, GLB)</li>
                <li>Preview images and thumbnails</li>
                <li>Model metadata and tags</li>
                <li>Version history</li>
              </ul>
            </AlertDescription>
          </Alert>

          {isMultiple && (
            <div className="max-h-32 overflow-y-auto p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Models to delete:</p>
              <ul className="text-sm space-y-1">
                {models.map((model) => (
                  <li key={model.id} className="truncate">
                    • {model.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="confirm-delete" checked={confirmChecked} onCheckedChange={setConfirmChecked} />
            <Label htmlFor="confirm-delete" className="text-sm">
              I understand this action cannot be undone
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!confirmChecked || isDeleting}>
            {isDeleting ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {isMultiple ? `${models.length} Models` : "Model"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
