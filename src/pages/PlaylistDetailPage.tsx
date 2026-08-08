/**
 * 中文名：歌单详情页
 * 职责：歌单内加字（含一行字自动拆分）/删字 + 顺序/乱序练习入口
 * 依赖：胶囊按钮、字符输入框、歌单仓库
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CapsuleButton from '../components/CapsuleButton'
import CharacterInput from '../components/CharacterInput'
import { playlistRepository } from '../db/repositories/playlist-repository'
import type { PlaylistItem, PlaylistWithCount } from '../types'

export default function PlaylistDetailPage() {
  const { id } = useParams()
  const playlistId = Number(id)
  const navigate = useNavigate()
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [playlist, setPlaylist] = useState<PlaylistWithCount | null>(null)

  const load = async () => {
    const [its, all] = await Promise.all([
      playlistRepository.getItems(playlistId),
      playlistRepository.getAll()
    ])
    setItems(its)
    setPlaylist(all.find((p) => p.id === playlistId) ?? null)
  }

  useEffect(() => {
    load()
  }, [playlistId])

  const handleAdd = async (text: string) => {
    await playlistRepository.addCharsByString(playlistId, text)
    load()
  }

  const removeItem = async (itemId: number) => {
    await playlistRepository.removeItem(itemId)
    load()
  }

  return (
    <div style={{ padding: '16px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => navigate('/playlist')} style={{ fontSize: 20, color: 'var(--text-secondary)' }}>‹</button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{playlist?.name ?? '歌单'}</div>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>加字（输入单字或一段话，自动拆分逐字加入）</div>
        <CharacterInput onSubmit={handleAdd} />
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <CapsuleButton color="yellow" size="sm" block onClick={() => navigate(`/playlist/${playlistId}/practice?order=seq`)}>
            顺序练习
          </CapsuleButton>
          <CapsuleButton color="pink" size="sm" block onClick={() => navigate(`/playlist/${playlistId}/practice?order=shuffle`)}>
            乱序练习
          </CapsuleButton>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          歌单空空，输入字加入吧
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 10
        }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)', fontSize: 28
              }}
            >
              {it.character}
              <button
                onClick={() => removeItem(it.id)}
                style={{
                  position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--neon-pink)', color: '#1a1714', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
