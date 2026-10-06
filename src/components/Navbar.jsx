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
  { path: '/software', label: '软件' },
  { path: '/games', label: '小游戏' },
  { path: '/ai', label: 'AI 榜单' },
  { path: '/chat', label: 'AI 对话' },
  { path: '/knowledge', label: '笔记' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

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

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass">
        <nav className="max-w-6xl mx-auto section-padding">
          <div className="flex items-center justify-between h-14">
            {/* 站点标识 */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.svg" alt="" className="w-7 h-7" />
              <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                TaoTools
              </span>
            </Link>

            {/* 桌面导航：文字 + 下划线，不用填充胶囊 */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-2.5 py-1.5 text-[13px] rounded-md transition-colors ${
                      active
                        ? 'text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute left-2.5 right-2.5 -bottom-[7px] h-[2px] bg-primary-600 dark:bg-primary-400" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* 操作区 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="搜索"
                title="搜索"
              >
                <Search className="w-4 h-4" />
                <span className="text-[13px]">搜索</span>
                <kbd className="font-mono text-[10px] px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
                aria-label="搜索"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
              <Link
                to="/favorites"
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
                aria-label="我的收藏"
                title="我的收藏"
              >
                <Heart className="w-[18px] h-[18px]" />
              </Link>
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
                aria-label="切换菜单"
              >
                {isOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
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
              transition={{ duration: 0.18 }}
              className="lg:hidden bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="max-w-6xl mx-auto section-padding py-2">
                {navLinks.map((link) => {
                  const active = isActive(link.path)
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${
                        active
                          ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
