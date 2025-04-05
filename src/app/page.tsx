'use client'

import { ShuffleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import playlistImg from '@/assets/playlist-ado.png'
import spotifyLogoBlack from '@/assets/spotify-logo-black.svg'
import spotifyLogoGreen from '@/assets/spotify-logo-green.svg'
import spotifyLogoWhite from '@/assets/spotify-logo-white.svg'
import App from '@/components/App'
import { Button } from '@/components/ui/button'

const ARTIST_IMAGE = 'https://i.scdn.co/image/ab6761610000e5ebbcb1c184c322688f10cdce7a'
const ARTIST_IMAGE_ALT = 'Ado (https://open.spotify.com/artist/6mEQK9m2krja6X1cfsAjfl)'

export default function Home() {
  const session = useSession()

  if (!session || session.status !== 'authenticated') {
    return (
      <div className="flex h-full flex-col items-center justify-center py-24 text-center">
        <h1 className="max-w-[360px] text-pretty text-4xl font-semibold">
          Add all song of any artist in{' '}
          <span className="bg-gradient-title bg-clip-text text-transparent">One Click</span>
        </h1>
        <div className="my-12 flex items-center gap-5">
          <Link className="relative" href="https://open.spotify.com/artist/6mEQK9m2krja6X1cfsAjfl" target="_blank">
            <Image
              className="size-[100px] rounded-md"
              src={ARTIST_IMAGE}
              alt={ARTIST_IMAGE_ALT}
              width="100"
              height="100"
            />
            <Image className="absolute left-1 top-1 size-[21px]" src={spotifyLogoWhite} alt="" width="21" height="21" />
          </Link>
          <ShuffleIcon className="size-10" />
          <Image className="size-[100px] rounded-md" src={playlistImg} alt="Playlist of Ado" width="100" height="100" />
        </div>

        <Button className="h-10 gap-1.5" onClick={() => signIn('spotify')}>
          Sign in with <span className="sr-only">Spotify</span>
          <Image className="rounded-md dark:hidden" src={spotifyLogoGreen} alt="Spotify logo" width="24" height="24" />
          <Image
            className="hidden rounded-md dark:block"
            src={spotifyLogoBlack}
            alt="Spotify logo"
            width="24"
            height="24"
          />
        </Button>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          We only use essential data refer to our{' '}
          <Link href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    )
  }

  return <App />
}
