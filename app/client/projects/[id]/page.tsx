'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ClientProjectDetailRedirect() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      router.replace('/client?project=' + encodeURIComponent(id))
    }
  }, [id, router])

  return null
}
