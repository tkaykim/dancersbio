"use client";

import Link from "next/link";
import { Ico } from "@/components/cue";

export default function PromoBanner() {
    return (
        <div style={{ padding: '8px 20px 4px' }}>
            <Link
                href="/crew"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: 56,
                    padding: '0 18px',
                    borderRadius: 14,
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                    color: 'var(--cue-ink)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 140,
                        background: 'linear-gradient(to left, var(--cue-accent-dim), transparent)',
                        opacity: 0.7,
                    }}
                />
                <span
                    style={{
                        fontSize: 13,
                        zIndex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingRight: 16,
                    }}
                >
                    <span style={{ fontWeight: 700 }}>포트폴리오 만들기</span>
                    <span style={{ color: 'var(--cue-ink-3)' }}> · 또는 기존 프로필 클레임</span>
                </span>
                <span style={{ color: 'var(--cue-accent)', zIndex: 1, display: 'inline-flex' }}>
                    {Ico.arrow('currentColor', 16)}
                </span>
            </Link>
        </div>
    );
}
