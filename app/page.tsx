import { redirect } from 'next/navigation'

export type DancerCategory = 'all' | 'battler' | 'choreographer'

export default function Home() {
    redirect('/casting')
}
