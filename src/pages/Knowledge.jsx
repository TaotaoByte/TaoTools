import { useState, useMemo } from 'react'
import { Search, Clock, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
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

  return (
    <div className="page-container">
      <SectionTitle
        title="知识库"
        subtitle="Markdown 语法、开发笔记、软件配置与效率技巧沉淀"
      />

      {/* 搜索框 */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章标题或摘要..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {knowledgeData.categories.map((cat) => (
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

      {/* 文章网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredArticles.map((item, index) => (
          <ScrollReveal key={item.id} delay={index * 0.05}>
            <Link to={`/knowledge/${item.slug}`}>
              <Card className="overflow-hidden h-full group flex flex-col">
                {item.cover && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium mb-3">
                    {knowledgeData.categories.find((c) => c.id === item.category)?.name}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {item.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {item.readTime}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400">没有找到匹配的文章</p>
        </div>
      )}
    </div>
  )
}
