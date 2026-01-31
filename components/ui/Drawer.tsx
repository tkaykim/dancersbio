'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export default function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setAnimateIn(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setAnimateIn(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isMounted) return null

    // We want to keep rendering while closing animation plays if it was open
    if (!isOpen && !animateIn) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Content */}
            <div
                className={cn(
                    "relative w-full sm:w-[500px] sm:rounded-2xl bg-neutral-900 border-t sm:border border-neutral-800 shadow-2xl transition-transform duration-300 ease-out max-h-[90vh] flex flex-col",
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-50"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
