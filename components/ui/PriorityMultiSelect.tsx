'use client'

import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, X } from 'lucide-react'

interface PriorityOption {
    value: string
    label: string
}

interface PriorityMultiSelectProps {
    options: PriorityOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    variant?: 'list' | 'pills'
}

export default function PriorityMultiSelect({
    options,
    selected,
    onChange,
    variant = 'list'
}: PriorityMultiSelectProps) {
    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(s => s !== value))
        } else {
            onChange([...selected, value])
        }
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const next = [...selected]
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
        onChange(next)
    }

    const moveDown = (index: number) => {
        if (index === selected.length - 1) return
        const next = [...selected]
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
        onChange(next)
    }

    const remove = (value: string) => {
        onChange(selected.filter(s => s !== value))
    }

    const getLabel = (value: string) => {
        return options.find(o => o.value === value)?.label ?? value
    }

    const getPriority = (value: string) => {
        const idx = selected.indexOf(value)
        return idx >= 0 ? idx + 1 : null
    }

    return (
        <div className="space-y-4">
            {/* Selection Grid */}
            {variant === 'list' ? (
                <div className="grid grid-cols-1 gap-3">
                    {options.map(({ value, label }) => {
                        const priority = getPriority(value)
                        const isSelected = priority !== null
                        return (
                            <button
                                key={value}
                                onClick={() => toggle(value)}
                                className={cn(
                                    'flex items-center justify-between p-4 rounded-lg border transition-all',
                                    isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-neutral-800 hover:bg-neutral-900'
                                )}
                            >
                                <span className="font-medium text-white">{label}</span>
                                {isSelected && (
                                    <span className="w-7 h-7 rounded-full bg-primary text-black text-sm font-bold flex items-center justify-center">
                                        {priority}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {options.map(({ value, label }) => {
                        const priority = getPriority(value)
                        const isSelected = priority !== null
                        return (
                            <button
                                key={value}
                                onClick={() => toggle(value)}
                                className={cn(
                                    'px-4 py-2 rounded-full border transition-all flex items-center gap-2',
                                    isSelected
                                        ? 'border-primary bg-primary text-black font-semibold'
                                        : 'border-neutral-800 text-white hover:bg-neutral-900'
                                )}
                            >
                                {isSelected && (
                                    <span className="w-5 h-5 rounded-full bg-black text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {priority}
                                    </span>
                                )}
                                {label}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Priority Order Summary */}
            {selected.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-3">
                        선택 순서 (위일수록 높은 우선순위)
                    </p>
                    <div className="space-y-2">
                        {selected.map((value, index) => (
                            <div
                                key={value}
                                className="flex items-center gap-3 bg-neutral-800/60 rounded-lg px-3 py-2"
                            >
                                <span className="w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-white text-sm flex-1 truncate">
                                    {getLabel(value)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveUp(index) }}
                                        disabled={index === 0}
                                        className="p-1 rounded hover:bg-neutral-700 disabled:opacity-30 transition-colors"
                                    >
                                        <ArrowUp className="w-4 h-4 text-white/70" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveDown(index) }}
                                        disabled={index === selected.length - 1}
                                        className="p-1 rounded hover:bg-neutral-700 disabled:opacity-30 transition-colors"
                                    >
                                        <ArrowDown className="w-4 h-4 text-white/70" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); remove(value) }}
                                        className="p-1 rounded hover:bg-red-900/40 transition-colors ml-1"
                                    >
                                        <X className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
