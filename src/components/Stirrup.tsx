import * as THREE from 'three'
import { useMemo } from 'react'
import { buildStirrupCurve } from '../utils/rebarGeometry'
import { createRebarMaterial } from '../utils/rebarTexture'
import type { RebarPlacement } from '../hooks/useBeamRebars'

interface Props {
  item: RebarPlacement // 含 innerW/innerH/stirrupXs/diameter
  color: string
  clippingPlanes?: THREE.Plane[]
  highlightId?: string | null
  onPick?: (id: string, index: number) => void
}

/** 沿梁长方向阵列的矩形箍筋 */
export default function Stirrup({ item, color, clippingPlanes, highlightId, onPick }: Props) {
  const diameter = item.diameter
  const innerW = item.innerW ?? 200
  const innerH = item.innerH ?? 400
  const xs = item.stirrupXs ?? []

  const geometry = useMemo(() => {
    const hookLen = item.hookLen ?? Math.max(10 * diameter, 75)
    const curve = buildStirrupCurve(innerW, innerH, hookLen, diameter)
    const tube = new THREE.TubeGeometry(
      curve as unknown as THREE.Curve<THREE.Vector3>,
      160,
      diameter / 2,
      12,
      false,
    )
    tube.rotateY(Math.PI / 2) // XY -> YZ
    return tube
  }, [innerW, innerH, diameter, item.hookLen])

  const baseMaterial = useMemo(() => {
    const m = createRebarMaterial(color, 6, 2)
    return m
  }, [color])

  const highlightMaterial = useMemo(() => {
    const m = baseMaterial.clone()
    m.emissive = new THREE.Color('#fde047')
    m.emissiveIntensity = 0.7
    return m
  }, [baseMaterial])

  baseMaterial.clippingPlanes = clippingPlanes ?? []
  highlightMaterial.clippingPlanes = clippingPlanes ?? []

  return (
    <group>
      {xs.map((x, i) => {
        const fullId = `${item.id}-${i + 1}`
        const isHi = highlightId === fullId
        return (
          <mesh
            key={i}
            geometry={geometry}
            material={isHi ? highlightMaterial : baseMaterial}
            position={[x, 0, 0]}
            castShadow
            receiveShadow
            userData={{ rebarId: fullId, role: item.role, label: `${item.label}#${i + 1}` }}
            onClick={(e) => {
              e.stopPropagation()
              onPick?.(fullId, i)
            }}
          />
        )
      })}
    </group>
  )
}
