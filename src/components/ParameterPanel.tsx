import { useControls, folder } from 'leva'
import type { BeamParams, RebarGrade } from '../types/beam'
import type { ColumnParams, SlabParams, ComponentKind } from '../types/component'

const KIND_OPTIONS = { '梁 Beam': 'beam', '柱 Column': 'column', '板 Slab': 'slab' } as const

const GRADE_OPTIONS = { 'HRB400 (C)': 'C', 'HPB300 (G)': 'G', 'HRB500 (E)': 'E' }

export function useBeamParams(): BeamParams {
  const values = useControls({
    几何尺寸: folder({
      width: { value: 250, min: 150, max: 600, step: 10, label: '梁宽 b (mm)' },
      height: { value: 500, min: 200, max: 1200, step: 10, label: '梁高 h (mm)' },
      length: { value: 6000, min: 1000, max: 12000, step: 100, label: '净跨 Ln (mm)' },
      cover: { value: 25, min: 15, max: 50, step: 1, label: '保护层 (mm)' },
    }),
    支座: folder({
      showSupports: { value: true, label: '显示支座柱' },
      supportWidth: { value: 400, min: 200, max: 800, step: 50, label: '支座宽hc (mm)' },
      supportDepth: { value: 400, min: 200, max: 800, step: 50, label: '支座深bc (mm)' },
      supportExtUp: { value: 600, min: 0, max: 2000, step: 50, label: '顶部伸出 (mm)' },
      supportExtDown: { value: 600, min: 0, max: 2000, step: 50, label: '底部伸出 (mm)' },
    }),
    锚固搭接: folder({
      laFactor: { value: 35, min: 20, max: 50, step: 1, label: '锚固倍数 La/d' },
      bendHook: { value: 15, min: 10, max: 20, step: 1, label: '弯钩倍数 (15d)' },
      maxBarLength: { value: 9000, min: 6000, max: 12000, step: 500, label: '钢筋定尺 (mm)' },
      lapFactor: { value: 1.4, min: 1.0, max: 1.8, step: 0.1, label: '搭接倍数 Ll/La' },
    }),
    上部纵筋: folder({
      topGrade: { value: 'C', options: GRADE_OPTIONS, label: '等级' },
      topDiameter: { value: 20, options: [12, 14, 16, 18, 20, 22, 25, 28, 32], label: '直径 (mm)' },
      topCount: { value: 4, min: 2, max: 8, step: 1, label: '根数' },
    }),
    下部纵筋: folder({
      botGrade: { value: 'C', options: GRADE_OPTIONS, label: '等级' },
      botDiameter: { value: 25, options: [12, 14, 16, 18, 20, 22, 25, 28, 32], label: '直径 (mm)' },
      botCount: { value: 4, min: 2, max: 8, step: 1, label: '根数' },
    }),
    箍筋: folder({
      stiGrade: { value: 'C', options: GRADE_OPTIONS, label: '等级' },
      stiDiameter: { value: 8, options: [6, 8, 10, 12], label: '直径 (mm)' },
      stiSpacing: { value: 150, min: 50, max: 400, step: 10, label: '间距 (mm)' },
    }),
    腰筋: folder({
      waistGrade: { value: 'G', options: GRADE_OPTIONS, label: '等级' },
      waistDiameter: { value: 12, options: [10, 12, 14, 16], label: '直径 (mm)' },
      waistPerSide: { value: 2, min: 0, max: 4, step: 1, label: '每侧根数' },
    }),
    显示控制: folder({
      concreteOpacity: { value: 0.3, min: 0, max: 1, step: 0.05, label: '混凝土不透明度' },
      showAnnotations: { value: true, label: '显示标注' },
      enableClipping: { value: false, label: '启用剖面切割' },
      clipPosition: { value: 0.5, min: 0, max: 1, step: 0.01, label: '切割位置' },
    }),
  })

  return {
    width: values.width,
    height: values.height,
    length: values.length,
    cover: values.cover,
    showSupports: values.showSupports,
    supportWidth: values.supportWidth,
    supportDepth: values.supportDepth,
    supportExtUp: values.supportExtUp,
    supportExtDown: values.supportExtDown,
    laFactor: values.laFactor,
    bendHook: values.bendHook,
    maxBarLength: values.maxBarLength,
    lapFactor: values.lapFactor,
    topRebar: {
      grade: values.topGrade as RebarGrade,
      diameter: values.topDiameter,
      count: values.topCount,
    },
    bottomRebar: {
      grade: values.botGrade as RebarGrade,
      diameter: values.botDiameter,
      count: values.botCount,
    },
    stirrup: {
      grade: values.stiGrade as RebarGrade,
      diameter: values.stiDiameter,
      spacing: values.stiSpacing,
    },
    waistRebar: {
      grade: values.waistGrade as RebarGrade,
      diameter: values.waistDiameter,
      perSide: values.waistPerSide,
    },
    concreteOpacity: values.concreteOpacity,
    showAnnotations: values.showAnnotations,
    enableClipping: values.enableClipping,
    clipPosition: values.clipPosition,
  }
}

