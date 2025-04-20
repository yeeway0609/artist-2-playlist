'use client'

import { LogOutIcon, MoonIcon, SunIcon, MenuIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import logoDark from '@/assets/logo-dark.png'
import logoLight from '@/assets/logo-light.png'
import ArrowUpRightIcon from '@/components/ui/arrow-up-right'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Header() {
  const session = useSession()

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
            <Avatar className="size-[34px]">
              <AvatarImage src={session.data?.user?.image ?? undefined} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>

            <LogOutButton />
          </>
        )}

        <ThemeButton />
        <MenuButton />
      </div>
    </header>
  )
}

function LogOutButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="size-10" variant="outline" onClick={() => signOut()}>
            <LogOutIcon />
            <span className="sr-only">Log out</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Log out</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ThemeButton() {
  const { theme, setTheme } = useTheme()

  function switchTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
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
  )
}

function MenuButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-10" variant="outline">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-5 mt-1 w-36 md:mr-0">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link href="/">
          <DropdownMenuItem className="cursor-pointer">
            <span>Home</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/how-to-use">
          <DropdownMenuItem className="cursor-pointer">
            <span>How to use</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/privacy-policy">
          <DropdownMenuItem className="cursor-pointer">
            <span>Privacy policy</span>
          </DropdownMenuItem>
        </Link>

        <Link href="https://forms.gle/wgGBjkw9CL7ahypK7" target="_blank">
          <DropdownMenuItem className="cursor-pointer">
            <span>Feedback form</span>
            <ArrowUpRightIcon />
          </DropdownMenuItem>
        </Link>

        <Link href="https://github.com/yeeway0609/artist-2-playlist" target="_blank">
          <DropdownMenuItem className="cursor-pointer">
            <span>GitHub repo</span>
            <ArrowUpRightIcon />
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
