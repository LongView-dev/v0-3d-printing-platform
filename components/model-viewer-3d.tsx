"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, Box, Html } from "@react-three/drei"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { OBJLoader } from "three/addons/loaders/OBJLoader.js"
import { STLLoader } from "three/addons/loaders/STLLoader.js"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Ruler, LayoutGrid, Maximize2, Loader2, AlertTriangle } from "lucide-react"
import type { ModelMeta } from "@/lib/types"

interface ModelViewer3DProps {
  model: ModelMeta
  className?: string
}

interface Model3DProps {
  url: string
  fileType: string
  onLoad?: (object: THREE.Object3D) => void
  onError?: (error: Error) => void
}

function Model3D({ url, fileType, onLoad, onError }: Model3DProps) {
  const meshRef = useRef<THREE.Object3D>(null)
  const gltf = useLoader(GLTFLoader, url)
  const object = fileType === "glb" ? gltf.scene : null

  useEffect(() => {
    if (fileType === "obj") {
      const objLoader = new OBJLoader()
      objLoader.load(
        url,
        (obj) => {
          if (onLoad) {
            onLoad(obj)
          }
        },
        undefined,
        (err) => {
          if (onError) {
            onError(err)
          }
        },
      )
    } else if (fileType === "stl") {
      const stlLoader = new STLLoader()
      stlLoader.load(
        url,
        (geometry) => {
          const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.4,
            metalness: 0.1,
          })
          const stlObject = new THREE.Mesh(geometry, material)
          if (onLoad) {
            onLoad(stlObject)
          }
        },
        undefined,
        (err) => {
          if (onError) {
            onError(err)
          }
        },
      )
    }
  }, [url, fileType, onLoad, onError])

  useFrame((state) => {
    if (meshRef.current) {
      // Optional: Add subtle rotation animation
      // meshRef.current.rotation.y += 0.005
    }
  })

  if (!object) return null

  return <primitive ref={meshRef} object={object} />
}

function ModelBoundingBox({ object }: { object: THREE.Object3D }) {
  const [box, setBox] = useState<THREE.Box3 | null>(null)

  useEffect(() => {
    if (object) {
      const bbox = new THREE.Box3().setFromObject(object)
      setBox(bbox)
    }
  }, [object])

  if (!box) return null

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  return (
    <group position={[center.x, center.y, center.z]}>
      <Box args={[size.x, size.y, size.z]} wireframe>
        <meshBasicMaterial color="orange" opacity={0.3} transparent />
      </Box>
    </group>
  )
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading 3D model...</span>
      </div>
    </Html>
  )
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <Html center>
      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-sm">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">{error}</span>
      </div>
    </Html>
  )
}

export function ModelViewer3D({ model, className }: ModelViewer3DProps) {
  const [loadedObject, setLoadedObject] = useState<THREE.Object3D | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBoundingBox, setShowBoundingBox] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [measureMode, setMeasureMode] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState<"light" | "dark" | "studio">("studio")
  const controlsRef = useRef<any>(null)

  const modelUrl = model.glbUrl || model.objUrl || model.stlUrl
  const fileType = model.glbUrl ? "glb" : model.objUrl ? "obj" : "stl"

  const handleModelLoad = (object: THREE.Object3D) => {
    setLoadedObject(object)
    setLoading(false)
    setError(null)

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    object.position.sub(center)

    // Scale to fit in view
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 5) {
      const scale = 5 / maxDim
      object.scale.setScalar(scale)
    }
  }

  const handleModelError = (error: Error) => {
    setError(error.message)
    setLoading(false)
  }

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const getEnvironmentPreset = () => {
    switch (backgroundColor) {
      case "light":
        return "apartment"
      case "dark":
        return "night"
      case "studio":
        return "studio"
      default:
        return "studio"
    }
  }

  if (!modelUrl) {
    return (
      <div className={`aspect-square bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No 3D model available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 3D Canvas */}
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={<LoadingSpinner />}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />

            {/* Environment */}
            <Environment preset={getEnvironmentPreset()} />

            {/* Grid */}
            {showGrid && (
              <Grid
                args={[20, 20]}
                position={[0, -2, 0]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#888888"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#444444"
                fadeDistance={15}
                fadeStrength={1}
              />
            )}

            {/* Model */}
            {!error && (
              <Model3D url={modelUrl} fileType={fileType} onLoad={handleModelLoad} onError={handleModelError} />
            )}

            {/* Bounding Box */}
            {showBoundingBox && loadedObject && <ModelBoundingBox object={loadedObject} />}

            {/* Error Display */}
            {error && <ErrorDisplay error={error} />}

            {/* Controls */}
            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              dampingFactor={0.05}
              enableDamping={true}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
          <Button variant="ghost" size="sm" onClick={resetCamera} title="Reset Camera">
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant={measureMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setMeasureMode(!measureMode)}
            title="Measure Tool"
          >
            <Ruler className="h-4 w-4" />
          </Button>

          <Button
            variant={showBoundingBox ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            title="Show Bounding Box"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant={showGrid ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        {/* Background Controls */}
        <div className="flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-2">
          {(["light", "dark", "studio"] as const).map((bg) => (
            <Button
              key={bg}
              variant={backgroundColor === bg ? "default" : "ghost"}
              size="sm"
              onClick={() => setBackgroundColor(bg)}
              className="capitalize"
            >
              {bg}
            </Button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-4 right-4">
        {loading && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading
          </Badge>
        )}
        {error && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Error
          </Badge>
        )}
        {measureMode && (
          <Badge variant="default" className="gap-1">
            <Ruler className="h-3 w-3" />
            Measure Mode
          </Badge>
        )}
      </div>
    </div>
  )
}
