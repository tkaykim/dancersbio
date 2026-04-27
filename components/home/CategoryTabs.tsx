"use client";

import type { DancerCategory } from "@/app/page";

interface CategoryTabsProps {
    selected: DancerCategory;
    onChange: (category: DancerCategory) => void;
}

const TABS: { value: DancerCategory; label: string; description: string }[] = [
    { value: "all", label: "전체", description: "모든 댄서" },
    { value: "battler", label: "배틀", description: "배틀 · 심사 · 워크샵" },
    { value: "choreographer", label: "안무/방송", description: "안무 · 방송 · 공연" },
];

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
    return (
        <div style={{ padding: '12px 20px 4px' }}>
            <div style={{ display: 'flex', gap: 6 }}>
                {TABS.map((tab) => {
                    const on = selected === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => onChange(tab.value)}
                            style={{
                                padding: '7px 14px',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                background: on ? 'var(--cue-accent)' : 'transparent',
                                color: on ? 'var(--cue-accent-ink)' : 'var(--cue-ink-2)',
                                border: on ? 'none' : '1px solid var(--cue-hairline-2)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'background 120ms, color 120ms',
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
