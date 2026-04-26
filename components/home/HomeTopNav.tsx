"use client";

import Link from "next/link";
import { Ico } from "@/components/cue";

export default function HomeTopNav() {
    return (
        <header
            className="sticky top-0 z-50 flex items-center justify-between pt-header-safe"
            style={{
                padding: '14px 20px',
                background: 'rgba(14,14,12,0.78)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
            }}
        >
            <button
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cue-ink)',
                    cursor: 'pointer',
                }}
                aria-label="menu"
            >
                {Ico.more('currentColor', 18)}
            </button>

            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 0, textDecoration: 'none' }}>
                <span
                    style={{
                        fontFamily: 'var(--font-cue-serif), serif',
                        fontStyle: 'italic',
                        fontSize: 26,
                        color: 'var(--cue-ink)',
                        letterSpacing: -0.4,
                        lineHeight: 1,
                    }}
                >
                    dancers
                </span>
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--cue-accent)',
                        margin: '0 1px 4px',
                    }}
                />
                <span
                    style={{
                        fontFamily: 'var(--font-cue-serif), serif',
                        fontStyle: 'italic',
                        fontSize: 26,
                        color: 'var(--cue-ink)',
                        letterSpacing: -0.4,
                        lineHeight: 1,
                    }}
                >
                    bio
                </span>
            </Link>

            <Link
                href="/crew"
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cue-ink)',
                }}
            >
                {Ico.search('currentColor', 18)}
            </Link>
        </header>
    );
}
