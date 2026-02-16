import { User as UserIcon, Mail } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface UserProfileCardProps {
    user: User
    primaryDancer?: { stage_name: string; profile_img: string | null } | null
}

export default function UserProfileCard({ user, primaryDancer }: UserProfileCardProps) {
    return (
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {primaryDancer?.profile_img ? (
                        <img src={primaryDancer.profile_img} alt={primaryDancer.stage_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                        {primaryDancer?.stage_name || user.user_metadata?.name || '사용자'}
                    </h2>
                    <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </p>
                </div>
            </div>
        </section>
    )
}
