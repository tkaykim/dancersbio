"use client";

import { cn } from "@/lib/utils";
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
        <div className="px-5 py-3">
            <div className="flex gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                            selected === tab.value
                                ? "bg-primary text-black"
                                : "bg-neutral-800/80 text-white/60 hover:bg-neutral-700 hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
