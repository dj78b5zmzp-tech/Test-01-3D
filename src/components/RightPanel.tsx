import { useState } from 'react'
import * as THREE from 'three'
import type { BeamParams, RebarGrade } from '../types/beam'
import type { ColumnParams, SlabParams, ComponentKind } from '../types/component'
import type { SetParam } from './ParameterPanel'

/* ═══════ tiny reusable controls ═══════ */

function NumField({ label, value, unit, onChange }: {
  label: string; value: number; unit?: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-1">
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} title={label}
          className="w-20 bg-surface-dim text-right text-sm text-on-surface font-label-mono px-2 py-1 rounded border border-outline-variant/30 focus:border-primary focus:ring-0" />
        {unit && <span className="text-xs text-on-surface-variant w-8">{unit}</span>}
      </div>
    </div>
  )
}

function ReadonlyField({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-1">
        <span className="w-20 text-right text-sm text-tertiary font-label-mono px-2 py-1 bg-surface-dim rounded border border-outline-variant/20">{value}</span>
        {unit && <span className="text-xs text-on-surface-variant w-8">{unit}</span>}
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs text-on-surface-variant">{label}</label>
        <span className="font-label-mono text-label-mono text-primary bg-surface-dim px-2 py-0.5 rounded border border-outline-variant/30">
          {step < 1 ? value.toFixed(2) : value}
        </span>
      </div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value}
        title={label} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded bg-surface-dim border-outline-variant text-primary focus:ring-primary focus:ring-offset-0" />
      <span className="text-sm text-on-surface">{label}</span>
    </label>
  )
}

