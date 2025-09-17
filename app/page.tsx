import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Zap, Battery as Gallery, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
          Create, Manage & Print
          <span className="text-primary block">3D Models with AI</span>
        </h1>
        <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
          Upload images or 3D files, generate models from text prompts, and manage your 3D printing projects all in one
          place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-5 w-5" />
              Start Creating
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/gallery">
              <Gallery className="mr-2 h-5 w-5" />
              Browse Gallery
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for 3D Printing</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Upload & Import</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload images, STL, OBJ, or GLB files. Drag and drop support with automatic format detection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate 3D models from text prompts or images using advanced AI. Multiple styles available.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Gallery className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Smart Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize, search, and filter your models. Tag management and printability analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Print Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                3D preview, measurements, volume calculations, and export to STL/OBJ/GLB formats.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="bg-muted rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of makers and designers using PrintFrame 3D to bring their ideas to life.
          </p>
          <Button size="lg" asChild>
            <Link href="/upload">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
