import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import AuthSessionProvider from '@/components/AuthSessionProvider'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/ThemeProvider.tsx'

export const metadata: Metadata = {
  title: 'Artist2Playlist for Spotify',
  description: 'Add every song by any artist to your playlists on Spotify in one click.',
  openGraph: {
    type: "website",
    url: 'https://artist-2-playlist.vercel.app',
    title: 'Artist2Playlist for Spotify',
    description: 'Add every song by any artist to your playlists on Spotif in one click.',
    siteName: 'Artist2Playlist',
    images: [
      {
        url: 'https://artist-2-playlist.vercel.app/og.png',
        width: 1200,
        height: 630,
        alt: 'Artist2Playlist for Spotify',
      },
    ],
  }
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
        <body className="flex min-h-dvh flex-col items-center antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex w-full max-w-screen-sm flex-col">
              <Header />
              <main className="flex flex-grow flex-col items-center px-5">{children}</main>
            </div>
            <Footer />
          </ThemeProvider>
        </body>
      </AuthSessionProvider>
    </html>
  )
}
