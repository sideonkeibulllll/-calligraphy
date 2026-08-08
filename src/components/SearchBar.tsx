/**
 * 中文名：搜索框
 * 职责：字符搜索输入，实时回调
 * 依赖：无
 */
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (keyword: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = '搜索练过的字' }: SearchBarProps) {
  const [value, setValue] = useState('')
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      background: 'var(--bg-input)', borderRadius: 'var(--radius-capsule)',
      border: '1px solid var(--border-soft)'
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); onSearch(e.target.value) }}
        placeholder={placeholder}
        style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)', minWidth: 0 }}
      />
    </div>
  )
}
