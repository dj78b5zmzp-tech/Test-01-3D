import * as THREE from 'three'
import { useCallback, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei'
import BeamScene from './components/BeamScene'
import ColumnScene from './components/ColumnScene'
import SlabScene from './components/SlabScene'
import RebarTable from './components/RebarTable'
import ExportButtons from './components/ExportButtons'
import LeftSidebar from './components/LeftSidebar'
import RightPanel from './components/RightPanel'
import {
  useComponentKindState,
  useBeamParamsState,
  useColumnParamsState,
  useSlabParamsState,
} from './components/ParameterPanel'
import type { RebarItem } from './types/rebar'

const KIND_LABEL: Record<string, string> = { beam: '梁', column: '柱', slab: '板' }

export default function App() {
  const [kind, setKind] = useComponentKindState()
  const [beamParams, setBeam] = useBeamParamsState()
  const [columnParams, setColumn] = useColumnParamsState()
  const [slabParams, setSlab] = useSlabParamsState()

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

  const cameraPos: [number, number, number] =
    kind === 'beam' ? [6, 4, 6] : kind === 'column' ? [4, 3, 4] : [5, 4, 5]

  // resizable bottom panel
  const [panelH, setPanelH] = useState(224)
  const draggingBot = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  // resizable left / right panels
  const [leftW, setLeftW] = useState(320)
  const [rightW, setRightW] = useState(360)
  const draggingLeft = useRef(false)
  const draggingRight = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingBot.current) {
        setPanelH(Math.max(120, Math.min(500, startH.current + (startY.current - e.clientY))))
      }
      if (draggingLeft.current) {
        setLeftW(Math.max(200, Math.min(500, startW.current + (e.clientX - startX.current))))
      }
      if (draggingRight.current) {
        setRightW(Math.max(280, Math.min(560, startW.current - (e.clientX - startX.current))))
      }
    }
    const onUp = () => { draggingBot.current = false; draggingLeft.current = false; draggingRight.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col bg-background text-on-background overflow-hidden font-body-md antialiased selection:bg-primary/30 selection:text-primary">
      {/* ─── TopAppBar ─── */}
      <header className="flex justify-between items-center h-header-height px-gutter w-full fixed top-0 z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant transition-all duration-200">
        <div className="flex items-center space-x-8">
          <div className="flex items-center gap-3">
            <span className="font-display-lg text-display-lg font-bold text-on-surface flex items-center gap-2">
              3D <span className="text-primary font-headline-md text-headline-md mt-1">钢筋平法可视化</span>
            </span>
            <span className="px-2 py-0.5 bg-surface-container-highest text-secondary border border-secondary/30 rounded text-xs ml-2 mt-1">
              {KIND_LABEL[kind]}
            </span>
            {highlightId && (
              <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary border border-tertiary/40 text-xs font-label-mono ml-2">
                已选中: {highlightId}
              </span>
            )}
          </div>
          <nav className="hidden md:flex space-x-6 h-full pt-1">
            <a className="h-full flex items-center text-primary border-b-2 border-primary pb-1 font-body-md transition-colors" href="#">项目概览</a>
            <a className="h-full flex items-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors px-2 font-body-md" href="#">构件库</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ExportButtons getScene={getScene} />
        </div>
      </header>

      {/* ─── Main Layout ─── */}
      <div className="flex-1 mt-header-height flex overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar kind={kind} setKind={setKind} width={leftW}
          onPreset={(preset) => { setKind('beam'); setBeam('width', preset.width); setBeam('height', preset.height); setBeam('length', preset.length); if (preset.supportWidth !== undefined) setBeam('supportWidth', preset.supportWidth) }} />
        {/* Left resize handle */}
        <div className="w-1.5 cursor-ew-resize flex items-center justify-center group z-50 hover:bg-primary/20 transition-colors"
          onMouseDown={e => { draggingLeft.current = true; startX.current = e.clientX; startW.current = leftW }}>
          <div className="w-0.5 h-8 rounded-full bg-outline-variant/40 group-hover:bg-primary/60 transition-colors" />
        </div>

        {/* Center: Canvas + Bottom HUD */}
        <main className="flex-1 flex flex-col relative bg-surface-dim canvas-grid">
          {/* 3D Viewport */}
          <div className="flex-1 relative w-full h-full overflow-hidden" style={{ paddingBottom: `${panelH}px` }}>
            <Canvas
              key={kind}
              shadows
              gl={{ antialias: true, localClippingEnabled: true }}
              dpr={[1, 2]}
              onPointerMissed={() => setHighlightId(null)}
            >
              <color attach="background" args={['#0b1326']} />
              <PerspectiveCamera makeDefault position={cameraPos} fov={45} near={0.05} far={200} />
              <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1} maxDistance={50} target={[0, 0, 0]} />

              {kind === 'beam' && (
                <BeamScene params={beamParams} highlightId={highlightId} onPick={handlePick} onLayout={handleLayout} sceneRef={sceneRef} />
              )}
              {kind === 'column' && (
                <ColumnScene params={columnParams} highlightId={highlightId} onPick={handlePick} onLayout={handleLayout} sceneRef={sceneRef} />
              )}
              {kind === 'slab' && (
                <SlabScene params={slabParams} highlightId={highlightId} onPick={handlePick} onLayout={handleLayout} sceneRef={sceneRef} />
              )}

              <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
                <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#fff" />
              </GizmoHelper>
            </Canvas>

          </div>

          {/* Resizable Bottom HUD Panel */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col z-20 pointer-events-none bg-surface-dim/80 backdrop-blur-md border-t border-outline-variant"
            style={{ height: `${panelH}px` }}>
            {/* Drag handle */}
            <div className="h-2 cursor-ns-resize pointer-events-auto flex items-center justify-center group"
              onMouseDown={e => { draggingBot.current = true; startY.current = e.clientY; startH.current = panelH }}>
              <div className="w-10 h-1 rounded-full bg-outline-variant/60 group-hover:bg-primary/60 transition-colors" />
            </div>
            <div className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden">
              <RebarTable items={rebarItems} />
            </div>
          </div>
        </main>

        {/* Right resize handle */}
        <div className="w-1.5 cursor-ew-resize flex items-center justify-center group z-50 hover:bg-primary/20 transition-colors"
          onMouseDown={e => { draggingRight.current = true; startX.current = e.clientX; startW.current = rightW }}>
          <div className="w-0.5 h-8 rounded-full bg-outline-variant/40 group-hover:bg-primary/60 transition-colors" />
        </div>

        {/* Right Panel */}
        <RightPanel
          kind={kind} setKind={setKind}
          beamParams={beamParams} setBeam={setBeam}
          columnParams={columnParams} setColumn={setColumn}
          slabParams={slabParams} setSlab={setSlab}
          width={rightW}
          getScene={getScene}
        />
      </div>
    </div>
  )
}
