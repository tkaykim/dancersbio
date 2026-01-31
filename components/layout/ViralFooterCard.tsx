"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ViralFooterCard() {
    return (
        <div className="w-full px-6 py-12 pb-24 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
                Are you a Dancer?
            </h3>
            <p className="text-sm text-white/50 mb-8 max-w-[240px] leading-relaxed">
                Create your professional portfolio in seconds and get discovered by top clients.
            </p>

            <Link
                href="/onboarding"
                className="w-full max-w-sm bg-white text-black font-bold h-12 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
                Create My Profile
                <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[10px] text-white/30 mt-6">
                Join 1,200+ dancers on dancers.bio
            </p>
        </div>
    );
}
