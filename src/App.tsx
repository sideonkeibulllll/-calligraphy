/**
 * 中文名：应用根组件
 * 职责：路由表 + Tab 显隐控制 + 整体布局壳
 * 依赖：底部导航栏、练习主页、临摹练习页、历史记录页、字符详情页、歌单管理页、歌单详情页、设置页、画摹主页、画摹图片管理器、画摹画布页
 */
import { Routes, Route, useLocation } from 'react-router-dom'
import TabBar from './components/TabBar'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import HistoryPage from './pages/HistoryPage'
import DetailPage from './pages/DetailPage'
import PlaylistPage from './pages/PlaylistPage'
import PlaylistDetailPage from './pages/PlaylistDetailPage'
import SettingsPage from './pages/SettingsPage'
import SketchHubPage from './pages/SketchHubPage'
import SketchGalleryPage from './pages/SketchGalleryPage'
import SketchCanvasPage from './pages/SketchCanvasPage'

const TAB_ROUTES = ['/', '/history', '/playlist', '/settings']

export default function App() {
  const location = useLocation()
  const showTab = TAB_ROUTES.includes(location.pathname)

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <main style={{ flex: 1, paddingBottom: showTab ? 'calc(var(--tab-height) + var(--safe-bottom))' : 0 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/playlist" element={<PlaylistPage />} />
          <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/review" element={<PracticePage />} />
          <Route path="/playlist/:id/practice" element={<PracticePage />} />
          <Route path="/detail/:char" element={<DetailPage />} />
          <Route path="/sketch" element={<SketchHubPage />} />
          <Route path="/sketch/gallery" element={<SketchGalleryPage />} />
          <Route path="/sketch/canvas/:id" element={<SketchCanvasPage />} />
        </Routes>
      </main>
      {showTab && <TabBar />}
    </div>
  )
}
