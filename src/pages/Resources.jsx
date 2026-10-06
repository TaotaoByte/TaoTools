import { useState, useMemo } from 'react'
import { ArrowUpRight, Heart, Search } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Favicon } from '../components/Favicon.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import resourcesData from '../data/resources.json'

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

export default function Resources() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [favorites, setFavorites] = useLocalStorage('taotools-favorites', [])

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const filteredResources = useMemo(() => {
    return resourcesData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="page-container space-y-10">
      {/* ── 页头 ── */}
      <header>
        <p className="label-mono">Resources</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          资源库
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          {resourcesData.items.length} 个设计模板、素材、图标字体与学习站点；收藏只记在浏览器本地，不需要登录。
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="全部资源"
          subtitle="搜索范围包含名称、说明与标签，点角标可以把资源收进收藏。"
          action={
            <span className="label-mono tnum">
              {filteredResources.length} / {resourcesData.items.length}
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
              placeholder="搜索名称、说明与标签"
              aria-label="搜索资源"
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-[13px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {resourcesData.categories.map((cat) => (
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

        {/* 资源网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResources.map((item, index) => {
            const isFavorite = favorites.includes(item.id)
            return (
              <ScrollReveal key={item.id} delay={index * 0.05}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full group"
                >
                  <Card className="p-4 h-full flex flex-col relative cursor-pointer">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      className="absolute top-3.5 right-3.5 p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
                      aria-label={isFavorite ? '取消收藏' : '收藏'}
                      aria-pressed={isFavorite}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFavorite
                            ? 'fill-primary-600 text-primary-600 dark:fill-primary-400 dark:text-primary-400'
                            : ''
                        }`}
                      />
                    </button>

                    <div className="flex items-start gap-3">
                      <GlyphBox>
                        <Favicon
                          id={item.id}
                          url={item.url}
                          fallbackIcon={item.icon}
                          className="w-5 h-5 rounded-sm"
                        />
                      </GlyphBox>
                      <div className="flex-1 min-w-0 pr-10 pt-0.5">
                        <h3 className="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {resourcesData.categories.find((c) => c.id === item.category)?.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 group-hover:underline">
                        访问
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </a>
              </ScrollReveal>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              没有匹配的资源，换个关键词或分类试试。
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
