import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { Environment, ContactShadows, Grid } from '@react-three/drei'
import Concrete from './Concrete'
import RebarAnnotation from './RebarAnnotation'
import { buildStirrupCurve } from '../utils/rebarGeometry'
import { createRebarMaterial } from '../utils/rebarTexture'
import { REBAR_COLORS, formatStirrup } from '../utils/rebarConstants'
import { useColumnLayout, type ColumnPlacement } from '../hooks/useColumnRebars'
import type { ColumnParams } from '../types/component'

interface Props {
  params: ColumnParams
  highlightId: string | null
  onPick: (id: string) => void
  onLayout: (items: ColumnPlacement[]) => void
  sceneRef?: React.MutableRefObject<THREE.Group | null>
}

export default function ColumnScene({ params, highlightId, onPick, onLayout, sceneRef }: Props) {
  const { width, depth, height, cover, concreteOpacity, showAnnotations, longRebar, stirrup } = params
  const layout = useColumnLayout(params)

  // 推送下料数据
  useEffect(() => {
    onLayout(layout.items)
  }, [layout.items, onLayout])

  const longItem = layout.items.find((i) => i.id === 'CL')!
  const stItem = layout.items.find((i) => i.id === 'CS')!

  // 纵筋几何 (圆柱沿Y)
  const longGeom = useMemo(() => {
    return new THREE.CylinderGeometry(longRebar.diameter / 2, longRebar.diameter / 2, height, 24, 1)
  }, [longRebar.diameter, height])

  const longMat = useMemo(() => createRebarMaterial(REBAR_COLORS[longRebar.grade], 1, Math.max(1, Math.round(height / 200))), [longRebar.grade, height])
  const longHi = useMemo(() => {
    const m = longMat.clone()
    m.emissive = new THREE.Color('#fde047')
    m.emissiveIntensity = 0.6
    return m
  }, [longMat])

  // 箍筋几何 (XZ 平面闭合矩形 -> 沿Y方向阵列)
  const stirrupGeom = useMemo(() => {
    const curve = buildStirrupCurve(layout.innerW, layout.innerD, stirrup.diameter * 6, stirrup.diameter)
    const tube = new THREE.TubeGeometry(curve as unknown as THREE.Curve<THREE.Vector3>, 160, stirrup.diameter / 2, 12, false)
    tube.rotateX(Math.PI / 2) // XY -> XZ
    return tube
  }, [layout.innerW, layout.innerD, stirrup.diameter])

  const stMat = useMemo(() => createRebarMaterial(REBAR_COLORS[stirrup.grade], 6, 2), [stirrup.grade])
  const stHi = useMemo(() => {
    const m = stMat.clone()
    m.emissive = new THREE.Color('#fde047')
    m.emissiveIntensity = 0.7
    return m
  }, [stMat])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 14, 6]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Environment preset="warehouse" />

      <group scale={0.001} ref={sceneRef as any}>
        <Concrete width={depth} height={height} length={width} opacity={concreteOpacity} />

        {/* 纵筋 */}
        {longItem.positions!.map((p, i) => {
          const id = `${longItem.id}-${i + 1}`
          const isHi = highlightId === id
          return (
            <mesh
              key={id}
              geometry={longGeom}
              material={isHi ? longHi : longMat}
              position={[p.x, 0, p.z]}
              castShadow
              receiveShadow
              userData={{ rebarId: id, label: `${longItem.label}#${i + 1}` }}
              onClick={(e) => {
                e.stopPropagation()
                onPick(id)
              }}
            />
          )
        })}

        {/* 箍筋 */}
        {stItem.stirrupYs!.map((y, i) => {
          const id = `${stItem.id}-${i + 1}`
          const isHi = highlightId === id
          return (
            <mesh
              key={id}
              geometry={stirrupGeom}
              material={isHi ? stHi : stMat}
              position={[0, y, 0]}
              castShadow
              receiveShadow
              userData={{ rebarId: id, label: `${stItem.label}#${i + 1}` }}
              onClick={(e) => {
                e.stopPropagation()
                onPick(id)
              }}
            />
          )
        })}

        {showAnnotations && (
          <>
            <RebarAnnotation
              position={[width / 2 + 300, height / 2 + 200, 0]}
              text={`柱纵筋: ${longItem.count}${longRebar.grade}${longRebar.diameter}`}
            />
            <RebarAnnotation
              position={[-width / 2 - 300, 0, depth / 2 + 200]}
              text={`箍筋: ${formatStirrup(stirrup.grade, stirrup.diameter, stirrup.spacing)}`}
              color="#22d3ee"
            />
            <RebarAnnotation
              position={[0, -height / 2 - 350, 0]}
              text={`b×h×H = ${width}×${depth}×${height}  保护层${cover}`}
              color="#f87171"
            />
          </>
        )}
      </group>

      <ContactShadows position={[0, -height / 2 / 1000 - 0.01, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
      <Grid
        position={[0, -height / 2 / 1000 - 0.02, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#334155"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#475569"
        fadeDistance={20}
        infiniteGrid
      />
    </>
  )
}
