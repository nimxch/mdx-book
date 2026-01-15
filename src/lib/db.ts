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
}

export interface CachedChapter {
  id: string
  repoId: string
  title: string
  content: string
  path: string
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
  downloadProgress!: Table<DownloadProgress>

  constructor() {
    super("BookReaderDB")
    this.version(1).stores({
      users: "++id, login",
      cachedRepos: "id, owner, repo, fullName",
      cachedChapters: "++id, repoId, path",
      downloadProgress: "repoId",
    })
  }
}

export const db = new BookReaderDB()
