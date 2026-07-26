import { useState, useMemo } from 'react'
import { Search, ExternalLink, X } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Icon } from '../components/Icon.jsx'
import { Favicon } from '../components/Favicon.jsx'
import toolsData from '../data/tools.json'

// 动态导入内置工具组件
const toolComponents = {
  TextDiff: () => import('../tools/TextDiff.jsx'),
  JsonTool: () => import('../tools/JsonTool.jsx'),
  Base64Tool: () => import('../tools/Base64Tool.jsx'),
  TimestampTool: () => import('../tools/TimestampTool.jsx'),
  RegexTool: () => import('../tools/RegexTool.jsx'),
  ColorTool: () => import('../tools/ColorTool.jsx'),
  PasswordTool: () => import('../tools/PasswordTool.jsx'),
  WordCountTool: () => import('../tools/WordCountTool.jsx'),
}

export default function Tools() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTool, setActiveTool] = useState(null)
  const [ToolComponent, setToolComponent] = useState(null)

  const filteredTools = useMemo(() => {
    return toolsData.items.filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const openTool = async (tool) => {
    if (tool.type === 'external') {
      window.open(tool.url, '_blank', 'noopener,noreferrer')
      return
    }
    const importFn = toolComponents[tool.component]
    if (importFn) {
      const module = await importFn()
      setToolComponent(() => module.default)
      setActiveTool(tool)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeTool = () => {
    setActiveTool(null)
    setToolComponent(null)
  }

  if (activeTool) {
    return (
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={closeTool}
            className="mb-6 inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            ← 返回工具列表
          </button>
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon name={activeTool.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeTool.name}</h1>
                  <p className="text-slate-600 dark:text-slate-400">{activeTool.description}</p>
                </div>
              </div>
              <button
                onClick={closeTool}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            {ToolComponent && <ToolComponent />}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SectionTitle
        title="工具箱"
        subtitle="内置实用小工具与精选外部工具，提升你的工作效率"
      />

      {/* 搜索框 */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工具..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {toolsData.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredTools.map((tool, index) => {
          const cardContent = (
            <>
              {tool.type === 'external' && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  外部工具 <ExternalLink className="w-3 h-3" />
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                  {tool.type === 'external' ? (
                    <Favicon id={tool.id} url={tool.url} fallbackIcon={tool.icon} className="w-7 h-7 rounded" />
                  ) : (
                    <Icon name={tool.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 pr-16">{tool.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{tool.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {toolsData.categories.find((c) => c.id === tool.category)?.name}
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                  {tool.type === 'external' ? '访问 →' : '使用 →'}
                </span>
              </div>
            </>
          )

          return (
            <ScrollReveal key={tool.id} delay={index * 0.05}>
              {tool.type === 'external' ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="p-5 h-full group relative cursor-pointer">
                    {cardContent}
                  </Card>
                </a>
              ) : (
                <Card onClick={() => openTool(tool)} className="p-5 h-full group relative cursor-pointer">
                  {cardContent}
                </Card>
              )}
            </ScrollReveal>
          )
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配的工具</p>
        </div>
      )}
    </div>
  )
}
