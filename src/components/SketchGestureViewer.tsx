/**
 * 中文名：画摹手势查看器
 * 职责：单指拖拽、双指捏合缩放+旋转的图片查看层（图片查看器式操作）
 * 依赖：无
 */
import { useRef, useState, type PointerEvent as ReactPointerEvent, useEffect } from 'react'

interface SketchGestureViewerProps {
  src: string
}

interface Transform {
  x: number
  y: number
  scale: number
  rotate: number
}

interface GestureStart {
  x: number
  y: number
  cx: number
  cy: number
  dist: number
  angle: number
  transform: Transform
}

const MIN_SCALE = 0.2
const MAX_SCALE = 12

export default function SketchGestureViewer({ src }: SketchGestureViewerProps) {
  const [t, setT] = useState<Transform>({ x: 0, y: 0, scale: 1, rotate: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const start = useRef<GestureStart | null>(null)

  useEffect(() => {
    // 换图重置变换
    setT({ x: 0, y: 0, scale: 1, rotate: 0 })
    pointers.current.clear()
    start.current = null
  }, [src])

  const pinch = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dist = Math.hypot(a.x - b.x, a.y - b.y)
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
    const cx = (a.x + b.x) / 2
    const cy = (a.y + b.y) / 2
    return { dist, angle, cx, cy }
  }

  const handleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      start.current = {
        x: pts[0].x, y: pts[0].y, cx: pts[0].x, cy: pts[0].y,
        dist: 0, angle: 0, transform: { ...t }
      }
    } else if (pts.length === 2) {
      const p = pinch(pts[0], pts[1])
      start.current = {
        x: p.cx, y: p.cy, cx: p.cx, cy: p.cy,
        dist: p.dist, angle: p.angle, transform: { ...t }
      }
    }
  }

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const s = start.current
    if (!s) return
    const pts = [...pointers.current.values()]

    if (pts.length === 1) {
      // 单指拖拽
      setT((cur) => ({ ...cur, x: s.transform.x + (pts[0].x - s.x), y: s.transform.y + (pts[0].y - s.y) }))
    } else if (pts.length >= 2) {
      // 双指缩放 + 旋转 + 中点平移
      const p = pinch(pts[0], pts[1])
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s.transform.scale * (p.dist / (s.dist || 1))))
      const rotate = s.transform.rotate + (p.angle - s.angle)
      setT({
        x: s.transform.x + (p.cx - s.cx),
        y: s.transform.y + (p.cy - s.cy),
        scale,
        rotate
      })
    }
  }

  const handleUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      // 双指抬一根后重置单指起点，避免跳变
      start.current = {
        x: pts[0].x, y: pts[0].y, cx: pts[0].x, cy: pts[0].y,
        dist: 0, angle: 0, transform: { ...t }
      }
    } else if (pts.length === 0) {
      start.current = null
    }
  }

  return (
    <div
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', touchAction: 'none', overflow: 'hidden'
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          maxWidth: '94%', maxHeight: '94%',
          transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
          transformOrigin: 'center center', userSelect: 'none'
        }}
      />
    </div>
  )
}
