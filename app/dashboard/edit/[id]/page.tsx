'use client'

import { use } from 'react'
import { redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function EditRedirect({ params }: PageProps) {
    const { id } = use(params)
    redirect(`/my/profiles/${id}/edit`)
}
