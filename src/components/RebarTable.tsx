import { useState } from 'react'
import type { RebarItem } from '../types/rebar'
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

export default function RebarTable({ items }: Props) {
  const [open, setOpen] = useState(true)

  const totalWeight = items.reduce((s, it) => s + it.totalWeight, 0)
  const totalLength = items.reduce((s, it) => s + (it.singleLength * it.count) / 1000, 0)

  const handleExport = () => {
    const header = ['编号', '类型', '等级', '直径(mm)', '单根长度(mm)', '根数', '总长(m)', '单位重(kg/m)', '总重(kg)']
    const rows = items.map((it) => [
      it.id,
      it.label,
      it.grade,
      it.diameter,
      it.singleLength.toFixed(0),
      it.count,
      ((it.singleLength * it.count) / 1000).toFixed(2),
      it.unitWeight.toFixed(3),
      it.totalWeight.toFixed(2),
    ]) as string[][]
    rows.push(['', '合计', '', '', '', '', totalLength.toFixed(2), '', totalWeight.toFixed(2)])
    downloadCSV(`rebar-schedule-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
  }

  return (
    <div className="absolute right-4 bottom-4 w-[460px] bg-slate-900/90 border border-slate-700 rounded-lg backdrop-blur shadow-xl text-xs">
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-slate-700 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="font-semibold text-slate-100 flex items-center gap-2">
          <span>📋 钢筋下料表</span>
          <span className="text-slate-400 font-normal">
            合计 {totalLength.toFixed(2)} m / {totalWeight.toFixed(2)} kg
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleExport()
            }}
            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            导出 CSV
          </button>
          <span className="text-slate-400">{open ? '▾' : '▸'}</span>
        </div>
      </div>
      {open && (
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/70 text-slate-300 sticky top-0">
              <tr>
                <th className="px-2 py-1.5">编号</th>
                <th className="px-2 py-1.5">名称</th>
                <th className="px-2 py-1.5 text-right">直径</th>
                <th className="px-2 py-1.5 text-right">单长(mm)</th>
                <th className="px-2 py-1.5 text-right">数量</th>
                <th className="px-2 py-1.5 text-right">总长(m)</th>
                <th className="px-2 py-1.5 text-right">总重(kg)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-800 hover:bg-slate-800/40">
                  <td className="px-2 py-1 font-mono">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ background: ROLE_COLOR[it.role] }}
                    />
                    {it.id}
                  </td>
                  <td className="px-2 py-1">{it.label}</td>
                  <td className="px-2 py-1 text-right font-mono">{it.grade}{it.diameter}</td>
                  <td className="px-2 py-1 text-right font-mono">{it.singleLength.toFixed(0)}</td>
                  <td className="px-2 py-1 text-right font-mono">{it.count}</td>
                  <td className="px-2 py-1 text-right font-mono">{((it.singleLength * it.count) / 1000).toFixed(2)}</td>
                  <td className="px-2 py-1 text-right font-mono text-amber-300">{it.totalWeight.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
