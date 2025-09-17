"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, X, SlidersHorizontal, LayoutGrid, List } from "lucide-react"
import type { FilterOptions, SortOption, ModelFileType } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { mockTags } from "@/lib/mock-data"

interface GalleryFiltersProps {
  onFiltersChange?: (filters: FilterOptions) => void
  onSortChange?: (sort: SortOption) => void
  onViewChange?: (view: "grid" | "list") => void
  view?: "grid" | "list"
}

export function GalleryFilters({ onFiltersChange, onSortChange, onViewChange, view = "grid" }: GalleryFiltersProps) {
  const { filters, setFilters, sortBy, setSortBy, searchQuery, setSearchQuery } = useAppStore()

  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const fileTypes: { value: ModelFileType; label: string }[] = [
    { value: "stl", label: "STL" },
    { value: "obj", label: "OBJ" },
    { value: "glb", label: "GLB" },
    { value: "generated", label: "AI Generated" },
    { value: "image", label: "Images" },
  ]

  const printableOptions = [
    { value: "printable", label: "Print Ready" },
    { value: "needs-fix", label: "Needs Fix" },
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name A-Z" },
    { value: "volume", label: "Volume (Large to Small)" },
  ]

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    onSortChange?.(value)
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {}
    setLocalFilters(emptyFilters)
    setFilters(emptyFilters)
    setSearchQuery("")
    onFiltersChange?.(emptyFilters)
  }

  const hasActiveFilters =
    Object.keys(localFilters).some((key) => {
      const value = localFilters[key as keyof FilterOptions]
      return Array.isArray(value) ? value.length > 0 : value !== undefined
    }) || searchQuery.length > 0

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.fileType?.length) count += localFilters.fileType.length
    if (localFilters.tags?.length) count += localFilters.tags.length
    if (localFilters.printable?.length) count += localFilters.printable.length
    if (searchQuery.length > 0) count += 1
    return count
  }

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* File Types */}
                <div>
                  <Label className="text-sm font-medium">File Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {fileTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filetype-${type.value}`}
                          checked={localFilters.fileType?.includes(type.value) || false}
                          onCheckedChange={(checked) => {
                            const current = localFilters.fileType || []
                            const updated = checked ? [...current, type.value] : current.filter((t) => t !== type.value)
                            handleFilterChange("fileType", updated.length > 0 ? updated : undefined)
                          }}
                        />
                        <Label htmlFor={`filetype-${type.value}`} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {mockTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={localFilters.tags?.includes(tag) || false}
                          onCheckedChange={(checked) => {
                            const current = localFilters.tags || []
                            const updated = checked ? [...current, tag] : current.filter((t) => t !== tag)
                            handleFilterChange("tags", updated.length > 0 ? updated : undefined)
                          }}
                        />
                        <Label htmlFor={`tag-${tag}`} className="text-sm capitalize">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Printable Status */}
                <div>
                  <Label className="text-sm font-medium">Printable Status</Label>
                  <div className="space-y-2 mt-2">
                    {printableOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`printable-${option.value}`}
                          checked={localFilters.printable?.includes(option.value as any) || false}
                          onCheckedChange={(checked) => {
                            const current = localFilters.printable || []
                            const updated = checked
                              ? [...current, option.value as any]
                              : current.filter((p) => p !== option.value)
                            handleFilterChange("printable", updated.length > 0 ? updated : undefined)
                          }}
                        />
                        <Label htmlFor={`printable-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange?.("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange?.("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {localFilters.fileType?.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type.toUpperCase()}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  const updated = localFilters.fileType?.filter((t) => t !== type)
                  handleFilterChange("fileType", updated?.length ? updated : undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {localFilters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  const updated = localFilters.tags?.filter((t) => t !== tag)
                  handleFilterChange("tags", updated?.length ? updated : undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {localFilters.printable?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status === "printable" ? "Print Ready" : "Needs Fix"}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  const updated = localFilters.printable?.filter((p) => p !== status)
                  handleFilterChange("printable", updated?.length ? updated : undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
