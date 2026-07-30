import { Heart } from 'lucide-react'
import { cn, formatNumber } from '../utils/helpers.js'
import { useLikes } from '../hooks/useLikes.js'

export function LikeButton({ id, initialCount = 0, size = 'md', className = '' }) {
  const { count, liked, toggle } = useLikes(id, initialCount)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500',
        liked
          ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-500 dark:hover:text-rose-400',
        sizeClasses[size],
        className,
      )}
      aria-label={liked ? '取消点赞' : '点赞'}
      title={liked ? '取消点赞' : '点赞'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          liked && 'fill-current scale-110',
        )}
      />
      <span>{formatNumber(count)}</span>
    </button>
  )
}
