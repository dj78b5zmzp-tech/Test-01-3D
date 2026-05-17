import * as THREE from 'three'

/**
 * 程序化生成 HRB 螺纹钢的法线贴图：
 * 主体：竖向纵肋两条 + 斜向月牙肋(交错)
 * 输出可平铺(repeatWrapping)的法线贴图
 */
function buildRibCanvas(width = 512, height = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // 1. 灰底 (法线 Z 朝外)
  ctx.fillStyle = 'rgb(128,128,255)'
  ctx.fillRect(0, 0, width, height)

  const drawRib = (cx: number, cy: number, w: number, h: number, angle: number, intensity: number) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    // 模拟凸起：从一侧偏蓝(凹)到另一侧偏黄(凸)，法线贴图核心
    const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
    const a = Math.round(128 + 90 * intensity)
    const b = Math.round(128 - 90 * intensity)
    grad.addColorStop(0, `rgb(128,${b},255)`)
    grad.addColorStop(0.5, 'rgb(180,180,255)')
    grad.addColorStop(1, `rgb(128,${a},255)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 纵向纵肋(两条)
  const longRibW = 14
  ctx.fillStyle = 'rgb(180,128,255)'
  ctx.fillRect(width * 0.25 - longRibW / 2, 0, longRibW, height)
  ctx.fillStyle = 'rgb(76,128,255)'
  ctx.fillRect(width * 0.75 - longRibW / 2, 0, longRibW, height)

  // 斜向月牙肋 — 上半组与下半组方向相反
  const rows = 14
  for (let i = 0; i < rows; i++) {
    const y = (i + 0.5) * (height / rows)
    const angle = i % 2 === 0 ? Math.PI / 9 : -Math.PI / 9
    // 上排
    drawRib(width * 0.125, y, 90, 14, angle, 1.0)
    drawRib(width * 0.375, y, 90, 14, angle, 1.0)
    drawRib(width * 0.625, y, 90, 14, -angle, 1.0)
    drawRib(width * 0.875, y, 90, 14, -angle, 1.0)
  }

  return canvas
}

let cachedNormalMap: THREE.Texture | null = null
export function getRebarNormalMap(): THREE.Texture {
  if (cachedNormalMap) return cachedNormalMap
  const canvas = buildRibCanvas(512, 512)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  cachedNormalMap = tex
  return tex
}

/** 创建钢筋专用 PBR 材质（带螺纹法线贴图） */
export function createRebarMaterial(color: string, repeatU = 1, repeatV = 1): THREE.MeshStandardMaterial {
  const normalMap = getRebarNormalMap().clone()
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping
  normalMap.repeat.set(repeatU, repeatV)
  normalMap.needsUpdate = true

  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.85,
    roughness: 0.4,
    normalMap,
    normalScale: new THREE.Vector2(0.7, 0.7),
  })
}
