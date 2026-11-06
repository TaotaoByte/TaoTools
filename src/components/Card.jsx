import { cn } from '../utils/helpers.js'

/**
 * 基础卡片。默认无投影、1px 发丝描边，悬浮只做描边加深。
 * 不再使用 hover 上浮 + 大阴影的组合。
 */
export function Card({ children, className = '', hover = true, onClick }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(event) }
      } : undefined}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700',
        hover && 'card-hover',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
