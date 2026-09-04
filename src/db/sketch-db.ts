/**
 * 中文名：画摹图库
 * 职责：画摹模块专用 IndexedDB 连接与事务封装（sketch-images / sketch-folders / sketch-sessions 三仓）
 * 依赖：无
 */

const DB_NAME = 'sketch-db'
const DB_VERSION = 1

export const STORE_IMAGES = 'sketch-images'
export const STORE_FOLDERS = 'sketch-folders'
export const STORE_SESSIONS = 'sketch-sessions'

let dbPromise: Promise<IDBDatabase> | null = null

export function openSketchDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessions = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id', autoIncrement: true })
        sessions.createIndex('image_id', 'image_id')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      dbPromise = null
      reject(req.error)
    }
  })
  return dbPromise
}

/**
 * 在单个事务中执行同步操作序列，事务完成后 resolve。
 * fn 必须同步发起点内所有请求（IndexedDB 事务在微任务边界自动提交）。
 */
export function runTx<T>(
  stores: string | string[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => T
): Promise<T> {
  return openSketchDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(typeof stores === 'string' ? [stores] : stores, mode)
        let result: T | undefined
        tx.oncomplete = () => resolve(result as T)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
        try {
          result = fn(tx)
        } catch (err) {
          tx.abort()
          reject(err)
        }
      })
  )
}

/** 单请求快捷事务：返回请求结果 */
export function reqOnce<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openSketchDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode)
        const req = fn(tx.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
  )
}
