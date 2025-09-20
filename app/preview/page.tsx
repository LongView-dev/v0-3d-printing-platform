"use client"

import { useState } from "react"
import { ModelViewer3D } from "@/components/model-viewer-3d"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Cable as Cube } from "lucide-react"
import type { ModelMeta } from "@/lib/types"

// Sample models for demonstration
const sampleModels: ModelMeta[] = [
  {
    id: "sample-1",
    name: "Rubber Duck",
    description: "Classic rubber duck 3D model for testing",
    glbUrl: "/assets/3d/duck.glb",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "demo",
    tags: ["toy", "duck", "sample"],
    category: "toys",
    printable: true,
    fileSize: 1024000,
    dimensions: { x: 50, y: 40, z: 35 },
    volume: 70000,
    triangles: 2048,
  },
  {
    id: "sample-2",
    name: "Geometric Cube",
    description: "Simple geometric cube for testing",
    glbUrl: "/placeholder.glb?height=100&width=100&query=geometric cube",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "demo",
    tags: ["geometric", "cube", "simple"],
    category: "geometric",
    printable: true,
    fileSize: 512000,
    dimensions: { x: 30, y: 30, z: 30 },
    volume: 27000,
    triangles: 12,
  },
]

export default function PreviewPage() {
  const [selectedModel, setSelectedModel] = useState<ModelMeta>(sampleModels[0])
  const [customUrl, setCustomUrl] = useState("")
  const [isLoadingCustom, setIsLoadingCustom] = useState(false)

  const handleLoadCustomModel = () => {
    if (!customUrl.trim()) return

    setIsLoadingCustom(true)

    // Create a custom model object
    const customModel: ModelMeta = {
      id: "custom-" + Date.now(),
      name: "Custom Model",
      description: "User-provided 3D model",
      glbUrl: customUrl.includes(".glb") ? customUrl : undefined,
      objUrl: customUrl.includes(".obj") ? customUrl : undefined,
      stlUrl: customUrl.includes(".stl") ? customUrl : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user",
      tags: ["custom"],
      category: "custom",
      printable: true,
      fileSize: 0,
      dimensions: { x: 0, y: 0, z: 0 },
      volume: 0,
      triangles: 0,
    }

    setSelectedModel(customModel)
    setIsLoadingCustom(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">3D Model Preview</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Interactive 3D model viewer with rotation, zoom, and drag controls. Load sample models or provide your own 3D
          file URL.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sample Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cube className="h-5 w-5" />
                Sample Models
              </CardTitle>
              <CardDescription>Choose from pre-loaded sample models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleModels.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModel.id === model.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedModel(model)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {model.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Custom Model URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Custom Model
              </CardTitle>
              <CardDescription>Load your own 3D model from URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-url">Model URL</Label>
                <Input
                  id="model-url"
                  placeholder="https://example.com/model.glb"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={handleLoadCustomModel}
                disabled={!customUrl.trim() || isLoadingCustom}
                className="w-full"
              >
                {isLoadingCustom ? "Loading..." : "Load Model"}
              </Button>
              <p className="text-xs text-muted-foreground">Supports .glb, .obj, and .stl formats</p>
            </CardContent>
          </Card>

          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{selectedModel.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
              </div>
              {selectedModel.dimensions && (
                <div>
                  <Label className="text-sm font-medium">Dimensions</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedModel.dimensions.x} × {selectedModel.dimensions.y} × {selectedModel.dimensions.z} mm
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedModel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Interactive 3D Viewer</CardTitle>
              <CardDescription>
                Use mouse to rotate, zoom, and pan. Toolbar provides additional controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelViewer3D model={selectedModel} className="w-full h-[600px]" />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Mouse Controls</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Left click + drag: Rotate</li>
                    <li>• Right click + drag: Pan</li>
                    <li>• Scroll wheel: Zoom</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Toolbar</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Reset: Return to default view</li>
                    <li>• Measure: Enable measurement mode</li>
                    <li>• Box: Show bounding box</li>
                    <li>• Grid: Toggle floor grid</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Environment</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Light: Bright environment</li>
                    <li>• Dark: Night environment</li>
                    <li>• Studio: Professional lighting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
