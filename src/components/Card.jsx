import { cn } from '../utils/helpers.js'

export function Card({ children, className = '', hover = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700',
        'shadow-sm dark:shadow-none',
        hover && 'card-hover cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
