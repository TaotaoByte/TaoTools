import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar.jsx'
import { Footer } from './components/Footer.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'

// 路由懒加载
const Home = lazy(() => import('./pages/Home.jsx'))
const Tools = lazy(() => import('./pages/Tools.jsx'))
const Resources = lazy(() => import('./pages/Resources.jsx'))
const Software = lazy(() => import('./pages/Software.jsx'))
const AI = lazy(() => import('./pages/AI.jsx'))
const AITutorialDetail = lazy(() => import('./pages/AITutorialDetail.jsx'))
const Knowledge = lazy(() => import('./pages/Knowledge.jsx'))
const KnowledgeDetail = lazy(() => import('./pages/KnowledgeDetail.jsx'))
const AIChat = lazy(() => import('./pages/AIChat.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/software" element={<PageWrapper><Software /></PageWrapper>} />
        <Route path="/ai" element={<PageWrapper><AI /></PageWrapper>} />
        <Route path="/ai/tutorials/:slug" element={<PageWrapper><AITutorialDetail /></PageWrapper>} />
        <Route path="/knowledge" element={<PageWrapper><Knowledge /></PageWrapper>} />
        <Route path="/knowledge/:slug" element={<PageWrapper><KnowledgeDetail /></PageWrapper>} />
        <Route path="/favorites" element={<PageWrapper><Favorites /></PageWrapper>} />
        <Route path="/chat" element={<PageWrapper><AIChat /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoadingScreen />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-18">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 animate-pulse" />
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
