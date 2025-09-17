"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagManager } from "./tag-manager"
import { Edit3, Save, X } from "lucide-react"
import type { ModelMeta } from "@/lib/types"

interface ModelEditDialogProps {
  model: ModelMeta
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<ModelMeta>) => void
  isSaving?: boolean
}

interface EditForm {
  name: string
  description: string
  printable: "printable" | "needs-fix"
}

export function ModelEditDialog({ model, isOpen, onOpenChange, onSave, isSaving = false }: ModelEditDialogProps) {
  const [tags, setTags] = useState(model.tags)

  const form = useForm<EditForm>({
    defaultValues: {
      name: model.name,
      description: model.description || "",
      printable: model.printable,
    },
  })

  const handleSave = (data: EditForm) => {
    const updates: Partial<ModelMeta> = {
      name: data.name,
      description: data.description,
      printable: data.printable,
      tags: tags,
      updatedAt: new Date().toISOString(),
    }
    onSave(updates)
  }

  const handleCancel = () => {
    form.reset()
    setTags(model.tags)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Model
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                {...form.register("name", { required: "Name is required" })}
                placeholder="Enter model name..."
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="printable">Printable Status</Label>
              <Select
                value={form.watch("printable")}
                onValueChange={(value) => form.setValue("printable", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printable">Print Ready</SelectItem>
                  <SelectItem value="needs-fix">Needs Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your model..."
              className="min-h-[100px]"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex flex-wrap gap-1 flex-1 min-h-[2rem] p-2 border rounded-md">
                {tags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No tags</span>
                ) : (
                  tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
              <TagManager
                selectedTags={tags}
                onTagsChange={setTags}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    Edit Tags
                  </Button>
                }
              />
            </div>
          </div>

          {/* Model Info (Read-only) */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">File Type</Label>
              <p className="text-sm font-medium">{model.fileType.toUpperCase()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <p className="text-sm font-medium capitalize">
                {model.source === "nano-banana" ? "AI Generated" : "Uploaded"}
              </p>
            </div>
            {model.volumeCm3 && (
              <div>
                <Label className="text-xs text-muted-foreground">Volume</Label>
                <p className="text-sm font-medium">{model.volumeCm3.toFixed(1)} cm³</p>
              </div>
            )}
            {model.faces && (
              <div>
                <Label className="text-xs text-muted-foreground">Faces</Label>
                <p className="text-sm font-medium">{model.faces.toLocaleString()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
