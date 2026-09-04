/**
 * 中文名：笔顺区
 * 职责：Make Me a Hanzi 字符数据自渲染 SVG，逐笔演示（自动无限循环）+ 手动控制
 * 依赖：汉字数据钩子
 */
import { useState, useEffect, useRef } from 'react'
import { useCharacterData } from '../hooks/use-character-data'

interface StrokeOrderProps {
  char: string
  size?: number
}

// Make Me a Hanzi 笔画数据需上下翻转 + 上移115对齐基线（经 debug-stroke.html 视觉校准）
const STROKE_TRANSFORM = 'translate(0 -115) translate(1024 0) scale(-1 1) rotate(180 512 512)'

const ctrlBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 'var(--radius-capsule)',
  border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
}

export default function StrokeOrder({ char, size = 150 }: StrokeOrderProps) {
  const { data, supported, loading } = useCharacterData(char)
  const [visible, setVisible] = useState(0)
  const [playKey, setPlayKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    stopTimer()
    if (!data) {
      setVisible(0)
      return
    }
    setVisible(0)
    timerRef.current = setInterval(() => {
      setVisible((c) => {
        if (c >= data.strokes.length) {
          // 播完保持完整字一个周期后回到第一笔，无限循环
          return 0
        }
        return c + 1
      })
    }, 450)
    return stopTimer
  }, [data, playKey])

  const manual = (delta: number) => {
    stopTimer()
    if (data) setVisible((c) => Math.max(0, Math.min(data.strokes.length, c + delta)))
  }

  if (loading) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
        加载笔顺...
      </div>
    )
  }

  if (!supported || !data) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
        暂无笔顺数据
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 1024 1024"
        style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}
      >
        <g transform={STROKE_TRANSFORM}>
          {data.strokes.map((d, i) => (
            <path key={i} d={d} fill={i < visible ? '#2ee6c8' : 'rgba(255,255,255,0.07)'} stroke="none" />
          ))}
        </g>
      </svg>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => manual(-1)} style={ctrlBtn} aria-label="上一笔">‹</button>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 44, textAlign: 'center' }}>
          {visible}/{data.strokes.length}
        </span>
        <button onClick={() => manual(1)} style={ctrlBtn} aria-label="下一笔">›</button>
        <button
          onClick={() => setPlayKey((k) => k + 1)}
          style={{ ...ctrlBtn, width: 'auto', padding: '0 12px', borderColor: 'var(--border-yellow)', color: 'var(--neon-yellow)' }}
        >
          重播
        </button>
      </div>
    </div>
  )
}
