/**
 * 中文名：画摹图片管理器
 * 职责：根目录+自建文件夹的图片卡片管理——单击进画布、长按弹菜单（重命名/删除/移动）、底部移动选择器、新建文件夹
 * 依赖：画摹图片卡片、画摹文件夹卡片、画摹长按菜单、画摹移动选择器、胶囊按钮、画摹仓库
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SketchImageCard from '../components/SketchImageCard'
import SketchFolderCard from '../components/SketchFolderCard'
import SketchCardMenu from '../components/SketchCardMenu'
import SketchMoveSheet from '../components/SketchMoveSheet'
import CapsuleButton from '../components/CapsuleButton'
import { sketchRepository } from '../db/repositories/sketch-repository'
import type { SketchFolder, SketchImageWithThumb } from '../types'

type MenuTarget =
  | { kind: 'image'; id: number; name: string; x: number; y: number }
  | { kind: 'folder'; id: number; name: string; x: number; y: number }

function shortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`
}

const dialogInput: React.CSSProperties = {
  flex: 1, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
  background: 'var(--bg-input)', border: '1px solid var(--border-soft)',
  borderRadius: 'var(--radius-capsule)', outline: 'none'
}

export default function SketchGalleryPage() {
  const navigate = useNavigate()
  const [folders, setFolders] = useState<SketchFolder[]>([])
  const [folderCounts, setFolderCounts] = useState<Map<number, number>>(new Map())
  const [images, setImages] = useState<SketchImageWithThumb[]>([])
  const [folderId, setFolderId] = useState<number | null>(null)
  const [menu, setMenu] = useState<MenuTarget | null>(null)
  const [rename, setRename] = useState<{ kind: 'image' | 'folder'; id: number; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDel, setConfirmDel] = useState<{ kind: 'image' | 'folder'; id: number; name: string } | null>(null)
  const [moveImageId, setMoveImageId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const urlsRef = useRef<string[]>([])

  const load = useCallback(async (fid: number | null) => {
    const allFolders = await sketchRepository.listFolders()
    setFolders(allFolders)
    setFolderCounts(await sketchRepository.countByFolder())
    const list = await sketchRepository.listImages(fid)
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = list.map((i) => i.thumbUrl)
    setImages(list)
  }, [])

  useEffect(() => {
    load(folderId)
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = []
    }
  }, [folderId, load])

  const folderName = folderId === null ? '根目录' : folders.find((f) => f.id === folderId)?.name ?? ''

  // ===== 长按菜单动作 =====

  const openRename = () => {
    if (!menu) return
    setRename({ kind: menu.kind, id: menu.id, name: menu.name })
    setRenameValue(menu.name)
    setMenu(null)
  }

  const openMove = () => {
    if (!menu) return
    setMoveImageId(menu.id)
    setMenu(null)
  }

  const openDelete = () => {
    if (!menu) return
    setConfirmDel({ kind: menu.kind, id: menu.id, name: menu.name })
    setMenu(null)
  }

  const submitRename = async () => {
    if (!rename) return
    const name = renameValue.trim()
    if (!name) return
    if (rename.kind === 'image') await sketchRepository.renameImage(rename.id, name)
    else await sketchRepository.renameFolder(rename.id, name)
    setRename(null)
    load(folderId)
  }

  const submitDelete = async () => {
    if (!confirmDel) return
    if (confirmDel.kind === 'image') {
      await sketchRepository.deleteImage(confirmDel.id)
    } else {
      // 删除非空文件夹：连带内部图片与其全部会话
      await sketchRepository.deleteFolder(confirmDel.id)
    }
    setConfirmDel(null)
    load(folderId)
  }

  const submitMove = async (target: number | null) => {
    if (moveImageId === null) return
    await sketchRepository.moveImage(moveImageId, target)
    setMoveImageId(null)
    load(folderId)
  }

  const submitNewFolder = async () => {
    const name = newName.trim()
    if (!name) return
    await sketchRepository.createFolder(name)
    setNewName('')
    setCreating(false)
    load(folderId)
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '0 4px' }}>
        <button
          onClick={() => (folderId === null ? navigate('/sketch') : setFolderId(null))}
          style={{ fontSize: 20, color: 'var(--text-secondary)', padding: 4, background: 'transparent', border: 'none' }}
        >
          ‹
        </button>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>图片管理 · {folderName}</div>
      </div>

      {folderId === null && (
        <div style={{ marginBottom: 16 }}>
          {creating ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="新文件夹名"
                style={dialogInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNewFolder()
                }}
              />
              <CapsuleButton color="teal" size="sm" onClick={submitNewFolder}>创建</CapsuleButton>
              <CapsuleButton color="ghost" size="sm" onClick={() => setCreating(false)}>取消</CapsuleButton>
            </div>
          ) : (
            <CapsuleButton color="ghost" size="sm" onClick={() => setCreating(true)}>＋ 新建文件夹</CapsuleButton>
          )}
        </div>
      )}

      {folderId === null && folders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {folders.map((f) => (
            <SketchFolderCard
              key={f.id}
              name={f.name}
              count={folderCounts.get(f.id) ?? 0}
              onClick={() => setFolderId(f.id)}
              onLongPress={(x, y) => setMenu({ kind: 'folder', id: f.id, name: f.name, x, y })}
            />
          ))}
        </div>
      )}

      {images.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '28px 0' }}>
          {folderId === null ? '根目录还没有图片，去画摹主页导入吧' : '此文件夹还没有图片'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {images.map((img) => (
            <SketchImageCard
              key={img.id}
              name={img.name}
              thumbUrl={img.thumbUrl}
              date={shortDate(img.updated_at)}
              onClick={() => navigate(`/sketch/canvas/${img.id}`)}
              onLongPress={(x, y) => setMenu({ kind: 'image', id: img.id, name: img.name, x, y })}
            />
          ))}
        </div>
      )}

      {menu && (
        <SketchCardMenu
          x={menu.x}
          y={menu.y}
          isFolder={menu.kind === 'folder'}
          onRename={openRename}
          onMove={openMove}
          onDelete={openDelete}
          onClose={() => setMenu(null)}
        />
      )}

      {rename && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-teal)', borderRadius: 'var(--radius-card)', padding: 20, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>重命名</div>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              style={dialogInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename()
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <CapsuleButton color="ghost" size="sm" onClick={() => setRename(null)}>取消</CapsuleButton>
              <CapsuleButton color="teal" size="sm" onClick={submitRename}>确定</CapsuleButton>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-pink)', borderRadius: 'var(--radius-card)', padding: 20, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              删除「{confirmDel.name}」？
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {confirmDel.kind === 'image'
                ? '该图片及其全部临摹历史将被彻底删除，不可恢复。'
                : '该文件夹内的全部图片及其临摹历史将被一并彻底删除，不可恢复。'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <CapsuleButton color="ghost" size="sm" onClick={() => setConfirmDel(null)}>取消</CapsuleButton>
              <CapsuleButton color="pink" size="sm" onClick={submitDelete}>删除</CapsuleButton>
            </div>
          </div>
        </div>
      )}

      {moveImageId !== null && (
        <SketchMoveSheet
          folders={folders}
          onPick={submitMove}
          onNewFolder={async (name) => {
            await sketchRepository.createFolder(name)
            const all = await sketchRepository.listFolders()
            setFolders(all)
          }}
          onClose={() => setMoveImageId(null)}
        />
      )}
    </div>
  )
}
