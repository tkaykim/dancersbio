"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Instagram } from "lucide-react";
import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";

export default function ClaimPage() {
    const [step, setStep] = useState(1);

    return (
        <MobileContainer>
            <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">

                {/* Header */}
                <div className="mb-8 pt-4">
                    <h1 className="text-2xl font-bold mb-2">Claim Profile</h1>
                    <p className="text-muted-foreground text-sm">
                        Verify your identity to manage this portfolio.
                    </p>
                </div>

                {/* Step 1: Confirm Identity */}
                {step === 1 && (
                    <div className="flex-1 flex flex-col">
                        <div className="bg-neutral-900 rounded-2xl p-6 mb-6 border border-white/10 text-center">
                            <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden relative">
                                {/* Placeholder for J-Ho Image */}
                                <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop" className="object-cover w-full h-full" alt="Profile" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">J-Ho</h2>
                            <p className="text-sm text-gray-400">Choreographer • Just Jerk</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-[#E1306C] text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                            >
                                <Instagram className="w-6 h-6" />
                                Verify with Instagram
                            </button>

                            <button className="w-full bg-neutral-800 text-gray-300 font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors">
                                Upload ID / Business Card
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Success */}
                {step === 2 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Request Sent!</h2>
                        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                            We are verifying your identity. You will get access to your dashboard shortly.
                        </p>

                        <Link href="/dashboard" className="w-full bg-primary text-black font-bold h-14 rounded-xl flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </MobileContainer>
    );
}
