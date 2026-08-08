/**
 * 中文名：字符详情页
 * 职责：单字大字+笔顺+历史评价+加入歌单/星标/开始练习
 * 依赖：大字区、笔顺区、星标按钮、胶囊按钮、汉字数据钩子、字卡仓库、练习记录仓库、歌单仓库、
 *       临摹状态、日期工具
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BigCharacter from '../components/BigCharacter'
import StrokeOrder from '../components/StrokeOrder'
import StarToggle from '../components/StarToggle'
import CapsuleButton from '../components/CapsuleButton'
import { useCharacterData } from '../hooks/use-character-data'
import { cardRepository } from '../db/repositories/card-repository'
import { recordRepository } from '../db/repositories/record-repository'
import { playlistRepository } from '../db/repositories/playlist-repository'
import { usePracticeStore } from '../store/practice-store'
import { formatDisplay } from '../utils/date'
import type { Card, PracticeRecord, Evaluation, PlaylistWithCount } from '../types'

const EVAL_LABEL: Record<Evaluation, { t: string; c: string }> = {
  good: { t: '勾', c: 'var(--neon-teal)' },
  mid: { t: '中', c: 'var(--neon-yellow)' },
  bad: { t: '差', c: 'var(--neon-pink)' }
}

export default function DetailPage() {
  const { char = '' } = useParams()
  const navigate = useNavigate()
  const { data, supported } = useCharacterData(char)
  const [card, setCard] = useState<Card | null>(null)
  const [records, setRecords] = useState<PracticeRecord[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([])

  useEffect(() => {
    const load = async () => {
      setCard(await cardRepository.findByChar(char))
      setRecords(await recordRepository.findByChar(char))
    }
    load()
  }, [char])

  const openPicker = async () => {
    setPlaylists(await playlistRepository.getAll())
    setShowPicker(true)
  }

  const addToPlaylist = async (id: number) => {
    await playlistRepository.addItem(id, char)
    setShowPicker(false)
  }

  const handleStar = async () => {
    if (!card) return
    await cardRepository.toggleStar(card.id)
    setCard({ ...card, starred: !card.starred })
  }

  const startPractice = () => {
    usePracticeStore.getState().setChars([char], 'practice')
    navigate('/practice')
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 20, color: 'var(--text-secondary)' }}>‹</button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{char}</div>
        <StarToggle active={!!card?.starred} onToggle={handleStar} size={26} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <BigCharacter char={char} size={180} />
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {supported && data ? `${data.strokeCount}画 · 部首 ${data.radical || '—'}` : '笔画数据加载中'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <StrokeOrder char={char} size={130} />
      </div>

      <div style={{
        padding: 16, borderRadius: 'var(--radius-card)', background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)', marginBottom: 16
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>历史评价</div>
        {records.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>暂无练习记录</div>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {records.map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDisplay(r.practiced_at)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: EVAL_LABEL[r.evaluation].c }}>
                  {EVAL_LABEL[r.evaluation].t}
                </span>
              </li>
            ))}
          </ul>
        )}
        {card && (
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 10 }}>
            下次复习：{card.due_date} · {card.priority ? '优先' : '常规'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <CapsuleButton color="teal" block onClick={openPicker}>加入歌单</CapsuleButton>
        <CapsuleButton color="pink" block onClick={startPractice}>开始练习</CapsuleButton>
      </div>

      {showPicker && (
        <div
          onClick={() => setShowPicker(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480, margin: '0 auto', background: 'var(--bg-surface)',
              borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '60vh', overflow: 'auto'
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>选择歌单</div>
            {playlists.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>还没有歌单，先去歌单页新建</div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {playlists.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => addToPlaylist(p.id)}
                      style={{
                        width: '100%', padding: 14, borderRadius: 'var(--radius-md)', textAlign: 'left',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.item_count} 字</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
