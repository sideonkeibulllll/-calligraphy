/**
 * 中文名：临摹练习页
 * 职责：临摹/复习/歌单练习共用页；大字区+笔顺区+自评，评价触发 SM-2 与记录写入
 * 依赖：大字区、笔顺区、自评栏、星标按钮、描红层、胶囊按钮、设置状态、临摹状态、复习状态、
 *       字卡仓库、练习记录仓库、歌单仓库、间隔重复算法、日期工具
 */
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BigCharacter from '../components/BigCharacter'
import StrokeOrder from '../components/StrokeOrder'
import EvaluationBar from '../components/EvaluationBar'
import StarToggle from '../components/StarToggle'
import TracingLayer, { type TracingLayerHandle } from '../components/TracingLayer'
import CapsuleButton from '../components/CapsuleButton'
import { useSettingsStore } from '../store/settings-store'
import { usePracticeStore } from '../store/practice-store'
import { useReviewStore } from '../store/review-store'
import { cardRepository } from '../db/repositories/card-repository'
import { recordRepository } from '../db/repositories/record-repository'
import { playlistRepository } from '../db/repositories/playlist-repository'
import { sm2 } from '../utils/sm2'
import { today } from '../utils/date'
import type { Card, Evaluation, PracticeSource } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SOURCE_LABEL: Record<PracticeSource, string> = {
  practice: '临摹',
  review: '复习',
  playlist: '歌单'
}

export default function PracticePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const tracingEnabled = useSettingsStore((s) => s.tracingEnabled)
  const tracingRef = useRef<TracingLayerHandle>(null)

  const path = location.pathname
  const source: PracticeSource = path === '/review' ? 'review' : path.startsWith('/playlist/') ? 'playlist' : 'practice'
  const playlistId = params.id ? Number(params.id) : null

  const [chars, setChars] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [card, setCard] = useState<Card | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      setReady(false)
      let list: string[] = []
      if (source === 'review') {
        const cards = await cardRepository.getDue()
        list = cards.map((c) => c.character)
        useReviewStore.getState().setQueue(cards)
      } else if (source === 'playlist' && playlistId) {
        const items = await playlistRepository.getItems(playlistId)
        list = items.map((i) => i.character)
        if (searchParams.get('order') === 'shuffle') list = shuffle(list)
      } else {
        list = [...usePracticeStore.getState().chars]
      }
      setChars(list)
      setIndex(0)
      setReady(true)
    }
    init()
  }, [path])

  useEffect(() => {
    const char = chars[index]
    tracingRef.current?.clear()
    if (!char) {
      setCard(null)
      return
    }
    setCard(null)
    setEvaluation(null)
    cardRepository.findByChar(char).then(setCard)
  }, [index, chars])

  const finish = () => {
    if (source === 'playlist' && playlistId) navigate(`/playlist/${playlistId}`)
    else navigate('/')
  }

  const goNext = () => {
    if (index < chars.length - 1) setIndex(index + 1)
    else finish()
  }

  const goPrev = () => {
    if (index > 0) setIndex(index - 1)
  }

  const handleEvaluate = async (ev: Evaluation) => {
    const char = chars[index]
    if (!char) return
    setEvaluation(ev)
    const is_new = !card
    const result = sm2({
      ease: card?.ease ?? 2.5,
      interval: card?.interval ?? 0,
      repetitions: card?.repetitions ?? 0,
      evaluation: ev,
      is_new
    })
    await recordRepository.save({
      card_id: card?.id ?? null,
      character: char,
      evaluation: ev,
      is_new,
      source
    })
    if (result) {
      await cardRepository.save({
        id: card?.id,
        character: char,
        ease: result.ease,
        interval: result.interval,
        repetitions: result.repetitions,
        due_date: result.due_date,
        priority: result.priority,
        starred: card?.starred ?? false,
        created_at: card?.created_at ?? today()
      })
    }
    if (ev !== 'bad' && source === 'review') {
      useReviewStore.getState().addCompleted()
    }
    setTimeout(goNext, 180)
  }

  const handleStar = async () => {
    if (!card) return
    await cardRepository.toggleStar(card.id)
    setCard({ ...card, starred: !card.starred })
  }

  if (!ready) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>准备中...</div>
  }

  if (!chars.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          {source === 'review' ? '今日无待复习字' : '暂无字符'}
        </div>
        <CapsuleButton color="ghost" onClick={() => navigate('/')}>返回主页</CapsuleButton>
      </div>
    )
  }

  const char = chars[index]

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '16px 20px 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16
      }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 20, color: 'var(--text-secondary)', padding: 4 }}>‹</button>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--neon-teal)', fontWeight: 700 }}>{index + 1}</span> / {chars.length}
          <span style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 'var(--radius-capsule)', background: 'var(--neon-teal-soft)', color: 'var(--neon-teal)', fontSize: 11 }}>{SOURCE_LABEL[source]}</span>
        </div>
        <StarToggle active={!!card?.starred} onToggle={handleStar} size={26} />
      </div>

      <div style={{
        position: 'relative', width: 280, height: 280, margin: '8px auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <BigCharacter char={char} size={280} />
        <TracingLayer ref={tracingRef} size={280} enabled={tracingEnabled} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <StrokeOrder char={char} size={140} />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <EvaluationBar value={evaluation} onChange={handleEvaluate} />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <CapsuleButton color="ghost" size="sm" onClick={goPrev} disabled={index === 0}>上一字</CapsuleButton>
          <CapsuleButton color="ghost" size="sm" onClick={goNext}>下一字</CapsuleButton>
        </div>
      </div>
    </div>
  )
}
