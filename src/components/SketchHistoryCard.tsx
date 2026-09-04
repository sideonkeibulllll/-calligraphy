/**
 * 中文名：画摹历史卡片
 * 职责：临摹历史横向卡片——上缩略图、左下名字、右下日期+时长
 * 依赖：无
 */
interface SketchHistoryCardProps {
  name: string
  thumbUrl: string
  date: string
  duration: number
  onClick: () => void
}

function formatDuration(sec: number): string {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} 分钟`
  return `${Math.floor(m / 60)} 时 ${m % 60} 分`
}

export default function SketchHistoryCard({ name, thumbUrl, date, duration, onClick }: SketchHistoryCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '0 0 auto', width: 96, padding: 0, border: '1px solid var(--border-teal)',
        borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left'
      }}
    >
      <img
        src={thumbUrl}
        alt={name}
        style={{ width: '100%', height: 66, objectFit: 'cover', display: 'block', background: 'var(--bg-elevated)' }}
      />
      <div style={{ padding: '6px 8px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>{date}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{formatDuration(duration)}</div>
      </div>
    </button>
  )
}
