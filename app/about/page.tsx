import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Cable as Cube, Zap, Users, Shield, Sparkles, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: Cube,
      title: "3D Model Management",
      description: "Upload, organize, and manage your 3D models with advanced tagging and search capabilities.",
    },
    {
      icon: Zap,
      title: "AI Generation",
      description: "Transform text and images into stunning 3D models using our advanced nano-banana AI technology.",
    },
    {
      icon: Users,
      title: "Community Gallery",
      description: "Discover and share amazing 3D creations with a vibrant community of makers and designers.",
    },
    {
      icon: Shield,
      title: "Print Analysis",
      description: "Get detailed printability analysis, material calculations, and optimization suggestions.",
    },
  ]

  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Former 3D printing engineer with 10+ years in additive manufacturing.",
      avatar: "/placeholder.svg?height=80&width=80&text=AC",
    },
    {
      name: "Sarah Kim",
      role: "Head of AI",
      bio: "Machine learning expert specializing in 3D generation and computer vision.",
      avatar: "/placeholder.svg?height=80&width=80&text=SK",
    },
    {
      name: "Mike Rodriguez",
      role: "Lead Developer",
      bio: "Full-stack developer passionate about creating intuitive maker tools.",
      avatar: "/placeholder.svg?height=80&width=80&text=MR",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          About PrintFrame 3D
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Revolutionizing 3D Creation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
          PrintFrame 3D is the ultimate platform for 3D model management, AI-powered generation, and community sharing.
          We're making 3D creation accessible to everyone.
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-2xl">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We believe that 3D creation should be accessible, intuitive, and collaborative. Our platform combines
            cutting-edge AI technology with powerful management tools to help creators, makers, and designers bring
            their ideas to life. Whether you're a hobbyist or a professional, PrintFrame 3D provides the tools you need
            to create, share, and print amazing 3D models.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="h-20 w-20 rounded-full mx-auto"
                  />
                </div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription className="font-medium text-primary">{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <Card className="mb-16">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Models Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get In Touch</CardTitle>
          <CardDescription>Have questions or want to collaborate? We'd love to hear from you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
          <Separator className="my-6" />
          <div className="text-center">
            <Button asChild>
              <Link href="/auth/register">Join PrintFrame 3D Today</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
