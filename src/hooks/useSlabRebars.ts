import { useMemo } from 'react'
import type { SlabParams } from '../types/component'
import { rebarUnitWeight, type RebarItem } from '../types/rebar'

export interface SlabRebarMesh extends RebarItem {
  direction: 'X' | 'Z'
  layer: 'bottom' | 'top'
  positions: number[] // 该方向钢筋的横向坐标列表
  barLength: number // 单根钢筋长度(沿其方向)
  y: number // Y 坐标
}

export interface SlabLayout {
  meshes: SlabRebarMesh[]
}

export function useSlabLayout(p: SlabParams): SlabLayout {
  return useMemo(() => {
    const { lengthX, lengthZ, thickness, cover, bottomRebarX, bottomRebarZ, topRebarX, topRebarZ, hasTopRebar } = p

    const yBottom = -thickness / 2 + cover + bottomRebarX.diameter / 2
    const yBottom2 = -thickness / 2 + cover + bottomRebarX.diameter + bottomRebarZ.diameter / 2
    const yTop = thickness / 2 - cover - topRebarX.diameter / 2
    const yTop2 = thickness / 2 - cover - topRebarX.diameter - topRebarZ.diameter / 2

    const build = (
      id: string,
      label: string,
      direction: 'X' | 'Z',
      layer: 'bottom' | 'top',
      spec: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number },
      y: number,
    ): SlabRebarMesh => {
      const isX = direction === 'X'
      const acrossSpan = isX ? lengthZ : lengthX // 钢筋根数沿该方向排布
      const barLen = isX ? lengthX : lengthZ
      const usable = acrossSpan - 2 * cover - spec.diameter
      const count = Math.max(1, Math.floor(usable / spec.spacing) + 1)
      const step = count > 1 ? usable / (count - 1) : 0
      const start = -usable / 2
      const positions = Array.from({ length: count }, (_, i) => start + step * i)
      const single = barLen - 2 * cover + 2 * 12 * spec.diameter // 加端部锚固简化
      const uw = rebarUnitWeight(spec.diameter)
      return {
        id,
        role: layer === 'bottom' ? 'bottomMain' : 'topMain',
        label,
        grade: spec.grade,
        diameter: spec.diameter,
        singleLength: single,
        count,
        unitWeight: uw,
        totalWeight: (single / 1000) * count * uw,
        direction,
        layer,
        positions,
        barLength: barLen,
        y,
      }
    }

    const meshes: SlabRebarMesh[] = [
      build('SBX', '底筋(X向)', 'X', 'bottom', bottomRebarX, yBottom),
      build('SBZ', '底筋(Z向)', 'Z', 'bottom', bottomRebarZ, yBottom2),
    ]
    if (hasTopRebar) {
      meshes.push(build('STX', '面筋(X向)', 'X', 'top', topRebarX, yTop))
      meshes.push(build('STZ', '面筋(Z向)', 'Z', 'top', topRebarZ, yTop2))
    }
    return { meshes }
  }, [p])
}
