import { useMemo, useState } from 'react'
import { ExternalLink, Copy, Check, Calendar, Clock, RefreshCw, CircleCheck, CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { ScrollReveal } from '../components/ScrollReveal.jsx'
import { LeaderboardTable, BoardMeta } from '../components/LeaderboardTable.jsx'
import { copyToClipboard } from '../utils/helpers.js'
import { LikeButton } from '../components/LikeButton.jsx'
import leaderboardsData from '../data/leaderboards.json'
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                 border border-slate-200 dark:border-slate-700
                 text-slate-600 dark:text-slate-300
                 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white
                 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? '已复制' : '复制'}
    </button>
  )
}

function formatStamp(iso) {
  if (!iso) return '未知'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '未知'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function daysSince(iso) {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86_400_000)
}

/* ── 榜单区块 ── */
function Boards() {
  const boards = leaderboardsData?.boards || []
  const [activeId, setActiveId] = useState(boards[0]?.id)
  const active = useMemo(
    () => boards.find((b) => b.id === activeId) || boards[0],
    [boards, activeId],
  )

  if (!boards.length) {
    return (
      <Card hover={false} className="p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          榜单数据尚未生成。在项目目录执行 <code className="font-mono">npm run update:leaderboards</code> 即可抓取。
        </p>
      </Card>
    )
  }

  const age = daysSince(leaderboardsData.generatedAt)
  const fresh = age !== null && age <= 14

  return (
    <div>
      {/* 同步状态 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          数据抓取于 <span className="font-mono text-slate-700 dark:text-slate-300">{formatStamp(leaderboardsData.generatedAt)}</span>
          {age !== null && <span className={fresh ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
            （{age === 0 ? '今天' : `${age} 天前`}）
          </span>}
        </span>
        <span>共 {boards.length} 个榜单</span>
      </div>

      {/* 榜单切换 */}
      <div className="flex flex-wrap gap-x-1 gap-y-1 border-b border-slate-200 dark:border-slate-800 mb-5">
        {boards.map((b) => {
          const on = b.id === active?.id
          return (
            <button
              key={b.id}
              onClick={() => setActiveId(b.id)}
              className={`relative px-3 py-2 text-[13px] rounded-t-md transition-colors ${
                on
                  ? 'text-slate-900 dark:text-white font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {b.name}
              {b.stale && <span className="ml-1 text-amber-600 dark:text-amber-400">*</span>}
              {on && (
                <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          )
        })}
      </div>

      {active && (
        <Card hover={false} className="p-5">
          <LeaderboardTable board={active} limit={10} />
          <BoardMeta board={active} />
        </Card>
      )}
    </div>
  )
}

/* ── 数据源状态 ── */
function SourceStatus() {
  const sources = leaderboardsData?.sources || []
  if (!sources.length) return null
  return (
    <Card hover={false} className="p-5">
      <h3 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">自动同步的数据源</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        由 GitHub Actions 每周一自动抓取并提交；任一源失败会保留上一次的缓存，不会让页面变空。
      </p>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {sources.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-4 py-2.5">
            <span className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              {s.ok ? (
                <CircleCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <CircleAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              {s.label}
            </span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500 text-right">
              {s.ok ? `${s.boards?.length ?? 0} 个榜 · ${(s.ms / 1000).toFixed(1)}s` : s.error}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function AI() {
  return (
    <div className="page-container space-y-12">
      <header>
        <p className="label-mono">Leaderboards</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          AI 大模型榜单
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
          汇总 LMArena、Artificial Analysis、SWE-bench、LiveBench 等公开榜单，每周自动同步一次。
          每个榜都标注了出处、榜单日期与评分口径，分数请结合口径理解，不要只看名次。
        </p>
      </header>

      <section>
        <SectionTitle index="01" title="排行榜" subtitle="切换标签查看不同维度的榜单。" />
        <Boards />
      </section>

      <section>
        <SourceStatus />
      </section>

      {/* AI 教学 */}
      <section>
        <SectionTitle index="02" title="AI 教程" subtitle="从 Prompt 写法到本地部署，都是实际用过的内容。" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiTutorialsData.items.map((item) => (
            <ScrollReveal key={item.id}>
              <Link to={`/ai/tutorials/${item.slug}`} className="group block h-full">
                <Card className="overflow-hidden h-full flex flex-col">
                  {item.cover && (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <img
                        src={item.cover}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-[15px] font-medium leading-snug text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                      {item.summary}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {item.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.readTime}
                        </span>
                      </div>
                      <LikeButton id={item.id} initialCount={item.likes ?? 0} size="sm" />
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
        <SectionTitle index="03" title="Prompt 模板" subtitle="即拿即用，点一下就能复制。" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {aiTipsData.items.map((item) => (
            <ScrollReveal key={item.id}>
              <Card hover={false} className="p-5 h-full flex flex-col">
                <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col">
                  <pre className="flex-1 max-h-40 overflow-y-auto rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {item.content}
                  </pre>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text={item.content} />
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section>
        <Card hover={false} className="p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            榜单说明与数据口径不理解的，可以看{' '}
            <Link to="/knowledge" className="text-primary-700 dark:text-primary-400 hover:underline">
              技术笔记
            </Link>
            ；需要直接用模型对话，去{' '}
            <Link to="/chat" className="text-primary-700 dark:text-primary-400 hover:underline">
              AI 对话
            </Link>
            （自带 API Key）。
          </p>
          <a
            href="https://github.com/TaotaoByte/TaoTools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            抓取脚本源码 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Card>
      </section>
    </div>
  )
}
