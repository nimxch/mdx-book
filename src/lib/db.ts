import Dexie, { type Table } from "dexie"

export interface User {
  id: number
  login: string
  name: string
  avatar_url: string
  accessToken: string
}

export interface CachedRepo {
  id: string
  owner: string
  repo: string
  name: string
  description: string
  fullName: string
  downloadedAt: number
  bookmarks?: CachedBookmark[]
}

export interface CachedBookmark {
  id: string // repoId:pageIndex
  repoId: string
  pageIndex: number
  chapterIndex: number
  title: string
  createdAt: number
}

export interface CachedChapter {
  id: string
  repoId: string
  title: string
  content: string
  contentSize: number
  path: string
  order: number
}

export interface CachedPage {
  id: string
  repoId: string
  chapterIndex: number
  pageIndex: number
  title: string
  content: string
  contentPreview: string
  contentLength: number
  order: number
}

export interface DownloadProgress {
  repoId: string
  current: number
  total: number
  status: "downloading" | "completed" | "failed"
  error?: string
}

class BookReaderDB extends Dexie {
  users!: Table<User>
  cachedRepos!: Table<CachedRepo>
  cachedChapters!: Table<CachedChapter>
  cachedPages!: Table<CachedPage>
  downloadProgress!: Table<DownloadProgress>
  bookmarks!: Table<CachedBookmark>

  constructor() {
    super("BookReaderDB_v2")
    this.version(1).stores({
      users: "++id, login",
      cachedRepos: "id, owner, repo, fullName",
      cachedChapters: "id, repoId, path, order, [repoId+order]",
      cachedPages: "id, repoId, [repoId+order], [chapterIndex+pageIndex]",
      downloadProgress: "repoId",
      bookmarks: "id, repoId, pageIndex, chapterIndex, createdAt",
    })
  }
}

export const db = new BookReaderDB()
