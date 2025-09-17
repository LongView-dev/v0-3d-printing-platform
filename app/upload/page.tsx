"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { GenerationPanel } from "@/components/generation-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, Zap, CheckCircle, ArrowRight, Info } from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { useAppStore } from "@/lib/store"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [uploadedModels, setUploadedModels] = useState<ModelMeta[]>([])
  const [generatedModels, setGeneratedModels] = useState<ModelMeta[]>([])
  const [activeTab, setActiveTab] = useState<"upload" | "generate">("upload")

  const handleUploadComplete = (model: ModelMeta) => {
    setUploadedModels((prev) => [...prev, model])
    console.log("[v0] Upload completed:", model.name)
  }

  const handleUploadError = (error: string) => {
    console.error("[v0] Upload error:", error)
  }

  const handleGenerationComplete = (model: ModelMeta) => {
    setGeneratedModels((prev) => [...prev, model])
    console.log("[v0] Generation completed:", model.name)
  }

  const handleGenerationError = (error: string) => {
    console.error("[v0] Generation error:", error)
  }

  const viewModel = (model: ModelMeta) => {
    router.push(`/models/${model.id}`)
  }

  const goToGallery = () => {
    router.push(user ? "/me/gallery" : "/gallery")
  }

  const allModels = [...uploadedModels, ...generatedModels]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Models</h1>
        <p className="text-muted-foreground">Upload your existing 3D files or generate new models with AI</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "generate")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FileUploader onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Supported Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">3D Models</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">STL</Badge>
                        <Badge variant="secondary">OBJ</Badge>
                        <Badge variant="secondary">GLB</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Images</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">JPG</Badge>
                        <Badge variant="secondary">PNG</Badge>
                        <Badge variant="secondary">WebP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Uploaded images can be used to generate 3D models using the AI Generate tab.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GenerationPanel
                  onGenerationComplete={handleGenerationComplete}
                  onGenerationError={handleGenerationError}
                />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Generation Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Be Specific</h4>
                      <p className="text-muted-foreground text-xs">
                        Include details like "medieval dragon with wings" instead of just "dragon"
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Choose the Right Style</h4>
                      <p className="text-muted-foreground text-xs">
                        Low poly for gaming, realistic for detailed models
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Size Matters</h4>
                      <p className="text-muted-foreground text-xs">
                        Consider your printer's build volume when setting scale
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    AI generation typically takes 2-5 minutes. You can continue using the app while it processes.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Results */}
        {allModels.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Models</h2>
              <Button variant="outline" onClick={goToGallery}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allModels.slice(-6).map((model) => (
                <Card
                  key={model.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => viewModel(model)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      <img
                        src={model.previewUrl || "/placeholder.svg"}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{model.name}</h3>
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {model.source === "nano-banana" ? "Generated" : "Uploaded"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {model.fileType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
