"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { useState, Suspense } from "react"
import "./globals.css"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PrintFrame 3D - 3D Model Generation & Management Platform</title>
        <meta
          name="description"
          content="Upload, generate, and manage 3D models for 3D printing. Create models from text or images using AI."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ErrorBoundary>
              <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1">
                  <Suspense fallback={null}>{children}</Suspense>
                </main>
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
