'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ghost, Search } from "lucide-react";
import { useState, useRef } from "react";
import { number, z } from "zod";

const querySchema = z.object({
  query: z.string().min(3).max(100),
  num: z.number().min(1).max(100),
})

export default function Home() {
  const [books, setBooks] = useState<null | Book[]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const queryRef = useRef<null | HTMLInputElement>(null)
  const numberRef = useRef<null | HTMLInputElement>(null)

  const loadBooks = async (query: string, num: number) => {
    try {
      querySchema.parse({ query: query, num: num })
      setQuery(query)
    } catch (err) {
      console.log("error")
      return
    }
    console.log("Loading books for query:", query)
    setIsLoading(true)
    const url = `https://openlibrary.org/search.json?q=${query.replaceAll(" ", "+")}&limit=5&page=1`
    console.log(url)
    const res = await fetch(`https://openlibrary.org/search.json?q=${query.replace(" ", "+")}&limit=${num}&page=1&fields=cover_i,edition_key,title,author_name`) 
    const data = await res.json()
    if(!data.docs) return
    const localBooks: Book[] = []
    data.docs.map(async (doc: any) => {
      console.log(doc)
      const book: Book = {
        id: doc.edition_key[0],
        title: doc.title ? doc.title as string : "unknown",
        author: doc.author_name ? doc.author_name[0] as string : "unknown",
        cover: {
          id: 0,
          size: "M",
          url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        }
      }
      localBooks.push(book)
    })
    setBooks(localBooks)
    setIsLoading(false)
    console.log("finished search")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-12">
        Books
      </h1>
      <div className="mx-auto mt-6 w-1/3 flex justify-between items-center">
        <Input type="number"
        placeholder="Results"
        defaultValue={5}
        min={1}
        max={100}
        ref={numberRef}
        className="mr-4 w-1/2" />
        <Input type="text"
        placeholder="Query..."
        ref={queryRef}
        />
        <Button
        aria-label="search"
        className="ml-4"
        onClick={() => {
          if(queryRef.current == null || !queryRef.current.value) return
          if(numberRef.current == null || !numberRef.current.value) return
          setIsLoading(true)
          loadBooks(queryRef.current.value, numberRef.current.valueAsNumber)
        }}>
          <Search className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col justify-center items-center space-y-12 pt-12">
        <h2 className="text-xl font-semibold">
          Search results: {query ? query : ""}
        </h2>
        <div className="px-24 grid grid-cols-2 gap-4">
          {books != null && isLoading === false ? books.map((book: Book) => (
            <div key={book.id}
            className="w-full h-52 px-8 py-4 bg-slate-200/75 border border-slate-400/75 rounded-lg grid grid-cols-6">
              <div className="col-span-4">
                <h2 className="text-xl font-medium mb-4">{book.title}</h2>
                <p className="italic text-slate-700">Author: {book.author}</p>
              </div>
              <div className="col-span-2 flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                src={book.cover.url}
                alt="Book cover"
                className="h-40 w-auto"
                />
              </div>
            </div>
          )) : null}
        </div>
        {isLoading ? Array.from({length: 3}).map((_, i) => (
          <div key={i} className="w-1/3 h-52 px-8 py-4 animate-pulse bg-slate-200/75 rounded-lg grid grid-cols-6">
            <div className="col-span-4">
              <h2 className="text-xl font-medium mb-4 text-slate-300 bg-slate-300 animate-pulse mr-12 rounded-md">xxxxxxxxx</h2>
              <p className="text-slate-300 bg-slate-300 animate-pulse inline rounded-md">Author: xxxxxxxxxxxxxxx</p>
            </div>
            <div className="col-span-2 p-4">
              <div className="w-full h-full bg-slate-300 animate-pulse rounded-lg" />
            </div>
          </div>
        )) : null}
        {!isLoading && books == null ? (
          <div className="w-full h-64 text-slate-600 text-xl flex justify-center items-center">
            Search for something... <Ghost className="w-8 h-8 ml-2" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
