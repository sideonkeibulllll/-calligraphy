/**
 * 中文名：复习状态
 * 职责：今日复习队列、当前索引、完成进度
 * 依赖：类型定义
 */
import { create } from 'zustand'
import type { Card } from '../types'

interface ReviewState {
  queue: Card[]
  currentIndex: number
  completedCount: number
  totalCount: number
  setQueue: (cards: Card[]) => void
  next: () => void
  prev: () => void
  setCurrent: (i: number) => void
  addCompleted: () => void
  reset: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  queue: [],
  currentIndex: 0,
  completedCount: 0,
  totalCount: 0,
  setQueue: (cards) =>
    set({ queue: cards, currentIndex: 0, completedCount: 0, totalCount: cards.length }),
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.queue.length - 1) })),
  prev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  setCurrent: (i) => set({ currentIndex: i }),
  addCompleted: () => set((s) => ({ completedCount: s.completedCount + 1 })),
  reset: () => set({ queue: [], currentIndex: 0, completedCount: 0, totalCount: 0 })
}))

export default useReviewStore
