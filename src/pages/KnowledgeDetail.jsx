import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { MarkdownRenderer } from '../components/MarkdownRenderer.jsx'
import { LikeButton } from '../components/LikeButton.jsx'
import knowledgeData from '../data/knowledge.json'

export default function KnowledgeDetail() {
  const { slug } = useParams()

  const article = useMemo(() => {
    return knowledgeData.items.find((item) => item.slug === slug)
  }, [slug])

  const toc = useMemo(() => {
    if (!article) return []
    const matches = article.content.match(/^##\s+(.+)$/gm) || []
    return matches.map((line) => line.replace(/^##\s+/, ''))
  }, [article])

  if (!article) {
    return (
      <div className="page-container text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          文章未找到
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          抱歉，你访问的文章不存在或已被移除。
        </p>
        <Link to="/knowledge" className="btn-primary">
          返回知识库
        </Link>
      </div>
    )
  }

  const categoryName = knowledgeData.categories.find((c) => c.id === article.category)?.name

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> 返回知识库
        </Link>

        {article.cover && (
          <ScrollReveal className="mb-8">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden">
              <img
                src={article.cover}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <Card hover={false} className="p-6 sm:p-10 mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                <Tag className="w-3.5 h-3.5" /> {categoryName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Calendar className="w-3.5 h-3.5" /> {article.date}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              {article.summary}
            </p>
            <div className="flex items-center gap-3">
              <LikeButton id={article.id} initialCount={article.likes ?? 0} />
            </div>
          </Card>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 目录 */}
          {toc.length > 0 && (
            <ScrollReveal className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                <Card hover={false} className="p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                    目录
                  </h3>
                  <ul className="space-y-2">
                    {toc.map((title) => {
                      const id = title.toLowerCase().replace(/\s+/g, '-')
                      return (
                        <li key={id}>
                          <button
                            onClick={() => {
                              const el = document.getElementById(id)
                              el?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="block text-left w-full text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {title}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              </div>
            </ScrollReveal>
          )}

          {/* 正文 */}
          <ScrollReveal
            className={`order-1 ${toc.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}
          >
            <Card hover={false} className="p-6 sm:p-10">
              <MarkdownRenderer content={article.content} />
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
