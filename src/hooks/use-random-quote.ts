/**
 * 中文名：随机名言钩子
 * 职责：App 启动时随机返回一句名言，整个会话内固定（切页不换，下次启动重新随机）
 * 依赖：名言库
 */
import { useMemo } from 'react'
import { quotes, type Quote } from '../data/quotes'

// 模块级缓存：App 会话内只随机一次
let cached: Quote | null = null

function pick(): Quote {
  if (!cached) {
    const idx = Math.floor(Math.random() * quotes.length)
    cached = quotes[idx] ?? quotes[0]
  }
  return cached
}

export function useRandomQuote(): Quote {
  return useMemo(() => pick(), [])
}
