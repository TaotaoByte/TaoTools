import { ScrollReveal } from './ScrollReveal.jsx'

export function SectionTitle({ title, subtitle, centered = false }) {
  return (
    <ScrollReveal className={`mb-10 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base sm:text-lg">
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  )
}
