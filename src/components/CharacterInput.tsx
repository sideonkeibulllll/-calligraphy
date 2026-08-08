/**
 * 中文名：字符输入框
 * 职责：主页输入框，输入单字/多字，回车或点按钮提交临摹
 * 依赖：胶囊按钮
 */
import { useState } from 'react'
import CapsuleButton from './CapsuleButton'

interface CharacterInputProps {
  onSubmit: (text: string) => void
}

export default function CharacterInput({ onSubmit }: CharacterInputProps) {
  const [value, setValue] = useState('')
  const submit = () => {
    if (value.trim()) {
      onSubmit(value)
      setValue('')
    }
  }
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit() }}
      style={{ display: 'flex', gap: 8 }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入单字或一段话，回车开始"
        style={{
          flex: 1, padding: '12px 16px', background: 'var(--bg-input)',
          borderRadius: 'var(--radius-capsule)', border: '1px solid var(--border-soft)',
          fontSize: 15, color: 'var(--text-primary)', minWidth: 0
        }}
      />
      <CapsuleButton type="submit" color="pink">临摹</CapsuleButton>
    </form>
  )
}
