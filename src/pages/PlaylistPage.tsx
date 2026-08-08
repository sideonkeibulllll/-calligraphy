/**
 * 中文名：歌单管理页
 * 职责：歌单列表 + 新建歌单 + 快速练习入口
 * 依赖：胶囊按钮、歌单仓库
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CapsuleButton from '../components/CapsuleButton'
import { playlistRepository } from '../db/repositories/playlist-repository'
import type { PlaylistWithCount } from '../types'

export default function PlaylistPage() {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([])

  const load = async () => {
    setPlaylists(await playlistRepository.getAll())
  }

  useEffect(() => {
    load()
  }, [])

  const createPlaylist = async () => {
    const name = window.prompt('输入歌单名称')
    if (name && name.trim()) {
      await playlistRepository.create(name.trim())
      load()
    }
  }

  const deletePlaylist = async (id: number, name: string) => {
    if (window.confirm(`删除歌单「${name}」？`)) {
      await playlistRepository.delete(id)
      load()
    }
  }

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>歌单</h2>
        <CapsuleButton color="teal" size="sm" onClick={createPlaylist}>+ 新建</CapsuleButton>
      </div>

      {playlists.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          还没有歌单，点击右上角新建
        </div>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {playlists.map((p) => (
            <li
              key={p.id}
              style={{
                padding: 16, borderRadius: 'var(--radius-card)', background: 'var(--bg-surface)',
                border: '1px solid var(--border-soft)'
              }}
            >
              <div
                onClick={() => navigate(`/playlist/${p.id}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{p.item_count} 字</div>
                </div>
                <span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>›</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <CapsuleButton color="yellow" size="sm" onClick={() => navigate(`/playlist/${p.id}/practice?order=seq`)}>
                  顺序练习
                </CapsuleButton>
                <CapsuleButton color="pink" size="sm" onClick={() => navigate(`/playlist/${p.id}/practice?order=shuffle`)}>
                  乱序练习
                </CapsuleButton>
                <button
                  onClick={() => deletePlaylist(p.id, p.name)}
                  style={{
                    marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)',
                    padding: '0 8px'
                  }}
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
