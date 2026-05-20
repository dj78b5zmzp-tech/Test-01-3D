import * as THREE from 'three'
import { useMemo } from 'react'
import type { BeamParams } from '../types/beam'
import { rebarUnitWeight, type RebarItem } from '../types/rebar'
import { buildAnchoredPath, splitForLap, type BarSegment } from '../utils/longBarPath'
import { stirrupSingleLength } from '../utils/rebarGeometry'

export interface LongBar {
  /** 一根钢筋切分后的分段路径 (>=1 段)，每段内是一段独立的钢筋实体 */
  segments: BarSegment[]
}

export interface RebarPlacement extends RebarItem {
  /** 纵筋专属：每根钢筋(含分段) */
  bars?: LongBar[]
  beamLength?: number
  /** 箍筋专属 */
  stirrupXs?: number[]
  innerW?: number
  innerH?: number
  hookLen?: number
}

export interface BeamLayout {
  innerW: number
  innerH: number
  topY: number
  bottomY: number
  items: RebarPlacement[]
  /** 计算结果摘要：各类钢筋的锚固长度等 */
  anchorInfo: { La: number; isBendAnchor: boolean; hookLen: number }
}

function distribute(count: number, span: number, y: number): { y: number; z: number }[] {
  if (count <= 0) return []
  if (count === 1) return [{ y, z: 0 }]
  const step = span / (count - 1)
  const start = -span / 2
  return Array.from({ length: count }, (_, i) => ({ y, z: start + step * i }))
}

export function useBeamLayout(p: BeamParams): BeamLayout {
  return useMemo(() => {
    const { width, height, length, cover, topRebar, bottomRebar, stirrup, waistRebar } = p
    const { supportWidth, laFactor, bendHook, maxBarLength, lapFactor } = p

    const innerW = width - 2 * cover - stirrup.diameter
    const innerH = height - 2 * cover - stirrup.diameter
    const topY = height / 2 - cover - stirrup.diameter - topRebar.diameter / 2
    const bottomY = -height / 2 + cover + stirrup.diameter + bottomRebar.diameter / 2
    const topSpanZ = innerW - topRebar.diameter
    const bottomSpanZ = innerW - bottomRebar.diameter

    // ---- 箍筋 ----
    const endCover = 50
    const stirrupXs: number[] = []
    for (let x = -length / 2 + endCover; x <= length / 2 - endCover + 1e-6; x += stirrup.spacing)
      stirrupXs.push(x)
    const stirrupHookLen = Math.max(10 * stirrup.diameter, 75)
    const stirrupSingleLen = stirrupSingleLength(innerW, innerH, stirrupHookLen, stirrup.diameter)

    // ---- 纵筋路径生成 ----
    const buildBars = (
      positions: { y: number; z: number }[],
      diameter: number,
      side: 'top' | 'bottom' | 'waist',
    ): LongBar[] => {
      return positions.map((pos) => {
        const { points } = buildAnchoredPath({
          netSpan: length,
          supportWidth,
          supportDepth: p.supportDepth,
          diameter,
          y: pos.y,
          z: pos.z,
          side,
          cover,
          laFactor,
          bendHook,
          maxBarLength,
          lapFactor,
        })
        const segments = splitForLap(points, diameter, maxBarLength, lapFactor, laFactor)
        return { segments }
      })
    }

    const topPos = distribute(topRebar.count, topSpanZ, topY)
    const bottomPos = distribute(bottomRebar.count, bottomSpanZ, bottomY)
    const waistPos: { y: number; z: number }[] = []
    if (waistRebar.perSide > 0) {
      const yStep = (topY - bottomY) / (waistRebar.perSide + 1)
      const zSide = innerW / 2 - waistRebar.diameter / 2
      for (let i = 0; i < waistRebar.perSide; i++) {
        const y = bottomY + yStep * (i + 1)
        waistPos.push({ y, z: zSide })
        waistPos.push({ y, z: -zSide })
      }
    }

    const topBars = buildBars(topPos, topRebar.diameter, 'top')
    const bottomBars = buildBars(bottomPos, bottomRebar.diameter, 'bottom')
    const waistBars = buildBars(waistPos, waistRebar.diameter, 'waist')

    // ---- 下料统计：每根钢筋的总展开长度(=所有分段相加) ----
    const sumLen = (bars: LongBar[]) =>
      bars.reduce((s, b) => s + b.segments.reduce((ss, seg) => ss + seg.length, 0), 0)
    const totalSegCount = (bars: LongBar[]) => bars.reduce((s, b) => s + b.segments.length, 0)

    const items: RebarPlacement[] = []

    const La = laFactor * Math.max(topRebar.diameter, bottomRebar.diameter)
    const innerInSupport = supportWidth - cover
    const isBendAnchor = innerInSupport < La

    const pushLongItem = (
      id: string,
      label: string,
      role: RebarItem['role'],
      bars: LongBar[],
      grade: BeamParams['topRebar']['grade'],
      diameter: number,
    ) => {
      if (bars.length === 0) return
      const totalLen = sumLen(bars) // mm
      const segCount = totalSegCount(bars)
      const avgSingle = totalLen / segCount
      const uw = rebarUnitWeight(diameter)
      const hasLap = bars.some(b => b.segments.length > 1)
      let note = isBendAnchor ? '弯锚' : '直锚'
      if (hasLap) note += ' 搭接'
      if (role === 'waist') note = `每侧${waistRebar.perSide}根`
      items.push({
        id,
        role,
        label,
        grade,
        diameter,
        singleLength: Math.round(avgSingle),
        count: segCount,
        unitWeight: uw,
        totalWeight: (totalLen / 1000) * uw,
        note,
        status: isBendAnchor ? 'Warn' as const : 'Verified' as const,
        bars,
        beamLength: length,
      })
    }

    pushLongItem('TM', '上部纵筋', 'topMain', topBars, topRebar.grade, topRebar.diameter)
    pushLongItem('BM', '下部纵筋', 'bottomMain', bottomBars, bottomRebar.grade, bottomRebar.diameter)
    pushLongItem('WA', '腰筋', 'waist', waistBars, waistRebar.grade, waistRebar.diameter)

    {
      const uw = rebarUnitWeight(stirrup.diameter)
      const stiNote = `间距${stirrup.spacing} n=${stirrupXs.length}`
      items.push({
        id: 'ST',
        role: 'stirrup',
        label: '箍筋',
        grade: stirrup.grade,
        diameter: stirrup.diameter,
        singleLength: Math.round(stirrupSingleLen),
        count: stirrupXs.length,
        unitWeight: uw,
        totalWeight: (stirrupSingleLen / 1000) * stirrupXs.length * uw,
        note: stiNote,
        status: 'Verified' as const,
        stirrupXs,
        innerW,
        innerH,
        hookLen: stirrupHookLen,
        beamLength: length,
      })
    }

    return {
      innerW,
      innerH,
      topY,
      bottomY,
      items,
      anchorInfo: { La, isBendAnchor, hookLen: bendHook * Math.max(topRebar.diameter, bottomRebar.diameter) },
    }
  }, [p])
}

// 兼容旧引用 (App.tsx 通过 RebarPlacement 引用)
export type { BarSegment }
export { THREE }
