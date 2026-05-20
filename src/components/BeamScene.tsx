import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { Environment, ContactShadows, Grid } from '@react-three/drei'
import Concrete from './Concrete'
import Support from './Support'
import LongitudinalRebar from './LongitudinalRebar'
import Stirrup from './Stirrup'
import RebarAnnotation from './RebarAnnotation'
import { REBAR_COLORS, formatRebar, formatStirrup } from '../utils/rebarConstants'
import { useBeamLayout } from '../hooks/useBeamRebars'
import type { BeamParams } from '../types/beam'
import type { RebarItem } from '../types/rebar'

interface Props {
  params: BeamParams
  highlightId: string | null
  onPick: (id: string) => void
  onLayout: (items: RebarItem[]) => void
  sceneRef?: React.MutableRefObject<THREE.Group | null>
}

/**
 * 场景单位：1 = 1mm。
 * 内部用一个 group 缩放 0.001，使外部相机以"米"工作更自然。
 */
export default function BeamScene({ params, highlightId, onPick, onLayout, sceneRef }: Props) {
  const { width, height, length, cover, topRebar, bottomRebar, stirrup, waistRebar, concreteOpacity, showAnnotations, enableClipping, clipPosition } = params
  const layout = useBeamLayout(params)
  const { topY, bottomY, innerW } = layout

  // 推送下料数据
  useEffect(() => {
    onLayout(layout.items)
  }, [layout.items, onLayout])

  const clippingPlanes = useMemo(() => {
    if (!enableClipping) return [] as THREE.Plane[]
    const x = (clipPosition - 0.5) * length
    return [new THREE.Plane(new THREE.Vector3(1, 0, 0), -x)]
  }, [enableClipping, clipPosition, length])

  const topItem = layout.items.find((i) => i.id === 'TM')
  const botItem = layout.items.find((i) => i.id === 'BM')
  const waistItem = layout.items.find((i) => i.id === 'WA')
  const stirrupItem = layout.items.find((i) => i.id === 'ST')!

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <Environment preset="warehouse" />

      <group scale={0.001} ref={sceneRef as any}>
        <Concrete width={width} height={height} length={length} opacity={concreteOpacity} clippingPlanes={clippingPlanes} />

        {params.showSupports && (
          <>
            <Support
              centerX={-length / 2 - params.supportWidth / 2}
              hc={params.supportWidth}
              bc={params.supportDepth}
              beamHeight={height}
              extUp={params.supportExtUp}
              extDown={params.supportExtDown}
              opacity={Math.min(1, concreteOpacity + 0.15)}
              clippingPlanes={clippingPlanes}
            />
            <Support
              centerX={length / 2 + params.supportWidth / 2}
              hc={params.supportWidth}
              bc={params.supportDepth}
              beamHeight={height}
              extUp={params.supportExtUp}
              extDown={params.supportExtDown}
              opacity={Math.min(1, concreteOpacity + 0.15)}
              clippingPlanes={clippingPlanes}
            />
          </>
        )}

        {topItem && (
          <LongitudinalRebar
            item={topItem}
            color={REBAR_COLORS[topRebar.grade]}
            clippingPlanes={clippingPlanes}
            highlightId={highlightId}
            onPick={(id) => onPick(id)}
          />
        )}
        {botItem && (
          <LongitudinalRebar
            item={botItem}
            color={REBAR_COLORS[bottomRebar.grade]}
            clippingPlanes={clippingPlanes}
            highlightId={highlightId}
            onPick={(id) => onPick(id)}
          />
        )}
        {waistItem && (
          <LongitudinalRebar
            item={waistItem}
            color={REBAR_COLORS[waistRebar.grade]}
            clippingPlanes={clippingPlanes}
            highlightId={highlightId}
            onPick={(id) => onPick(id)}
          />
        )}
        <Stirrup
          item={stirrupItem}
          color={REBAR_COLORS[stirrup.grade]}
          clippingPlanes={clippingPlanes}
          highlightId={highlightId}
          onPick={(id) => onPick(id)}
        />

        {enableClipping && (
          <mesh position={[(clipPosition - 0.5) * length, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[width * 1.4, height * 1.4]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
        )}

        {showAnnotations && (
          <>
            <RebarAnnotation
              position={[length / 2 + 200, topY, 0]}
              text={`上部纵筋: ${formatRebar(topRebar.grade, topRebar.diameter, topRebar.count)}`}
            />
            <RebarAnnotation
              position={[length / 2 + 200, bottomY, 0]}
              text={`下部纵筋: ${formatRebar(bottomRebar.grade, bottomRebar.diameter, bottomRebar.count)}`}
            />
            <RebarAnnotation
              position={[0, height / 2 + 350, 0]}
              text={`箍筋: ${formatStirrup(stirrup.grade, stirrup.diameter, stirrup.spacing)}`}
              color="#22d3ee"
            />
            {waistRebar.perSide > 0 && (
              <RebarAnnotation
                position={[-length / 2 - 200, 0, innerW / 2]}
                text={`腰筋: ${waistRebar.perSide * 2}${waistRebar.grade}${waistRebar.diameter}`}
                color="#a78bfa"
              />
            )}
            <RebarAnnotation
              position={[length / 4, -height / 2 - 400, 0]}
              text={`b×h×Ln = ${width}×${height}×${length}  保护层${cover}`}
              color="#f87171"
            />
            <RebarAnnotation
              position={[-length / 4, -height / 2 - 400, 0]}
              text={`锚固 La=${layout.anchorInfo.La}mm  ${layout.anchorInfo.isBendAnchor ? '弯锚(15d)' : '直锚'}`}
              color="#34d399"
            />
          </>
        )}
      </group>

      <ContactShadows position={[0, (-height / 2 - (params.showSupports ? params.supportExtDown : 0)) / 1000 - 0.01, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
      <Grid
        position={[0, (-height / 2 - (params.showSupports ? params.supportExtDown : 0)) / 1000 - 0.02, 0]}
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
