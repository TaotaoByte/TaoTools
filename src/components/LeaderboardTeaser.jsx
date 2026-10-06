import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Card } from './Card.jsx'
import { SectionTitle } from './SectionTitle.jsx'
import { LeaderboardTable } from './LeaderboardTable.jsx'
import leaderboardsData from '../data/leaderboards.json'

function relativeDay(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const days = Math.floor((Date.now() - t) / 86_400_000)
  if (days <= 0) return '今天'
  if (days === 1) return '昨天'
  return `${days} 天前`
}

/**
 * 首页的榜单速览。数据来自 scripts/fetch-leaderboards.mjs 自动抓取的结果。
 */
export function LeaderboardTeaser() {
  const boards = leaderboardsData?.boards || []
  const board = boards.find((b) => b.id === 'lmarena-overall') || boards[0]
  if (!board) return null

  return (
    <section>
      <SectionTitle
        index="02"
        title="AI 模型榜单"
        subtitle="数据每周自动从 LMArena、Artificial Analysis、SWE-bench 等权威榜单同步，不需要手工维护。"
        action={
          <Link
            to="/ai"
            className="inline-flex items-center gap-1 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
          >
            全部榜单 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <Card hover={false} className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <div>
            <h3 className="text-[15px] font-medium text-slate-900 dark:text-white">{board.name}</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              {board.publisher}
              {board.updatedAt ? ` · ${board.updatedAt}` : ''}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" />
            同步于 {relativeDay(leaderboardsData.generatedAt) || '最近'}
          </span>
        </div>

        <LeaderboardTable board={board} limit={5} dense />

        <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          共 {boards.length} 个榜单 · 数据源 {leaderboardsData.sources?.filter((s) => s.ok).length ?? 0}/
          {leaderboardsData.sources?.length ?? 0} 正常
        </p>
      </Card>
    </section>
  )
}
