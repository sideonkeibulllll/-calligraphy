/**
 * 中文名：历史记录页
 * 职责：练习记录时间流水 + 搜索 + 全部/星标筛选，点击进字详情
 * 依赖：搜索框、星标按钮、字卡仓库、练习记录仓库、日期工具
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import StarToggle from '../components/StarToggle'
import { cardRepository } from '../db/repositories/card-repository'
import { recordRepository } from '../db/repositories/record-repository'
import { formatDisplay } from '../utils/date'
import type { PracticeRecord, Evaluation } from '../types'

const EVAL_LABEL: Record<Evaluation, { t: string; c: string }> = {
  good: { t: '勾', c: 'var(--neon-teal)' },
  mid: { t: '中', c: 'var(--neon-yellow)' },
  bad: { t: '差', c: 'var(--neon-pink)' }
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<PracticeRecord[]>([])
  const [starMap, setStarMap] = useState<Map<string, boolean>>(new Map())
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<'all' | 'starred'>('all')

  useEffect(() => {
    const load = async () => {
      const [recs, cards] = await Promise.all([
        recordRepository.getRecent(300),
        cardRepository.getAll()
      ])
      setRecords(recs)
      const m = new Map<string, boolean>()
      cards.forEach((c) => m.set(c.character, c.starred))
      setStarMap(m)
    }
    load()
  }, [])

  const filtered = records.filter((r) => {
    if (keyword && !r.character.includes(keyword)) return false
    if (filter === 'starred' && !starMap.get(r.character)) return false
    return true
  })

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>历史记录</h2>
      <div style={{ marginBottom: 14 }}>
        <SearchBar onSearch={setKeyword} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'starred'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-capsule)', fontSize: 12, fontWeight: 600,
              border: filter === f ? '1px solid var(--neon-pink)' : '1px solid var(--border-soft)',
              background: filter === f ? 'var(--neon-pink-soft)' : 'var(--bg-elevated)',
              color: filter === f ? 'var(--neon-pink)' : 'var(--text-tertiary)'
            }}
          >
            {f === 'all' ? '全部' : '星标'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          暂无记录
        </div>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r) => {
            const ev = EVAL_LABEL[r.evaluation]
            return (
              <li
                key={r.id}
                onClick={() => navigate(`/detail/${encodeURIComponent(r.character)}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 'var(--radius-card)', background: 'var(--bg-surface)',
                  border: '1px solid var(--border-soft)'
                }}
              >
                <span style={{ fontSize: 30, lineHeight: 1, minWidth: 36 }}>{r.character}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatDisplay(r.practiced_at)}</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--radius-capsule)',
                      background: 'var(--bg-elevated)', color: ev.c
                    }}>{ev.t}</span>
                  </div>
                </div>
                <StarToggle active={!!starMap.get(r.character)} onToggle={() => {}} size={22} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
