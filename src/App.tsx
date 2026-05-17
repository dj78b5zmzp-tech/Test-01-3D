import * as THREE from 'three'
import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Leva } from 'leva'
import BeamScene from './components/BeamScene'
import ColumnScene from './components/ColumnScene'
import SlabScene from './components/SlabScene'
import RebarTable from './components/RebarTable'
import ExportButtons from './components/ExportButtons'
import {
  useBeamParams,
  useComponentKind,
  useColumnParams,
  useSlabParams,
} from './components/ParameterPanel'
import type { RebarItem } from './types/rebar'

const KIND_LABEL: Record<string, string> = { beam: '梁构件', column: '柱构件', slab: '板构件' }

export default function App() {
  const kind = useComponentKind()
  const beamParams = useBeamParams()
  const columnParams = useColumnParams()
  const slabParams = useSlabParams()

  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [rebarItems, setRebarItems] = useState<RebarItem[]>([])
  const sceneRef = useRef<THREE.Group | null>(null)

  const handlePick = useCallback((id: string) => {
    setHighlightId((cur) => (cur === id ? null : id))
  }, [])

  const handleLayout = useCallback((items: RebarItem[]) => {
    setRebarItems(items)
  }, [])

  const getScene = useCallback(() => sceneRef.current, [])

  // 相机默认位置随构件切换
  const cameraPos: [number, number, number] =
    kind === 'beam' ? [6, 4, 6] : kind === 'column' ? [4, 3, 4] : [5, 4, 5]

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <header className="h-12 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-wide">3D 钢筋平法可视化</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {KIND_LABEL[kind]}
          </span>
          {highlightId && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              ✓ 已选中: {highlightId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ExportButtons getScene={getScene} />
          <div className="text-xs text-slate-400">左键旋转 · 右键平移 · 滚轮缩放 · 点击钢筋高亮</div>
        </div>
      </header>

      <main className="flex-1 relative">
        <Canvas
          key={kind}
          shadows
          gl={{ antialias: true, localClippingEnabled: true }}
          dpr={[1, 2]}
          onPointerMissed={() => setHighlightId(null)}
        >
          <color attach="background" args={['#0b0f14']} />
          <PerspectiveCamera makeDefault position={cameraPos} fov={45} near={0.05} far={200} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1} maxDistance={50} target={[0, 0, 0]} />

          {kind === 'beam' && (
            <BeamScene
              params={beamParams}
              highlightId={highlightId}
              onPick={handlePick}
              onLayout={handleLayout}
              sceneRef={sceneRef}
            />
          )}
          {kind === 'column' && (
            <ColumnScene
              params={columnParams}
              highlightId={highlightId}
              onPick={handlePick}
              onLayout={handleLayout}
              sceneRef={sceneRef}
            />
          )}
          {kind === 'slab' && (
            <SlabScene
              params={slabParams}
              highlightId={highlightId}
              onPick={handlePick}
              onLayout={handleLayout}
              sceneRef={sceneRef}
            />
          )}

          <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#fff" />
          </GizmoHelper>
        </Canvas>

        <Leva collapsed={false} oneLineLabels titleBar={{ title: '参数控制' }} />

        {/* 左下图例 */}
        <div className="absolute left-4 top-4 bg-slate-900/85 border border-slate-700 rounded-lg p-3 text-xs space-y-1.5 backdrop-blur">
          <div className="font-semibold text-slate-200 mb-1">钢筋等级</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-1.5 rounded" style={{ background: '#7d848c' }} />
            <span>HRB400 (C)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-1.5 rounded" style={{ background: '#9aa0a6' }} />
            <span>HPB300 (G)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-1.5 rounded" style={{ background: '#5f6770' }} />
            <span>HRB500 (E)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-1.5 rounded" style={{ background: '#fde047', boxShadow: '0 0 4px #fde047' }} />
            <span>已选中(发光)</span>
          </div>
        </div>

        <RebarTable items={rebarItems} />
      </main>
    </div>
  )
}
