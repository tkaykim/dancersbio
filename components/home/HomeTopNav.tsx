"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";

export default function HomeTopNav() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-black/80 backdrop-blur-md">
            <button className="text-white hover:text-primary transition-colors">
                <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-0.5">
                <span className="text-xl font-bold text-white tracking-tight">dancers</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span className="text-xl font-bold text-white tracking-tight">bio</span>
            </Link>

            <Link href="/search" className="text-white hover:text-primary transition-colors">
                <Search className="w-6 h-6" />
            </Link>
        </header>
    );
}
