import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import AuthSessionProvider from '@/components/AuthSessionProvider'
import Header from '@/components/Header'
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
        <body className="flex justify-center antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-dvh w-full max-w-screen-sm flex-col">
              <Header />
              <main className="flex flex-grow flex-col items-center px-5">{children}</main>
              <footer className="flex flex-col space-y-1 border-t border-border px-6 py-8">
                <Link href="/privacy-policy">Privacy policy</Link>
                <Link href="https://github.com/yeeway0609/spotify-artist-to-playlist" target="_blank">
                  GitHub
                  <span className="ml-1 text-sm text-primary">&#8599;</span>
                </Link>
                <Link href="" target="_blank">
                  Report a issue
                  <span className="ml-1 text-sm text-primary">&#8599;</span>
                </Link>
                <p className="pt-1 text-center text-sm text-primary">Copyright © 2025 yeeway</p>
              </footer>
            </div>
          </ThemeProvider>
        </body>
      </AuthSessionProvider>
    </html>
  )
}
