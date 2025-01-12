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
  description: 'Add all songs of any artist to your playlists on Spotify.',
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
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </AuthSessionProvider>
    </html>
  )
}
