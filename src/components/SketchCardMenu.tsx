/**
 * 中文名：画摹长按菜单
 * 职责：长按卡片后于按点附近弹出的浮动菜单（重命名/移动到/删除），点遮罩关闭
 * 依赖：无
 */
import { useEffect, useRef } from 'react'

interface SketchCardMenuProps {
  x: number
  y: number
  isFolder: boolean
  onRename: () => void
  onMove: () => void
  onDelete: () => void
  onClose: () => void
}

const MENU_W = 132
const MENU_H = 128

export default function SketchCardMenu({ x, y, isFolder, onRename, onMove, onDelete, onClose }: SketchCardMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('pointerdown', close, true)
    return () => window.removeEventListener('pointerdown', close, true)
  }, [onClose])

  // 菜单贴边修正，避免超出屏幕
  const left = Math.min(Math.max(8, x - MENU_W / 2), window.innerWidth - MENU_W - 8)
  const top = Math.min(Math.max(8, y - 12), window.innerHeight - MENU_H - 8)

  const item: React.CSSProperties = {
    padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)',
    textAlign: 'left', width: '100%', background: 'transparent', border: 'none'
  }

  return (
    <>
      <div
        onPointerDown={(e) => e.stopPropagation()}
        ref={ref}
        style={{
          position: 'fixed', left, top, width: MENU_W, zIndex: 60,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-pink)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-dark)', overflow: 'hidden'
        }}
      >
        <button style={item} onClick={onRename}>重命名</button>
        {!isFolder && <button style={item} onClick={onMove}>移动到…</button>}
        <button style={{ ...item, color: '#f09595' }} onClick={onDelete}>删除</button>
      </div>
    </>
  )
}
