import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { LikeButton } from '../components/LikeButton.jsx'
import knowledgeData from '../data/knowledge.json'

export default function Knowledge() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredArticles = useMemo(() => {
    return knowledgeData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const categoryName = (id) => knowledgeData.categories.find((c) => c.id === id)?.name

  return (
    <div className="page-container space-y-12">
      <header>
        <p className="label-mono">Knowledge Base</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          技术笔记
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          共 <span className="tnum">{knowledgeData.items.length}</span> 篇笔记，内容为 Markdown 语法、开发流程、软件安装配置与效率技巧。
        </p>
      </header>

      <section>
        <SectionTitle
          index="01"
          title="全部笔记"
          subtitle="按分类筛选，或直接搜索标题与摘要。"
          action={<span className="label-mono tnum">{filteredArticles.length} 篇</span>}
        />

        {/* 搜索框 */}
        <div className="relative max-w-md mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索标题或摘要"
            aria-label="搜索笔记"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary-600 dark:focus:border-primary-500 transition-colors"
          />
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {knowledgeData.categories.map((cat) => {
            const active = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-md text-[13px] border transition-colors ${
                  active
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* 文章网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((item) => (
            <ScrollReveal key={item.id}>
              <Link to={`/knowledge/${item.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden flex flex-col">
                  {item.cover && (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <img
                        src={item.cover}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="label-mono">{categoryName(item.category)}</p>
                    <h3 className="mt-2 text-[15px] font-medium leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">
                      {item.summary}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="label-mono tnum">
                        {item.date} · {item.readTime}
                      </span>
                      <LikeButton id={item.id} initialCount={item.likes ?? 0} size="sm" />
                    </div>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 py-16 text-center">
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              没有匹配的笔记。换一个关键词，或把分类切回「全部」。
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
