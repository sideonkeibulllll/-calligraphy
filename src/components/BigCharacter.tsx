/**
 * 中文名：大字区
 * 职责：系统字体渲染大字（不指定 font-family，由系统自定义字体接管）+ 网格背景
 * 依赖：网格背景、设置状态
 */
import GridBackground from './GridBackground'
import { useSettingsStore } from '../store/settings-store'

interface BigCharacterProps {
  char: string
  size?: number
  showGrid?: boolean
}

export default function BigCharacter({ char, size = 260, showGrid = true }: BigCharacterProps) {
  const gridType = useSettingsStore((s) => s.gridType)
  return (
    <div style={{
      position: 'relative', width: size, height: size, margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--radius-card)', overflow: 'hidden'
    }}>
      {showGrid && <GridBackground type={gridType} size={size} />}
      <span style={{
        fontSize: size * 0.78, lineHeight: 1, color: 'var(--text-primary)',
        position: 'relative', zIndex: 1, userSelect: 'none'
      }}>
        {char}
      </span>
    </div>
  )
}
