"use client";

import { useState } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import { ArrowLeft, Check, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProposalPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        company: "",
        name: "",
        email: "",
        phone: "",
        type: "",
        budget: "",
        date: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            alert("제안서가 전송되었습니다!");
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <MobileContainer>
            <div className="flex flex-col h-full bg-background relative text-foreground">
                {/* Minimal Header */}
                <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-md z-40">
                    <Link href={`/profile/j-ho`} className="p-2 hover:bg-muted/20 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </Link>
                    <span className="font-bold text-base tracking-wide uppercase text-muted-foreground">New Proposal</span>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 flex-1 flex flex-col overflow-y-auto pb-28">

                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold mb-1">Make a Proposal</h1>
                        <p className="text-sm text-muted-foreground">Send a request to <span className="text-primary font-bold">J-Ho</span></p>
                    </div>

                    {/* Section 1: Client Info */}
                    <div className="mb-10">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-5 tracking-widest border-b border-border/50 pb-2">
                            01 Client Information
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Company / Brand</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Grigo Entertainment"
                                    className="w-full h-14 px-5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Contact Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Gildong Hong"
                                    className="w-full h-14 px-5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="official@company.com"
                                    className="w-full h-14 px-5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="010-0000-0000"
                                    className="w-full h-14 px-5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Project Info */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-5 tracking-widest border-b border-border/50 pb-2">
                            02 Project Details
                        </h3>

                        <label className="block text-sm font-semibold mb-3">Project Type</label>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {['Choreography', 'Broadcast', 'Judging', 'Workshop'].map((type) => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`h-12 rounded-xl text-sm font-medium border transition-all ${formData.type === type
                                        ? "border-primary bg-primary/20 text-primary"
                                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Estimated Budget</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-4 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground/50"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>

                {/* Floating Submit Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/90 backdrop-blur-xl border-t border-border/50 max-w-[480px] mx-auto z-50">
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.company || !formData.type || isSubmitting}
                        className="w-full h-14 bg-primary text-primary-foreground rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? "Sending..." : "Send Proposal"}
                        {!isSubmitting && <Check className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </MobileContainer>
    );
}
