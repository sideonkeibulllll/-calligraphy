/**
 * 中文名：胶囊按钮
 * 职责：20px 胶囊圆角按钮，霓虹色填充 + 硬投影
 * 依赖：无
 */
import type { ReactNode, CSSProperties } from 'react'

type Color = 'pink' | 'teal' | 'yellow' | 'ghost'

interface CapsuleButtonProps {
  children: ReactNode
  onClick?: () => void
  color?: Color
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
  style?: CSSProperties
}

const COLORS: Record<Color, { bg: string; shadow: string; border: string; text: string }> = {
  pink: { bg: 'var(--neon-pink)', shadow: 'var(--shadow-dark)', border: 'transparent', text: '#1a1714' },
  teal: { bg: 'var(--neon-teal)', shadow: 'var(--shadow-dark)', border: 'transparent', text: '#1a1714' },
  yellow: { bg: 'var(--neon-yellow)', shadow: 'var(--shadow-dark)', border: 'transparent', text: '#1a1714' },
  ghost: { bg: 'transparent', shadow: 'none', border: 'var(--border-soft)', text: 'var(--text-primary)' }
}

const SIZES = {
  sm: { padding: '6px 14px', fontSize: 12 },
  md: { padding: '10px 20px', fontSize: 14 },
  lg: { padding: '14px 26px', fontSize: 16 }
}

export default function CapsuleButton({
  children, onClick, color = 'pink', size = 'md', block, type = 'button', disabled, style
}: CapsuleButtonProps) {
  const c = COLORS[color]
  const s = SIZES[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-capsule)', border: `1.5px solid ${c.border}`,
        background: c.bg, color: c.text,
        fontWeight: 700, fontSize: s.fontSize, padding: s.padding,
        boxShadow: disabled ? 'none' : c.shadow,
        width: block ? '100%' : undefined, opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.1s', ...style
      }}
    >
      {children}
    </button>
  )
}
