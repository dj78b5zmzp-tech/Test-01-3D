export type ComponentKind = 'beam' | 'column' | 'slab'

export interface ColumnParams {
  width: number // b (沿X)
  depth: number // h (沿Z)
  height: number // 柱高 (沿Y)
  cover: number
  longRebar: { grade: 'C' | 'G' | 'E'; diameter: number; countX: number; countZ: number } // 每边根数
  stirrup: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number }
  concreteOpacity: number
  showAnnotations: boolean
}

export interface SlabParams {
  lengthX: number
  lengthZ: number
  thickness: number
  cover: number
  bottomRebarX: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number } // X向底筋
  bottomRebarZ: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number } // Z向底筋
  topRebarX: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number }
  topRebarZ: { grade: 'C' | 'G' | 'E'; diameter: number; spacing: number }
  hasTopRebar: boolean
  concreteOpacity: number
  showAnnotations: boolean
}
