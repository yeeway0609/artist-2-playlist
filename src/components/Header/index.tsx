'use client'

import { LogOutIcon } from 'lucide-react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import logoDark from '@/assets/logo-dark.png'
import logoLight from '@/assets/logo-light.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DarkModeToggle } from './DarkModeToggle'

export default function Header() {
  const session = useSession()
  const { resolvedTheme } = useTheme()

  return (
    <header className="flex justify-between px-5 py-2">
      <div className="flex items-center space-x-2">
        <Image
          src={resolvedTheme === 'dark' ? logoDark : logoLight}
          alt="Artist2Playlist logo"
          width={28}
          height={28}
        />
        <p className="mr-auto font-semibold text-primary">Artist2Playlist</p>
      </div>

      <div className="flex items-center space-x-3">
        {session.status === 'authenticated' && (
          <>
            <Avatar className="size-[34px]">
              <AvatarImage src={session.data?.user?.image ?? undefined} />
              <AvatarFallback>/</AvatarFallback>
            </Avatar>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => signOut()}>
                    <LogOutIcon />
                    <span className="sr-only">Log out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DarkModeToggle />
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
