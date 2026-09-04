/**
 * 中文名：画摹移动选择器
 * 职责：底部弹出的文件夹单选选择器（列表含根目录与全部文件夹，最下方可新建文件夹）
 * 依赖：画摹文件夹卡片所用的类型定义
 */
import { useState } from 'react'
import type { SketchFolder } from '../types'

interface SketchMoveSheetProps {
  folders: SketchFolder[]
  onPick: (folderId: number | null) => void
  onNewFolder: (name: string) => void
  onClose: () => void
}

const rowStyle: React.CSSProperties = {
  padding: '13px 18px', fontSize: 13, color: 'var(--text-primary)',
  background: 'transparent', border: 'none', textAlign: 'left', width: '100%'
}

export default function SketchMoveSheet({ folders, onPick, onNewFolder, onClose }: SketchMoveSheetProps) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const createFolder = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onNewFolder(trimmed)
    setName('')
    setCreating(false)
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 70 }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-teal)',
        borderRadius: 'var(--radius-card) var(--radius-card) 0 0', padding: '14px 16px calc(18px + var(--safe-bottom))'
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>移动到…（单选即生效）</div>
        <div style={{ maxHeight: '42vh', overflowY: 'auto' }}>
          <button style={rowStyle} onClick={() => onPick(null)}>根目录</button>
          {folders.map((f) => (
            <button key={f.id} style={rowStyle} onClick={() => onPick(f.id)}>
              {f.name}
            </button>
          ))}
        </div>
        {creating ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="新文件夹名"
              style={{
                flex: 1, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
                background: 'var(--bg-input)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-capsule)', outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFolder()
              }}
            />
            <button
              onClick={createFolder}
              style={{
                padding: '10px 18px', fontSize: 12, fontWeight: 700,
                background: 'var(--neon-teal)', color: '#1a1714', border: 'none',
                borderRadius: 'var(--radius-capsule)'
              }}
            >
              创建
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              ...rowStyle, marginTop: 6, color: 'var(--neon-teal)',
              borderTop: '1px solid var(--border-soft)', borderRadius: 0
            }}
          >
            ＋ 新建文件夹
          </button>
        )}
      </div>
    </>
  )
}
