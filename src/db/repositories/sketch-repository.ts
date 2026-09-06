/**
 * 中文名：画摹仓库
 * 职责：画摹图片/文件夹/临摹会话的 CRUD，含导入图片生成缩略图、删除连带清理、历史聚合
 * 依赖：画摹图库、类型定义、日期工具
 */
import { runTx, reqOnce, STORE_IMAGES, STORE_FOLDERS, STORE_SESSIONS } from '../sketch-db'
import type {
  SketchFolder,
  SketchImage,
  SketchSession,
  SketchImageWithThumb,
  SketchSessionWithImage
} from '../../types'
import { nowIso } from '../../utils/date'

interface ImageRecord extends SketchImage {
  blob: Blob
  thumb: Blob
}

function thumbUrl(thumb: Blob): string {
  return URL.createObjectURL(thumb)
}

function toWithThumb(rec: ImageRecord): SketchImageWithThumb {
  return {
    id: rec.id,
    name: rec.name,
    folder_id: rec.folder_id,
    created_at: rec.created_at,
    updated_at: rec.updated_at,
    thumbUrl: thumbUrl(rec.thumb)
  }
}

async function makeThumb(file: Blob, max = 320): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * ratio))
  const h = Math.max(1, Math.round(bitmap.height * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 不可用')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('缩略图生成失败'))), 'image/jpeg', 0.85)
  })
}

function fileNameOf(file: File): string {
  const idx = file.name.lastIndexOf('.')
  return idx > 0 ? file.name.slice(0, idx) : file.name
}

