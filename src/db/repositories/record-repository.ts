/**
 * 中文名：练习记录仓库
 * 职责：每次临摹/复习记录的写入与查询
 * 依赖：数据库连接、类型定义、日期工具
 */
import { run, query, type DbRow } from '../database'
import type { PracticeRecord, Evaluation, PracticeSource } from '../../types'
import { nowIso, today } from '../../utils/date'

function mapRecord(row: DbRow): PracticeRecord {
  return {
    id: row.id as number,
    card_id: (row.card_id as number | null) ?? null,
    character: row.character as string,
    evaluation: row.evaluation as Evaluation,
    is_new: Boolean(row.is_new),
    source: row.source as PracticeSource,
    practiced_at: row.practiced_at as string
  }
}

export const recordRepository = {
  async save(record: Omit<PracticeRecord, 'id' | 'practiced_at'>): Promise<void> {
    await run(
      `INSERT INTO records (card_id, character, evaluation, is_new, source, practiced_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        record.card_id, record.character, record.evaluation,
        record.is_new ? 1 : 0, record.source, nowIso()
      ]
    )
  },

  async findByChar(character: string): Promise<PracticeRecord[]> {
    const rows = await query(
      'SELECT * FROM records WHERE character = ? ORDER BY practiced_at DESC',
      [character]
    )
    return rows.map(mapRecord)
  },

  async getTodayCompleted(date: string = today()): Promise<number> {
    const rows = await query(
      `SELECT COUNT(*) as cnt FROM records
       WHERE DATE(practiced_at) = ? AND evaluation IN ('good','mid')`,
      [date]
    )
    return Number((rows[0]?.cnt as number) ?? 0)
  },

  async getTodayTotal(date: string = today()): Promise<number> {
    const rows = await query(
      `SELECT COUNT(*) as cnt FROM records WHERE DATE(practiced_at) = ?`,
      [date]
    )
    return Number((rows[0]?.cnt as number) ?? 0)
  },

  async getRecent(limit: number = 50): Promise<PracticeRecord[]> {
    const rows = await query('SELECT * FROM records ORDER BY practiced_at DESC LIMIT ?', [limit])
    return rows.map(mapRecord)
  }
}

export default recordRepository
