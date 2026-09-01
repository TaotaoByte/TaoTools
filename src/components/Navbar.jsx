import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, Heart } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle.jsx'
import { SearchModal } from './SearchModal.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/tools', label: '工具箱' },
  { path: '/resources', label: '资源库' },
  { path: '/software', label: '软件推荐' },
  { path: '/ai', label: 'AI 中心' },
  { path: '/chat', label: 'AI 对话' },
  { path: '/knowledge', label: '知识库' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  // Cmd/Ctrl + K 快捷唤起搜索
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass">
      <nav className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/favicon.svg" alt="TaoTools" className="w-9 h-auto group-hover:opacity-90 transition-opacity" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">TaoTools</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">一站式工具导航与知识分享平台</p>
            </div>
          </Link>

          {/* 桌面导航 */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="搜索"
              title="搜索 (Ctrl+K)"
            >
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <Link
              to="/favorites"
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="我的收藏"
              title="我的收藏"
            >
              <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="切换菜单"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass border-t border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto section-padding py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
