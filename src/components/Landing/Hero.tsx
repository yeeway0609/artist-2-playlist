import { ShuffleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import playlistImg from '@/assets/playlist-ado.png'
import spotifyLogoWhite from '@/assets/spotify-logo-white.svg'
import SignInButton from './SignInButton'

export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center">
      <h1 className="max-w-[360px] text-pretty text-4xl font-semibold">
        Add every song by any artist to a playlist in{' '}
        <span className="bg-gradient-title bg-clip-text text-transparent">One Click</span>
      </h1>
      <div className="my-12 flex items-center gap-5">
        <Link className="relative" href="https://open.spotify.com/artist/6mEQK9m2krja6X1cfsAjfl" target="_blank">
          <Image
            className="size-[100px] rounded-md"
            src="https://i.scdn.co/image/ab6761610000e5ebbcb1c184c322688f10cdce7a"
            title="Ado"
            alt="Ado (https://open.spotify.com/artist/6mEQK9m2krja6X1cfsAjfl)"
            width="100"
            height="100"
          />
          <Image className="absolute left-1 top-1 size-[21px]" src={spotifyLogoWhite} alt="" width="21" height="21" />
        </Link>
        <ShuffleIcon className="size-10" />
        <Image className="size-[100px] rounded-md" src={playlistImg} alt="Playlist of Ado" width="100" height="100" />
      </div>

      <SignInButton />
      <p className="mt-6 text-xs text-muted-foreground">
        We only use essential data refer to our{' '}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </section>
  )
}
