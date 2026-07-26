import { useState } from 'react'
import { ExternalLink, Copy, Check, Clock, Calendar, Wand2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { copyToClipboard } from '../utils/helpers.js'
import aiModelsData from '../data/aiModels.json'
import aiTutorialsData from '../data/aiTutorials.json'
import aiTipsData from '../data/aiTips.json'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? '已复制' : '复制'}
    </button>
  )
}

export default function AI() {
  return (
    <div className="page-container space-y-20">
      {/* AI 大模型排名 */}
      <section>
        <SectionTitle
          title="AI 大模型排名"
          subtitle="主流大语言模型能力对比与免费额度参考"
        />
        <ScrollReveal>
          <Card hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">模型</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">厂商</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">上下文</th>
                    <th className="px-5 py-4 font-semibold min-w-[200px]">特点</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">免费额度</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">官网</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {aiModelsData.models.map((model) => (
                    <tr
                      key={model.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {model.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {model.company}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {model.context}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                        {model.features}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium">
                          {model.free}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <a
                          href={model.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          访问 <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </ScrollReveal>
      </section>

      {/* AI 教学 */}
      <section>
        <SectionTitle
          title="AI 教学"
          subtitle="系统学习 AI 使用技巧，从 Prompt 工程到实战应用"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {aiTutorialsData.items.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.08}>
              <Link to={`/ai/tutorials/${item.slug}`}>
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
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
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
      </section>

      {/* AI 实用技巧 */}
      <section>
        <SectionTitle
          title="AI 实用技巧"
          subtitle="即拿即用的 Prompt 模板，一键复制即可使用"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {aiTipsData.items.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05}>
              <Card hover={false} className="p-5 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {item.content}
                    </pre>
                  </div>
                  <div className="flex justify-end">
                    <CopyButton text={item.content} />
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
