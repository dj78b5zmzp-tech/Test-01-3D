import { Html } from '@react-three/drei'

interface Props {
  position: [number, number, number]
  text: string
  color?: string
}

export default function RebarAnnotation({ position, text, color = '#facc15' }: Props) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[100, 0]}>
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          color,
          border: `1px solid ${color}`,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {text}
      </div>
    </Html>
  )
}
