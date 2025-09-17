"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Share2,
  Edit3,
  Calendar,
  User,
  Ruler,
  Weight,
  Layers,
  AlertTriangle,
  CheckCircle,
  Tag,
  FileText,
} from "lucide-react"
import type { ModelMeta } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ModelInfoPanelProps {
  model: ModelMeta
  onDownload?: (format: string) => void
  onShare?: () => void
  onUpdateModel?: (updates: Partial<ModelMeta>) => void
}

const materialDensities = {
  PLA: 1.24,
  ABS: 1.04,
  PETG: 1.27,
  TPU: 1.2,
  "Wood PLA": 1.28,
  "Metal PLA": 1.8,
  Resin: 1.15,
}

export function ModelInfoPanel({ model, onDownload, onShare, onUpdateModel }: ModelInfoPanelProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<keyof typeof materialDensities>("PLA")
  const [unit, setUnit] = useState<"mm" | "inch">("mm")
  const [isEditing, setIsEditing] = useState(false)
  const [editedModel, setEditedModel] = useState(model)

  const density = materialDensities[selectedMaterial]
  const estimatedWeight = model.volumeCm3 ? (model.volumeCm3 * density).toFixed(1) : "N/A"

  const convertUnit = (value: number) => {
    return unit === "inch" ? (value / 25.4).toFixed(2) : value.toFixed(1)
  }

  const handleSaveEdit = () => {
    onUpdateModel?.(editedModel)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedModel(model)
    setIsEditing(false)
  }

  const downloadFormats = [
    { value: "stl", label: "STL", available: !!model.stlUrl },
    { value: "obj", label: "OBJ", available: !!model.objUrl },
    { value: "glb", label: "GLB", available: !!model.glbUrl },
  ].filter((format) => format.available)

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1 flex-1">
            {isEditing ? (
              <Input
                value={editedModel.name}
                onChange={(e) => setEditedModel({ ...editedModel, name: e.target.value })}
                className="text-lg font-semibold"
              />
            ) : (
              <CardTitle className="text-lg">{model.name}</CardTitle>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}</span>
              <Separator orientation="vertical" className="h-3" />
              <User className="h-3 w-3" />
              <span>{model.source === "nano-banana" ? "AI Generated" : "Uploaded"}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedModel.description || ""}
                  onChange={(e) => setEditedModel({ ...editedModel, description: e.target.value })}
                  placeholder="Add a description..."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {model.description && <p className="text-sm text-muted-foreground">{model.description}</p>}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <Tag className="h-3 w-3 text-muted-foreground mr-1" />
                {model.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {model.printable === "printable" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Print Ready
                    </Badge>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <Badge variant="destructive">Needs Fix</Badge>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Print Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Print Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unit Toggle */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Units:</Label>
            <Select value={unit} onValueChange={(value: "mm" | "inch") => setUnit(value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">mm</SelectItem>
                <SelectItem value="inch">inch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          {model.bboxMm && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Length</Label>
                <div className="font-mono">
                  {convertUnit(model.bboxMm.x)} {unit}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width</Label>
                <div className="font-mono">
                  {convertUnit(model.bboxMm.y)} {unit}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <div className="font-mono">
                  {convertUnit(model.bboxMm.z)} {unit}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Volume & Surface Area */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Volume</Label>
              <div className="font-mono">{model.volumeCm3?.toFixed(1) || "N/A"} cm³</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Surface Area</Label>
              <div className="font-mono">{model.areaCm2?.toFixed(1) || "N/A"} cm²</div>
            </div>
          </div>

          <Separator />

          {/* Material & Weight */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Material</Label>
              <Select
                value={selectedMaterial}
                onValueChange={(value: keyof typeof materialDensities) => setSelectedMaterial(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(materialDensities).map((material) => (
                    <SelectItem key={material} value={material}>
                      {material} ({materialDensities[material as keyof typeof materialDensities]} g/cm³)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estimated Weight: </span>
              <Badge variant="outline" className="font-mono">
                {estimatedWeight} g
              </Badge>
            </div>
          </div>

          {/* Technical Info */}
          {model.faces && (
            <div className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>Faces: </span>
              <Badge variant="outline" className="font-mono">
                {model.faces.toLocaleString()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Issues */}
      {model.printable === "needs-fix" && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Print Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  Thin Walls
                </Badge>
                <span className="text-muted-foreground">Some walls may be too thin to print</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  Overhangs
                </Badge>
                <span className="text-muted-foreground">May require support structures</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {downloadFormats.map((format) => (
            <Button
              key={format.value}
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => onDownload?.(format.value)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {format.label}
            </Button>
          ))}

          <Separator />

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Model
          </Button>
        </CardContent>
      </Card>

      {/* Version History */}
      {model.version && model.version > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Version {model.version} (Current)</span>
                <Badge variant="default">Latest</Badge>
              </div>
              {Array.from({ length: model.version - 1 }, (_, i) => (
                <div key={i} className="flex items-center justify-between text-muted-foreground">
                  <span>Version {model.version - 1 - i}</span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
