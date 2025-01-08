'use client'

import { LogOutIcon } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DarkModeToggle } from './DarkModeToggle'

export default function Header() {
  const session = useSession()

  return (
    <header className="flex items-center justify-end space-x-3 px-3 py-2">
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
    </header>
  )
}