export const sketchRepository = {
  // ===== 文件夹 =====

  async listFolders(): Promise<SketchFolder[]> {
    const rows = await reqOnce<IDBValidKey[]>(STORE_FOLDERS, 'readonly', (s) => s.getAllKeys())
    const all: SketchFolder[] = []
    for (const key of rows) {
      const rec = await reqOnce<SketchFolder | undefined>(STORE_FOLDERS, 'readonly', (s) => s.get(key as number))
      if (rec) all.push(rec)
    }
    return all.sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  async createFolder(name: string): Promise<SketchFolder> {
    const folder: SketchFolder = { id: 0, name, created_at: nowIso() }
    // 剥离 id:0，交给 autoIncrement 生成主键（显式 0 会顶死自增键，导致后续 add 全部 ConstraintError）
    const { id: _id, ...toAdd } = folder
    const key = await reqOnce<IDBValidKey>(STORE_FOLDERS, 'readwrite', (s) => s.add(toAdd))
    folder.id = key as number
    return folder
  },

  async renameFolder(id: number, name: string): Promise<void> {
    await runTx(STORE_FOLDERS, 'readwrite', (tx) => {
      const store = tx.objectStore(STORE_FOLDERS)
      const req = store.get(id)
      req.onsuccess = () => {
        const rec = req.result as SketchFolder | undefined
        if (rec) store.put({ ...rec, name })
      }
    })
  },

  /** 删除文件夹：内部图片一并删除（含其会话），返回被删除的图片 id 列表 */
  async deleteFolder(id: number): Promise<number[]> {
    const images = (await reqOnce<ImageRecord[]>(STORE_IMAGES, 'readonly', (s) => s.getAll())) as ImageRecord[]
    const victims = images.filter((i) => i.folder_id === id).map((i) => i.id)
    await runTx([STORE_IMAGES, STORE_SESSIONS, STORE_FOLDERS], 'readwrite', (tx) => {
      const imgStore = tx.objectStore(STORE_IMAGES)
      const sesStore = tx.objectStore(STORE_SESSIONS)
      for (const vid of victims) {
        imgStore.delete(vid)
        const idx = sesStore.index('image_id')
        const req = idx.openCursor(IDBKeyRange.only(vid))
        req.onsuccess = () => {
          const cursor = req.result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
        }
      }
      tx.objectStore(STORE_FOLDERS).delete(id)
    })
    return victims
  },

  // ===== 图片 =====

  async addImageFromFile(file: File, folderId: number | null): Promise<SketchImage> {
    const thumb = await makeThumb(file)
    const rec: ImageRecord = {
      id: 0,
      name: fileNameOf(file),
      folder_id: folderId,
      created_at: nowIso(),
      updated_at: nowIso(),
      blob: file,
      thumb
    }
    // 剥离 id:0，交给 autoIncrement 生成主键（显式 0 会顶死自增键，导致后续 add 全部 ConstraintError）
    const { id: _id, ...toAdd } = rec
    const key = await reqOnce<IDBValidKey>(STORE_IMAGES, 'readwrite', (s) => s.add(toAdd))
    const { blob: _blob, thumb: _thumb, ...meta } = { ...rec, id: key as number }
    return meta
  },

  async listImages(folderId: number | null): Promise<SketchImageWithThumb[]> {
    const rows = (await reqOnce<ImageRecord[]>(STORE_IMAGES, 'readonly', (s) => s.getAll())) as ImageRecord[]
    return rows
      .filter((r) => r.folder_id === folderId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(toWithThumb)
  },

  /** 各文件夹的图片数量统计（不含根目录） */
  async countByFolder(): Promise<Map<number, number>> {
    const rows = (await reqOnce<ImageRecord[]>(STORE_IMAGES, 'readonly', (s) => s.getAll())) as ImageRecord[]
    const map = new Map<number, number>()
    for (const r of rows) {
      if (r.folder_id !== null) map.set(r.folder_id, (map.get(r.folder_id) ?? 0) + 1)
    }
    return map
  },

  /** 取原图 objectURL（画布用），找不到返回 null */
  async getImageUrl(id: number): Promise<{ url: string; name: string } | null> {
    const rec = await reqOnce<ImageRecord | undefined>(STORE_IMAGES, 'readonly', (s) => s.get(id))
    if (!rec) return null
    return { url: URL.createObjectURL(rec.blob), name: rec.name }
  },

  async renameImage(id: number, name: string): Promise<void> {
    await runTx(STORE_IMAGES, 'readwrite', (tx) => {
      const store = tx.objectStore(STORE_IMAGES)
      const req = store.get(id)
      req.onsuccess = () => {
        const rec = req.result as ImageRecord | undefined
        if (rec) store.put({ ...rec, name })
      }
    })
  },

  async moveImage(id: number, folderId: number | null): Promise<void> {
    await runTx(STORE_IMAGES, 'readwrite', (tx) => {
      const store = tx.objectStore(STORE_IMAGES)
      const req = store.get(id)
      req.onsuccess = () => {
        const rec = req.result as ImageRecord | undefined
        if (rec) store.put({ ...rec, folder_id: folderId })
      }
    })
  },

  /** 删除图片与其全部会话 */
  async deleteImage(id: number): Promise<void> {
    await runTx([STORE_IMAGES, STORE_SESSIONS], 'readwrite', (tx) => {
      tx.objectStore(STORE_IMAGES).delete(id)
      const idx = tx.objectStore(STORE_SESSIONS).index('image_id')
      const req = idx.openCursor(IDBKeyRange.only(id))
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
    })
  },

  // ===== 会话 =====

  /** 记录一次临摹会话并刷新图片最近更新时间 */
  async addSession(imageId: number, startedAt: string, durationSec: number): Promise<void> {
    const session: SketchSession = {
      id: 0,
      image_id: imageId,
      started_at: startedAt,
      duration: Math.max(0, Math.round(durationSec))
    }
    await runTx([STORE_SESSIONS, STORE_IMAGES], 'readwrite', (tx) => {
      // 剥离 id:0，交给 autoIncrement 生成主键（显式 0 会顶死自增键，导致后续 add 全部 ConstraintError）
      const { id: _sesId, ...sesToAdd } = session
      tx.objectStore(STORE_SESSIONS).add(sesToAdd)
      const store = tx.objectStore(STORE_IMAGES)
      const req = store.get(imageId)
      req.onsuccess = () => {
        const rec = req.result as ImageRecord | undefined
        if (rec) store.put({ ...rec, updated_at: nowIso() })
      }
    })
  },

  /** 主页临摹历史：每张图取最近一次会话，按会话时间倒序 */
  async listRecentSessions(limit = 20): Promise<SketchSessionWithImage[]> {
    const images = (await reqOnce<ImageRecord[]>(STORE_IMAGES, 'readonly', (s) => s.getAll())) as ImageRecord[]
    const sessions = (await reqOnce<SketchSession[]>(STORE_SESSIONS, 'readonly', (s) => s.getAll())) as SketchSession[]
    const latestByImage = new Map<number, SketchSession>()
    for (const s of sessions) {
      const cur = latestByImage.get(s.image_id)
      if (!cur || s.started_at > cur.started_at) latestByImage.set(s.image_id, s)
    }
    const result: SketchSessionWithImage[] = []
    for (const img of images) {
      const session = latestByImage.get(img.id)
      if (session) result.push({ image: toWithThumb(img), session })
    }
    result.sort((a, b) => b.session.started_at.localeCompare(a.session.started_at))
    return result.slice(0, limit)
  }
}

export default sketchRepository
