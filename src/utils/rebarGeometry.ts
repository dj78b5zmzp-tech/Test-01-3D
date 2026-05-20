import * as THREE from 'three'

/* ═══════ 圆弧辅助 ═══════ */

const ARC_SEGMENTS_PER_90 = 10

/**
 * 获取箍筋弯曲内半径 R（按22G101-1 P58）
 * HPB300(G): D=2.5d → R=1.25d
 * HRB400(C): D=4d   → R=2d
 * HRB500(E): D=5d   → R=2.5d
 * 箍筋常用HPB300，默认取 R=1.25d
 */
function getBendRadius(diameter: number): number {
  return 1.25 * diameter
}

/**
 * 向 CurvePath 添加一段圆弧（XY平面，用多段LineCurve3逼近）
 * @param path    目标路径
 * @param cx, cy  圆心坐标
 * @param radius  半径（到钢筋中心线）
 * @param startAngle 起始角(rad)
 * @param endAngle   终止角(rad)
 * @param segments   分段数
 */
function addArc(
  path: THREE.CurvePath<THREE.Vector3>,
  cx: number, cy: number,
  radius: number,
  startAngle: number, endAngle: number,
  segments: number,
): void {
  for (let i = 0; i < segments; i++) {
    const a0 = startAngle + (endAngle - startAngle) * (i / segments)
    const a1 = startAngle + (endAngle - startAngle) * ((i + 1) / segments)
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(cx + radius * Math.cos(a0), cy + radius * Math.sin(a0), 0),
      new THREE.Vector3(cx + radius * Math.cos(a1), cy + radius * Math.sin(a1), 0),
    ))
  }
}

/* ═══════ 箍筋路径生成 ═══════ */

/**
 * 生成箍筋路径（带 135° 抗震弯钩，四角圆弧过渡）
 * 矩形位于 XY 平面，中心在原点。
 * 路径: hookA平直段 → 135°弧 → 底边 → 90°弧(p2) → 右边 → 90°弧(p3) → 顶边 → 90°弧(p4) → 左边 → 135°弧 → hookB平直段
 */
export function buildStirrupCurve(
  innerWidth: number,
  innerHeight: number,
  hookLength: number = 60,
  diameter: number = 8,
): THREE.CurvePath<THREE.Vector3> {
  const w = innerWidth / 2
  const h = innerHeight / 2
  const R = getBendRadius(diameter) // 弯曲内半径
  const Rc = R + diameter / 2       // 中心线半径（几何路径沿钢筋中心线）
  const path = new THREE.CurvePath<THREE.Vector3>()

  const hookStraight = Math.max(10 * diameter, 75) // 弯钩平直段长度 max(10d,75)
  const seg90 = ARC_SEGMENTS_PER_90
  const seg135 = Math.round(ARC_SEGMENTS_PER_90 * 1.5)

  // ─── Hook A: 底边起始端弯钩 (在左下角p1=(-w,-h)) ───
  // 弧圆心在角内侧，135°弧从弯钩方向弯转到底边方向
  // 弯钩平直段指向右上45°方向
  const cxA = -w + Rc
  const cyA = -h + Rc
  const hookA_arcStart = 3 * Math.PI / 4   // 弧起始极角(弯钩侧)
  const hookA_arcEnd = 3 * Math.PI / 2     // 弧终止极角(底边切点)

  const hookA_arcStartX = cxA + Rc * Math.cos(hookA_arcStart)
  const hookA_arcStartY = cyA + Rc * Math.sin(hookA_arcStart)
  const hookA_freeX = hookA_arcStartX + hookStraight * Math.cos(Math.PI / 4)
  const hookA_freeY = hookA_arcStartY + hookStraight * Math.sin(Math.PI / 4)

  // HookA 平直段
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(hookA_freeX, hookA_freeY, 0),
    new THREE.Vector3(hookA_arcStartX, hookA_arcStartY, 0),
  ))
  // HookA 135°弧
  addArc(path, cxA, cyA, Rc, hookA_arcStart, hookA_arcEnd, seg135)

  // ─── 底边直线 ───
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(-w + Rc, -h, 0),
    new THREE.Vector3(w - Rc, -h, 0),
  ))

  // ─── p2角(w,-h) 右下: 90°弧 ───
  addArc(path, w - Rc, -h + Rc, Rc, -Math.PI / 2, 0, seg90)

  // ─── 右边直线 ───
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(w, -h + Rc, 0),
    new THREE.Vector3(w, h - Rc, 0),
  ))

  // ─── p3角(w,h) 右上: 90°弧 ───
  addArc(path, w - Rc, h - Rc, Rc, 0, Math.PI / 2, seg90)

  // ─── 顶边直线 ───
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(w - Rc, h, 0),
    new THREE.Vector3(-w + Rc, h, 0),
  ))

  // ─── p4角(-w,h) 左上: 90°弧 ───
  addArc(path, -w + Rc, h - Rc, Rc, Math.PI / 2, Math.PI, seg90)

  // ─── 左边直线 ───
  path.add(new THREE.LineCurve3(
    new THREE.Vector3(-w, h - Rc, 0),
    new THREE.Vector3(-w, -h + Rc, 0),
  ))

  // ─── Hook B: 左边终端弯钩 (也在左下角p1区域) ───
  // 路径沿左边从上往下(-Y)到达弧，弯135°后平直段指向右上45°
  // 弧圆心同hookA，但偏移一个直径避免管体重叠
  const cxB = -w + Rc + diameter * 0.5
  const cyB = -h + Rc + diameter * 0.5
  const hookB_arcStart = Math.PI            // 左边切点极角
  const hookB_arcEnd = 7 * Math.PI / 4      // 弯钩侧极角(315°)

  // HookB 135°弧
  addArc(path, cxB, cyB, Rc, hookB_arcStart, hookB_arcEnd, seg135)

  // HookB 平直段
  const hookB_arcEndX = cxB + Rc * Math.cos(hookB_arcEnd)
  const hookB_arcEndY = cyB + Rc * Math.sin(hookB_arcEnd)
  const hookB_freeX = hookB_arcEndX + hookStraight * Math.cos(Math.PI / 4)
  const hookB_freeY = hookB_arcEndY + hookStraight * Math.sin(Math.PI / 4)

  path.add(new THREE.LineCurve3(
    new THREE.Vector3(hookB_arcEndX, hookB_arcEndY, 0),
    new THREE.Vector3(hookB_freeX, hookB_freeY, 0),
  ))

  return path
}

/** 计算箍筋单根展开长度（含双弯钩和圆弧） */
export function stirrupSingleLength(innerW: number, innerH: number, hookLen: number, diameter: number = 8): number {
  const R = getBendRadius(diameter)
  const Rc = R + diameter / 2
  // 四个90°弧长 + 底边+右边+顶边+左边直线段 + 两个135°弧长 + 两段弯钩平直段
  const arc90 = (Math.PI / 2) * Rc // 单个90°弧长
  const arc135 = (135 * Math.PI / 180) * Rc // 单个135°弧长
  const straightBottom = innerW - 2 * Rc
  const straightRight = innerH - 2 * Rc
  const straightTop = innerW - 2 * Rc
  const straightLeft = innerH - 2 * Rc
  const hookStraight = Math.max(10 * diameter, 75)
  return straightBottom + straightRight + straightTop + straightLeft
    + 4 * arc90 + 2 * arc135 + 2 * hookStraight
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
