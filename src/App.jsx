import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { Navbar } from './components/Navbar.jsx'
import { Footer } from './components/Footer.jsx'

// 路由懒加载
const Home = lazy(() => import('./pages/Home.jsx'))
const Tools = lazy(() => import('./pages/Tools.jsx'))
const Resources = lazy(() => import('./pages/Resources.jsx'))
const Software = lazy(() => import('./pages/Software.jsx'))
const AI = lazy(() => import('./pages/AI.jsx'))
const AITutorialDetail = lazy(() => import('./pages/AITutorialDetail.jsx'))
const Games = lazy(() => import('./pages/Games.jsx'))
const Knowledge = lazy(() => import('./pages/Knowledge.jsx'))
const KnowledgeDetail = lazy(() => import('./pages/KnowledgeDetail.jsx'))
const AIChat = lazy(() => import('./pages/AIChat.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/software" element={<Software />} />
      <Route path="/games" element={<Games />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/ai/tutorials/:slug" element={<AITutorialDetail />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/knowledge/:slug" element={<KnowledgeDetail />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/chat" element={<AIChat />} />
      {/* 兜底：没有 path="*" 时，不存在的地址会渲染成空白页 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-14">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <span className="label-mono">加载中…</span>
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
