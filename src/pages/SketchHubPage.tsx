/**
 * 中文名：画摹主页
 * 职责：画摹模块首页——导入新图片、临摹历史横向卡片、前往图片管理器
 * 依赖：画摹选图器、画摹历史卡片、胶囊按钮、画摹仓库
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SketchImagePicker, { type SketchImagePickerHandle } from '../components/SketchImagePicker'
import SketchHistoryCard from '../components/SketchHistoryCard'
import CapsuleButton from '../components/CapsuleButton'
import { sketchRepository } from '../db/repositories/sketch-repository'
import type { SketchSessionWithImage } from '../types'

function shortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`
}

export default function SketchHubPage() {
  const navigate = useNavigate()
  const pickerRef = useRef<SketchImagePickerHandle>(null)
  const [history, setHistory] = useState<SketchSessionWithImage[]>([])
  const [importing, setImporting] = useState(false)
  const urlsRef = useRef<string[]>([])

  const loadHistory = async () => {
    const list = await sketchRepository.listRecentSessions()
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = list.map((h) => h.image.thumbUrl)
    setHistory(list)
  }

  useEffect(() => {
    loadHistory()
    return () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const handlePicked = async (file: File) => {
    setImporting(true)
    try {
      const img = await sketchRepository.addImageFromFile(file, null)
      navigate(`/sketch/canvas/${img.id}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      <SketchImagePicker ref={pickerRef} onPicked={handlePicked} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>画摹</div>
      </div>

      <CapsuleButton
        block
        color="pink"
        size="lg"
        disabled={importing}
        onClick={() => pickerRef.current?.open()}
        style={{ marginBottom: 24 }}
      >
        {importing ? '导入中...' : '导入新图片 · 开始临摹'}
      </CapsuleButton>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>临摹历史</div>
      {history.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '16px 0 8px', textAlign: 'center' }}>
          还没有临摹记录，导入第一张图片开始吧
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' }}>
          {history.map((h) => (
            <SketchHistoryCard
              key={h.image.id}
              name={h.image.name}
              thumbUrl={h.image.thumbUrl}
              date={shortDate(h.session.started_at)}
              duration={h.session.duration}
              onClick={() => navigate(`/sketch/canvas/${h.image.id}`)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <CapsuleButton block color="ghost" onClick={() => navigate('/sketch/gallery')}>
          前往图片管理器
        </CapsuleButton>
      </div>
    </div>
  )
}
