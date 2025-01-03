import type { Metadata } from "next";
import "./globals.css";
import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Spotify Artist2Playlist",
  description: "Add all songs of artist on Spotify to your playlists.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <AuthSessionProvider session={session}>
        <body className="antialiased min-h-dvh max-w-screen-sm mx-auto">
          <main className="flex flex-col items-center py-10 px-4">
            {children}
          </main>
          <footer className=""></footer>
        </body>
      </AuthSessionProvider>
    </html>
  );
}
