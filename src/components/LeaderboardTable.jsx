import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

function extraOf(row) {
  if (row.priceIn != null) return `$${row.priceIn} / $${row.priceOut}`
  if (row.votes != null) return `${row.votes.toLocaleString('zh-CN')} 票`
  if (row.note) return row.note
  return ''
}

function extraLabel(rows) {
  const r = rows.find((x) => x.priceIn != null) || rows.find((x) => x.votes != null)
  if (!r) return ''
  return r.priceIn != null ? '价格 $/百万 token' : '投票数'
}

/**
 * 榜单表格。数据来源见 board.publisher / board.url。
 */
export function LeaderboardTable({ board, limit, dense = false }) {
  const [expanded, setExpanded] = useState(false)
  const rows = board.ranked || []
  const shown = limit && !expanded ? rows.slice(0, limit) : rows
  const extra = extraLabel(rows)
  const pad = dense ? 'py-2' : 'py-2.5'

  if (!rows.length) {
    return (
      <p className="py-6 text-sm text-slate-500 dark:text-slate-400">
        该榜单暂时没有数据，等待下一次自动同步。
      </p>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className={`${pad} pr-3 w-10 label-mono font-normal`}>#</th>
              <th className={`${pad} pr-4 label-mono font-normal`}>模型</th>
              <th className={`${pad} pr-4 label-mono font-normal hidden sm:table-cell`}>厂商</th>
              <th className={`${pad} pr-4 label-mono font-normal text-right`}>{board.metric}</th>
              {extra && (
                <th className={`${pad} label-mono font-normal text-right hidden md:table-cell`}>
                  {extra}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                key={`${row.rank}-${row.slug || row.model}`}
                className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td
                  className={`${pad} pr-3 font-mono text-xs tnum ${
                    row.rank <= 3
                      ? 'text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {row.rank}
                </td>
                <td className={`${pad} pr-4 font-medium text-slate-900 dark:text-white`}>
                  {row.model}
                  <span className="sm:hidden block text-xs font-normal text-slate-500 dark:text-slate-400">
                    {row.vendor}
                  </span>
                </td>
                <td className={`${pad} pr-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell`}>
                  {row.vendor || '—'}
                </td>
                <td className={`${pad} pr-4 text-right font-mono tnum text-slate-900 dark:text-slate-100`}>
                  {row.score}
                </td>
                {extra && (
                  <td
                    className={`${pad} text-right font-mono tnum text-xs text-slate-400 dark:text-slate-500 hidden md:table-cell`}
                  >
                    {extraOf(row) || '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {limit && rows.length > limit && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-[13px] text-primary-700 dark:text-primary-400 hover:underline"
        >
          {expanded ? '收起' : `展开全部 ${rows.length} 名`}
        </button>
      )}
    </div>
  )
}

/** 榜单出处与更新时间——每个榜都必须显示，避免"数据不知道哪来的" */
export function BoardMeta({ board }) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      <span>
        来源：
        <a
          href={board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 inline-flex items-center gap-0.5"
        >
          {board.publisher}
          <ExternalLink className="w-3 h-3" />
        </a>
      </span>
      {board.updatedAt && (
        <span className="font-mono">榜单日期 {board.updatedAt}</span>
      )}
      {board.license && <span className="font-mono">{board.license}</span>}
      {board.stale && (
        <span className="text-amber-700 dark:text-amber-400">本次同步失败，显示的是上一次缓存</span>
      )}
      {board.metricHint && (
        <span className="basis-full text-slate-400 dark:text-slate-500 leading-relaxed">
          {board.metricHint}
        </span>
      )}
    </div>
  )
}
