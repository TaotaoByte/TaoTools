import { useEffect, useRef, useState } from 'react'
import { Share2, Link2, Check, Send } from 'lucide-react'
import { copyToClipboard } from '../utils/helpers.js'

export function ShareButton({ title, className = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const copyLink = async () => {
    try {
      await copyToClipboard(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const shareToWeibo = () => {
    const weibo = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    window.open(weibo, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // 用户取消分享时忽略
      }
      setOpen(false)
    }
  }

  const itemClass =
    'w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors'

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        aria-label="分享"
      >
        <Share2 className="w-4 h-4" />
        分享
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-44 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          <button className={itemClass} onClick={copyLink}>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Link2 className="w-4 h-4 text-slate-400" />
            )}
            {copied ? '已复制链接' : '复制链接'}
          </button>
          <button className={itemClass} onClick={shareToWeibo}>
            <Send className="w-4 h-4 text-slate-400" />
            分享到微博
          </button>
          {canNativeShare && (
            <button className={itemClass} onClick={nativeShare}>
              <Share2 className="w-4 h-4 text-slate-400" />
              系统分享
            </button>
          )}
        </div>
      )}
    </div>
  )
}