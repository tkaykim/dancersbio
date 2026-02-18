'use client'

import { Search } from 'lucide-react'

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

export default function ClientFilterBar({
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  dancerNameFilter,
  onDancerNameFilterChange,
}: ClientFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-primary"
      >
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
        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm w-32 placeholder-white/40 focus:outline-none focus:border-primary"
      />
      <div className="relative flex-1 min-w-[140px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={dancerNameFilter}
          onChange={(e) => onDancerNameFilterChange(e.target.value)}
          placeholder="댄서명 검색"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  )
}
