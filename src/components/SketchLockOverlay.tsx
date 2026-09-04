/**
 * 中文名：画摹锁定层
 * 职责：锁定态全屏透明拦截层（手势与点击全部失效），右上角隐形热区 1.5 秒内三击解锁，仅灰色小圆指示
 * 依赖：无
 */
import { useRef } from 'react'

interface SketchLockOverlayProps {
  onUnlock: () => void
}

const TAP_WINDOW_MS = 1500
const TAP_COUNT = 3

export default function SketchLockOverlay({ onUnlock }: SketchLockOverlayProps) {
  const taps = useRef<number[]>([])

  const handleTap = () => {
    const now = Date.now()
    taps.current = taps.current.filter((t) => now - t <= TAP_WINDOW_MS)
    taps.current.push(now)
    if (taps.current.length >= TAP_COUNT) {
      taps.current = []
      onUnlock()
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 90, touchAction: 'none' }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 右上角隐形热区：灰色小圆代表，无动效 */}
      <div
        onPointerDown={(e) => {
          e.stopPropagation()
          handleTap()
        }}
        style={{ position: 'absolute', top: 18, right: 18, width: 72, height: 72, cursor: 'default' }}
      >
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'rgba(0,0,0,0.28)', margin: '31px auto'
        }} />
      </div>
    </div>
  )
}
