/**
 * 中文名：星标按钮
 * 职责：收藏星标切换
 * 依赖：无
 */
interface StarToggleProps {
  active: boolean
  onToggle: () => void
  size?: number
}

export default function StarToggle({ active, onToggle, size = 28 }: StarToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="星标"
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={active ? 'var(--neon-yellow)' : 'none'}
        stroke={active ? 'var(--neon-yellow)' : 'var(--text-tertiary)'}
        strokeWidth="2" strokeLinejoin="round">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.5 1.6 6.7L12 17.3 5.8 20.6l1.6-6.7L2.2 8.9l6.9-.6z" />
      </svg>
    </button>
  )
}
