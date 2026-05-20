import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

interface Props {
  getScene: () => THREE.Object3D | null
}

function saveBlob(data: BlobPart, filename: string, type: string) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportButtons({ getScene }: Props) {
  const stamp = () => new Date().toISOString().slice(0, 10)

  const exportGLTF = (binary: boolean) => {
    const scene = getScene()
    if (!scene) return
    const exporter = new GLTFExporter()
    exporter.parse(
      scene,
      (result) => {
        if (binary && result instanceof ArrayBuffer) {
          saveBlob(result, `rebar-beam-${stamp()}.glb`, 'application/octet-stream')
        } else {
          const json = JSON.stringify(result, null, 2)
          saveBlob(json, `rebar-beam-${stamp()}.gltf`, 'application/json')
        }
      },
      (err) => {
        console.error('GLTF 导出失败', err)
        alert('GLTF 导出失败，请查看控制台')
      },
      { binary },
    )
  }

  const exportSTL = () => {
    const scene = getScene()
    if (!scene) return
    const exporter = new STLExporter()
    const stl = exporter.parse(scene, { binary: true }) as unknown as DataView
    saveBlob(stl.buffer as ArrayBuffer, `rebar-beam-${stamp()}.stl`, 'application/octet-stream')
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-on-surface-variant text-sm mr-2">导出:</span>
      <button className="px-3 py-1 bg-primary text-on-primary rounded text-sm hover:bg-primary/90 transition-colors shadow-sm font-semibold"
        onClick={() => exportGLTF(true)}>导出 GLB</button>
      <button className="px-3 py-1 border border-outline-variant text-on-surface rounded text-sm hover:bg-surface-container-highest transition-colors"
        onClick={() => exportGLTF(false)}>GLTF</button>
      <button className="px-3 py-1 border border-outline-variant text-on-surface rounded text-sm hover:bg-surface-container-highest transition-colors"
        onClick={exportSTL}>STL</button>
    </div>
  )
}
