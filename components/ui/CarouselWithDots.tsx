"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface CarouselWithDotsProps {
    items: React.ReactNode[];
    className?: string; // Container className
    slideClassName?: string; // Individual slide className
}

export default function CarouselWithDots({ items, className, slideClassName }: CarouselWithDotsProps) {
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

    return (
        <div className={cn("relative flex flex-col gap-4", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y -ml-4"> {/* Negative margin to handle slide padding */}
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex-[0_0_100%] min-w-0 pl-4", // Default 1 per slide, with left padding
                                slideClassName
                            )}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Pagination */}
            {scrollSnaps.length > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                index === selectedIndex
                                    ? "bg-primary w-2 h-2"
                                    : "bg-white/10 hover:bg-white/30"
                            )}
                            onClick={() => scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
