/**
 * 中文名：画摹文件夹卡片
 * 职责：图片管理器中的文件夹卡片——文件夹图标 + 名字 + 数量；单击进入 + 长按管理
 * 依赖：无
 */
import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface SketchFolderCardProps {
  name: string
  count: number
  onClick: () => void
  onLongPress: (x: number, y: number) => void
}

const LONG_PRESS_MS = 500
const MOVE_TOLERANCE = 8

export default function SketchFolderCard({ name, count, onClick, onLongPress }: SketchFolderCardProps) {
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

  return (
    <button
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerMove={(e) => {
        const dx = Math.abs(e.clientX - downPos.current.x)
        const dy = Math.abs(e.clientY - downPos.current.y)
        if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clearTimer()
      }}
      onPointerCancel={clearTimer}
      style={{
        padding: 0, border: '1px solid var(--border-yellow)',
        borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left'
      }}
    >
      <div style={{
        width: 44, height: 44, margin: 10, borderRadius: 'var(--radius-sm)',
        background: 'var(--neon-yellow-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M3 6 h6 l2 -2.5 h4 v3 h6 V19 a1.5 1.5 0 0 1 -1.5 1.5 H4.5 A1.5 1.5 0 0 1 3 19 Z" fill="var(--neon-yellow)" opacity="0.7" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{count} 张图片</div>
      </div>
    </button>
  )
}
