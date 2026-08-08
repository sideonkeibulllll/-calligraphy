/**
 * 中文名：归色进度环
 * 职责：今日复习完成率环形进度
 * 依赖：无
 */
interface ProgressRingProps {
  completed: number
  total: number
  size?: number
}

export default function ProgressRing({ completed, total, size = 84 }: ProgressRingProps) {
  const radius = size / 2 - 6
  const circ = 2 * Math.PI * radius
  const pct = total > 0 ? completed / total : 0
  const offset = circ * (1 - pct)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--neon-teal)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{completed}</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>/{total || 0}</span>
      </div>
    </div>
  )
}
