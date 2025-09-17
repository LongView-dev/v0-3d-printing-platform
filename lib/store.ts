import { create } from "zustand"
import type { User, FilterOptions, SortOption } from "./types"

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // UI state
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void

  // Gallery state
  selectedModels: string[]
  setSelectedModels: (ids: string[]) => void
  toggleModelSelection: (id: string) => void
  clearSelection: () => void

  // Filter state
  filters: FilterOptions
  setFilters: (filters: FilterOptions) => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Upload state
  isUploading: boolean
  setIsUploading: (uploading: boolean) => void
  uploadProgress: number
  setUploadProgress: (progress: number) => void

  // Generation state
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  generationTaskId: string | null
  setGenerationTaskId: (taskId: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // UI state
  theme: "light",
  setTheme: (theme) => set({ theme }),

  // Gallery state
  selectedModels: [],
  setSelectedModels: (selectedModels) => set({ selectedModels }),
  toggleModelSelection: (id) =>
    set((state) => ({
      selectedModels: state.selectedModels.includes(id)
        ? state.selectedModels.filter((modelId) => modelId !== id)
        : [...state.selectedModels, id],
    })),
  clearSelection: () => set({ selectedModels: [] }),

  // Filter state
  filters: {},
  setFilters: (filters) => set({ filters }),
  sortBy: "newest",
  setSortBy: (sortBy) => set({ sortBy }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Upload state
  isUploading: false,
  setIsUploading: (isUploading) => set({ isUploading }),
  uploadProgress: 0,
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),

  // Generation state
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  generationTaskId: null,
  setGenerationTaskId: (generationTaskId) => set({ generationTaskId }),
}))
