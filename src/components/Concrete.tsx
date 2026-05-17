import * as THREE from 'three'
import { useMemo } from 'react'

interface Props {
  width: number // 沿Z
  height: number // 沿Y
  length: number // 沿X
  opacity: number
  clippingPlanes?: THREE.Plane[]
}

export default function Concrete({ width, height, length, opacity, clippingPlanes }: Props) {
  const transparent = opacity < 1
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cfd2d6',
        roughness: 0.92,
        metalness: 0.02,
        transparent,
        opacity,
        clippingPlanes: clippingPlanes ?? [],
        clipShadows: true,
        side: THREE.DoubleSide,
      }),
    [opacity, transparent, clippingPlanes],
  )

  return (
    <mesh castShadow receiveShadow material={material}>
      <boxGeometry args={[length, height, width]} />
    </mesh>
  )
}
