import type { RebarGrade } from './beam'

export type RebarRole = 'topMain' | 'bottomMain' | 'waist' | 'stirrup'

export type RebarStatus = 'Verified' | 'Warn' | 'Error' | ''

export interface RebarItem {
  id: string // 唯一 ID，例 "TM-1" / "ST-12"
  role: RebarRole
  label: string // 中文名："上部纵筋" / "箍筋#3"
  grade: RebarGrade
  diameter: number // mm
  singleLength: number // 单根展开长度 (mm)
  count: number // 数量
  unitWeight: number // kg/m (按公称直径)
  totalWeight: number // kg (= singleLength/1000 * count * unitWeight)
  note?: string // 备注（锚固方式、间距等）
  status?: RebarStatus // 校验状态
}

/** 钢筋单位重量 (kg/m)，按公称直径计算，密度7850 */
export function rebarUnitWeight(diameterMm: number): number {
  // π * (d/2)² * 7850 / 1e6 (d in mm -> m²) → 简化常数 0.00617
  return 0.006165 * diameterMm * diameterMm
}

export const ROLE_LABEL: Record<RebarRole, string> = {
  topMain: '上部纵筋',
  bottomMain: '下部纵筋',
  waist: '腰筋',
  stirrup: '箍筋',
}

export const ROLE_COLOR: Record<RebarRole, string> = {
  topMain: '#fbbf24',
  bottomMain: '#fb923c',
  waist: '#a78bfa',
  stirrup: '#22d3ee',
}
