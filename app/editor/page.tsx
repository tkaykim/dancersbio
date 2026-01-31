"use client";

import MobileContainer from "@/components/layout/MobileContainer";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditorPage() {
    const router = useRouter();
    const [careerList, setCareerList] = useState([
        { id: 1, title: "멜론 뮤직 어워드 오프닝", year: "2024", category: "Performance" },
        { id: 2, title: "스트릿 댄스 배틀 우승", year: "2023", category: "Award" },
    ]);

    return (
        <MobileContainer>
            <div className="flex flex-col h-full bg-muted/10 pb-20">

                {/* Header */}
                <div className="flex justify-between items-center px-4 py-4 bg-background border-b border-border sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-lg">프로필 편집</h1>
                    </div>
                    <button className="text-primary font-semibold text-sm hover:underline">
                        미리보기
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Section: Profile Image */}
                    <section>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase mb-3">프로필 이미지</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-muted rounded-full overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=200&fit=crop" alt="Profile" className="object-cover w-full h-full" />
                            </div>
                            <button className="text-sm border border-input bg-background px-4 py-2 rounded-lg hover:bg-muted font-medium">
                                변경하기
                            </button>
                        </div>
                    </section>

                    {/* Section: Basic Info */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase mb-1">기본 정보</h2>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">활동명</label>
                            <input type="text" defaultValue="J-Ho" className="w-full p-3 rounded-xl border border-input bg-background font-bold text-lg" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">소개 (Bio)</label>
                            <textarea defaultValue="Just jerk crew leader / Choreographer" className="w-full p-3 rounded-xl border border-input bg-background min-h-[100px]" />
                        </div>
                    </section>

                    {/* Section: Career (List Editor) */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold text-muted-foreground uppercase">경력 / 이력</h2>
                            <button className="p-1 hover:bg-muted rounded-full">
                                <Plus className="w-5 h-5 text-primary" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {careerList.map((item) => (
                                <div key={item.id} className="bg-background p-4 rounded-xl border border-border flex items-start gap-3 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{item.year}</span>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.category}</span>
                                        </div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                    </div>
                                    <button
                                        onClick={() => setCareerList(l => l.filter(i => i.id !== item.id))}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Floating Save Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border max-w-[480px] mx-auto z-40">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full h-12 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:translate-y-[-1px] transition-transform"
                    >
                        <Save className="w-4 h-4" />
                        저장하기
                    </button>
                </div>

            </div>
        </MobileContainer>
    );
}
