import { ScrollReveal } from './ScrollReveal.jsx'

/**
 * 分区标题：等宽小标签 + 主标题 + 可选描述左对齐排版。
 * index 为可选的章节序号（如 "01"）。
 */
export function SectionTitle({ title, subtitle, index, action, className = '' }) {
  return (
    <ScrollReveal className={`mb-8 ${className}`}>
      <div className="flex items-end justify-between gap-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-3">
            {index && (
              <span className="font-mono text-sm font-normal text-primary-600 dark:text-primary-400">
                {index}
              </span>
            )}
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pb-0.5">{action}</div>}
      </div>
    </ScrollReveal>
  )
}
