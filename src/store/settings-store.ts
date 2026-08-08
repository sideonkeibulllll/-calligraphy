/**
 * 中文名：设置状态
 * 职责：网格类型、描红开关等设置项，localStorage 持久化
 * 依赖：类型定义
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GridType } from '../types'

interface SettingsState {
  gridType: GridType
  tracingEnabled: boolean
  setGridType: (g: GridType) => void
  setTracingEnabled: (b: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gridType: 'mi',
      tracingEnabled: false,
      setGridType: (gridType) => set({ gridType }),
      setTracingEnabled: (tracingEnabled) => set({ tracingEnabled })
    }),
    { name: 'calligraphy-settings' }
  )
)

export default useSettingsStore
