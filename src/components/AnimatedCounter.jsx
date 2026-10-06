import { useEffect, useRef, useState } from 'react'

/**
 * 数字滚动组件。
 *
 * 旧实现依赖 framer-motion 的 useInView：只有当观察器恰好判定「进入视口」时
 * 才会启动动画。实测存在竞态 —— 首页数据行里 target 不变化的两个计数器
 * （内置工具 / 教程与笔记）会永远停在 0。这里改成纯 useEffect 实现：
 *
 *  1. 挂载即从 0 滚到目标值，不再依赖观察器；
 *  2. target 变化时（例如访客数、点赞数从接口/本地存储读到真实值）会从当前
 *     显示值继续滚到新值，不再像以前那样停在旧数字上；
 *  3. 用户开启「减少动态效果」时直接显示最终值。
 */
export function AnimatedCounter({ target, suffix = '', duration = 900, className = '' }) {
  const to = Number(target) || 0
  const [count, setCount] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || duration <= 0) {
      fromRef.current = to
      setCount(to)
      return
    }

    const from = fromRef.current
    if (from === to) {
      setCount(to)
      return
    }

    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      if (p < 1) {
        setCount(Math.round(from + (to - from) * eased))
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
        setCount(to)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])

  return (
    <span className={className}>
      {count.toLocaleString('zh-CN')}
      {suffix}
    </span>
  )
}
