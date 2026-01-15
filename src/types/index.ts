export interface GitHubProject {
  owner: string
  repo: string
  branch?: string
  path?: string
}

export interface MarkdownFile {
  path: string
  name: string
  content: string
  size: number
  sha: string
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
}

export interface BookChapter {
  id: string
  title: string
  content: string
  path: string
  order: number
}

export interface Book {
  title: string
  description?: string
  owner: string
  repo: string
  chapters: BookChapter[]
  totalChapters: number
}
