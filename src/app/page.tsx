"use client";

import { useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { PartialSearchResult } from "@spotify/web-api-ts-sdk";
import { Button } from "@/components/ui/button";
import sdk from "@/lib/spotifySdk";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebouncedCallback } from "use-debounce";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Home() {
  const session = useSession();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState(
    {} as Pick<PartialSearchResult, "artists">
  );

  const debouncedSearchArtist = useDebouncedCallback(async (input: string) => {
    if (!input) return;

    const results = await sdk.search(input, ["artist"]);
    if (results) {
      console.log(results);
      setSearchResults(results);
    }
  }, 300);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearchArtist(value);
  }

  if (!session || session.status !== "authenticated") {
    return (
      <div>
        <h1>Spotify Web API Typescript SDK in Next.js</h1>
        <Button onClick={() => signIn("spotify")}>Sign in with Spotify</Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-screen-sm mx-auto">
      <main className="flex flex-col items-center py-10 px-4">
        <Avatar className="size-20">
          <AvatarImage src={session.data.user?.image ?? undefined} />
          <AvatarFallback>Avatar</AvatarFallback>
        </Avatar>
        <p className="text-3xl my-3">{session.data.user?.name}</p>
        <Button onClick={() => signOut()}>Sign out</Button>

        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a command or search..."
            value={searchInput}
            onChangeCapture={handleSearchChange}
          />
          <CommandList>
            {/* <CommandEmpty>No results found.</CommandEmpty> */}
            {searchResults.artists?.items.slice(0, 5).map((artist) => (
              <CommandItem key={artist.id}>
                <img
                  src={artist.images[0].url}
                  className=" max-w-10 aspect-square"
                  alt=""
                />
                <p>{artist.name}</p>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </main>
      <footer className=""></footer>
    </div>
  );
}
