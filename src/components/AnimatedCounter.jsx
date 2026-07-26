import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function AnimatedCounter({ target, suffix = '', duration = 1500, className = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // 使用 easeOutQuart 缓动
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString('zh-CN')}
      {suffix}
    </span>
  )
}
