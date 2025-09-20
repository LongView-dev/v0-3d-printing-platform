"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Upload, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserMenu } from "@/components/user-menu"
import { useAppStore } from "@/lib/store"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme, user, searchQuery, setSearchQuery } = useAppStore()

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P3D</span>
            </div>
            <span className="font-bold text-xl">PrintFrame 3D</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/gallery"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/gallery" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/preview"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/preview" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Preview
          </Link>
          {user && (
            <Link
              href="/me/gallery"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/me/gallery" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              My Models
            </Link>
          )}
          <Link
            href="/upload"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/upload" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Upload
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center space-x-2 flex-1 max-w-sm mx-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4" />
            </Link>
          </Button>

          <UserMenu />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem asChild>
                  <Link href="/gallery">Gallery</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/preview">Preview</Link>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link href="/me/gallery">My Models</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/upload">Upload</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
