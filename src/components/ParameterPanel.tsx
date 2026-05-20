import { useState, useCallback } from 'react'
import type { BeamParams, RebarGrade } from '../types/beam'
import type { ColumnParams, SlabParams, ComponentKind } from '../types/component'

export type SetParam<T> = <K extends keyof T>(key: K, val: T[K]) => void

export function useComponentKindState() {
  const [kind, setKind] = useState<ComponentKind>('beam')
  return [kind, setKind] as const
}

export function useBeamParamsState(): [BeamParams, SetParam<BeamParams>] {
  const [p, setP] = useState<BeamParams>({
    width: 250, height: 500, length: 6000, cover: 25,
    showSupports: true, supportWidth: 400, supportDepth: 400, supportExtUp: 600, supportExtDown: 600,
    laFactor: 35, bendHook: 15, maxBarLength: 9000, lapFactor: 1.4,
    topRebar: { grade: 'C', diameter: 20, count: 4 },
    bottomRebar: { grade: 'C', diameter: 25, count: 4 },
    stirrup: { grade: 'C', diameter: 8, spacing: 150 },
    waistRebar: { grade: 'G', diameter: 12, perSide: 2 },
    concreteOpacity: 0.3, showAnnotations: true, enableClipping: false, clipPosition: 0.5,
  })
  const set: SetParam<BeamParams> = useCallback((k, v) => setP(prev => ({ ...prev, [k]: v })), [])
  return [p, set]
}

export function useColumnParamsState(): [ColumnParams, SetParam<ColumnParams>] {
  const [p, setP] = useState<ColumnParams>({
    width: 500, depth: 500, height: 4000, cover: 30,
    longRebar: { grade: 'C', diameter: 25, countX: 4, countZ: 4 },
    stirrup: { grade: 'C', diameter: 10, spacing: 150 },
    concreteOpacity: 0.3, showAnnotations: true,
  })
  const set: SetParam<ColumnParams> = useCallback((k, v) => setP(prev => ({ ...prev, [k]: v })), [])
  return [p, set]
}

export function useSlabParamsState(): [SlabParams, SetParam<SlabParams>] {
  const [p, setP] = useState<SlabParams>({
    lengthX: 4000, lengthZ: 3000, thickness: 120, cover: 15,
    bottomRebarX: { grade: 'C', diameter: 10, spacing: 200 },
    bottomRebarZ: { grade: 'C', diameter: 10, spacing: 200 },
    topRebarX: { grade: 'C', diameter: 8, spacing: 200 },
    topRebarZ: { grade: 'C', diameter: 8, spacing: 200 },
    hasTopRebar: true, concreteOpacity: 0.3, showAnnotations: true,
  })
  const set: SetParam<SlabParams> = useCallback((k, v) => setP(prev => ({ ...prev, [k]: v })), [])
  return [p, set]
}
