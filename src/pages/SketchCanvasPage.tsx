/**
 * 中文名：画摹画布页
 * 职责：全白无文字临摹画布——手势查看参考图、锁定防误触（拦截返回键）、屏幕常亮、退出自动记录会话
 * 依赖：画摹手势查看器、画摹锁定层、屏幕常亮钩子、画摹仓库、@capacitor/app
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { App } from '@capacitor/app'
import SketchGestureViewer from '../components/SketchGestureViewer'
import SketchLockOverlay from '../components/SketchLockOverlay'
import { useWakeLock } from '../hooks/use-wake-lock'
import { sketchRepository } from '../db/repositories/sketch-repository'

export default function SketchCanvasPage() {
  const navigate = useNavigate()
  const params = useParams()
  const imageId = params.id ? Number(params.id) : null

  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const [locked, setLocked] = useState(false)
  const startedAtRef = useRef<string>(new Date().toISOString())
  const imgUrlRef = useRef<string | null>(null)

  useWakeLock(true)

  // 载入图片（退出画布时释放 objectURL）
  useEffect(() => {
    let disposed = false
    if (imageId === null || Number.isNaN(imageId)) {
      setMissing(true)
      return
    }
    sketchRepository.getImageUrl(imageId).then((res) => {
      if (disposed) {
        if (res) URL.revokeObjectURL(res.url)
        return
      }
      if (!res) {
        setMissing(true)
        return
      }
      imgUrlRef.current = res.url
      setImgUrl(res.url)
    })
    return () => {
      disposed = true
      if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current)
    }
  }, [imageId])

  // 退出：写会话记录后返回
  const exitCanvas = async () => {
    if (imageId !== null && !Number.isNaN(imageId)) {
      const started = new Date(startedAtRef.current)
      const duration = (Date.now() - started.getTime()) / 1000
      await sketchRepository.addSession(imageId, startedAtRef.current, duration)
    }
    navigate(-1)
  }

  // 统一接管 Android 返回键：锁定态不响应，非锁定态走统一退出（写会话记录）
  const exitRef = useRef<() => void>(() => {})
  exitRef.current = exitCanvas

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | null = null
    let disposed = false
    App.addListener('backButton', () => {
      if (locked) return // 锁定态：完全不响应
      exitRef.current()
    })
      .then((h) => {
        if (disposed) h.remove()
        else handle = h
      })
      .catch(() => {
        /* web 平台无 backButton 事件 */
      })
    return () => {
      disposed = true
      handle?.remove().catch(() => undefined)
    }
  }, [locked])

  if (missing) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg-base)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>图片不存在或已被删除</div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 20px', fontSize: 13, borderRadius: 'var(--radius-capsule)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)'
          }}
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#ffffff', overflow: 'hidden' }}>
      {imgUrl && <SketchGestureViewer src={imgUrl} />}

      {!locked && (
        <>
          {/* 左上角退出（半透明小图标） */}
          <button
            onClick={exitCanvas}
            aria-label="退出画布"
            style={{
              position: 'absolute', top: 18, left: 18, width: 40, height: 40,
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M11 4 L6 9 L11 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 右下角锁定（半透明小图标） */}
          <button
            onClick={() => setLocked(true)}
            aria-label="锁定画布"
            style={{
              position: 'absolute', bottom: 26, right: 22, width: 44, height: 44,
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <rect x="3.5" y="7.5" width="11" height="8" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8" />
              <path d="M6 7.5 v -2 a3 3 0 0 1 6 0 v 2" fill="none" stroke="#fff" strokeWidth="1.8" />
            </svg>
          </button>
        </>
      )}

      {locked && <SketchLockOverlay onUnlock={() => setLocked(false)} />}
    </div>
  )
}
