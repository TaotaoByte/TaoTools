import { useState, useEffect, useMemo } from 'react'
import { useTotalLikes } from './useLikes.js'
import toolsData from '../data/tools.json'
import aiTutorialsData from '../data/aiTutorials.json'
import knowledgeData from '../data/knowledge.json'
import statsData from '../data/stats.json'

const VISITOR_STORAGE_KEY = 'taotools-visitor-count'
const VISITOR_API_URL = 'https://api.counterapi.dev/v1/taotools/visitors/up'
const VISITOR_FALLBACK = 10

function getInitialVisitorCount() {
  if (typeof window === 'undefined') return VISITOR_FALLBACK
  try {
    const saved = window.localStorage.getItem(VISITOR_STORAGE_KEY)
    return saved ? Number(saved) : VISITOR_FALLBACK
  } catch {
    return VISITOR_FALLBACK
  }
}

function saveVisitorCount(value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VISITOR_STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

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
  const [visitorCount, setVisitorCount] = useState(getInitialVisitorCount)

  const baseLikeCounts = useMemo(() => getBaseLikeCounts(), [])
  const liveLikes = useTotalLikes(baseLikeCounts)

  useEffect(() => {
    let mounted = true
    fetch(VISITOR_API_URL, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (mounted && typeof data.count === 'number') {
          setVisitorCount(data.count)
          saveVisitorCount(data.count)
        }
      })
      .catch((err) => {
        // 网络失败时使用本地缓存，避免显示过期默认值
        console.warn('[useStats] 访客计数接口失败，使用本地缓存:', err)
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
