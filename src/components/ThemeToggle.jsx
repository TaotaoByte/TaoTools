import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'light' ? '切换到深色模式' : '切换到浅色模式'

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors ${className}`}
      aria-label={label}
      title={label}
    >
      {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
    </button>
  )
}
