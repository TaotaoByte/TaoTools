import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MarkdownRenderer } from '../components/MarkdownRenderer.jsx'
import { LikeButton } from '../components/LikeButton.jsx'
import { ShareButton } from '../components/ShareButton.jsx'
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
      <div className="page-container">
        <div className="max-w-3xl mx-auto py-16 text-center">
          <p className="label-mono">Not Found</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            文章未找到
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            这篇笔记可能已被移除，或者链接有误。
          </p>
          <Link to="/knowledge" className="btn-primary mt-6">
            返回知识库
          </Link>
        </div>
      </div>
    )
  }

  const categoryName = knowledgeData.categories.find((c) => c.id === article.category)?.name
  const meta = [
    categoryName,
    article.date,
    `阅读约 ${article.readTime}`,
    ...(article.tags ?? []),
  ].filter(Boolean)

  return (
    <div className="page-container">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回知识库
        </Link>

        {/* 标题块：等宽元信息行 + 发丝分隔线，不用卡片包起来 */}
        <header className="mt-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <p className="label-mono">{meta.join(' · ')}</p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-3xl">
              {article.summary}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <LikeButton id={article.id} initialCount={article.likes ?? 0} />
            <ShareButton title={article.title} />
          </div>
        </header>

        {article.cover && (
          <div className="mt-8 aspect-[21/9] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img src={article.cover} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className={`mt-10 grid grid-cols-1 gap-8 lg:gap-12 ${
            toc.length > 0 ? 'lg:grid-cols-[13rem_minmax(0,1fr)]' : ''
          }`}
        >
          {/* 目录：左侧发丝竖线，不用卡片 */}
          {toc.length > 0 && (
            <nav aria-label="文章目录" className="order-2 lg:order-1">
              <div className="lg:sticky lg:top-20">
                <p className="label-mono">目录</p>
                <ul className="mt-4 border-l border-slate-200 dark:border-slate-800">
                  {toc.map((title) => {
                    const id = title.toLowerCase().replace(/\s+/g, '-')
                    return (
                      <li key={id}>
                        <button
                          onClick={() => {
                            const el = document.getElementById(id)
                            el?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="block w-full text-left pl-3.5 py-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                          {title}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </nav>
          )}

          {/* 正文 */}
          <div className="order-1 lg:order-2 min-w-0 max-w-3xl">
            <MarkdownRenderer content={article.content} />
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/knowledge"
                className="inline-flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 返回知识库
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
