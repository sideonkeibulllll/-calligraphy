/**
 * 中文名：间隔重复算法
 * 职责：定制版 SM-2，处理勾/中/差三档评分
 * 依赖：类型定义、日期工具
 *
 * 规则：
 * - 首次临摹：勾/差入队（明天复习），中不入队（返回 null）
 * - 计划内复习：
 *   勾 → 当日进度✓，SM-2 拉长间隔，明日按到期日正常排
 *   中 → 当日进度✓，间隔=1，明日优先置顶
 *   差 → 当日进度✗，间隔=1 重排近期重练
 */
import type { Evaluation, Sm2Input, Sm2Result } from '../types'
import { today, tomorrow, addDays } from './date'

const EASE_MIN = 1.3
const EASE_INIT = 2.5

export function sm2(input: Sm2Input): Sm2Result | null {
  const { evaluation, is_new, ease: prevEase, interval: prevInterval, repetitions: prevRep } = input

  if (is_new && evaluation === 'mid') return null

  if (is_new) {
    if (evaluation === 'good') {
      return { ease: EASE_INIT, interval: 1, repetitions: 1, due_date: tomorrow(), priority: false }
    }
    return { ease: EASE_INIT, interval: 1, repetitions: 0, due_date: tomorrow(), priority: false }
  }

  if (evaluation === 'good') {
    const newRep = prevRep + 1
    let newInterval: number
    if (newRep === 1) newInterval = 1
    else if (newRep === 2) newInterval = 6
    else newInterval = Math.round(prevInterval * prevEase)
    const newEase = Math.max(EASE_MIN, prevEase + 0.1)
    return {
      ease: newEase,
      interval: newInterval,
      repetitions: newRep,
      due_date: addDays(today(), newInterval),
      priority: false
    }
  }

  if (evaluation === 'mid') {
    const newEase = Math.max(EASE_MIN, prevEase * 0.9)
    return { ease: newEase, interval: 1, repetitions: prevRep, due_date: tomorrow(), priority: true }
  }

  const newEase = Math.max(EASE_MIN, prevEase * 0.8)
  return { ease: newEase, interval: 1, repetitions: 0, due_date: tomorrow(), priority: false }
}

export function evaluate(evaluation: Evaluation): boolean {
  return evaluation === 'good' || evaluation === 'mid'
}

export default sm2
