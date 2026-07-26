import * as LucideIcons from 'lucide-react'

export function Icon({ name, className = '' }) {
  const IconComponent = LucideIcons[name]
  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} />
  }
  return <IconComponent className={className} />
}
