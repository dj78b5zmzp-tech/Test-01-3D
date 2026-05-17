// 钢筋规格符号: C = HRB400 普通钢筋, G = 光圆钢筋(HPB300), E = HRB500 等
export type RebarGrade = 'C' | 'G' | 'E'

export interface RebarSpec {
  grade: RebarGrade
  diameter: number // mm
  count: number
}

// 形如 "4C25" => { grade: 'C', diameter: 25, count: 4 }
export interface BeamParams {
  // 几何 (length 表示净跨 Ln：两支座内侧之间的距离)
  width: number // 梁宽 b (mm)
  height: number // 梁高 h (mm)
  length: number // 净跨 Ln (mm)
  cover: number // 保护层厚度 (mm)

  // 支座 (柱)
  showSupports: boolean
  supportWidth: number // 支座沿X方向尺寸 hc (mm)
  supportDepth: number // 支座沿Z方向尺寸 bc (mm)
  supportExtUp: number // 支座顶部伸出梁顶的高度 (mm)
  supportExtDown: number // 支座底部伸出梁底的高度 (mm)

  // 锚固 / 搭接
  laFactor: number // 锚固倍数，默认 35 (即 La = 35d)
  bendHook: number // 90°弯钩水平/竖直长度倍数，默认 15 (15d)
  maxBarLength: number // 单根钢筋定尺 (mm)，超过需搭接，默认 9000
  lapFactor: number // 搭接倍数 (Ll/La)，默认 1.4

  // 配筋
  topRebar: RebarSpec // 上部纵筋
  bottomRebar: RebarSpec // 下部纵筋
  stirrup: { grade: RebarGrade; diameter: number; spacing: number } // 箍筋
  waistRebar: { grade: RebarGrade; diameter: number; perSide: number } // 腰筋 (每侧根数)

  // 显示
  concreteOpacity: number // 0~1
  showAnnotations: boolean
  enableClipping: boolean
  clipPosition: number // 沿梁长归一化位置 0~1
}
