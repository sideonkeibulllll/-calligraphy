/**
 * 中文名：设置页
 * 职责：网格类型切换、描红开关、字体说明、关于世界观
 * 依赖：设置状态
 */
import { useSettingsStore } from '../store/settings-store'
import type { GridType } from '../types'

const GRIDS: { key: GridType; label: string }[] = [
  { key: 'mi', label: '米字格' },
  { key: 'tian', label: '田字格' },
  { key: 'gong', label: '九宫格' }
]

function Row({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div style={{
      padding: 16, borderRadius: 'var(--radius-card)', background: 'var(--bg-surface)',
      border: '1px solid var(--border-soft)', marginBottom: 12
    }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, lineHeight: 1.6 }}>{desc}</div>}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}

export default function SettingsPage() {
  const gridType = useSettingsStore((s) => s.gridType)
  const setGridType = useSettingsStore((s) => s.setGridType)
  const tracingEnabled = useSettingsStore((s) => s.tracingEnabled)
  const setTracingEnabled = useSettingsStore((s) => s.setTracingEnabled)

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>设置</h2>

      <Row title="网格类型" desc="临摹大字背后的辅助格，默认米字格">
        <div style={{ display: 'flex', gap: 8 }}>
          {GRIDS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGridType(g.key)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 'var(--radius-capsule)', fontSize: 12, fontWeight: 600,
                border: gridType === g.key ? '1px solid var(--neon-pink)' : '1px solid var(--border-soft)',
                background: gridType === g.key ? 'var(--neon-pink-soft)' : 'var(--bg-elevated)',
                color: gridType === g.key ? 'var(--neon-pink)' : 'var(--text-secondary)'
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Row>

      <Row title="屏幕描红" desc="开启后可在屏幕大字上描红书写，默认关闭">
        <button
          onClick={() => setTracingEnabled(!tracingEnabled)}
          style={{
            width: 52, height: 30, borderRadius: 20, position: 'relative',
            background: tracingEnabled ? 'var(--neon-teal)' : 'var(--bg-input)',
            transition: 'background 0.2s'
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: tracingEnabled ? 25 : 3, width: 24, height: 24,
            borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
          }} />
        </button>
      </Row>

      <Row title="字体说明" desc="本应用走系统字体：请在手机主题商店更换书法字体，应用内不指定 font-family，系统字体会自动替换显示。变颜色、变大小均不影响替换。">
      </Row>

      <Row title="关于 · 暗夜多巴胺乐园" desc="乐园因数据熵增正褪色崩解。异乡人天镜通过归色（临摹汉字）让色彩回流。每一次勾选都是温柔的牺牲，每一次复习都成为新快乐的种子。快乐不排斥悲伤，无序即秩序。">
      </Row>

      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 11, marginTop: 8 }}>
        归色临摹 v0.1.0
      </div>
    </div>
  )
}
