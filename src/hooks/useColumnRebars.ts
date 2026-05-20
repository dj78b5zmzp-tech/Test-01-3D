import { useMemo } from 'react'
import type { ColumnParams } from '../types/component'
import { rebarUnitWeight, type RebarItem } from '../types/rebar'

export interface ColumnPlacement extends RebarItem {
  positions?: { x: number; z: number }[]
  columnHeight?: number
  stirrupYs?: number[]
  innerW?: number
  innerD?: number
}

export interface ColumnLayout {
  innerW: number
  innerD: number
  items: ColumnPlacement[]
}

export function useColumnLayout(p: ColumnParams): ColumnLayout {
  return useMemo(() => {
    const { width, depth, height, cover, longRebar, stirrup } = p
    const innerW = width - 2 * cover - stirrup.diameter
    const innerD = depth - 2 * cover - stirrup.diameter

    // 长筋每边根数 (countX 沿X边，countZ 沿Z边)；周圈布置去重
    const positions: { x: number; z: number }[] = []
    const xCount = Math.max(2, longRebar.countX)
    const zCount = Math.max(2, longRebar.countZ)
    const xs = Array.from({ length: xCount }, (_, i) =>
      -((innerW - longRebar.diameter) / 2) + (i * (innerW - longRebar.diameter)) / (xCount - 1),
    )
    const zs = Array.from({ length: zCount }, (_, i) =>
      -((innerD - longRebar.diameter) / 2) + (i * (innerD - longRebar.diameter)) / (zCount - 1),
    )
    // 四条边
    for (let i = 0; i < xCount; i++) {
      positions.push({ x: xs[i], z: zs[0] })
      positions.push({ x: xs[i], z: zs[zCount - 1] })
    }
    for (let j = 1; j < zCount - 1; j++) {
      positions.push({ x: xs[0], z: zs[j] })
      positions.push({ x: xs[xCount - 1], z: zs[j] })
    }
    const totalLong = positions.length

    const endCover = 50
    const stirrupYs: number[] = []
    const start = -height / 2 + endCover
    const end = height / 2 - endCover
    for (let y = start; y <= end + 1e-6; y += stirrup.spacing) stirrupYs.push(y)

    const items: ColumnPlacement[] = []
    {
      const len = height - 2 * cover + 2 * 35 * longRebar.diameter
      const uw = rebarUnitWeight(longRebar.diameter)
      items.push({
        id: 'CL',
        role: 'topMain',
        label: '柱纵筋',
        grade: longRebar.grade,
        diameter: longRebar.diameter,
        singleLength: len,
        count: totalLong,
        unitWeight: uw,
        totalWeight: (len / 1000) * totalLong * uw,
        note: `周圈${totalLong}根 H=${height}`,
        status: 'Verified',
        positions,
        columnHeight: height,
      })
    }
    {
      const single = 2 * (innerW + innerD) + 2 * (12 * stirrup.diameter)
      const uw = rebarUnitWeight(stirrup.diameter)
      items.push({
        id: 'CS',
        role: 'stirrup',
        label: '柱箍筋',
        grade: stirrup.grade,
        diameter: stirrup.diameter,
        singleLength: single,
        count: stirrupYs.length,
        unitWeight: uw,
        totalWeight: (single / 1000) * stirrupYs.length * uw,
        note: `间距${stirrup.spacing} n=${stirrupYs.length}`,
        status: 'Verified',
        stirrupYs,
        innerW,
        innerD,
        columnHeight: height,
      })
    }
    return { innerW, innerD, items }
  }, [p])
}
