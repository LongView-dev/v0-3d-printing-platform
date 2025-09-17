"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { ModelViewer3D } from "@/components/model-viewer-3d"
import { ModelInfoPanel } from "@/components/model-info-panel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import type { ModelMeta } from "@/lib/types"

export default function ModelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const {
    data: model,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["model", modelId],
    queryFn: () => api.getModel(modelId),
  })

  const handleDownload = (format: string) => {
    if (!model) return

    let url: string | undefined
    switch (format) {
      case "stl":
        url = model.stlUrl
        break
      case "obj":
        url = model.objUrl
        break
      case "glb":
        url = model.glbUrl
        break
    }

    if (url) {
      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `${model.name}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`[v0] Downloaded ${model.name} as ${format.toUpperCase()}`)
    }
  }

  const handleShare = () => {
    if (!model) return

    if (navigator.share) {
      navigator.share({
        title: model.name,
        text: model.description || `Check out this 3D model: ${model.name}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      console.log("[v0] Model URL copied to clipboard")
    }
  }

  const handleUpdateModel = async (updates: Partial<ModelMeta>) => {
    try {
      await api.updateModel(modelId, updates)
      refetch()
      console.log("[v0] Model updated successfully")
    } catch (error) {
      console.error("[v0] Failed to update model:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading model...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Model Not Found</h1>
          <p className="text-muted-foreground mb-6">The model you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{model.name}</h1>
          <p className="text-muted-foreground">3D Model Details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 3D Viewer */}
        <div className="lg:col-span-2">
          <ModelViewer3D model={model} className="w-full" />
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1">
          <ModelInfoPanel
            model={model}
            onDownload={handleDownload}
            onShare={handleShare}
            onUpdateModel={handleUpdateModel}
          />
        </div>
      </div>
    </div>
  )
}
