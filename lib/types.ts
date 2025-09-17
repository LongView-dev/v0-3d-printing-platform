export type ModelFileType = "stl" | "obj" | "glb" | "image" | "generated"

export interface ModelMeta {
  id: string
  name: string
  description?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  fileType: ModelFileType
  previewUrl: string // 卡片缩略图
  glbUrl?: string
  stlUrl?: string
  objUrl?: string
  printable: "printable" | "needs-fix"
  bboxMm?: { x: number; y: number; z: number }
  volumeCm3?: number
  areaCm2?: number
  faces?: number
  material?: { density_g_cm3?: number }
  weight_g?: number
  source: "upload" | "nano-banana"
  version?: number
}

export interface GenerateRequest {
  mode: "text" | "image2model"
  prompt?: string
  imageUrl?: string
  style?: "lowpoly" | "realistic" | "organic" | "hardSurface"
  scaleMm?: number
  seed?: number
}

export interface GenerateResponse {
  taskId: string
}

export interface TaskStatus {
  status: "pending" | "succeed" | "failed"
  glbUrl?: string
  stlUrl?: string
  previewPng?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export type FilterOptions = {
  fileType?: ModelFileType[]
  tags?: string[]
  printable?: ("printable" | "needs-fix")[]
  dateRange?: { start: Date; end: Date }
}

export type SortOption = "newest" | "oldest" | "name" | "volume"
