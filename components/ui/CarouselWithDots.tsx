"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface CarouselWithDotsProps {
    items: React.ReactNode[];
    className?: string; // Container className
    slideClassName?: string; // Individual slide className
    /** Number of slides visible at once (default 1). Use 3 for list-type career sections. */
    slidesPerView?: number;
}

export default function CarouselWithDots({ items, className, slideClassName, slidesPerView = 1 }: CarouselWithDotsProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        containScroll: 'trimSnaps'
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onInit = useCallback((emblaApi: any) => {
        setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = useCallback((emblaApi: any) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on('reInit', onInit);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onInit, onSelect]);

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    );

    if (!items || items.length === 0) return null;

    const perView = slidesPerView ?? 1;
    const slideWidthClass = perView === 3
        ? "flex-[0_0_calc((100%-2rem)/3)] min-w-0 pl-4" // 3 visible, 1rem gap between
        : "flex-[0_0_100%] min-w-0 pl-4";

    const pageCount = perView === 3 ? Math.ceil(items.length / 3) : scrollSnaps.length;
    const currentPage = perView === 3 ? Math.min(Math.floor(selectedIndex / 3), pageCount - 1) : selectedIndex;
    const handleDotClick = perView === 3
        ? (pageIndex: number) => scrollTo(Math.min(pageIndex * 3, items.length - 1))
        : scrollTo;

    return (
        <div className={cn("relative flex flex-col gap-4", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-4"> {/* Negative margin to handle slide padding */}
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                slideWidthClass,
                                slideClassName
                            )}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Pagination */}
            {pageCount > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                    {Array.from({ length: pageCount }).map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                index === currentPage
                                    ? "bg-primary w-2 h-2"
                                    : "bg-white/10 hover:bg-white/30"
                            )}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
