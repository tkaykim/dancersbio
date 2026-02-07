"use client";

import { useState } from "react";
import HomeTopNav from "@/components/home/HomeTopNav";
import PromoBanner from "@/components/home/PromoBanner";
import PortraitGrid from "@/components/home/PortraitGrid";
import CategoryTabs from "@/components/home/CategoryTabs";

export type DancerCategory = "all" | "battler" | "choreographer";

export default function Home() {
  const [category, setCategory] = useState<DancerCategory>("all");

  return (
    <main className="flex flex-col h-full w-full pb-20 bg-background text-foreground">
      {/* 1. Sticky Header with Logo */}
      <HomeTopNav />

      {/* 2. Create Portfolio Promo Banner */}
      <PromoBanner />

      {/* 3. Category Tabs */}
      <CategoryTabs selected={category} onChange={setCategory} />

      {/* 4. Portrait Grid (filtered by category) */}
      <PortraitGrid category={category} />
    </main>
  );
}
