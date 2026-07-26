import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext.jsx'

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${className}`}
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-600" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400" />
      )}
    </button>
  )
}