export function useComponentKind(): ComponentKind {
  const { kind } = useControls('构件类型', {
    kind: { value: 'beam', options: KIND_OPTIONS, label: '类型' },
  })
  return kind as ComponentKind
}

export function useColumnParams(): ColumnParams {
  const v = useControls('柱构件', {
    几何尺寸: folder({
      cWidth: { value: 500, min: 200, max: 1200, step: 10, label: '截面b (mm)' },
      cDepth: { value: 500, min: 200, max: 1200, step: 10, label: '截面h (mm)' },
      cHeight: { value: 4000, min: 1000, max: 8000, step: 100, label: '柱高 (mm)' },
      cCover: { value: 30, min: 15, max: 50, step: 1, label: '保护层 (mm)' },
    }),
    纵筋: folder({
      cLongGrade: { value: 'C', options: GRADE_OPTIONS, label: '等级' },
      cLongDia: { value: 25, options: [16, 18, 20, 22, 25, 28, 32], label: '直径 (mm)' },
      cLongCountX: { value: 4, min: 2, max: 6, step: 1, label: 'X边根数' },
      cLongCountZ: { value: 4, min: 2, max: 6, step: 1, label: 'Z边根数' },
    }),
    箍筋: folder({
      cStiGrade: { value: 'C', options: GRADE_OPTIONS, label: '等级' },
      cStiDia: { value: 10, options: [8, 10, 12], label: '直径 (mm)' },
      cStiSpacing: { value: 150, min: 50, max: 400, step: 10, label: '间距 (mm)' },
    }),
    显示控制: folder({
      cOpacity: { value: 0.3, min: 0, max: 1, step: 0.05, label: '混凝土不透明度' },
      cShowAnno: { value: true, label: '显示标注' },
    }),
  })
  return {
    width: v.cWidth,
    depth: v.cDepth,
    height: v.cHeight,
    cover: v.cCover,
    longRebar: { grade: v.cLongGrade as RebarGrade, diameter: v.cLongDia, countX: v.cLongCountX, countZ: v.cLongCountZ },
    stirrup: { grade: v.cStiGrade as RebarGrade, diameter: v.cStiDia, spacing: v.cStiSpacing },
    concreteOpacity: v.cOpacity,
    showAnnotations: v.cShowAnno,
  }
}

export function useSlabParams(): SlabParams {
  const v = useControls('板构件', {
    几何尺寸: folder({
      sLenX: { value: 4000, min: 1000, max: 10000, step: 100, label: '板长X (mm)' },
      sLenZ: { value: 3000, min: 1000, max: 10000, step: 100, label: '板长Z (mm)' },
      sThk: { value: 120, min: 80, max: 400, step: 10, label: '板厚 (mm)' },
      sCover: { value: 15, min: 10, max: 40, step: 1, label: '保护层 (mm)' },
    }),
    底筋: folder({
      sBxGrade: { value: 'C', options: GRADE_OPTIONS, label: 'X向 等级' },
      sBxDia: { value: 10, options: [8, 10, 12, 14, 16], label: 'X向 直径' },
      sBxSpacing: { value: 200, min: 100, max: 300, step: 10, label: 'X向 间距' },
      sBzGrade: { value: 'C', options: GRADE_OPTIONS, label: 'Z向 等级' },
      sBzDia: { value: 10, options: [8, 10, 12, 14, 16], label: 'Z向 直径' },
      sBzSpacing: { value: 200, min: 100, max: 300, step: 10, label: 'Z向 间距' },
    }),
    面筋: folder({
      sHasTop: { value: true, label: '启用面筋' },
      sTxGrade: { value: 'C', options: GRADE_OPTIONS, label: 'X向 等级' },
      sTxDia: { value: 8, options: [8, 10, 12, 14], label: 'X向 直径' },
      sTxSpacing: { value: 200, min: 100, max: 300, step: 10, label: 'X向 间距' },
      sTzGrade: { value: 'C', options: GRADE_OPTIONS, label: 'Z向 等级' },
      sTzDia: { value: 8, options: [8, 10, 12, 14], label: 'Z向 直径' },
      sTzSpacing: { value: 200, min: 100, max: 300, step: 10, label: 'Z向 间距' },
    }),
    显示控制: folder({
      sOpacity: { value: 0.3, min: 0, max: 1, step: 0.05, label: '混凝土不透明度' },
      sShowAnno: { value: true, label: '显示标注' },
    }),
  })
  return {
    lengthX: v.sLenX,
    lengthZ: v.sLenZ,
    thickness: v.sThk,
    cover: v.sCover,
    bottomRebarX: { grade: v.sBxGrade as RebarGrade, diameter: v.sBxDia, spacing: v.sBxSpacing },
    bottomRebarZ: { grade: v.sBzGrade as RebarGrade, diameter: v.sBzDia, spacing: v.sBzSpacing },
    topRebarX: { grade: v.sTxGrade as RebarGrade, diameter: v.sTxDia, spacing: v.sTxSpacing },
    topRebarZ: { grade: v.sTzGrade as RebarGrade, diameter: v.sTzDia, spacing: v.sTzSpacing },
    hasTopRebar: v.sHasTop,
    concreteOpacity: v.sOpacity,
    showAnnotations: v.sShowAnno,
  }
}
