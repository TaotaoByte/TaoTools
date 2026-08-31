import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, CornerDownLeft, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './Icon.jsx'

// 各内容类型的展示元数据
const typeMeta = {
  tool: { label: '工具', icon: 'Wrench', badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  resource: { label: '资源', icon: 'Globe', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  software: { label: '软件', icon: 'Download', badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
  knowledge: { label: '知识', icon: 'BookOpen', badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  ai: { label: 'AI', icon: 'Sparkles', badge: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
}

export function SearchModal({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState([])
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // 打开时：清空并懒加载索引
  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelected(0)
    let mounted = true
    import('../data/searchIndex.js').then((mod) => {
      if (mounted) setIndex(mod.default || [])
    })
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      mounted = false
    }
  }, [open])

  // 打开期间锁定页面滚动
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter((item) =>
        [item.title, item.description, item.category, ...(item.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 30)
  }, [index, query])

  useEffect(() => {
    setSelected(0)
  }, [results])

  // 选中的结果始终保持在可视区域内
  useEffect(() => {
    const el = listRef.current?.children[selected]
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const openItem = (item) => {
    if (item.external) {
      window.open(item.link, '_blank', 'noopener,noreferrer')
    } else {
      navigate(item.link)
    }
    onClose()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = results[selected]
      if (item) openItem(item)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -12 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto mt-[10vh] w-[92%] max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 输入区 */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4">
              <Search className="w-5 h-5 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="搜索工具、资源、软件、文章..."
                className="flex-1 bg-transparent text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700/50">
                ESC
              </kbd>
            </div>

            {/* 结果区 */}
            <div className="max-h-[55vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    输入关键词开始搜索，已收录 {index.length} 条工具、资源、软件与文章
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">没有找到匹配「{query}」的内容</p>
                </div>
              ) : (
                <ul ref={listRef} className="py-2">
                  {results.map((item, i) => {
                    const meta = typeMeta[item.type] || typeMeta.knowledge
                    const active = i === selected
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          onClick={() => openItem(item)}
                          onMouseEnter={() => setSelected(i)}
                          className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                            active ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                          }`}
                        >
                          <span className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <Icon name={item.icon} className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {item.title}
                              </span>
                              <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-md font-medium ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </span>
                            {item.description && (
                              <span className="block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {item.description}
                              </span>
                            )}
                          </span>
                          {item.external ? (
                            <ExternalLink className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600" />
                          ) : (
                            <ArrowRight className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* 底部提示 */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="w-3.5 h-3.5" /> 打开
              </span>
              <span>↑↓ 切换</span>
              <span>ESC 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}