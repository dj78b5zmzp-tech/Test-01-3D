import { useState } from 'react'
import type { RebarItem, RebarRole } from '../types/rebar'
import { ROLE_COLOR } from '../types/rebar'

interface Props {
  items: RebarItem[]
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const STATUS_STYLE: Record<string, string> = {
  Verified: 'text-secondary',
  Warn: 'text-tertiary',
  Error: 'text-error',
  '': 'text-on-surface-variant',
}

const STATUS_CN: Record<string, string> = {
  Verified: '已验证',
  Warn: '警告',
  Error: '错误',
  '': '—',
}

const FILTER_OPTIONS: { label: string; value: RebarRole | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '纵筋', value: 'topMain' },
  { label: '底筋', value: 'bottomMain' },
  { label: '腰筋', value: 'waist' },
  { label: '箍筋', value: 'stirrup' },
]

export default function RebarTable({ items }: Props) {
  const [filter, setFilter] = useState<RebarRole | 'all'>('all')

  const filtered = filter === 'all' ? items : items.filter(it => it.role === filter)
  const totalWeight = items.reduce((s, it) => s + it.totalWeight, 0)
  const kindCount = new Set(items.map(it => it.role)).size

  const handleExport = () => {
    const header = ['ID', '类型', '直径(MM)', '根数', '单长(M)', '总长(M)', '重量(KG)', '备注', '状态']
    const rows = filtered.map((it) => [
      it.id,
      it.label,
      String(it.diameter),
      String(it.count),
      (it.singleLength / 1000).toFixed(2),
      ((it.singleLength * it.count) / 1000).toFixed(2),
      it.totalWeight.toFixed(2),
      it.note || '',
      it.status || '',
    ])
    const totalLen = filtered.reduce((s, it) => s + (it.singleLength * it.count) / 1000, 0)
    const totalW = filtered.reduce((s, it) => s + it.totalWeight, 0)
    rows.push(['', '合计', '', '', '', totalLen.toFixed(2), totalW.toFixed(2), '', ''])
    downloadCSV(`rebar-schedule-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
  }

  return (
    <div className="flex-1 bg-surface-container-low/80 backdrop-blur-md border border-white/10 rounded-xl p-0 flex flex-col shadow-lg overflow-hidden pointer-events-auto">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-outline-variant/30 bg-surface-container-highest/50 flex justify-between items-center">
        <h3 className="font-label-sm text-[13px] text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">list_alt</span>
          钢筋下料表
          <span className="normal-case text-on-surface-variant font-label-mono text-label-mono ml-3">
            合计 {totalWeight.toFixed(2)} kg · {kindCount} 类
          </span>
        </h3>
        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">filter_list</span>
            <select value={filter} onChange={e => setFilter(e.target.value as RebarRole | 'all')}
              title="筛选类型"
              className="bg-transparent border-none text-xs text-on-surface-variant focus:ring-0 p-0 cursor-pointer">
              {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-highest/80 text-on-surface-variant text-xs hover:text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/40">
            <span className="material-symbols-outlined text-[14px]">download</span>
            导出 CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse font-label-mono text-label-mono">
          <thead className="sticky top-0 bg-surface-container-highest/90 backdrop-blur-sm text-on-surface-variant border-b border-outline-variant/30">
            <tr>
              <th className="px-4 py-2 font-semibold">ID</th>
              <th className="px-3 py-2 font-semibold">类型</th>
              <th className="px-3 py-2 font-semibold text-right">直径(MM)</th>
              <th className="px-3 py-2 font-semibold text-right">根数</th>
              <th className="px-3 py-2 font-semibold text-right">单长(M)</th>
              <th className="px-3 py-2 font-semibold text-right">总长(M)</th>
              <th className="px-3 py-2 font-semibold text-right">重量(KG)</th>
              <th className="px-3 py-2 font-semibold">备注</th>
              <th className="px-3 py-2 font-semibold text-right">状态</th>
            </tr>
          </thead>
          <tbody className="text-on-surface">
            {filtered.map((it, i) => {
              const singleM = it.singleLength / 1000
              const totalM = (it.singleLength * it.count) / 1000
              const st = it.status || ''
              return (
                <tr key={it.id}
                  className={`border-b border-outline-variant/15 hover:bg-surface-container-highest/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-lowest/20' : ''}`}>
                  <td className="px-4 py-2.5 text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: ROLE_COLOR[it.role] }} />
                    {it.id}
                  </td>
                  <td className="px-3 py-2.5">{it.label}</td>
                  <td className="px-3 py-2.5 text-right">{it.diameter}</td>
                  <td className="px-3 py-2.5 text-right">{it.count}</td>
                  <td className="px-3 py-2.5 text-right">{singleM.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right">{totalM.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right text-tertiary font-semibold">{it.totalWeight.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{it.note || '—'}</td>
                  <td className={`px-3 py-2.5 text-right font-semibold ${STATUS_STYLE[st]}`}>{STATUS_CN[st] || st || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
