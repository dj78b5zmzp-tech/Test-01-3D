import * as THREE from 'three'

export interface AnchorConfig {
  /** 净跨 Ln (mm) - 梁两支座内表面距离 */
  netSpan: number
  /** 支座沿X方向尺寸 hc */
  supportWidth: number
  /** 支座沿Z方向尺寸(用于判断空间足够否) */
  supportDepth: number
  /** 钢筋直径 */
  diameter: number
  /** 钢筋 Y 坐标 (上部纵筋为正、下部为负) */
  y: number
  /** 钢筋 Z 坐标 */
  z: number
  /** 上部还是下部纵筋(决定弯钩朝向) */
  side: 'top' | 'bottom' | 'waist'
  /** 保护层厚度 */
  cover: number
  /** 锚固倍数 La/d，默认 35 */
  laFactor: number
  /** 90° 弯钩长度倍数 (15d) */
  bendHook: number
  /** 单根定尺长度 */
  maxBarLength: number
  /** 搭接倍数 (Ll/La)，默认 1.4 */
  lapFactor: number
}

export interface BarSegment {
  /** 路径控制点 (mm)，按顺序连成 LineCurve */
  points: THREE.Vector3[]
  /** 该段展开长度 (mm) */
  length: number
}

/** 沿一段折线计算总长度 */
function polylineLength(pts: THREE.Vector3[]): number {
  let s = 0
  for (let i = 1; i < pts.length; i++) s += pts[i].distanceTo(pts[i - 1])
  return s
}

/**
 * 生成一根带两端锚固的纵筋路径（不含搭接分段）。
 * 上部钢筋：两端伸入支座到柱外侧保护层处后向下弯 90° 长 15d。
 * 下部钢筋：两端伸入支座到柱外侧保护层处后向上弯 90° 长 15d。
 * 腰筋：直锚到支座中心 La。
 */
export function buildAnchoredPath(cfg: AnchorConfig): { points: THREE.Vector3[]; totalLength: number } {
  const { netSpan, supportWidth, diameter, y, z, side, cover, laFactor, bendHook } = cfg

  const La = laFactor * diameter
  const hookLen = bendHook * diameter
  // 钢筋伸入支座到外侧保护层 (= 支座外边到钢筋的水平距离)
  const innerInSupport = supportWidth - cover // 从支座内侧算起到外侧保护层
  const useStraightAnchor = innerInSupport >= La && side === 'waist' // 只有腰筋直锚

  const xLeftBeam = -netSpan / 2 // 梁左端 (= 支座右内侧)
  const xRightBeam = netSpan / 2

  const points: THREE.Vector3[] = []

  if (side === 'waist' && useStraightAnchor) {
    // 直锚到 La 处
    const xL = xLeftBeam - La
    const xR = xRightBeam + La
    points.push(new THREE.Vector3(xL, y, z), new THREE.Vector3(xR, y, z))
  } else {
    // 弯锚：水平伸到支座外侧保护层处，再 90° 弯钩
    const xL_far = xLeftBeam - innerInSupport // 左端水平段终点 (在左支座外保护层)
    const xR_far = xRightBeam + innerInSupport
    // 弯钩朝向：上部钢筋向下、下部钢筋向上、腰筋默认向下
    const hookDy = side === 'top' ? -hookLen : side === 'bottom' ? hookLen : -hookLen

    // 起点 = 左弯钩自由端
    points.push(new THREE.Vector3(xL_far, y + hookDy, z))
    // 弯钩拐点
    points.push(new THREE.Vector3(xL_far, y, z))
    // 直段
    points.push(new THREE.Vector3(xR_far, y, z))
    // 右弯钩拐点 + 自由端
    points.push(new THREE.Vector3(xR_far, y + hookDy, z))
  }

  return { points, totalLength: polylineLength(points) }
}

/**
 * 将单根钢筋按定尺长度分段（处理搭接）。
 * 简化策略：在直段上等距切分；搭接区两段钢筋 Z 方向各偏移 ±diameter/2 紧贴。
 * 返回若干段，每段都含完整端部（如果是首段含左弯钩，末段含右弯钩，中间段为纯直线）。
 */
export function splitForLap(
  fullPoints: THREE.Vector3[],
  diameter: number,
  maxBarLength: number,
  lapFactor: number,
  laFactor: number,
): BarSegment[] {
  const total = polylineLength(fullPoints)
  if (total <= maxBarLength) {
    return [{ points: fullPoints, length: total }]
  }

  // 简化处理：仅在主直段上 split。fullPoints 至少 4 点（含弯钩），中间两段是直段
  // 我们假设直段是 fullPoints[1] -> fullPoints[fullPoints.length - 2]
  if (fullPoints.length < 2) return [{ points: fullPoints, length: total }]

  const lapLen = lapFactor * laFactor * diameter
  // 找最长直段(中间)，沿 X 方向切分
  const headEnd = fullPoints[fullPoints.length === 4 ? 1 : 0] // 直段起点
  const tailStart = fullPoints[fullPoints.length === 4 ? 2 : fullPoints.length - 1] // 直段终点
  const straightLen = headEnd.distanceTo(tailStart)
  const segCount = Math.ceil((straightLen + lapLen) / maxBarLength)
  // 每段沿X的实际位置：第k段从 x[k] 到 x[k+1]+lapLen
  const xs: number[] = []
  for (let k = 0; k <= segCount; k++) {
    xs.push(headEnd.x + (k * straightLen) / segCount)
  }

  const segs: BarSegment[] = []
  const y = headEnd.y
  const z = headEnd.z
  for (let k = 0; k < segCount; k++) {
    const xStart = xs[k]
    const xEnd = Math.min(xs[k + 1] + lapLen, tailStart.x) // 含搭接长度
    const isFirst = k === 0
    const isLast = k === segCount - 1
    const pts: THREE.Vector3[] = []
    if (isFirst) {
      // 首段：含左弯钩(原始 fullPoints[0..1])，主直段切到 xEnd
      pts.push(fullPoints[0].clone())
      pts.push(new THREE.Vector3(xStart, y, z)) // = headEnd
      pts.push(new THREE.Vector3(xEnd, y, z))
    } else if (isLast) {
      // 末段：从 xStart 到右弯钩
      pts.push(new THREE.Vector3(xStart, y, z))
      pts.push(new THREE.Vector3(tailStart.x, y, z))
      pts.push(fullPoints[fullPoints.length - 1].clone())
    } else {
      pts.push(new THREE.Vector3(xStart, y, z))
      pts.push(new THREE.Vector3(xEnd, y, z))
    }
    segs.push({ points: pts, length: polylineLength(pts) })
  }
  return segs
}

/** 把一组控制点转换成 CurvePath 供 TubeGeometry 使用，跳过零长边 */
export function pointsToCurve(points: THREE.Vector3[]): THREE.CurvePath<THREE.Vector3> {
  const curve = new THREE.CurvePath<THREE.Vector3>()
  for (let i = 1; i < points.length; i++) {
    if (points[i].distanceToSquared(points[i - 1]) < 1e-6) continue
    curve.add(new THREE.LineCurve3(points[i - 1], points[i]))
  }
  return curve
}
