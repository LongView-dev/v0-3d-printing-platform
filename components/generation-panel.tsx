"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, ImageIcon, Upload, Loader2, Shuffle } from "lucide-react"
import { api } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import type { GenerateRequest, ModelMeta } from "@/lib/types"

interface GenerationPanelProps {
  onGenerationComplete?: (model: ModelMeta) => void
  onGenerationError?: (error: string) => void
  className?: string
}

interface GenerationForm {
  mode: "text" | "image2model"
  prompt: string
  style: "lowpoly" | "realistic" | "organic" | "hardSurface"
  scaleMm: number
  seed?: number
  imageFile?: File
}

const STYLE_OPTIONS = [
  { value: "lowpoly", label: "Low Poly", description: "Clean geometric shapes, perfect for gaming" },
  { value: "realistic", label: "Realistic", description: "Detailed and lifelike appearance" },
  { value: "organic", label: "Organic", description: "Natural, flowing forms" },
  { value: "hardSurface", label: "Hard Surface", description: "Mechanical and industrial designs" },
]

const EXAMPLE_PROMPTS = [
  "A medieval dragon figurine for tabletop gaming",
  "Modern minimalist phone stand",
  "Organic flowing vase with smooth curves",
  "Mechanical gear with precise teeth",
  "Abstract sculpture with geometric patterns",
  "Cute animal figurine for decoration",
]

export function GenerationPanel({ onGenerationComplete, onGenerationError, className }: GenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setIsGenerating: setGlobalGenerating, setGenerationTaskId } = useAppStore()

  const form = useForm<GenerationForm>({
    defaultValues: {
      mode: "text",
      prompt: "",
      style: "realistic",
      scaleMm: 50,
      seed: undefined,
    },
  })

  const watchedMode = form.watch("mode")
  const [selectedPrompt, setSelectedPrompt] = useState<string>("")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue("imageFile", file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateRandomSeed = () => {
    const seed = Math.floor(Math.random() * 1000000)
    form.setValue("seed", seed)
  }

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const status = await api.getTaskStatus(taskId)

        switch (status.status) {
          case "pending":
            setGenerationStatus("Generating your 3D model...")
            setGenerationProgress(Math.min(30 + attempts * 2, 80))
            attempts++

            if (attempts < maxAttempts) {
              setTimeout(poll, 2000) // Poll every 2 seconds
            } else {
              throw new Error("Generation timeout - please try again")
            }
            break

          case "succeed":
            setGenerationProgress(100)
            setGenerationStatus("Generation complete!")

            // Create a mock model from the generation result
            const generatedModel: ModelMeta = {
              id: `generated-${Date.now()}`,
              name: form.getValues("prompt").slice(0, 50) || "Generated Model",
              description: `AI generated ${form.getValues("style")} model`,
              tags: [form.getValues("style"), "generated", "ai"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              fileType: "generated",
              previewUrl: status.previewPng || "/generated-3d-model.jpg",
              glbUrl: status.glbUrl,
              stlUrl: status.stlUrl,
              printable: "printable",
              bboxMm: { x: form.getValues("scaleMm"), y: form.getValues("scaleMm"), z: form.getValues("scaleMm") },
              volumeCm3: Math.pow(form.getValues("scaleMm") / 10, 3),
              areaCm2: 6 * Math.pow(form.getValues("scaleMm") / 10, 2),
              faces: 1000,
              material: { density_g_cm3: 1.24 },
              weight_g: Math.pow(form.getValues("scaleMm") / 10, 3) * 1.24,
              source: "nano-banana",
              version: 1,
            }

            onGenerationComplete?.(generatedModel)

            setTimeout(() => {
              setIsGenerating(false)
              setGlobalGenerating(false)
              setGenerationTaskId(null)
              setTaskId(null)
              setGenerationProgress(0)
              setGenerationStatus("")
            }, 2000)
            break

          case "failed":
            throw new Error(status.error || "Generation failed")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Generation failed"
        setGenerationStatus("")
        setIsGenerating(false)
        setGlobalGenerating(false)
        setGenerationTaskId(null)
        setTaskId(null)
        setGenerationProgress(0)
        onGenerationError?.(errorMessage)
      }
    }

    poll()
  }

  const onSubmit = async (data: GenerationForm) => {
    try {
      setIsGenerating(true)
      setGlobalGenerating(true)
      setGenerationProgress(10)
      setGenerationStatus("Starting generation...")

      const request: GenerateRequest = {
        mode: data.mode,
        prompt: data.prompt,
        style: data.style,
        scaleMm: data.scaleMm,
        seed: data.seed,
      }

      if (data.mode === "image2model" && data.imageFile) {
        // In a real implementation, you'd upload the image first
        request.imageUrl = URL.createObjectURL(data.imageFile)
      }

      const response = await api.generateModel(request)
      setTaskId(response.taskId)
      setGenerationTaskId(response.taskId)
      setGenerationProgress(20)
      setGenerationStatus("Task created, processing...")

      // Start polling for status
      pollTaskStatus(response.taskId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start generation"
      setIsGenerating(false)
      setGlobalGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus("")
      onGenerationError?.(errorMessage)
    }
  }

  const useExamplePrompt = (prompt: string) => {
    setSelectedPrompt(prompt)
    form.setValue("prompt", prompt)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Model Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Generation Mode */}
          <Tabs value={watchedMode} onValueChange={(value) => form.setValue("mode", value as "text" | "image2model")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Text to 3D
              </TabsTrigger>
              <TabsTrigger value="image2model" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image to 3D
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="prompt">Describe your 3D model</Label>
                <Textarea
                  id="prompt"
                  placeholder="A detailed dragon figurine for tabletop gaming..."
                  {...form.register("prompt", { required: "Please describe what you want to generate" })}
                  className="min-h-[100px]"
                />
                {form.formState.errors.prompt && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.prompt.message}</p>
                )}
              </div>

              {/* Example Prompts */}
              <div>
                <Label className="text-sm text-muted-foreground">Example prompts:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2 bg-transparent"
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image2model" className="space-y-4">
              <div>
                <Label htmlFor="image">Reference Image</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span>Click to upload image</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="image-prompt">Additional description (optional)</Label>
                <Textarea
                  id="image-prompt"
                  placeholder="Additional details about the model..."
                  {...form.register("prompt")}
                  className="min-h-[80px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Style Selection */}
          <div>
            <Label htmlFor="style">Style</Label>
            <Select value={form.watch("style")} onValueChange={(value) => form.setValue("style", value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale */}
          <div>
            <Label htmlFor="scale">Target Size (mm)</Label>
            <Input id="scale" type="number" min="10" max="200" {...form.register("scaleMm", { valueAsNumber: true })} />
            <p className="text-xs text-muted-foreground mt-1">Approximate size of the longest dimension</p>
          </div>

          {/* Advanced Options */}
          <div>
            <Label htmlFor="seed">Seed (optional)</Label>
            <div className="flex gap-2">
              <Input id="seed" type="number" placeholder="Random" {...form.register("seed", { valueAsNumber: true })} />
              <Button type="button" variant="outline" size="icon" onClick={generateRandomSeed}>
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Use the same seed to reproduce results</p>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">{generationStatus}</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">This may take 2-5 minutes depending on complexity</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate 3D Model
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            AI generation uses advanced algorithms to create 3D models. Results may vary and some manual cleanup might
            be needed for optimal printing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
