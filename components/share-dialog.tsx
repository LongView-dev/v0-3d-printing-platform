"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Share2, Mail, MessageSquare, Check, QrCode } from "lucide-react"
import type { ModelMeta } from "@/lib/types"

interface ShareDialogProps {
  model: ModelMeta
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ model, isOpen, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [shareMethod, setShareMethod] = useState<"link" | "embed">("link")

  const modelUrl = `${window.location.origin}/models/${model.id}`
  const embedCode = `<iframe src="${modelUrl}?embed=true" width="600" height="400" frameborder="0"></iframe>`

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: model.name,
          text: model.description || `Check out this 3D model: ${model.name}`,
          url: modelUrl,
        })
      } catch (error) {
        console.error("Share failed:", error)
      }
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this 3D model: ${model.name}`)
    const body = encodeURIComponent(
      `I thought you might be interested in this 3D model:\n\n${model.name}\n${model.description || ""}\n\nView it here: ${modelUrl}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(`Check out this 3D model: ${model.name}`)
    const url = encodeURIComponent(modelUrl)

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Model
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Model Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <img
              src={model.previewUrl || "/placeholder.svg"}
              alt={model.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{model.name}</h3>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {model.fileType.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {model.printable === "printable" ? "Print Ready" : "Needs Fix"}
                </Badge>
              </div>
            </div>
          </div>

          <Tabs value={shareMethod} onValueChange={(value) => setShareMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Share Link</TabsTrigger>
              <TabsTrigger value="embed">Embed Code</TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              {/* Direct Link */}
              <div>
                <Label className="text-sm font-medium">Direct Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={modelUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => handleCopy(modelUrl)} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick Share Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Share</Label>

                {/* Native Share (if supported) */}
                {navigator.share && (
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleNativeShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share via System
                  </Button>
                )}

                {/* Email */}
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleEmailShare}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>

                {/* Social Media */}
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSocialShare("twitter")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSocialShare("facebook")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSocialShare("linkedin")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="embed" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Embed Code</Label>
                <div className="flex gap-2 mt-2">
                  <textarea
                    value={embedCode}
                    readOnly
                    className="flex-1 min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono resize-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(embedCode)}
                    className="flex-shrink-0 self-start"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This embed code will display an interactive 3D viewer on any website that supports iframes.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {copied && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Copied to clipboard!</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
