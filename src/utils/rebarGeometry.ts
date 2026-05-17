import * as THREE from 'three'

/**
 * 生成箍筋路径（带 135° 抗震弯钩，两端均向矩形内侧弯入）
 * 顺序：钩A端点 → p1 → p2 → p3 → p4 → p1' → 钩B端点
 * 矩形位于 XY 平面，中心在原点。XY平面 → 后续在组件层旋转到所需平面。
 */
export function buildStirrupCurve(
  innerWidth: number,
  innerHeight: number,
  hookLength: number = 60,
  diameter: number = 8,
): THREE.CurvePath<THREE.Vector3> {
  const w = innerWidth / 2
  const h = innerHeight / 2
  const path = new THREE.CurvePath<THREE.Vector3>()

  const p1 = new THREE.Vector3(-w, -h, 0) // 左下角(开口位置)
  const p2 = new THREE.Vector3(w, -h, 0)
  const p3 = new THREE.Vector3(w, h, 0)
  const p4 = new THREE.Vector3(-w, h, 0)

  // 弯钩方向 = 135°，即指向矩形对角线方向 (右上)
  const hookDir = new THREE.Vector3(1, 1, 0).normalize().multiplyScalar(hookLength)
  // 两弯钩在 p1 角点交错错开 1 个直径，避免重叠
  const offsetA = new THREE.Vector3(0, diameter * 0.6, 0)
  const offsetB = new THREE.Vector3(diameter * 0.6, 0, 0)

  const pA0 = p1.clone().add(hookDir).add(offsetA) // 弯钩A自由端
  const pA1 = p1.clone().add(offsetA) // 弯钩A拐点(贴在p1旁)
  const pB1 = p1.clone().add(offsetB) // 弯钩B拐点
  const pB0 = p1.clone().add(hookDir).add(offsetB) // 弯钩B自由端

  // 弯钩A: 自由端 → 拐点 → 进入主体
  path.add(new THREE.LineCurve3(pA0, pA1))
  path.add(new THREE.LineCurve3(pA1, p2))
  path.add(new THREE.LineCurve3(p2, p3))
  path.add(new THREE.LineCurve3(p3, p4))
  path.add(new THREE.LineCurve3(p4, pB1))
  // 弯钩B: 拐点 → 自由端
  path.add(new THREE.LineCurve3(pB1, pB0))

  return path
}

/** 计算箍筋单根展开长度（含双弯钩） */
export function stirrupSingleLength(innerW: number, innerH: number, hookLen: number): number {
  return 2 * (innerW + innerH) + 2 * hookLen
}

/**
 * 沿X方向(梁长方向)的一根直线钢筋
 */
export function buildStraightRebarCurve(length: number): THREE.LineCurve3 {
  return new THREE.LineCurve3(
    new THREE.Vector3(-length / 2, 0, 0),
    new THREE.Vector3(length / 2, 0, 0),
  )
}

/**
 * 计算一排纵筋的 Y、Z 坐标分布
 * @param count 钢筋根数
 * @param spanZ 沿截面宽度方向可用净距 (= width - 2*cover - 2*stirrupDia - rebarDia)
 * @param y     该排所在Y高度
 */
export function distributeLongitudinalRebar(
  count: number,
  spanZ: number,
  y: number,
): { y: number; z: number }[] {
  if (count <= 0) return []
  if (count === 1) return [{ y, z: 0 }]
  const step = spanZ / (count - 1)
  const start = -spanZ / 2
  return Array.from({ length: count }, (_, i) => ({ y, z: start + step * i }))
}
