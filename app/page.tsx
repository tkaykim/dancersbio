"use client";

import HomeTopNav from "@/components/home/HomeTopNav";
import PromoBanner from "@/components/home/PromoBanner";
import PortraitGrid from "@/components/home/PortraitGrid";

export default function Home() {
  return (
    <main className="flex flex-col h-full w-full pb-20 bg-background text-foreground">
      {/* 1. Sticky Header with Logo */}
      <HomeTopNav />

      {/* 2. Create Portfolio Promo Banner */}
      <PromoBanner />

      {/* 3. Portrait Grid (Popular Dancers & Groups) */}
      <PortraitGrid />

    </main>
  );
}
