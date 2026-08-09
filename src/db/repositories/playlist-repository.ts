/**
 * 中文名：歌单仓库
 * 职责：歌单与歌单项的 CRUD，含输入一行字自动拆分
 * 依赖：数据库连接、类型定义、日期工具
 */
import { run, query, type DbRow } from '../database'
import type { Playlist, PlaylistItem, PlaylistWithCount } from '../../types'
import { nowIso } from '../../utils/date'

function mapPlaylist(row: DbRow): Playlist {
  return {
    id: row.id as number,
    name: row.name as string,
    created_at: row.created_at as string
  }
}

function mapItem(row: DbRow): PlaylistItem {
  return {
    id: row.id as number,
    playlist_id: row.playlist_id as number,
    character: row.character as string,
    position: row.position as number,
    added_at: row.added_at as string
  }
}

function splitChars(text: string): string[] {
  // 保留输入顺序与重复字（如"一生一世"拆为 4 字），仅过滤空白
  return Array.from(text).filter((ch) => ch.trim())
}

export const playlistRepository = {
  async create(name: string): Promise<Playlist> {
    await run('INSERT INTO playlists (name, created_at) VALUES (?, ?)', [name, nowIso()])
    const rows = await query('SELECT * FROM playlists WHERE id = last_insert_rowid()')
    return mapPlaylist(rows[0])
  },

  async getAll(): Promise<PlaylistWithCount[]> {
    const rows = await query(
      `SELECT p.*, (SELECT COUNT(*) FROM playlist_items i WHERE i.playlist_id = p.id) as item_count
       FROM playlists p ORDER BY p.created_at DESC`
    )
    return rows.map((r) => ({ ...mapPlaylist(r), item_count: Number(r.item_count) }))
  },

  async delete(id: number): Promise<void> {
    await run('DELETE FROM playlist_items WHERE playlist_id = ?', [id])
    await run('DELETE FROM playlists WHERE id = ?', [id])
  },

  async getItems(id: number): Promise<PlaylistItem[]> {
    const rows = await query(
      'SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY position ASC',
      [id]
    )
    return rows.map(mapItem)
  },

  async addItem(playlistId: number, character: string): Promise<void> {
    const rows = await query(
      'SELECT COUNT(*) as cnt FROM playlist_items WHERE playlist_id = ?',
      [playlistId]
    )
    const pos = Number((rows[0]?.cnt as number) ?? 0)
    await run(
      'INSERT INTO playlist_items (playlist_id, character, position, added_at) VALUES (?, ?, ?, ?)',
      [playlistId, character, pos, nowIso()]
    )
  },

  async addCharsByString(playlistId: number, text: string): Promise<number> {
    // 不去重：重复字也逐个加入歌单（各有独立 position）
    const chars = splitChars(text)
    for (const ch of chars) {
      await this.addItem(playlistId, ch)
    }
    return chars.length
  },

  async removeItem(itemId: number): Promise<void> {
    await run('DELETE FROM playlist_items WHERE id = ?', [itemId])
  }
}

export default playlistRepository
