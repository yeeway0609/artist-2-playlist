'use client'

import React from 'react'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

function AuthSessionProvider({
  session,
  children,
}: {
  children: React.ReactNode
  session: Session | null | undefined
}) {
  return (
    <SessionProvider session={session} refetchInterval={15 * 60}>
      {children}
    </SessionProvider>
  )
}

export default AuthSessionProvider
