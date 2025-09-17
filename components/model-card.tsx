"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Download, Share2, MoreVertical, CheckCircle, AlertTriangle, Cable as Cube, Zap } from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { useAppStore } from "@/lib/store"

interface ModelCardProps {
  model: ModelMeta
  showSelection?: boolean
  onPreview?: (model: ModelMeta) => void
  onDownload?: (model: ModelMeta) => void
  onShare?: (model: ModelMeta) => void
}

export function ModelCard({ model, showSelection = false, onPreview, onDownload, onShare }: ModelCardProps) {
  const { selectedModels, toggleModelSelection } = useAppStore()
  const isSelected = selectedModels.includes(model.id)

  const handleSelectionChange = (checked: boolean) => {
    toggleModelSelection(model.id)
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "generated":
        return <Zap className="h-3 w-3" />
      default:
        return <Cube className="h-3 w-3" />
    }
  }

  const getPrintableColor = (printable: string) => {
    return printable === "printable" ? "default" : "destructive"
  }

  const getPrintableIcon = (printable: string) => {
    return printable === "printable" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-0 relative">
        {showSelection && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
        )}

        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={model.previewUrl || "/placeholder.svg"}
            alt={model.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onPreview?.(model)} asChild>
              <Link href={`/models/${model.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onDownload?.(model)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-1 flex-1">{model.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/models/${model.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.(model)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(model)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {model.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{model.description}</p>}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {model.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
              {tag}
            </Badge>
          ))}
          {model.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              +{model.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {getFileTypeIcon(model.fileType)}
            <span className="uppercase">{model.fileType}</span>
          </div>
          <div className="flex items-center gap-1">
            {getPrintableIcon(model.printable)}
            <Badge variant={getPrintableColor(model.printable)} className="text-xs px-1 py-0">
              {model.printable === "printable" ? "Ready" : "Needs Fix"}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}</span>
        {model.volumeCm3 && <span>{model.volumeCm3.toFixed(1)} cm³</span>}
      </CardFooter>
    </Card>
  )
}
