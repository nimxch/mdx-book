import type { GitHubProject, MarkdownFile, Book, BookChapter } from "./src/types"

const GITHUB_API_BASE = "https://api.github.com"

async function fetchWithAuth(url: string, accept = "application/vnd.github.v3+json"): Promise<Response> {
  const headers: HeadersInit = {
    Accept: accept,
  }

  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(url, { headers })
}

async function getRepositoryContent(
  owner: string,
  repo: string,
  branch = "main",
  path = ""
): Promise<MarkdownFile[]> {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`

  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch repository content: ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

async function getAllMarkdownFilesRecursive(
  owner: string,
  repo: string,
  branch = "main",
  path = "",
  accumulatedFiles: MarkdownFile[] = []
): Promise<MarkdownFile[]> {
  const files = await getRepositoryContent(owner, repo, branch, path)

  for (const file of files) {
    if (file.type === "file" && file.name.endsWith(".md")) {
      accumulatedFiles.push(file)
    } else if (file.type === "dir") {
      await getAllMarkdownFilesRecursive(owner, repo, branch, file.path, accumulatedFiles)
    }
  }

  const sorted = accumulatedFiles.sort((a, b) => a.path.localeCompare(b.path))
  return sorted
}

async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  branch = "main"
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`

  const response = await fetchWithAuth(url, "application/vnd.github.raw")
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`)
  }

  return response.text()
}

function extractTitle(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1].trim() : null
}

async function getRepositoryInfo(owner: string, repo: string) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`)
  }
  return response.json()
}

interface Page {
  chapterIndex: number
  pageIndex: number
  title: string
  contentPreview: string
  contentLength: number
}

function divideIntoPages(chapters: BookChapter[], containerWidth = 1000): Page[] {
  const pages: Page[] = []

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex]
    const contentLength = chapter.content.length

    const charsPerPage = containerWidth * 50
    const totalPages = Math.max(1, Math.ceil(contentLength / charsPerPage))

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const start = pageIndex * charsPerPage
      const end = Math.min(start + charsPerPage, contentLength)
      const pageContent = chapter.content.substring(start, end)
      const preview = pageContent.replace(/\n/g, " ").substring(0, 200)

      pages.push({
        chapterIndex,
        pageIndex,
        title: chapter.title,
        contentPreview: preview + (pageContent.length > 200 ? "..." : ""),
        contentLength: pageContent.length
      })
    }
  }

  return pages
}

async function main() {
  const project: GitHubProject = {
    owner: "torvalds",
    repo: "linux",
    branch: "main",
    path: "Documentation"
  }

  console.log(`Fetching MD files from ${project.owner}/${project.repo}/${project.path || ""}...`)

  const markdownFiles = await getAllMarkdownFilesRecursive(
    project.owner,
    project.repo,
    project.branch,
    project.path
  )

  console.log(`Found ${markdownFiles.length} markdown files`)

  if (markdownFiles.length === 0) {
    console.log("No markdown files found!")
    return
  }

  const chapters: BookChapter[] = []

  for (let i = 0; i < markdownFiles.length; i++) {
    const file = markdownFiles[i]
    console.log(`Processing ${i + 1}/${markdownFiles.length}: ${file.path}`)

    try {
      const content = await getFileContent(project.owner, project.repo, file.path, project.branch)

      chapters.push({
        id: file.sha,
        title: extractTitle(content) || file.name.replace(".md", ""),
        content,
        path: file.path,
        order: i,
      })
    } catch (error) {
      console.error(`Error fetching ${file.path}:`, error)
    }
  }

  const repoInfo = await getRepositoryInfo(project.owner, project.repo)

  const book: Book = {
    title: repoInfo.name,
    description: repoInfo.description,
    owner: project.owner,
    repo: project.repo,
    chapters,
    totalChapters: chapters.length,
  }

  console.log(`\n=== BOOK CREATED ===`)
  console.log(`Title: ${book.title}`)
  console.log(`Total Chapters: ${book.totalChapters}`)
  console.log(`Total Content Length: ${book.chapters.reduce((sum, ch) => sum + ch.content.length, 0)} chars`)

  const pages = divideIntoPages(book.chapters)

  console.log(`\n=== TOTAL PAGES: ${pages.length} ===`)

  console.log(`\n=== FIRST 5 PAGES ===`)
  for (let i = 0; i < Math.min(5, pages.length); i++) {
    const page = pages[i]
    console.log(`\n--- Page ${i + 1} ---`)
    console.log(`Chapter: ${page.chapterIndex + 1} - ${page.title}`)
    console.log(`Page within chapter: ${page.pageIndex + 1}`)
    console.log(`Content length: ${page.contentLength} chars`)
    console.log(`Preview: ${page.contentPreview}`)
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Pages per chapter:`)
  for (let i = 0; i < Math.min(10, book.chapters.length); i++) {
    const chapterPages = pages.filter(p => p.chapterIndex === i).length
    console.log(`  Chapter ${i + 1}: ${chapterPages} pages`)
  }
}

main().catch(console.error)
