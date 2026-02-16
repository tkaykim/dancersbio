interface QuickStatCardProps {
    label: string
    value: string | number
    accent?: string
}

export default function QuickStatCard({ label, value, accent = 'text-primary' }: QuickStatCardProps) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex-1 min-w-0">
            <p className={`text-2xl font-bold ${accent}`}>{value}</p>
            <p className="text-white/50 text-xs mt-1 truncate">{label}</p>
        </div>
    )
}
