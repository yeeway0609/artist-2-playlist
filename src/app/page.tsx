'use client'

import { useSession } from 'next-auth/react'
import Dashboard from '@/components/Dashboard'
import Landing from '@/components/Landing'

export default function Page() {
  const session = useSession()

  if (!session || session.status !== 'authenticated') {
    return <Landing />
  }

  return <Dashboard />
}