function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { label: string; value: T }[]; onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value as T)} title={label}
        className="w-28 bg-surface-dim border border-outline-variant/30 rounded text-sm text-on-surface focus:ring-1 focus:ring-primary px-2 py-1">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function SectionHeader({ title, collapsible, open, onToggle, accent }: {
  title: string; collapsible?: boolean; open?: boolean; onToggle?: () => void; accent?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${collapsible ? 'cursor-pointer' : ''} ${accent ? 'mt-2' : ''}`} onClick={onToggle}>
      <h3 className={accent
        ? 'text-sm font-bold text-primary border-l-2 border-primary pl-2 tracking-wide'
        : 'text-xs font-semibold text-on-surface-variant uppercase tracking-wider'
      }>{title}</h3>
      {collapsible && (
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{open ? 'expand_less' : 'expand_more'}</span>
      )}
    </div>
  )
}

const GRADE_OPTS: { label: string; value: RebarGrade }[] = [
  { label: 'HRB400 (C)', value: 'C' },
  { label: 'HPB300 (G)', value: 'G' },
  { label: 'HRB500 (E)', value: 'E' },
]

const CONCRETE_OPTS = ['C25','C30','C35','C40','C45','C50'].map(v => ({ label: v, value: v }))
const SEISMIC_OPTS = ['L1','L2','L3','L4'].map(v => ({ label: v, value: v }))

const KIND_LABEL: Record<ComponentKind, string> = { beam: '梁', column: '柱', slab: '板' }
const KIND_CN: Record<ComponentKind, string> = { beam: 'KL · 框架梁', column: 'KZ · 框架柱', slab: 'B · 楼板' }

/* ═══════ TAB ICONS ═══════ */
const TABS = [
  { icon: 'tune', tip: '参数' },
  { icon: 'architecture', tip: '配筋' },
  { icon: 'visibility', tip: '显示' },
  { icon: 'download', tip: '导出' },
  { icon: 'smart_toy', tip: 'AI 助手' },
] as const

/* ═══════ Tab 0: Parameters ═══════ */
function ParamTab({ kind, beamParams, setBeam, columnParams, setColumn, slabParams, setSlab }: {
  kind: ComponentKind
  beamParams: BeamParams; setBeam: SetParam<BeamParams>
  columnParams: ColumnParams; setColumn: SetParam<ColumnParams>
  slabParams: SlabParams; setSlab: SetParam<SlabParams>
}) {
  const [matOpen, setMatOpen] = useState(true)
  const [geoOpen, setGeoOpen] = useState(true)

  const dims = kind === 'beam'
    ? `${beamParams.width}×${beamParams.height} · Ln=${beamParams.length}`
    : kind === 'column'
    ? `${columnParams.width}×${columnParams.depth} · H=${columnParams.height}`
    : `${slabParams.lengthX}×${slabParams.lengthZ} · t=${slabParams.thickness}`

  const vol = kind === 'beam'
    ? (beamParams.width * beamParams.height * beamParams.length / 1e9)
    : kind === 'column'
    ? (columnParams.width * columnParams.depth * columnParams.height / 1e9)
    : (slabParams.lengthX * slabParams.lengthZ * slabParams.thickness / 1e9)

  return (
    <>
      {/* SELECTION card */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">当前选择</span>
        <span className="text-xs text-primary font-semibold">{KIND_LABEL[kind]}</span>
      </div>
      <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/40 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {kind === 'beam' ? 'view_in_ar' : kind === 'column' ? 'view_column' : 'dashboard'}
          </span>
        </div>
        <div>
          <div className="text-sm font-semibold text-on-surface">{KIND_CN[kind]}</div>
          <div className="text-xs text-on-surface-variant font-label-mono">{dims}</div>
        </div>
      </div>

      {/* MATERIAL SPECS */}
      <SectionHeader title="材料参数" collapsible open={matOpen} onToggle={() => setMatOpen(!matOpen)} accent />
      {matOpen && (
        <div className="mb-4">
          <Select label="混凝土" value="C45" options={CONCRETE_OPTS} onChange={() => {}} />
          <Select label="抗震等级" value="L2" options={SEISMIC_OPTS} onChange={() => {}} />
          {kind === 'beam' && <NumField label="保护层" value={beamParams.cover} unit="mm" onChange={v => setBeam('cover', v)} />}
          {kind === 'column' && <NumField label="保护层" value={columnParams.cover} unit="mm" onChange={v => setColumn('cover', v)} />}
          {kind === 'slab' && <NumField label="保护层" value={slabParams.cover} unit="mm" onChange={v => setSlab('cover', v)} />}
        </div>
      )}

      {/* GEOMETRIC PARAMETERS */}
      <SectionHeader title="几何参数" collapsible open={geoOpen} onToggle={() => setGeoOpen(!geoOpen)} accent />
      {geoOpen && (
        <div className="mb-2">
          {kind === 'beam' && (
            <>
              <NumField label="净跨 (Ln)" value={beamParams.length} unit="mm" onChange={v => setBeam('length', v)} />
              <NumField label="截面宽 (b)" value={beamParams.width} unit="mm" onChange={v => setBeam('width', v)} />
              <NumField label="截面高 (h)" value={beamParams.height} unit="mm" onChange={v => setBeam('height', v)} />
              <NumField label="左支座宽" value={beamParams.supportWidth} unit="mm" onChange={v => setBeam('supportWidth', v)} />
              <NumField label="右支座深" value={beamParams.supportDepth} unit="mm" onChange={v => setBeam('supportDepth', v)} />
              <ReadonlyField label="体积" value={vol.toFixed(1)} unit="m³" />
            </>
          )}
          {kind === 'column' && (
            <>
              <NumField label="截面宽 (b)" value={columnParams.width} unit="mm" onChange={v => setColumn('width', v)} />
              <NumField label="截面深 (h)" value={columnParams.depth} unit="mm" onChange={v => setColumn('depth', v)} />
              <NumField label="柱高" value={columnParams.height} unit="mm" onChange={v => setColumn('height', v)} />
              <ReadonlyField label="体积" value={vol.toFixed(2)} unit="m³" />
            </>
          )}
          {kind === 'slab' && (
            <>
              <NumField label="板长 X" value={slabParams.lengthX} unit="mm" onChange={v => setSlab('lengthX', v)} />
              <NumField label="板长 Z" value={slabParams.lengthZ} unit="mm" onChange={v => setSlab('lengthZ', v)} />
              <NumField label="板厚" value={slabParams.thickness} unit="mm" onChange={v => setSlab('thickness', v)} />
              <ReadonlyField label="体积" value={vol.toFixed(2)} unit="m³" />
            </>
          )}
        </div>
      )}
    </>
  )
}

/* ═══════ Tab 1: Rebar ═══════ */
function RebarTab({ kind, beamParams, setBeam, columnParams, setColumn, slabParams, setSlab }: {
  kind: ComponentKind
  beamParams: BeamParams; setBeam: SetParam<BeamParams>
  columnParams: ColumnParams; setColumn: SetParam<ColumnParams>
  slabParams: SlabParams; setSlab: SetParam<SlabParams>
}) {
  if (kind === 'beam') {
    const p = beamParams; const set = setBeam
    return (
      <>
        <SectionHeader title="上部纵筋" />
        <Select label="等级" value={p.topRebar.grade} options={GRADE_OPTS} onChange={v => set('topRebar', { ...p.topRebar, grade: v })} />
        <Select label="直径" value={String(p.topRebar.diameter) as any} options={[12,14,16,18,20,22,25,28,32].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('topRebar', { ...p.topRebar, diameter: Number(v) })} />
        <NumField label="根数" value={p.topRebar.count} onChange={v => set('topRebar', { ...p.topRebar, count: v })} />

        <SectionHeader title="下部纵筋" />
        <Select label="等级" value={p.bottomRebar.grade} options={GRADE_OPTS} onChange={v => set('bottomRebar', { ...p.bottomRebar, grade: v })} />
        <Select label="直径" value={String(p.bottomRebar.diameter) as any} options={[12,14,16,18,20,22,25,28,32].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('bottomRebar', { ...p.bottomRebar, diameter: Number(v) })} />
        <NumField label="根数" value={p.bottomRebar.count} onChange={v => set('bottomRebar', { ...p.bottomRebar, count: v })} />

        <SectionHeader title="箍筋" />
        <Select label="等级" value={p.stirrup.grade} options={GRADE_OPTS} onChange={v => set('stirrup', { ...p.stirrup, grade: v })} />
        <Select label="直径" value={String(p.stirrup.diameter) as any} options={[6,8,10,12].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('stirrup', { ...p.stirrup, diameter: Number(v) })} />
        <NumField label="间距" value={p.stirrup.spacing} unit="mm" onChange={v => set('stirrup', { ...p.stirrup, spacing: v })} />

        <SectionHeader title="腰筋" />
        <Select label="等级" value={p.waistRebar.grade} options={GRADE_OPTS} onChange={v => set('waistRebar', { ...p.waistRebar, grade: v })} />
        <Select label="直径" value={String(p.waistRebar.diameter) as any} options={[10,12,14,16].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('waistRebar', { ...p.waistRebar, diameter: Number(v) })} />
        <NumField label="每侧根数" value={p.waistRebar.perSide} onChange={v => set('waistRebar', { ...p.waistRebar, perSide: v })} />

        <SectionHeader title="锚固搭接" />
        <NumField label="锚固倍数 La/d" value={p.laFactor} onChange={v => set('laFactor', v)} />
        <NumField label="弯钩倍数" value={p.bendHook} onChange={v => set('bendHook', v)} />
        <NumField label="钢筋定尺" value={p.maxBarLength} unit="mm" onChange={v => set('maxBarLength', v)} />
        <NumField label="搭接倍数" value={p.lapFactor} onChange={v => set('lapFactor', v)} />
      </>
    )
  }
  if (kind === 'column') {
    const p = columnParams; const set = setColumn
    return (
      <>
        <SectionHeader title="纵筋" />
        <Select label="等级" value={p.longRebar.grade} options={GRADE_OPTS} onChange={v => set('longRebar', { ...p.longRebar, grade: v })} />
        <Select label="直径" value={String(p.longRebar.diameter) as any} options={[16,18,20,22,25,28,32].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('longRebar', { ...p.longRebar, diameter: Number(v) })} />
        <NumField label="X 边根数" value={p.longRebar.countX} onChange={v => set('longRebar', { ...p.longRebar, countX: v })} />
        <NumField label="Z 边根数" value={p.longRebar.countZ} onChange={v => set('longRebar', { ...p.longRebar, countZ: v })} />

        <SectionHeader title="箍筋" />
        <Select label="等级" value={p.stirrup.grade} options={GRADE_OPTS} onChange={v => set('stirrup', { ...p.stirrup, grade: v })} />
        <Select label="直径" value={String(p.stirrup.diameter) as any} options={[8,10,12].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('stirrup', { ...p.stirrup, diameter: Number(v) })} />
        <NumField label="间距" value={p.stirrup.spacing} unit="mm" onChange={v => set('stirrup', { ...p.stirrup, spacing: v })} />
      </>
    )
  }
  // slab
  const p = slabParams; const set = setSlab
  return (
    <>
      <SectionHeader title="底筋 X" />
      <Select label="等级" value={p.bottomRebarX.grade} options={GRADE_OPTS} onChange={v => set('bottomRebarX', { ...p.bottomRebarX, grade: v })} />
      <Select label="直径" value={String(p.bottomRebarX.diameter) as any} options={[8,10,12,14,16].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('bottomRebarX', { ...p.bottomRebarX, diameter: Number(v) })} />
      <NumField label="间距" value={p.bottomRebarX.spacing} unit="mm" onChange={v => set('bottomRebarX', { ...p.bottomRebarX, spacing: v })} />

      <SectionHeader title="底筋 Z" />
      <Select label="等级" value={p.bottomRebarZ.grade} options={GRADE_OPTS} onChange={v => set('bottomRebarZ', { ...p.bottomRebarZ, grade: v })} />
      <Select label="直径" value={String(p.bottomRebarZ.diameter) as any} options={[8,10,12,14,16].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('bottomRebarZ', { ...p.bottomRebarZ, diameter: Number(v) })} />
      <NumField label="间距" value={p.bottomRebarZ.spacing} unit="mm" onChange={v => set('bottomRebarZ', { ...p.bottomRebarZ, spacing: v })} />

      <Checkbox label="启用面筋" checked={p.hasTopRebar} onChange={v => set('hasTopRebar', v)} />
      {p.hasTopRebar && (
        <>
          <SectionHeader title="面筋 X" />
          <Select label="等级" value={p.topRebarX.grade} options={GRADE_OPTS} onChange={v => set('topRebarX', { ...p.topRebarX, grade: v })} />
          <Select label="直径" value={String(p.topRebarX.diameter) as any} options={[8,10,12,14].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('topRebarX', { ...p.topRebarX, diameter: Number(v) })} />
          <NumField label="间距" value={p.topRebarX.spacing} unit="mm" onChange={v => set('topRebarX', { ...p.topRebarX, spacing: v })} />
          <SectionHeader title="面筋 Z" />
          <Select label="等级" value={p.topRebarZ.grade} options={GRADE_OPTS} onChange={v => set('topRebarZ', { ...p.topRebarZ, grade: v })} />
          <Select label="直径" value={String(p.topRebarZ.diameter) as any} options={[8,10,12,14].map(d => ({ label: `${d} mm`, value: String(d) }))} onChange={v => set('topRebarZ', { ...p.topRebarZ, diameter: Number(v) })} />
          <NumField label="间距" value={p.topRebarZ.spacing} unit="mm" onChange={v => set('topRebarZ', { ...p.topRebarZ, spacing: v })} />
        </>
      )}
    </>
  )
}

/* ═══════ Tab 2: Display ═══════ */
function DisplayTab({ kind, beamParams, setBeam, columnParams, setColumn, slabParams, setSlab }: {
  kind: ComponentKind
  beamParams: BeamParams; setBeam: SetParam<BeamParams>
  columnParams: ColumnParams; setColumn: SetParam<ColumnParams>
  slabParams: SlabParams; setSlab: SetParam<SlabParams>
}) {
  const opacity = kind === 'beam' ? beamParams.concreteOpacity : kind === 'column' ? columnParams.concreteOpacity : slabParams.concreteOpacity
  const setOpacity = (v: number) => {
    if (kind === 'beam') setBeam('concreteOpacity', v)
    else if (kind === 'column') setColumn('concreteOpacity', v)
    else setSlab('concreteOpacity', v)
  }
  const showAnno = kind === 'beam' ? beamParams.showAnnotations : kind === 'column' ? columnParams.showAnnotations : slabParams.showAnnotations
  const setAnno = (v: boolean) => {
    if (kind === 'beam') setBeam('showAnnotations', v)
    else if (kind === 'column') setColumn('showAnnotations', v)
    else setSlab('showAnnotations', v)
  }

  return (
    <>
      <SectionHeader title="显示控制" />
      <Slider label="混凝土不透明度" value={opacity} min={0} max={1} step={0.05} onChange={setOpacity} />
      <div className="py-2" />
      <Checkbox label="显示标注" checked={showAnno} onChange={setAnno} />
      {kind === 'beam' && (
        <>
          <div className="py-1" />
          <Checkbox label="显示支座柱" checked={beamParams.showSupports} onChange={v => setBeam('showSupports', v)} />
          <NumField label="顶部伸出" value={beamParams.supportExtUp} unit="mm" onChange={v => setBeam('supportExtUp', v)} />
          <NumField label="底部伸出" value={beamParams.supportExtDown} unit="mm" onChange={v => setBeam('supportExtDown', v)} />
          <div className="py-1" />
          <Checkbox label="启用剖面切割" checked={beamParams.enableClipping} onChange={v => setBeam('enableClipping', v)} />
          {beamParams.enableClipping && (
            <Slider label="切割位置" value={beamParams.clipPosition} min={0} max={1} step={0.01} onChange={v => setBeam('clipPosition', v)} />
          )}
        </>
      )}
    </>
  )
}

/* ═══════ Tab 3: Export (placeholder) ═══════ */
function ExportTab({ getScene }: { getScene: () => THREE.Object3D | null }) {
  return (
    <>
      <SectionHeader title="导出选项" />
      <p className="text-xs text-on-surface-variant py-2">使用顶栏按钮导出 GLB / GLTF / STL 文件。</p>
      <div className="space-y-2 mt-2">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary">view_in_ar</span>
          <div>
            <div className="text-sm text-on-surface font-semibold">3D 模型</div>
            <div className="text-xs text-on-surface-variant">GLB / GLTF 格式</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary">straighten</span>
          <div>
            <div className="text-sm text-on-surface font-semibold">网格模型</div>
            <div className="text-xs text-on-surface-variant">STL 格式</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
          <span className="material-symbols-outlined text-tertiary">table_chart</span>
          <div>
            <div className="text-sm text-on-surface font-semibold">下料表</div>
            <div className="text-xs text-on-surface-variant">CSV 格式（底部面板导出）</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════ Tab 4: AI 助手 ═══════ */
interface ChatMsg { role: 'user' | 'assistant' | 'system'; content: string }

const SUGGESTED_PROMPTS = [
  '当前梁的配筋率是否满足规范要求？',
  '帮我优化箍筋间距，使得抗剪承载力提高',
  '计算当前构件的总用钢量并给出成本估算',
  '将梁宽调整为 350mm，并确保配筋合理',
]

function AIChatTab() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'AI 助手已就绪。您可以询问钢筋参数、配筋规范、成本估算，或让 AI 直接调整模型参数。' },
    { role: 'assistant', content: '你好！我是钢筋 BIM 助手，可以帮你分析配筋方案、检查规范符合性、优化参数或估算用钢量。\n\n试试下方的快捷提问，或直接输入你的问题。' },
  ])
  const [input, setInput] = useState('')

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '✨ 该功能正在开发中，后续将接入大语言模型 API 实现智能对话。\n\n您输入的是：\n> ' + text },
    ])
    setInput('')
  }

  return (
    <div className="flex flex-col h-full -m-4">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="text-center">
                <span className="inline-block text-xs text-on-surface-variant bg-surface-container rounded-full px-3 py-1">{msg.content}</span>
              </div>
            )
          }
          const isUser = msg.role === 'user'
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[14px]">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                isUser
                  ? 'bg-primary text-on-primary rounded-br-sm'
                  : 'bg-surface-container text-on-surface border border-outline-variant/30 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* 快捷提问 */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((p, i) => (
          <button key={i} onClick={() => { setInput(p); }}
            className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors truncate max-w-full">
            {p}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-low/80">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="输入问题，如“检查配筋率”“优化箍筋”..."
            className="flex-1 bg-surface-dim text-sm text-on-surface rounded-lg px-3 py-2 border border-outline-variant/30 focus:border-primary focus:ring-0 placeholder:text-on-surface-variant/50" />
          <button onClick={send}
            className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary/80 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant/50 mt-1.5 text-center">功能开发中 · 后续将接入 AI 大模型</p>
      </div>
    </div>
  )
}

/* ═══════ MAIN RIGHT PANEL ═══════ */
interface RightPanelProps {
  kind: ComponentKind
  setKind: (k: ComponentKind) => void
  beamParams: BeamParams
  setBeam: SetParam<BeamParams>
  columnParams: ColumnParams
  setColumn: SetParam<ColumnParams>
  slabParams: SlabParams
  setSlab: SetParam<SlabParams>
  width: number
  getScene: () => THREE.Object3D | null
}

export default function RightPanel({ kind, setKind, beamParams, setBeam, columnParams, setColumn, slabParams, setSlab, width, getScene }: RightPanelProps) {
  const [tab, setTab] = useState(0)

  return (
    <aside className="h-full bg-surface-container-low/95 border-l border-outline-variant shadow-lg flex flex-col flex-shrink-0"
      style={{ width: `${width}px` }}>
      {/* Tab bar */}
      <div className="flex border-b border-outline-variant">
        {TABS.map((t, i) => (
          <button key={t.icon} onClick={() => setTab(i)} title={t.tip}
            className={`flex-1 flex items-center justify-center py-3 transition-colors ${
              tab === i
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}>
            <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      {tab === 4 ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AIChatTab />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          {tab === 0 && <ParamTab kind={kind} beamParams={beamParams} setBeam={setBeam} columnParams={columnParams} setColumn={setColumn} slabParams={slabParams} setSlab={setSlab} />}
          {tab === 1 && <RebarTab kind={kind} beamParams={beamParams} setBeam={setBeam} columnParams={columnParams} setColumn={setColumn} slabParams={slabParams} setSlab={setSlab} />}
          {tab === 2 && <DisplayTab kind={kind} beamParams={beamParams} setBeam={setBeam} columnParams={columnParams} setColumn={setColumn} slabParams={slabParams} setSlab={setSlab} />}
          {tab === 3 && <ExportTab getScene={getScene} />}
        </div>
      )}
    </aside>
  )
}
