"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Tag, Check } from "lucide-react"
import { mockTags } from "@/lib/mock-data"

interface TagManagerProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  trigger?: React.ReactNode
}

export function TagManager({ selectedTags, onTagsChange, trigger }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [availableTags, setAvailableTags] = useState(mockTags)
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags)

  const handleAddTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim().toLowerCase()
      setAvailableTags([...availableTags, trimmedTag])
      setLocalSelectedTags([...localSelectedTags, trimmedTag])
      setNewTag("")
    }
  }

  const handleToggleTag = (tag: string) => {
    setLocalSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSave = () => {
    onTagsChange(localSelectedTags)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setLocalSelectedTags(selectedTags)
    setIsOpen(false)
  }

  const handleRemoveTag = (tag: string) => {
    setLocalSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Tags */}
          <div>
            <Label className="text-sm font-medium">Selected Tags</Label>
            <div className="flex flex-wrap gap-1 mt-2 min-h-[2rem] p-2 border rounded-md">
              {localSelectedTags.length === 0 ? (
                <span className="text-sm text-muted-foreground">No tags selected</span>
              ) : (
                localSelectedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Add New Tag */}
          <div>
            <Label className="text-sm font-medium">Add New Tag</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Available Tags */}
          <div>
            <Label className="text-sm font-medium">Available Tags</Label>
            <div className="max-h-48 overflow-y-auto mt-2 space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={localSelectedTags.includes(tag)}
                    onCheckedChange={() => handleToggleTag(tag)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm capitalize cursor-pointer flex-1">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
