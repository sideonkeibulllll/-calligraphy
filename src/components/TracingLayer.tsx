/**
 * 中文名：描红层
 * 职责：屏幕描红触控绘画（canvas），记录每笔点集支持撤回；forwardRef 暴露 clear/undo 供父组件调用
 * 依赖：无
 */
import { useRef, forwardRef, useImperativeHandle } from 'react'

export interface TracingLayerHandle {
  clear: () => void
  undo: () => void
}

interface TracingLayerProps {
  size: number
  enabled: boolean
}

interface Point { x: number; y: number }

const TracingLayer = forwardRef<TracingLayerHandle, TracingLayerProps>(({ size, enabled }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<Point | null>(null)
  const strokes = useRef<Point[][]>([])
  const curStroke = useRef<Point[]>([])

  const getPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#ff4d9d'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const redraw = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size, size)
    applyStyle(ctx)
    for (const stroke of strokes.current) {
      if (stroke.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y)
      }
      ctx.stroke()
    }
  }

  const clear = () => {
    strokes.current = []
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, size, size)
  }

  const undo = () => {
    strokes.current.pop()
    redraw()
  }

  // 暴露给父组件：切换字时 clear、外部按钮可调 undo
  useImperativeHandle(ref, () => ({ clear, undo }))

  if (!enabled) return null

  const onDown = (e: React.PointerEvent) => {
    drawing.current = true
    const p = getPos(e)
    last.current = p
    curStroke.current = [p]
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const p = getPos(e)
    applyStyle(ctx)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    curStroke.current.push(p)
  }

  const onUp = () => {
    if (drawing.current && curStroke.current.length > 0) {
      strokes.current.push(curStroke.current)
    }
    drawing.current = false
    last.current = null
    curStroke.current = []
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{ position: 'absolute', inset: 0, touchAction: 'none', zIndex: 3, cursor: 'crosshair' }}
      />
      <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 4, display: 'flex', gap: 6 }}>
        <button
          onClick={undo}
          style={{
            padding: '4px 10px', fontSize: 11, fontWeight: 600,
            borderRadius: 'var(--radius-capsule)', border: '1px solid var(--border-teal)',
            background: 'rgba(26,23,20,0.7)', color: 'var(--neon-teal)'
          }}
        >
          撤回
        </button>
        <button
          onClick={clear}
          style={{
            padding: '4px 10px', fontSize: 11, fontWeight: 600,
            borderRadius: 'var(--radius-capsule)', border: '1px solid var(--border-yellow)',
            background: 'rgba(26,23,20,0.7)', color: 'var(--neon-yellow)'
          }}
        >
          清除
        </button>
      </div>
    </>
  )
})

TracingLayer.displayName = 'TracingLayer'
export default TracingLayer
