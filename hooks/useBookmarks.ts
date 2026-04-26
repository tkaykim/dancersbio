'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dancersbio.bookmarks.v1'
const EVENT_NAME = 'dancersbio:bookmarks-change'

export type BookmarkKind = 'casting' | 'dancer' | 'team'

export interface BookmarkEntry {
    id: string
    kind: BookmarkKind
    savedAt: number
}

type BookmarkMap = Record<string, BookmarkEntry>

function makeKey(kind: BookmarkKind, id: string) {
    return `${kind}:${id}`
}

function readStorage(): BookmarkMap {
    if (typeof window === 'undefined') return {}
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? (parsed as BookmarkMap) : {}
    } catch {
        return {}
    }
}

function writeStorage(map: BookmarkMap) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
        window.dispatchEvent(new Event(EVENT_NAME))
    } catch {
        // 용량 초과 등은 무시 — 북마크는 best-effort
    }
}

function subscribe(listener: () => void) {
    if (typeof window === 'undefined') return () => {}
    const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) listener()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(EVENT_NAME, listener)
    return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(EVENT_NAME, listener)
    }
}

const EMPTY: BookmarkMap = {}
function getServerSnapshot(): BookmarkMap {
    return EMPTY
}

export function useBookmarks() {
    const map = useSyncExternalStore(subscribe, readStorage, getServerSnapshot)

    const isBookmarked = useCallback(
        (kind: BookmarkKind, id: string) => Boolean(map[makeKey(kind, id)]),
        [map],
    )

    const toggle = useCallback((kind: BookmarkKind, id: string) => {
        const current = readStorage()
        const key = makeKey(kind, id)
        if (current[key]) {
            const { [key]: _removed, ...rest } = current
            writeStorage(rest)
            return false
        }
        writeStorage({ ...current, [key]: { id, kind, savedAt: Date.now() } })
        return true
    }, [])

    const remove = useCallback((kind: BookmarkKind, id: string) => {
        const current = readStorage()
        const key = makeKey(kind, id)
        if (!current[key]) return
        const { [key]: _removed, ...rest } = current
        writeStorage(rest)
    }, [])

    const list = useCallback(
        (kind?: BookmarkKind) => {
            const all = Object.values(map)
            const filtered = kind ? all.filter((e) => e.kind === kind) : all
            return filtered.sort((a, b) => b.savedAt - a.savedAt)
        },
        [map],
    )

    return { map, isBookmarked, toggle, remove, list, count: Object.keys(map).length }
}

export function useBookmarkCount(kind?: BookmarkKind) {
    const { map } = useBookmarks()
    if (!kind) return Object.keys(map).length
    return Object.values(map).filter((e) => e.kind === kind).length
}

/** 첫 마운트 후 한 번만 hydration 안전하게 false 반환 → 진짜 클라이언트 값으로 전환 */
export function useIsHydrated() {
    const subscribeOnce = useCallback((cb: () => void) => {
        const id = window.setTimeout(cb, 0)
        return () => window.clearTimeout(id)
    }, [])
    return useSyncExternalStore(
        subscribeOnce,
        () => true,
        () => false,
    )
}
