import { useState } from 'react'
import { Icon } from './Icon.jsx'

export function Favicon({ id, url, fallbackIcon = 'Globe', className = '' }) {
  const [phase, setPhase] = useState('local') // 'local' | 'remote' | 'fallback'

  if (phase === 'fallback') {
    return <Icon name={fallbackIcon} className={className} />
  }

  if (phase === 'local' && id) {
    return (
      <img
        src={`/favicons/${id}.ico`}
        alt=""
        className={className}
        onError={() => setPhase('remote')}
        loading="lazy"
        decoding="async"
      />
    )
  }

  let domain = ''
  try {
    domain = new URL(url).hostname
  } catch {
    return <Icon name={fallbackIcon} className={className} />
  }

  const remoteUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`

  return (
    <img
      src={remoteUrl}
      alt=""
      className={className}
      onError={() => setPhase('fallback')}
      loading="lazy"
      decoding="async"
    />
  )
}
