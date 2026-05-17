import type { RebarGrade } from '../types/beam'

// 常用钢筋直径列表 (mm)
export const REBAR_DIAMETERS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32]

// 不同等级钢筋的颜色 (便于在3D中区分)
export const REBAR_COLORS: Record<RebarGrade, string> = {
  G: '#9aa0a6', // HPB300 光圆 - 较亮的银灰
  C: '#7d848c', // HRB400 - 中灰
  E: '#5f6770', // HRB500 - 深灰
}

// 钢筋规格的简短文字描述
export function formatRebar(grade: RebarGrade, diameter: number, count: number): string {
  return `${count}${grade}${diameter}`
}

export function formatStirrup(grade: RebarGrade, diameter: number, spacing: number): string {
  return `${grade}${diameter}@${spacing}`
}

// 解析形如 "4C25" 的字符串
export function parseRebarSpec(text: string): { grade: RebarGrade; diameter: number; count: number } | null {
  const m = text.trim().match(/^(\d+)([CGE])(\d+)$/i)
  if (!m) return null
  return {
    count: parseInt(m[1], 10),
    grade: m[2].toUpperCase() as RebarGrade,
    diameter: parseInt(m[3], 10),
  }
}
