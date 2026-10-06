import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Search, X } from 'lucide-react'
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
  UrlCodecTool: () => import('../tools/UrlCodecTool.jsx'),
  UuidTool: () => import('../tools/UuidTool.jsx'),
  JwtTool: () => import('../tools/JwtTool.jsx'),
  NumberBaseTool: () => import('../tools/NumberBaseTool.jsx'),
  QrCodeTool: () => import('../tools/QrCodeTool.jsx'),
}

/* 图标块：发丝描边 + 中性色，只有整卡悬浮时才出现强调色 */
function GlyphBox({ children }) {
  return (
    <span
      className="w-10 h-10 shrink-0 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center
                 text-slate-500 dark:text-slate-400 transition-colors
                 group-hover:border-primary-300 dark:group-hover:border-primary-800
                 group-hover:text-primary-700 dark:group-hover:text-primary-400"
    >
      {children}
    </span>
  )
}

/* 分类标签：整页只有「当前项」用到强调色 */
function chipClass(active) {
  return `px-3 py-1.5 rounded-md text-[13px] border transition-colors ${
    active
      ? 'bg-primary-600 border-primary-600 text-white font-medium'
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100'
  }`
}

export default function Tools() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTool, setActiveTool] = useState(null)
  const [ToolComponent, setToolComponent] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

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
    if (searchParams.get('tool')) {
      setSearchParams({}, { replace: true })
    }
  }

  // 支持 ?tool=<id> 深链：自动打开对应内置工具
  const toolParam = searchParams.get('tool')
  useEffect(() => {
    if (!toolParam) return
    const tool = toolsData.items.find((t) => t.id === toolParam)
    if (tool && tool.type === 'internal') {
      openTool(tool)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolParam])

  // 列表数量直接由数据推导，避免页头文案与数据脱节
  const internalCount = toolsData.items.filter((t) => t.type === 'internal').length
  const externalCount = toolsData.items.length - internalCount

  if (activeTool) {
    return (
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={closeTool}
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回工具列表
          </button>

          <Card hover={false} className="mt-4">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                <GlyphBox>
                  <Icon name={activeTool.icon} className="w-[18px] h-[18px]" />
                </GlyphBox>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {activeTool.name}
                  </h1>
                  <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                    {activeTool.description}
                  </p>
                </div>
              </div>
              <button
                onClick={closeTool}
                className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="关闭工具"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5">{ToolComponent && <ToolComponent />}</div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-10">
      {/* ── 页头 ── */}
      <header>
        <p className="label-mono">Tools</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          工具箱
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          {internalCount} 个内置工具都在浏览器本地运行，数据不上传；另有 {externalCount} 个外部工具在新标签页打开。
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="全部工具"
          subtitle="按分类筛选，或搜索工具名称与说明。"
          action={
            <span className="label-mono tnum">
              {filteredTools.length} / {toolsData.items.length}
            </span>
          }
        />

        {/* 搜索 + 分类 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索工具名称与说明"
              aria-label="搜索工具"
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-[13px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {toolsData.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={chipClass(activeCategory === cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 工具网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTools.map((tool, index) => {
            const cardContent = (
              <>
                {tool.type === 'external' && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    外部 <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <GlyphBox>
                    {tool.type === 'external' ? (
                      <Favicon
                        id={tool.id}
                        url={tool.url}
                        fallbackIcon={tool.icon}
                        className="w-5 h-5 rounded-sm"
                      />
                    ) : (
                      <Icon name={tool.icon} className="w-[18px] h-[18px]" />
                    )}
                  </GlyphBox>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-[15px] font-medium text-slate-900 dark:text-white pr-12">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    {toolsData.categories.find((c) => c.id === tool.category)?.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 group-hover:underline">
                    {tool.type === 'external' ? '访问' : '使用'}
                    <ArrowRight className="w-3.5 h-3.5" />
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
                    className="block h-full"
                  >
                    <Card className="p-4 h-full group relative cursor-pointer flex flex-col">
                      {cardContent}
                    </Card>
                  </a>
                ) : (
                  <Card onClick={() => openTool(tool)} className="p-4 h-full group relative cursor-pointer flex flex-col">
                    {cardContent}
                  </Card>
                )}
              </ScrollReveal>
            )
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              没有匹配的工具，换个关键词或分类试试。
            </p>
            <button
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
              }}
              className="mt-3 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
