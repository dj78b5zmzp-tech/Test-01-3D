import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { Environment, ContactShadows, Grid } from '@react-three/drei'
import Concrete from './Concrete'
import RebarAnnotation from './RebarAnnotation'
import { createRebarMaterial } from '../utils/rebarTexture'
import { REBAR_COLORS } from '../utils/rebarConstants'
import { useSlabLayout, type SlabRebarMesh } from '../hooks/useSlabRebars'
import type { SlabParams } from '../types/component'
import type { RebarItem } from '../types/rebar'

interface Props {
  params: SlabParams
  highlightId: string | null
  onPick: (id: string) => void
  onLayout: (items: RebarItem[]) => void
  sceneRef?: React.MutableRefObject<THREE.Group | null>
}

/** 一组同方向同位置同直径的钢筋 (一个 mesh 网格) */
function RebarRow({
  data,
  highlightId,
  onPick,
}: {
  data: SlabRebarMesh
  highlightId: string | null
  onPick: (id: string) => void
}) {
  const isX = data.direction === 'X'

  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(data.diameter / 2, data.diameter / 2, data.barLength, 16, 1)
    // 默认沿Y轴；X向钢筋: 绕Z转90°，使其沿X; Z向钢筋: 绕X转90°，使其沿Z
    if (isX) g.rotateZ(Math.PI / 2)
    else g.rotateX(Math.PI / 2)
    return g
  }, [data.diameter, data.barLength, isX])

  const baseMat = useMemo(
    () => createRebarMaterial(REBAR_COLORS[data.grade], Math.max(1, Math.round(data.barLength / 200)), 2),
    [data.grade, data.barLength],
  )
  const hiMat = useMemo(() => {
    const m = baseMat.clone()
    m.emissive = new THREE.Color('#fde047')
    m.emissiveIntensity = 0.6
    return m
  }, [baseMat])

  return (
    <group>
      {data.positions.map((pos, i) => {
        const id = `${data.id}-${i + 1}`
        const isHi = highlightId === id
        const position: [number, number, number] = isX ? [0, data.y, pos] : [pos, data.y, 0]
        return (
          <mesh
            key={id}
            geometry={geometry}
            material={isHi ? hiMat : baseMat}
            position={position}
            castShadow
            receiveShadow
            userData={{ rebarId: id, label: `${data.label}#${i + 1}` }}
            onClick={(e) => {
              e.stopPropagation()
              onPick(id)
            }}
          />
        )
      })}
    </group>
  )
}

export default function SlabScene({ params, highlightId, onPick, onLayout, sceneRef }: Props) {
  const { lengthX, lengthZ, thickness, cover, concreteOpacity, showAnnotations } = params
  const layout = useSlabLayout(params)

  useEffect(() => {
    onLayout(layout.meshes)
  }, [layout.meshes, onLayout])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <Environment preset="warehouse" />

      <group scale={0.001} ref={sceneRef as any}>
        <Concrete width={lengthZ} height={thickness} length={lengthX} opacity={concreteOpacity} />
        {layout.meshes.map((m) => (
          <RebarRow key={m.id} data={m} highlightId={highlightId} onPick={onPick} />
        ))}

        {showAnnotations && (
          <>
            <RebarAnnotation
              position={[lengthX / 2 + 300, -thickness / 2 - 200, 0]}
              text={`底筋: ${params.bottomRebarX.grade}${params.bottomRebarX.diameter}@${params.bottomRebarX.spacing}(X) / ${params.bottomRebarZ.grade}${params.bottomRebarZ.diameter}@${params.bottomRebarZ.spacing}(Z)`}
              color="#fb923c"
            />
            {params.hasTopRebar && (
              <RebarAnnotation
                position={[-lengthX / 2 - 300, thickness / 2 + 200, 0]}
                text={`面筋: ${params.topRebarX.grade}${params.topRebarX.diameter}@${params.topRebarX.spacing}(X) / ${params.topRebarZ.grade}${params.topRebarZ.diameter}@${params.topRebarZ.spacing}(Z)`}
                color="#fbbf24"
              />
            )}
            <RebarAnnotation
              position={[0, -thickness / 2 - 450, 0]}
              text={`板 ${lengthX}×${lengthZ}×${thickness}  保护层${cover}`}
              color="#f87171"
            />
          </>
        )}
      </group>

      <ContactShadows position={[0, -thickness / 2 / 1000 - 0.01, 0]} opacity={0.5} scale={30} blur={2.5} far={6} />
      <Grid
        position={[0, -thickness / 2 / 1000 - 0.02, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#334155"
        sectionSize={2}
        sectionThickness={1.2}
        sectionColor="#475569"
        fadeDistance={30}
        infiniteGrid
      />
    </>
  )
}
