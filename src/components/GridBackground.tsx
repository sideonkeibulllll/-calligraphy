/**
 * 中文名：网格背景
 * 职责：米字格 / 田字格 / 九宫格 SVG 网格
 * 依赖：类型定义
 */
import type { GridType } from '../types'

interface GridBackgroundProps {
  type: GridType
  size: number
}

export default function GridBackground({ type, size }: GridBackgroundProps) {
  const stroke = 'rgba(255,77,157,0.35)'
  const mid = size / 2
  const dash = '4 4'
  return (
    <svg width={size} height={size} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <rect x="1" y="1" width={size - 2} height={size - 2} fill="none" stroke={stroke} strokeWidth="1.5" />
      {type === 'mi' && (
        <>
          <line x1="0" y1={mid} x2={size} y2={mid} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1={mid} y1="0" x2={mid} y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1="0" y1="0" x2={size} y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1={size} y1="0" x2="0" y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
        </>
      )}
      {type === 'tian' && (
        <>
          <line x1="0" y1={mid} x2={size} y2={mid} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1={mid} y1="0" x2={mid} y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
        </>
      )}
      {type === 'gong' && (
        <>
          <line x1="0" y1={size / 3} x2={size} y2={size / 3} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1="0" y1={(size / 3) * 2} x2={size} y2={(size / 3) * 2} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1={size / 3} y1="0" x2={size / 3} y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
          <line x1={(size / 3) * 2} y1="0" x2={(size / 3) * 2} y2={size} stroke={stroke} strokeWidth="1" strokeDasharray={dash} />
        </>
      )}
    </svg>
  )
}
