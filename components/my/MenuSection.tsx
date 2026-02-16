import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
    label: string
    href: string
    icon: LucideIcon
    badge?: string | number
    badgeColor?: string
}

interface MenuSectionProps {
    items: MenuItem[]
}

export default function MenuSection({ items }: MenuSectionProps) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {items.map((item, idx) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-5 py-4 hover:bg-neutral-800/50 transition active:scale-[0.99] ${idx < items.length - 1 ? 'border-b border-neutral-800/50' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-white/60" />
                        <span className="text-white font-medium text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.badge !== undefined && item.badge !== 0 && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-primary/20 text-primary'}`}>
                                {item.badge}
                            </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
