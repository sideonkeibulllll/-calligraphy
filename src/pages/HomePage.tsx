/**
 * 中文名：练习主页
 * 职责：问候+归色进度、开始复习入口、输入临摹入口、快捷入口
 * 依赖：胶囊按钮、字符输入框、归色进度环、临摹状态、字卡仓库、练习记录仓库
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CapsuleButton from '../components/CapsuleButton'
import CharacterInput from '../components/CharacterInput'
import ProgressRing from '../components/ProgressRing'
import { useRandomQuote } from '../hooks/use-random-quote'
import { usePracticeStore } from '../store/practice-store'
import { cardRepository } from '../db/repositories/card-repository'
import { recordRepository } from '../db/repositories/record-repository'

function splitChars(text: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const ch of Array.from(text)) {
    if (ch.trim() && !seen.has(ch)) {
      seen.add(ch)
      result.push(ch)
    }
  }
  return result
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，天镜'
  if (h < 12) return '早安，天镜'
  if (h < 18) return '午后好，天镜'
  return '夜安，天镜'
}

export default function HomePage() {
  const navigate = useNavigate()
  const quote = useRandomQuote()
  const [dueCount, setDueCount] = useState(0)
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    const load = async () => {
      setDueCount(await cardRepository.getDueCount())
      setCompleted(await recordRepository.getTodayCompleted())
    }
    load()
  }, [])

  const handleSubmit = (text: string) => {
    const chars = splitChars(text)
    if (!chars.length) return
    usePracticeStore.getState().setChars(chars, 'practice')
    navigate('/practice')
  }

  const startReview = () => navigate('/review')

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, padding: 20, borderRadius: 'var(--radius-card)',
        background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
        boxShadow: 'var(--shadow-teal)'
      }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{greeting()}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {quote.content}
            <span style={{ color: 'var(--neon-yellow)', marginLeft: 6, fontSize: 12 }}>— {quote.author}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>今日复习完成率</div>
        </div>
        <ProgressRing completed={completed} total={dueCount} />
      </div>

      <CapsuleButton block color="pink" size="lg" onClick={startReview} disabled={dueCount === 0}
        style={{ marginBottom: 16 }}>
        {dueCount > 0 ? `开始复习 · 今日 ${dueCount} 字` : '今日无待复习字'}
      </CapsuleButton>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>临摹新字</div>
        <CharacterInput onSubmit={handleSubmit} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => navigate('/playlist')}
          style={{
            flex: 1, padding: 16, borderRadius: 'var(--radius-card)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-teal)',
            color: 'var(--text-primary)', textAlign: 'left'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>歌单</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>字帖列表练习</div>
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{
            flex: 1, padding: 16, borderRadius: 'var(--radius-card)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-yellow)',
            color: 'var(--text-primary)', textAlign: 'left'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>历史</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>练习记录与星标</div>
        </button>
      </div>
    </div>
  )
}
