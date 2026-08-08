/**
 * 中文名：底部导航栏
 * 职责：练习 / 历史 / 歌单 / 设置 四 Tab 切换
 * 依赖：无（react-router-dom）
 */
import { NavLink } from 'react-router-dom'

interface TabItem {
  to: string
  label: string
  path: string
}

const TABS: TabItem[] = [
  { to: '/', label: '练习', path: 'M4 19l5-5 4 4 7-7' },
  { to: '/history', label: '历史', path: 'M5 6h14M5 12h14M5 18h9' },
  { to: '/playlist', label: '歌单', path: 'M9 18V6l11-2v12' },
  { to: '/settings', label: '设置', path: 'M12 8a4 4 0 100 8 4 4 0 000-8z' }
]

export default function TabBar() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
      height: 'calc(var(--tab-height) + var(--safe-bottom))', paddingBottom: 'var(--safe-bottom)',
      background: 'var(--bg-surface)', borderTop: '1px solid var(--border-soft)',
      display: 'flex', zIndex: 20
    }}>
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? 'var(--neon-pink)' : 'var(--text-tertiary)'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.path} />
              </svg>
              <span style={{
                fontSize: 11, color: isActive ? 'var(--neon-pink)' : 'var(--text-tertiary)',
                fontWeight: isActive ? 700 : 400
              }}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
