import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'taotools-likes'

function readLikes() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLikes(likes) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(likes))
  } catch {
    // ignore
  }
}

export function useLikes(id, initialCount = 0) {
  const [likes, setLikes] = useState(() => readLikes())

  useEffect(() => {
    setLikes(readLikes())
  }, [id])

  const record = likes[id] || { count: initialCount, liked: false }
  const count = record.count
  const liked = record.liked

  const toggle = useCallback(() => {
    setLikes((prev) => {
      const current = prev[id] || { count: initialCount, liked: false }
      const next = {
        ...prev,
        [id]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      }
      writeLikes(next)
      return next
    })
  }, [id, initialCount])

  return { count, liked, toggle }
}

export function useTotalLikes(defaultCounts = {}) {
  const [likes, setLikes] = useState(() => readLikes())

  useEffect(() => {
    setLikes(readLikes())
  }, [])

  const total = useMemo(() => {
    let sum = 0
    Object.keys(defaultCounts).forEach((id) => {
      const saved = likes[id]
      sum += saved ? saved.count : defaultCounts[id]
    })
    return sum
  }, [likes, defaultCounts])

  return total
}
