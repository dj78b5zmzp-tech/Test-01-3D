import * as THREE from 'three'
import { useMemo } from 'react'
import { createRebarMaterial } from '../utils/rebarTexture'
import { pointsToCurve } from '../utils/longBarPath'
import type { RebarPlacement } from '../hooks/useBeamRebars'

interface Props {
  item: RebarPlacement // 含 bars (每根钢筋的分段路径)
  color: string
  clippingPlanes?: THREE.Plane[]
  highlightId?: string | null
  onPick?: (id: string, index: number) => void
}

/** 一组沿X方向带锚固弯钩+搭接分段的纵筋。一根钢筋分段渲染。*/
export default function LongitudinalRebar({ item, color, clippingPlanes, highlightId, onPick }: Props) {
  const bars = item.bars ?? []
  const diameter = item.diameter

  const baseMaterial = useMemo(() => createRebarMaterial(color, 12, 2), [color])
  const highlightMaterial = useMemo(() => {
    const m = baseMaterial.clone()
    m.emissive = new THREE.Color('#fde047')
    m.emissiveIntensity = 0.6
    return m
  }, [baseMaterial])

  baseMaterial.clippingPlanes = clippingPlanes ?? []
  highlightMaterial.clippingPlanes = clippingPlanes ?? []

  // 为每根钢筋的每段生成一个 TubeGeometry
  const meshes = useMemo(() => {
    const list: { geom: THREE.BufferGeometry; key: string; barIndex: number }[] = []
    bars.forEach((bar, bi) => {
      bar.segments.forEach((seg, si) => {
        if (seg.points.length < 2) return
        const curve = pointsToCurve(seg.points)
        const tubular = Math.max(8, Math.round(seg.length / 50))
        const geom = new THREE.TubeGeometry(
          curve as unknown as THREE.Curve<THREE.Vector3>,
          tubular,
          diameter / 2,
          12,
          false,
        )
        list.push({ geom, key: `${bi}-${si}`, barIndex: bi })
      })
    })
    return list
  }, [bars, diameter])

  return (
    <group>
      {meshes.map(({ geom, key, barIndex }) => {
        const fullId = `${item.id}-${barIndex + 1}`
        const isHi = highlightId === fullId
        return (
          <mesh
            key={key}
            geometry={geom}
            material={isHi ? highlightMaterial : baseMaterial}
            castShadow
            receiveShadow
            userData={{ rebarId: fullId, role: item.role, label: `${item.label}#${barIndex + 1}` }}
            onClick={(e) => {
              e.stopPropagation()
              onPick?.(fullId, barIndex)
            }}
          />
        )
      })}
    </group>
  )
}
