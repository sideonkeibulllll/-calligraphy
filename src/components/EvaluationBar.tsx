/**
 * 中文名：自评栏
 * 职责：勾 / 中 / 差 三档自评按钮
 * 依赖：类型定义
 */
import type { Evaluation } from '../types'

interface EvaluationBarProps {
  value: Evaluation | null
  onChange: (e: Evaluation) => void
}

const OPTIONS: { key: Evaluation; label: string; color: string }[] = [
  { key: 'good', label: '勾', color: 'var(--neon-teal)' },
  { key: 'mid', label: '中', color: 'var(--neon-yellow)' },
  { key: 'bad', label: '差', color: 'var(--neon-pink)' }
]

export default function EvaluationBar({ value, onChange }: EvaluationBarProps) {
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
      {OPTIONS.map((o) => {
        const active = value === o.key
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            style={{
              width: 66, height: 66, borderRadius: 'var(--radius-capsule)',
              border: active ? `2px solid ${o.color}` : '1.5px solid var(--border-soft)',
              background: active ? o.color : 'var(--bg-elevated)',
              color: active ? '#1a1714' : 'var(--text-primary)',
              fontWeight: 700, fontSize: 20,
              boxShadow: active ? 'var(--shadow-dark)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
