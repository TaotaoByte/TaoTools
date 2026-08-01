import { useState, useEffect, useMemo } from 'react'
import { useTotalLikes } from './useLikes.js'
import toolsData from '../data/tools.json'
import aiTutorialsData from '../data/aiTutorials.json'
import knowledgeData from '../data/knowledge.json'
import statsData from '../data/stats.json'

const VISITOR_STORAGE_KEY = 'taotools-visitor-count'
const VISITOR_API_URL = 'https://api.counterapi.dev/v1/taotools/visitors/up'

function getBaseLikeCounts() {
  const counts = {}
  const addBase = (items) => {
    items.forEach((item) => {
      counts[item.id] = item.likes ?? 0
    })
  }
  addBase(toolsData.items)
  addBase(aiTutorialsData.items)
  addBase(knowledgeData.items)
  return counts
}

export function useStats() {
  const [visitorCount, setVisitorCount] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = window.localStorage.getItem(VISITOR_STORAGE_KEY)
    return saved ? Number(saved) : statsData.items.find((s) => s.id === 'visitors')?.value || 0
  })

  const baseLikeCounts = useMemo(() => getBaseLikeCounts(), [])
  const liveLikes = useTotalLikes(baseLikeCounts)

  useEffect(() => {
    let mounted = true
    fetch(VISITOR_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (mounted && typeof data.count === 'number') {
          setVisitorCount(data.count)
          try {
            window.localStorage.setItem(VISITOR_STORAGE_KEY, String(data.count))
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // 网络失败时使用本地缓存或默认值，静默处理
      })
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    return statsData.items.map((item) => {
      switch (item.id) {
        case 'tools':
          return { ...item, value: toolsData.items.length }
        case 'chapters':
          return { ...item, value: aiTutorialsData.items.length + knowledgeData.items.length }
        case 'visitors':
          return { ...item, value: visitorCount }
        case 'likes':
          return { ...item, value: liveLikes }
        default:
          return item
      }
    })
  }, [visitorCount, liveLikes])

  return stats
}
