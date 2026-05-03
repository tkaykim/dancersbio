import { User as UserIcon, Mail } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface UserProfileCardProps {
    user: User
    primaryDancer?: { stage_name: string; profile_img: string | null } | null
}

export default function UserProfileCard({ user, primaryDancer }: UserProfileCardProps) {
    return (
        <section
            className="rounded-2xl p-6"
            style={{
                background: 'var(--cue-surface)',
                border: '1px solid var(--cue-hairline)',
            }}
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
                    style={{
                        background: 'color-mix(in srgb, var(--cue-accent) 18%, transparent)',
                        border: '1px solid var(--cue-hairline)',
                    }}
                >
                    {primaryDancer?.profile_img ? (
                        <img src={primaryDancer.profile_img} alt={primaryDancer.stage_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8" style={{ color: 'var(--cue-accent)' }} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2
                        className="truncate"
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--cue-ink)',
                        }}
                    >
                        {primaryDancer?.stage_name || user.user_metadata?.name || '사용자'}
                    </h2>
                    <p
                        className="flex items-center gap-2 mt-1"
                        style={{
                            fontSize: 13,
                            color: 'var(--cue-ink-3)',
                        }}
                    >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </p>
                </div>
            </div>
        </section>
    )
}
