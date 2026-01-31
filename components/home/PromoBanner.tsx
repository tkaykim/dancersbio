"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PromoBanner() {
    return (
        <div className="px-5 py-2">
            <Link href="/search" className="group block w-full">
                <div className="relative w-full h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-between px-5 overflow-hidden border border-white/5">
                    {/* Green Glow Accent */}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-green-900/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                    <span className="text-sm font-medium text-white z-10 truncate pr-4">
                        <span className="font-bold text-white">Create Your Portfolio</span> or claim an existing one
                    </span>

                    <ArrowRight className="w-4 h-4 text-primary z-10 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>
    );
}

