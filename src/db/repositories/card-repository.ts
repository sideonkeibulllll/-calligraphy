/**
 * 中文名：字卡仓库
 * 职责：字卡（SM-2 状态）的 CRUD 与查询
 * 依赖：数据库连接、类型定义、日期工具
 */
import { run, query, type DbRow } from '../database'
import type { Card } from '../../types'
import { today } from '../../utils/date'

function mapCard(row: DbRow): Card {
  return {
    id: row.id as number,
    character: row.character as string,
    ease: row.ease as number,
    interval: row.interval as number,
    repetitions: row.repetitions as number,
    due_date: row.due_date as string,
    priority: Boolean(row.priority),
    starred: Boolean(row.starred),
    created_at: row.created_at as string
  }
}

export const cardRepository = {
  async findByChar(character: string): Promise<Card | null> {
    const rows = await query('SELECT * FROM cards WHERE character = ? LIMIT 1', [character])
    return rows.length ? mapCard(rows[0]) : null
  },

  async save(card: Omit<Card, 'id'> & { id?: number }): Promise<void> {
    await run(
      `INSERT INTO cards (character, ease, interval, repetitions, due_date, priority, starred, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(character) DO UPDATE SET
         ease = excluded.ease, interval = excluded.interval,
         repetitions = excluded.repetitions, due_date = excluded.due_date,
         priority = excluded.priority, starred = excluded.starred`,
      [
        card.character, card.ease, card.interval, card.repetitions, card.due_date,
        card.priority ? 1 : 0, card.starred ? 1 : 0, card.created_at
      ]
    )
  },

  async getDue(date: string = today()): Promise<Card[]> {
    const rows = await query(
      'SELECT * FROM cards WHERE due_date <= ? ORDER BY priority DESC, due_date ASC, created_at ASC',
      [date]
    )
    return rows.map(mapCard)
  },

  async getDueCount(date: string = today()): Promise<number> {
    const rows = await query('SELECT COUNT(*) as cnt FROM cards WHERE due_date <= ?', [date])
    return Number((rows[0]?.cnt as number) ?? 0)
  },

  async getAll(): Promise<Card[]> {
    const rows = await query('SELECT * FROM cards ORDER BY created_at DESC')
    return rows.map(mapCard)
  },

  async getStarred(): Promise<Card[]> {
    const rows = await query('SELECT * FROM cards WHERE starred = 1 ORDER BY created_at DESC')
    return rows.map(mapCard)
  },

  async toggleStar(id: number): Promise<void> {
    await run('UPDATE cards SET starred = 1 - starred WHERE id = ?', [id])
  },

  async searchByChar(keyword: string): Promise<Card[]> {
    const rows = await query(
      'SELECT * FROM cards WHERE character LIKE ? ORDER BY created_at DESC',
      [`%${keyword}%`]
    )
    return rows.map(mapCard)
  }
}

export default cardRepository
