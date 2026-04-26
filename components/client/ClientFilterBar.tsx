'use client'

import { Ico } from '@/components/cue'

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'pending', label: '대기' },
  { value: 'accepted', label: '수락' },
  { value: 'declined', label: '거절' },
  { value: 'negotiating', label: '협상중' },
  { value: 'cancelled', label: '취소' },
]

interface ClientFilterBarProps {
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  roleFilter: string
  onRoleFilterChange: (v: string) => void
  dancerNameFilter: string
  onDancerNameFilterChange: (v: string) => void
}

const inputStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--cue-surface)',
  border: '1px solid var(--cue-hairline)',
  color: 'var(--cue-ink)',
  fontSize: 12,
  outline: 'none',
  fontFamily: 'inherit',
}

export default function ClientFilterBar({
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  dancerNameFilter,
  onDancerNameFilterChange,
}: ClientFilterBarProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} style={inputStyle}>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        placeholder="역할 검색"
        style={{ ...inputStyle, width: 128 }}
      />
      <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--cue-ink-3)' }}>
          {Ico.search('currentColor', 14)}
        </div>
        <input
          type="text"
          value={dancerNameFilter}
          onChange={(e) => onDancerNameFilterChange(e.target.value)}
          placeholder="댄서명 검색"
          style={{ ...inputStyle, width: '100%', paddingLeft: 32 }}
        />
      </div>
    </div>
  )
}
