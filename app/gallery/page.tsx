"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { GalleryFilters } from "@/components/gallery-filters"
import { GalleryGrid } from "@/components/gallery-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { api } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import Link from "next/link"

export default function GalleryPage() {
  const { filters, sortBy, searchQuery } = useAppStore()
  const [view, setView] = useState<"grid" | "list">("grid")

  const { data, isLoading, error } = useQuery({
    queryKey: ["models", filters, sortBy, searchQuery],
    queryFn: () =>
      api.getModels({
        search: searchQuery || undefined,
        tags: filters.tags,
        fileType: filters.fileType,
        sortBy,
      }),
  })

  const handleModelDownload = (model: ModelMeta) => {
    console.log("Download model:", model.name)
    // Implement download logic
  }

  const handleModelShare = (model: ModelMeta) => {
    console.log("Share model:", model.name)
    // Implement share logic
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-1">Discover and explore 3D models from the community</p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus className="h-4 w-4 mr-2" />
            Add Model
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <GalleryFilters view={view} onViewChange={setView} />
      </div>

      {/* Gallery Grid */}
      <GalleryGrid
        models={data?.models || []}
        loading={isLoading}
        onModelDownload={handleModelDownload}
        onModelShare={handleModelShare}
      />

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load models. Please try again.</p>
        </div>
      )}
    </div>
  )
}
