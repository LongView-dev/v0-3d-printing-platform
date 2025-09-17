export default function ModelDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-20 bg-muted rounded animate-pulse" />
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 3D Viewer Skeleton */}
        <div className="lg:col-span-2">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Info Panel Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-muted-foreground/20 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted-foreground/20 rounded" />
                <div className="h-4 w-3/4 bg-muted-foreground/20 rounded" />
                <div className="h-4 w-1/2 bg-muted-foreground/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
