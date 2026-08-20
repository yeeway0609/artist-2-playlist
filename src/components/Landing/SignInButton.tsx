import Image from 'next/image'
import { signIn } from 'next-auth/react'
import spotifyLogoBlack from '@/assets/spotify-logo-black.svg'
import spotifyLogoGreen from '@/assets/spotify-logo-green.svg'
import { Button } from '@/components/ui/button'

export default function SignInButton() {
  return (
    <Button className="h-10 gap-1.5" onClick={() => signIn('spotify')}>
      Sign in with <span className="sr-only">Spotify</span>
      <Image className="rounded-md dark:hidden" src={spotifyLogoGreen} alt="Spotify logo" width="24" height="24" />
      <Image className="hidden rounded-md dark:block" src={spotifyLogoBlack} alt="Spotify logo" width="24" height="24" />
    </Button>
  )
}
