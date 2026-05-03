"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ico } from "@/components/cue";

type TabKey = 'casting' | 'crew' | 'inbox' | 'work' | 'me'

interface NavItem {
    label: string
    href: string
    key: TabKey
    icon: keyof typeof Ico
    /** Routes that should also activate this tab (legacy paths during migration). */
    aliases?: string[]
    badge?: number
}

const NAV: NavItem[] = [
    { label: 'Casting', href: '/casting', key: 'casting', icon: 'briefcase', aliases: ['/'] },
    { label: 'Crew',    href: '/crew',    key: 'crew',    icon: 'user',      aliases: ['/search', '/onboarding'] },
    { label: 'Inbox',   href: '/inbox',   key: 'inbox',   icon: 'msg',       aliases: ['/my/proposals'] },
    { label: 'Work',    href: '/work',    key: 'work',    icon: 'cal',       aliases: ['/my/projects'] },
    { label: 'Me',      href: '/me',      key: 'me',      icon: 'home',      aliases: ['/my'] },
]

const ALL_ALIASES: string[] = NAV.flatMap((n) => n.aliases ?? [])

function hasMoreSpecificAliasMatch(pathname: string, alias: string): boolean {
    for (const other of ALL_ALIASES) {
        if (other === alias) continue
        if (other.length <= alias.length) continue
        if (!other.startsWith(alias)) continue
        if (pathname === other || pathname.startsWith(other + '/')) return true
    }
    return false
}

function isActive(item: NavItem, pathname: string): boolean {
    if (pathname === item.href) return true
    if (item.href !== '/' && pathname.startsWith(item.href + '/')) return true
    if (item.aliases) {
        for (const alias of item.aliases) {
            if (alias === '/') {
                if (pathname === '/') return true
            } else if (pathname === alias) {
                return true
            } else if (pathname.startsWith(alias + '/')) {
                if (hasMoreSpecificAliasMatch(pathname, alias)) continue
                return true
            }
        }
    }
    return false
}

export default function BottomNav() {
    const pathname = usePathname() ?? '';

    return (
        <nav
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 pb-safe"
            style={{
                background: 'rgba(11,11,13,0.92)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                borderTop: '0.5px solid var(--cue-hairline-2)',
            }}
        >
            <div className="flex justify-around items-center" style={{ padding: '8px 0 6px', minHeight: 56 }}>
                {NAV.map((item) => {
                    const active = isActive(item, pathname);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3,
                                color: active ? 'var(--cue-accent)' : 'var(--cue-ink-3)',
                                transition: 'color 120ms',
                                textDecoration: 'none',
                                position: 'relative',
                            }}
                        >
                            <span style={{ position: 'relative' }}>
                                {Ico[item.icon]('currentColor', 22)}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -8,
                                            minWidth: 16,
                                            height: 16,
                                            padding: '0 4px',
                                            borderRadius: 999,
                                            background: 'var(--cue-bad)',
                                            color: 'var(--cue-bg)',
                                            fontSize: 9,
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
