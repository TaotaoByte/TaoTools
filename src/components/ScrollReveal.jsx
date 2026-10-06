import { cn } from '../utils/helpers.js'

/**
 * 内容始终可见：不再用 IntersectionObserver 把内容先隐藏再淡入。
 * 只保留一次极短的淡入，延迟上限 0.2s，避免长时间留白。
 */
export function ScrollReveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const capped = Math.min(delay, 0.2)
  return (
    <Tag
      className={cn('animate-fade-in-up', className)}
      style={capped ? { animationDelay: `${capped}s` } : undefined}
    >
      {children}
    </Tag>
  )
}
