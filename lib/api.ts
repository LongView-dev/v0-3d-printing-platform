import type { GenerateRequest, GenerateResponse, TaskStatus, ModelMeta } from "./types"
import { mockModels } from "./mock-data"

// Mock API functions - replace with real API calls
export const api = {
  // Models
  async getModels(params?: {
    search?: string
    tags?: string[]
    fileType?: string[]
    sortBy?: string
    limit?: number
    offset?: number
  }): Promise<{ models: ModelMeta[]; total: number }> {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

    let filteredModels = [...mockModels]

    if (params?.search) {
      const query = params.search.toLowerCase()
      filteredModels = filteredModels.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query) ||
          model.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    if (params?.tags?.length) {
      filteredModels = filteredModels.filter((model) => params.tags!.some((tag) => model.tags.includes(tag)))
    }

    if (params?.fileType?.length) {
      filteredModels = filteredModels.filter((model) => params.fileType!.includes(model.fileType))
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case "newest":
          filteredModels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case "oldest":
          filteredModels.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case "name":
          filteredModels.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "volume":
          filteredModels.sort((a, b) => (b.volumeCm3 || 0) - (a.volumeCm3 || 0))
          break
      }
    }

    const limit = params?.limit || 20
    const offset = params?.offset || 0
    const paginatedModels = filteredModels.slice(offset, offset + limit)

    return {
      models: paginatedModels,
      total: filteredModels.length,
    }
  },

  async getModel(id: string): Promise<ModelMeta | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockModels.find((model) => model.id === id) || null
  },

  async deleteModel(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(`[Mock API] Deleted model ${id}`)
  },

  async updateModel(id: string, updates: Partial<ModelMeta>): Promise<ModelMeta> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const model = mockModels.find((m) => m.id === id)
    if (!model) throw new Error("Model not found")

    const updatedModel = { ...model, ...updates, updatedAt: new Date().toISOString() }
    console.log(`[Mock API] Updated model ${id}`, updates)
    return updatedModel
  },

  // Generation
  async generateModel(request: GenerateRequest): Promise<GenerateResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("[Mock API] Started generation task:", taskId, request)
    return { taskId }
  },

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate different task states
    const random = Math.random()
    if (random < 0.3) {
      return { status: "pending" }
    } else if (random < 0.9) {
      return {
        status: "succeed",
        glbUrl: "/models/generated.glb",
        stlUrl: "/models/generated.stl",
        previewPng: "/generated-3d-model.jpg",
      }
    } else {
      return {
        status: "failed",
        error: "Generation failed: Invalid prompt or server error",
      }
    }
  },

  // Upload
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<ModelMeta> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      onProgress?.(i)
    }

    const newModel: ModelMeta = {
      id: `upload-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      description: `Uploaded ${file.type} file`,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileType: file.name.endsWith(".stl")
        ? "stl"
        : file.name.endsWith(".obj")
          ? "obj"
          : file.name.endsWith(".glb")
            ? "glb"
            : "image",
      previewUrl: `/placeholder.svg?height=200&width=200&query=uploaded ${file.name}`,
      printable: "printable",
      source: "upload",
      version: 1,
    }

    console.log("[Mock API] Uploaded file:", newModel)
    return newModel
  },
}
