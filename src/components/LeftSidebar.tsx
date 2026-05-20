import type { ComponentKind } from '../types/component'

export interface BeamPreset {
  label: string
  width: number
  height: number
  length: number
  supportWidth?: number
}

const NAV_ITEMS: { kind: ComponentKind; icon: string; label: string }[] = [
  { kind: 'beam', icon: 'view_in_ar', label: '梁' },
  { kind: 'column', icon: 'view_column', label: '柱' },
  { kind: 'slab', icon: 'dashboard', label: '板' },
]

const BEAM_PRESETS: BeamPreset[] = [
  { label: '默认 KL · 5m / 300×600', width: 300, height: 600, length: 5000, supportWidth: 500 },
  { label: '小型次梁 · 4m / 250×400', width: 250, height: 400, length: 4000, supportWidth: 400 },
  { label: '大跨主梁 · 8m / 350×800', width: 350, height: 800, length: 8000, supportWidth: 600 },
  { label: '窄支座弯锚 · 5m / 300×600', width: 300, height: 600, length: 5000, supportWidth: 300 },
]

interface Props {
  kind: ComponentKind
  setKind: (k: ComponentKind) => void
  width: number
  onPreset?: (p: BeamPreset) => void
}

export default function LeftSidebar({ kind, setKind, width, onPreset }: Props) {
  return (
    <aside className="h-full flex flex-col p-4 space-y-2 bg-surface-container-low/90 backdrop-blur-md border-r border-outline-variant z-40 flex-shrink-0 overflow-y-auto"
      style={{ width: `${width}px` }}>
      {/* brand block */}
      <div className="flex items-center gap-3 mb-4 p-2">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline/30 flex-shrink-0">
          <span className="material-symbols-outlined text-primary">domain</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-headline-md text-[14px] font-black text-on-surface leading-tight truncate">BIM 钢筋精细化设计</h2>
          <p className="text-xs text-on-surface-variant">V2.4.0</p>
        </div>
      </div>

      {/* Modules */}
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[16px] text-primary">settings_suggest</span>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">功能模块</span>
      </div>

      <nav className="flex flex-col gap-1 w-full">
        <button className="flex items-center gap-3 p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors w-full text-left text-sm">
          <span className="material-symbols-outlined text-[18px]">assessment</span>
          <span>结构分析</span>
        </button>
        {NAV_ITEMS.map(item => {
          const active = kind === item.kind
          return (
            <button key={item.kind} onClick={() => setKind(item.kind)}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 w-full text-left text-sm ${
                active
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}>
              <span className={`material-symbols-outlined text-[18px] ${active ? 'filled-icon' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Presets */}
      <div className="pt-4 border-t border-outline-variant/40">
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">预设方案</span>
      </div>
      <div className="flex flex-col gap-1">
        {BEAM_PRESETS.map((preset, i) => (
          <button key={i} onClick={() => onPreset?.(preset)}
            className="flex items-center gap-3 p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors w-full text-left text-sm">
            <span className="material-symbols-outlined text-[16px] text-primary/60">grid_view</span>
            <span className="truncate">{preset.label}</span>
          </button>
        ))}
      </div>

      {/* footer */}
      <div className="mt-auto border-t border-outline-variant/50 pt-4 flex flex-col gap-1">
        <a href="#" className="flex items-center gap-3 p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all duration-200 text-sm">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>设置</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-all duration-200 text-sm">
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          <span>帮助与支持</span>
        </a>
      </div>
    </aside>
  )
}
