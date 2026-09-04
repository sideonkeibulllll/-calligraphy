/**
 * 中文名：画摹图片卡片
 * 职责：图片管理器中的图片卡片——上缩略图、左下名字、右下最近日期；单击 + 长按
 * 依赖：无
 */
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface SketchImageCardProps {
  name: string
  thumbUrl: string
  date: string
  onClick: () => void
  onLongPress: (x: number, y: number) => void
}

const LONG_PRESS_MS = 500
const MOVE_TOLERANCE = 8

export default function SketchImageCard({ name, thumbUrl, date, onClick, onLongPress }: SketchImageCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)
  const downPos = useRef({ x: 0, y: 0 })

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    firedRef.current = false
    downPos.current = { x: e.clientX, y: e.clientY }
    const { clientX, clientY } = e
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress(clientX, clientY)
    }, LONG_PRESS_MS)
  }

  const handleUp = () => {
    clearTimer()
    if (!firedRef.current) onClick()
    firedRef.current = false
  }

  const handleMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // 位移超过阈值视为滚动意图，取消长按（轻微抖动不取消）
    const dx = Math.abs(e.clientX - downPos.current.x)
    const dy = Math.abs(e.clientY - downPos.current.y)
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clearTimer()
  }

  return (
    <button
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerMove={handleMove}
      onPointerCancel={clearTimer}
      style={{
        padding: 0, border: '1px solid var(--border-teal)', touchAction: 'auto',
        borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left'
      }}
    >
      <img
        src={thumbUrl}
        alt={name}
        draggable={false}
        style={{ width: '100%', height: 86, objectFit: 'cover', display: 'block', background: 'var(--bg-elevated)', pointerEvents: 'none' }}
      />
      <div style={{ padding: '6px 8px 8px', display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>{date}</span>
      </div>
    </button>
  )
}
