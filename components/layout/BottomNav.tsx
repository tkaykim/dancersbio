"use client";

import { Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "홈", href: "/", icon: Home },
        { label: "검색", href: "/search", icon: Search },
        { label: "MY", href: "/my", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/80 backdrop-blur-md border-t border-border z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90",
                                isActive ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-6 w-6" strokeWidth={isActive ? 3 : 2} />
                            <span className={cn("text-[10px] font-bold", isActive ? "block" : "hidden")}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
