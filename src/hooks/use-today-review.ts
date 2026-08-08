/**
 * 中文名：今日复习钩子
 * 职责：加载今日到期字卡到复习状态仓库
 * 依赖：字卡仓库、复习状态
 */
import { useState, useCallback, useEffect } from 'react'
import { cardRepository } from '../db/repositories/card-repository'
import { useReviewStore } from '../store/review-store'

export function useTodayReview() {
  const [loading, setLoading] = useState(true)
  const setQueue = useReviewStore((s) => s.setQueue)
  const queue = useReviewStore((s) => s.queue)
  const completedCount = useReviewStore((s) => s.completedCount)
  const totalCount = useReviewStore((s) => s.totalCount)

  const load = useCallback(async () => {
    setLoading(true)
    const cards = await cardRepository.getDue()
    setQueue(cards)
    setLoading(false)
  }, [setQueue])

  useEffect(() => {
    load()
  }, [load])

  return { queue, loading, reload: load, completedCount, totalCount }
}

export default useTodayReview
