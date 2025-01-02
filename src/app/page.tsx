"use client";

// import { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const session = useSession();

  if (!session || session.status !== "authenticated") {
    return (
      <div>
        <h1>Spotify Web API Typescript SDK in Next.js</h1>
        <Button onClick={() => signIn("spotify")}>Sign in with Spotify</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <main className="">
        <p>Logged in as {session.data.user?.name}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </main>
      <footer className=""></footer>
    </div>
  );
}
