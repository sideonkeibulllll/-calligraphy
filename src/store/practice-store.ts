/**
 * 中文名：临摹状态
 * 职责：临摹队列（输入字拆分）、当前索引、来源（临摹/复习/歌单）
 * 依赖：类型定义
 */
import { create } from 'zustand'
import type { PracticeSource } from '../types'

interface PracticeState {
  chars: string[]
  currentIndex: number
  source: PracticeSource
  playlistId: number | null
  setChars: (chars: string[], source: PracticeSource, playlistId?: number | null) => void
  next: () => void
  prev: () => void
  setCurrent: (i: number) => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>((set) => ({
  chars: [],
  currentIndex: 0,
  source: 'practice',
  playlistId: null,
  setChars: (chars, source, playlistId = null) =>
    set({ chars, currentIndex: 0, source, playlistId }),
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.chars.length - 1) })),
  prev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  setCurrent: (i) => set({ currentIndex: i }),
  reset: () => set({ chars: [], currentIndex: 0, source: 'practice', playlistId: null })
}))

export default usePracticeStore
