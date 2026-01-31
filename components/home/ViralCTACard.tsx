"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ViralCTACard({ className }: { className?: string }) {
    return (
        <div className={cn("w-full px-6 py-4", className)}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-6 shadow-lg shadow-blue-900/20 text-white">
                {/* Background Patterns */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/90">
                            For Dancers
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1">
                        당신도 댄서인가요?
                    </h3>
                    <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                        나만의 공식 포트폴리오를 만들고<br />
                        더 많은 제안을 받아보세요.
                    </p>

                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm"
                    >
                        무료로 시작하기
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
