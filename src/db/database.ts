/**
 * 中文名：数据库连接
 * 职责：统一封装 run/query 接口；安卓走 @capacitor-community/sqlite 原生，web 走 sql.js 调试
 * 依赖：数据表结构
 * 说明：web 端 sql.js 的 wasm 经 Vite `?url` 本地化加载，不再依赖 jsDelivr CDN
 */
import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite'
import { SCHEMA_STATEMENTS } from './schema'
// Vite 本地化加载 sql.js wasm，避免 web 调试依赖外网 CDN
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

export interface DbRow { [key: string]: unknown }

const sqlite = new SQLiteConnection(CapacitorSQLite)
let nativeDb: SQLiteDBConnection | null = null
let webDb: unknown = null
const WEB_STORAGE_KEY = 'calligraphy-sqlite'
let initialized = false

async function getNativeDb(): Promise<SQLiteDBConnection> {
  if (!nativeDb) {
    nativeDb = await sqlite.createConnection('calligraphy', false, 'no-encryption', 1, false)
    await nativeDb.open()
  }
  return nativeDb
}

async function getWebDb(): Promise<any> {
  if (!webDb) {
    const initSqlJs = (await import('sql.js')).default
    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl
    })
    const saved = localStorage.getItem(WEB_STORAGE_KEY)
    webDb = saved
      ? new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)))
      : new SQL.Database()
  }
  return webDb as any
}

function persistWeb(): void {
  if (webDb) {
    const data = (webDb as any).export() as Uint8Array
    let binary = ''
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i])
    localStorage.setItem(WEB_STORAGE_KEY, btoa(binary))
  }
}

export async function initDatabase(): Promise<void> {
  if (initialized) return
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDb()
    for (const stmt of SCHEMA_STATEMENTS) {
      await db.execute(stmt)
    }
  } else {
    const db = await getWebDb()
    for (const stmt of SCHEMA_STATEMENTS) {
      db.run(stmt)
    }
    persistWeb()
  }
  initialized = true
}

export async function run(sql: string, params: unknown[] = []): Promise<void> {
  if (!initialized) await initDatabase()
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDb()
    await db.run(sql, params as unknown[])
  } else {
    const db = await getWebDb()
    db.run(sql, params as unknown[])
    persistWeb()
  }
}

export async function query(sql: string, params: unknown[] = []): Promise<DbRow[]> {
  if (!initialized) await initDatabase()
  if (Capacitor.isNativePlatform()) {
    const db = await getNativeDb()
    const res = await db.query(sql, params as unknown[])
    return (res.values as DbRow[]) || []
  } else {
    const db = await getWebDb()
    const stmt = db.prepare(sql)
    stmt.bind(params as unknown[])
    const rows: DbRow[] = []
    while (stmt.step()) rows.push(stmt.getAsObject() as DbRow)
    stmt.free()
    return rows
  }
}
