"use client";

import { Search } from "lucide-react";

export default function HeroSearch() {
    return (
        <div className="w-full px-6 pt-12 pb-8 flex flex-col items-center">
            {/* Brand / Welcome */}
            <h1 className="text-4xl font-extrabold text-center mb-3 tracking-tighter text-foreground">
                Find Your <span className="text-primary">Groove</span>
            </h1>
            <p className="text-muted-foreground text-center mb-10 text-sm font-medium tracking-wide">
                Connect with world-class choreographers
            </p>

            {/* Search Bar */}
            <div className="w-full relative group max-w-md">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                    <Search className="absolute left-5 top-4 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        placeholder="Search artists, tracks, or styles..."
                        className="w-full h-14 pl-14 pr-6 rounded-full border border-border/50 bg-secondary/50 backdrop-blur-md shadow-sm ring-offset-background placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all font-medium text-base"
                    />
                </div>
            </div>
        </div>
    );
}
