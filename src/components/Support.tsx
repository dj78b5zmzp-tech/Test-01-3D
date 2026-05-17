import * as THREE from 'three'
import { useMemo } from 'react'

interface Props {
  centerX: number // 支座中心 X 位置
  hc: number // 沿X方向尺寸 (mm)
  bc: number // 沿Z方向尺寸 (mm)
  beamHeight: number // 梁高
  extUp: number // 顶部伸出梁顶
  extDown: number // 底部伸出梁底
  opacity: number
  clippingPlanes?: THREE.Plane[]
}

/** 柱状混凝土支座，与梁通过端面相交 */
export default function Support({ centerX, hc, bc, beamHeight, extUp, extDown, opacity, clippingPlanes }: Props) {
  const totalH = beamHeight + extUp + extDown
  const centerY = (extUp - extDown) / 2

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b8bcc2',
        roughness: 0.95,
        metalness: 0.02,
        transparent: opacity < 1,
        opacity,
        clippingPlanes: clippingPlanes ?? [],
        side: THREE.DoubleSide,
      }),
    [opacity, clippingPlanes],
  )

  return (
    <mesh position={[centerX, centerY, 0]} castShadow receiveShadow material={material}>
      <boxGeometry args={[hc, totalH, bc]} />
    </mesh>
  )
}
