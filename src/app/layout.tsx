import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import AuthSessionProvider from '@/components/AuthSessionProvider'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { ThemeProvider } from '@/components/ThemeProvider.tsx'

export const metadata: Metadata = {
  title: 'Artist2Playlist for Spotify',
  description: 'Add all songs of artist to your playlists on Spotify.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <AuthSessionProvider session={session}>
        <body className="mx-auto min-h-dvh max-w-screen-sm antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DarkModeToggle />
            <main className="flex flex-col items-center px-4 py-10">{children}</main>
            <footer className=""></footer>
          </ThemeProvider>
        </body>
      </AuthSessionProvider>
    </html>
  )
}
