import { useState, useMemo } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { Favicon } from '../components/Favicon.jsx'
import softwareData from '../data/software.json'

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

export default function Software() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredSoftware = useMemo(() => {
    return softwareData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="page-container space-y-10">
      {/* ── 页头 ── */}
      <header>
        <p className="label-mono">Software</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          软件推荐
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          {softwareData.items.length} 款开发、办公、设计与系统软件的官网入口，标注支持平台与价格方式。
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="全部软件"
          subtitle="按分类筛选，或搜索软件名称与说明；链接都指向官网。"
          action={
            <span className="label-mono tnum">
              {filteredSoftware.length} / {softwareData.items.length}
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
              placeholder="搜索软件名称与说明"
              aria-label="搜索软件"
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-[13px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {softwareData.categories.map((cat) => (
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

        {/* 软件网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSoftware.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full group"
              >
                <Card className="p-4 h-full flex flex-col relative cursor-pointer">
                  <div className="flex items-start gap-3">
                    <GlyphBox>
                      <Favicon
                        id={item.id}
                        url={item.url}
                        fallbackIcon={item.icon}
                        className="w-5 h-5 rounded-sm"
                      />
                    </GlyphBox>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      >
                        {platform}
                      </span>
                    ))}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded border ${
                        item.price.includes('免费') || item.price.includes('开源')
                          ? 'border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
                          : 'border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {softwareData.categories.find((c) => c.id === item.category)?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 group-hover:underline">
                      官网
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {filteredSoftware.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              没有匹配的软件，换个关键词或分类试试。
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
