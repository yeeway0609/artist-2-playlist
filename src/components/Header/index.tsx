'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import logoDark from '@/assets/logo-dark.png'
import logoLight from '@/assets/logo-light.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Header() {
  const session = useSession()
  const { theme, setTheme } = useTheme()

  function switchTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex justify-between px-5 py-6">
      <Link href="/" className="flex items-center">
        <Image className="dark:hidden" src={logoLight} alt="logo - light" width={32} height={32} />
        <Image className="hidden dark:block" src={logoDark} alt="logo - dark" width={32} height={32} />
        <span className="ml-3 hidden text-xl font-semibold text-primary min-[425px]:inline">Artist2Playlist</span>
      </Link>

      <div className="flex items-center space-x-3">
        {session.status === 'authenticated' && (
          <>
            <Avatar className="size-8">
              <AvatarImage src={session.data?.user?.image ?? undefined} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>

            <Button variant="outline" onClick={() => signOut()}>
              Log out
            </Button>
          </>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="size-10" variant="outline" onClick={switchTheme}>
                <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Switch theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
