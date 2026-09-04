/**
 * 中文名：屏幕常亮钩子
 * 职责：进入画摹画布时请求 Screen Wake Lock 保持常亮，离开/切后台自动释放并重挂
 * 依赖：无
 */
import { useEffect } from 'react'

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    let sentinel: WakeLockSentinel | null = null
    let disposed = false

    const request = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          sentinel = await navigator.wakeLock.request('screen')
          if (disposed) {
            sentinel.release()
            sentinel = null
          }
        }
      } catch {
        // 不支持或被系统拒绝时静默降级（屏幕可能自动休眠）
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') request()
    }

    request()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinel?.release().catch(() => undefined)
      sentinel = null
    }
  }, [active])
}

export default useWakeLock
