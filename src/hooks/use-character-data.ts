/**
 * 中文名：汉字数据钩子
 * 职责：加载 Make Me a Hanzi 的 graphics.txt / dictionary.txt（完全离线），
 *       提供当前字符的笔画 SVG 路径与元数据
 * 依赖：无
 *
 * 数据来源：public/hanzi-data/（需先运行 npm run fetch:hanzi 下载）
 */
import { useEffect, useState } from 'react'

export interface HanziCharData {
  character: string
  strokes: string[]
  radical: string
  strokeCount: number
}

interface DictEntry {
  character: string
  radical: string
  strokes: number
}

interface HanziDataset {
  graphics: Map<string, string[]>
  dict: Map<string, DictEntry>
}

let datasetPromise: Promise<HanziDataset> | null = null

function loadDataset(): Promise<HanziDataset> {
  if (!datasetPromise) {
    datasetPromise = (async () => {
      const base = import.meta.env.BASE_URL
      const [gRes, dRes] = await Promise.all([
        fetch(`${base}hanzi-data/graphics.txt`),
        fetch(`${base}hanzi-data/dictionary.txt`)
      ])
      const graphics = new Map<string, string[]>()
      const dict = new Map<string, DictEntry>()
      if (gRes.ok) {
        const gText = await gRes.text()
        for (const line of gText.trim().split('\n')) {
          try {
            const obj = JSON.parse(line)
            if (obj.character) graphics.set(obj.character, obj.strokes || [])
          } catch {
            /* skip */
          }
        }
      }
      if (dRes.ok) {
        const dText = await dRes.text()
        for (const line of dText.trim().split('\n')) {
          try {
            const obj = JSON.parse(line)
            if (obj.character) {
              dict.set(obj.character, {
                character: obj.character,
                radical: obj.radical || '',
                strokes: obj.strokes || 0
              })
            }
          } catch {
            /* skip */
          }
        }
      }
      return { graphics, dict }
    })()
  }
  return datasetPromise
}

export function useCharacterData(char: string | null) {
  const [data, setData] = useState<HanziCharData | null>(null)
  const [loading, setLoading] = useState(true)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!char) {
      setData(null)
      setLoading(false)
      setSupported(true)
      return
    }
    setLoading(true)
    loadDataset().then(({ graphics, dict }) => {
      if (cancelled) return
      const strokes = graphics.get(char)
      if (!strokes || !strokes.length) {
        setData(null)
        setSupported(false)
        setLoading(false)
        return
      }
      const d = dict.get(char)
      setData({
        character: char,
        strokes,
        radical: d?.radical || '',
        strokeCount: d?.strokes || strokes.length
      })
      setSupported(true)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [char])

  return { data, loading, supported }
}

export default useCharacterData
