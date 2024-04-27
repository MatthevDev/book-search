type Book = {
    id: string,
    title: string,
    author: string,
    cover: BookCover,
}

type BookCover = {
    id: number,
    size: "S" | "M" | "L",
    url: string,
}