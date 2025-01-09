'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import App from './App'

export default function Home() {
  // TODO: session 過期要導回登入頁
  const session = useSession()

  if (!session || session.status !== 'authenticated') {
    return (
      <div>
        <Button onClick={() => signIn('spotify')}>Sign in with Spotify</Button>
        <p>we only use essential data refer to our privacy policy</p>
      </div>
    )
  }

  return <App />
}
