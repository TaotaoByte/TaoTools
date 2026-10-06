import { Heart } from 'lucide-react'
import { cn, formatNumber } from '../utils/helpers.js'
import { useLikes } from '../hooks/useLikes.js'

export function LikeButton({ id, initialCount = 0, size = 'md', className = '' }) {
  const { count, liked, toggle } = useLikes(id, initialCount)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-[13px] gap-1.5',
    lg: 'px-3 py-2 text-sm gap-2',
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
        'inline-flex items-center rounded-md font-medium tnum transition-colors duration-150',
        'border',
        liked
          ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-800 hover:text-primary-700 dark:hover:text-primary-400',
        sizeClasses[size],
        className,
      )}
      aria-label={liked ? '取消点赞' : '点赞'}
      title={liked ? '取消点赞' : '点赞'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          liked && 'fill-current',
        )}
      />
      <span>{formatNumber(count)}</span>
    </button>
  )
}
