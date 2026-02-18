'use client'

export default function AdminPageHeader({
    title,
    description,
}: {
    title: string
    description?: string
}) {
    return (
        <div className="mb-6 md:mb-8">
            <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
        </div>
    )
}
