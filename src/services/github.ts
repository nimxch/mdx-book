import type { GitHubProject, MarkdownFile, Book, BookChapter } from "@/types"
import { db } from "@/lib/db"
import { getAccessToken } from "@/services/auth"

const GITHUB_API_BASE = "https://api.github.com"

async function fetchWithAuth(url: string, accept = "application/vnd.github.v3+json"): Promise<Response> {
  const headers: HeadersInit = {
    Accept: accept,
  }

  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(url, { headers })
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  _sha: string,
  branch?: string
): Promise<string> {
  const query = branch ? `?ref=${encodeURIComponent(branch)}` : ""
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}${query}`

  const response = await fetchWithAuth(url, "application/vnd.github.raw")
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch file content: ${response.statusText}. URL: ${url}. Response: ${text.substring(0, 200)}`)
  }

  return response.text()
}

export async function getRepositoryContent(
  project: GitHubProject
): Promise<MarkdownFile[]> {
  const { owner, repo, branch, path = "" } = project
  const query = branch ? `?ref=${encodeURIComponent(branch)}` : ""
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}${query}`

  const response = await fetchWithAuth(url)
  if (!response.ok) {
    const text = await response.text()
    
    // Try to parse as JSON to get detailed error message
    try {
      const errorData = JSON.parse(text)
      if (errorData.message) {
        // Check for rate limit error
        if (errorData.message.includes("rate limit exceeded") || errorData.message.includes("API rate limit")) {
          throw new Error(`GitHub API rate limit exceeded. Please authenticate with GitHub to get higher rate limits. ${errorData.documentation_url || ""}`)
        }
        throw new Error(`GitHub API error: ${errorData.message}`)
      }
    } catch (parseError) {
      // If not JSON, handle as before
      if (text.startsWith("<")) {
        throw new Error(`GitHub API error (rate limit or not found): ${response.status} ${response.statusText}`)
      }
    }
    
    throw new Error(`Failed to fetch repository content: ${response.statusText}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got ${contentType}. URL: ${url}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

export async function getMarkdownFiles(
  project: GitHubProject
): Promise<MarkdownFile[]> {
  const files = await getRepositoryContent(project)
  return files.filter((file) => file.name.endsWith(".md"))
}

export async function getAllMarkdownFilesRecursive(
  project: GitHubProject,
  accumulatedFiles: MarkdownFile[] = []
): Promise<MarkdownFile[]> {
  const files = await getRepositoryContent(project)

  for (const file of files) {
    if (file.type === "file" && file.name.endsWith(".md")) {
      accumulatedFiles.push(file)
    } else if (file.type === "dir") {
      await getAllMarkdownFilesRecursive(
        {
          ...project,
          path: file.path,
        },
        accumulatedFiles
      )
    }
  }

  const sorted = accumulatedFiles.sort((a, b) => a.path.localeCompare(b.path))
  return sorted
}

export async function downloadRepository(
  project: GitHubProject,
  onProgress?: (current: number, total: number) => void
): Promise<Book> {
  const repoId = `${project.owner}/${project.repo}`
  const repoInfo = await getRepositoryInfo(project)

  await db.downloadProgress.put({
    repoId,
    current: 0,
    total: 0,
    status: "downloading",
  })

  const markdownFiles = await getAllMarkdownFilesRecursive(project)

  if (markdownFiles.length === 0) {
    throw new Error("No markdown files found in repository")
  }

  await db.downloadProgress.put({
    repoId,
    current: 0,
    total: markdownFiles.length,
    status: "downloading",
  })

  const chapters: BookChapter[] = []
  
  for (let i = 0; i < markdownFiles.length; i++) {
    const file = markdownFiles[i]
    
    let content: string
    try {
      content = await getFileContent(
        project.owner,
        project.repo,
        file.path,
        file.sha,
        project.branch
      )
    } catch (error) {
      content = `# Error loading file\n\nFailed to load: ${file.path}\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`
    }
    
    if (content.length === 0 && file.size > 1000000) {
      content = `# File Too Large\n\nThe file "${file.name}" is ${file.size} bytes.\n\nGitHub's raw content API should support files up to 100MB.\n\nPlease read the original at: https://github.com/${project.owner}/${project.repo}/blob/${project.branch || "main"}/${file.path}`
    }
    
    const chapter: BookChapter = {
      id: file.sha,
      title: extractTitle(content) || file.name.replace(".md", ""),
      content,
      path: file.path,
      order: i,
    }

    chapters.push(chapter)
    
    if (content.length > 0) {
      try {
        await db.cachedChapters.put({
          id: chapter.id,
          repoId,
          title: chapter.title,
          content: chapter.content,
          contentSize: chapter.content.length,
          path: chapter.path,
          order: chapter.order,
        })
      } catch (error) {
        throw new Error(`Failed to save chapter "${chapter.title}" (${chapter.content.length} chars). IndexedDB may have size limits.`)
      }
    }
    
    await db.downloadProgress.put({
      repoId,
      current: i + 1,
      total: markdownFiles.length,
      status: "downloading",
    })

    onProgress?.(i + 1, markdownFiles.length)
  }

  const validChapters = chapters.filter(ch => ch.content.length > 0)

  if (validChapters.length === 0) {
    throw new Error("No chapters could be downloaded. Files may be too large for GitHub API.")
  }

  const cachedRepo = {
    id: repoId,
    owner: project.owner,
    repo: project.repo,
    name: repoInfo.name,
    description: repoInfo.description,
    fullName: repoInfo.full_name,
    downloadedAt: Date.now(),
  }

  await db.cachedRepos.put(cachedRepo)
  await db.downloadProgress.put({
    repoId,
    current: markdownFiles.length,
    total: markdownFiles.length,
    status: "completed",
  })

  const pages = divideIntoPages(validChapters)

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    try {
      await db.cachedPages.put({
        id: `${repoId}-page-${i}`,
        repoId,
        chapterIndex: page.chapterIndex,
        pageIndex: page.pageIndex,
        title: page.title,
        content: page.content,
        contentPreview: page.contentPreview,
        contentLength: page.contentLength,
        order: i,
      })
    } catch (error) {
    }
  }

  return {
    title: repoInfo.name,
    description: repoInfo.description,
    owner: project.owner,
    repo: project.repo,
    chapters: validChapters,
    pages,
    totalChapters: validChapters.length,
  }
}

export async function loadBookFromCache(repoId: string): Promise<Book | null> {
  const repo = await db.cachedRepos.get(repoId)
  if (!repo) return null

  const chapters = await db.cachedChapters
    .where("repoId")
    .equals(repoId)
    .sortBy("order")

  const pages = await db.cachedPages
    .where("repoId")
    .equals(repoId)
    .sortBy("order")

  return {
    title: repo.name,
    description: repo.description,
    owner: repo.owner,
    repo: repo.repo,
    chapters,
    pages: pages.map(p => ({
      chapterIndex: p.chapterIndex,
      pageIndex: p.pageIndex,
      title: p.title,
      content: p.content,
      contentPreview: p.contentPreview,
      contentLength: p.contentLength,
    })),
    totalChapters: chapters.length,
  }
}

export async function getCachedRepos(): Promise<Array<{ id: string; name: string; description: string; downloadedAt: number }>> {
  return db.cachedRepos.toArray()
}

export async function deleteCachedRepo(repoId: string): Promise<void> {
  await db.cachedChapters.where("repoId").equals(repoId).delete()
  await db.cachedPages.where("repoId").equals(repoId).delete()
  await db.cachedRepos.delete(repoId)
  await db.downloadProgress.delete(repoId)
}

export async function getDownloadProgress(repoId: string) {
  return db.downloadProgress.get(repoId)
}

async function getRepositoryInfo(project: GitHubProject) {
  const { owner, repo } = project
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`

  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`)
  }

  return response.json()
}

function extractTitle(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1].trim() : null
}

export function parseGitHubUrl(url: string): GitHubProject | null {
  if (!url) return null

  // Clean the URL: strip protocol and common prefixes
  let cleanUrl = url.trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")

  // Handle api.github.com URLs (e.g., api.github.com/repos/owner/repo/contents/path)
  if (cleanUrl.includes("api.github.com/repos/")) {
    const parts = cleanUrl.split("api.github.com/repos/")[1].split("/")
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1],
        // Note: API URLs for contents might have path/branch in them, 
        // but for simplicity we just return owner/repo and let the user specify details 
        // if they provided a complex API URL.
      }
    }
  }

  const patterns = [
    // Standard GitHub URLs: github.com/owner/repo/tree/branch/path
    /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?(?:\/(.+))?/,
    // Short format: owner/repo/path
    /^([^/]+)\/([^/]+)(?:\/(.+))?$/,
  ]

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match) {
      // Avoid matching "github.com" as owner if it's already handled or malformed
      if (match[1] === "github.com") continue

      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
        branch: match[3],
        path: match[4],
      }
    }
  }

  return null
}

export async function buildBook(project: GitHubProject): Promise<Book> {
  const markdownFiles = await getAllMarkdownFilesRecursive(project)

  const chapters: BookChapter[] = await Promise.all(
    markdownFiles.map(async (file, index) => {
      const content = await getFileContent(
        project.owner,
        project.repo,
        file.path,
        file.sha,
        project.branch
      )
      return {
        id: file.sha,
        title: extractTitle(content) || file.name.replace(".md", ""),
        content,
        path: file.path,
        order: index,
      }
    })
  )

  const repoInfo = await getRepositoryInfo(project)

  const pages = divideIntoPages(chapters)

  return {
    title: repoInfo.name,
    description: repoInfo.description,
    owner: project.owner,
    repo: project.repo,
    chapters,
    pages,
    totalChapters: chapters.length,
  }
}

function divideIntoPages(chapters: BookChapter[], _containerWidth = 1000): import("@/types").BookPage[] {
  const CHARS_PER_PAGE = 2000
  const pages: import("@/types").BookPage[] = []

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
    const chapter = chapters[chapterIndex]
    const content = chapter.content

    const paragraphs = content.split(/\n\n+/)

    let currentPageContent = ""
    let pageIndex = 0

    for (const paragraph of paragraphs) {
      if (currentPageContent.length + paragraph.length + 2 > CHARS_PER_PAGE && currentPageContent.length > 0) {
        const preview = currentPageContent.replace(/\n/g, " ").substring(0, 200)
        pages.push({
          chapterIndex,
          pageIndex,
          title: chapter.title,
          content: currentPageContent,
          contentPreview: preview + (currentPageContent.length > 200 ? "..." : ""),
          contentLength: currentPageContent.length
        })
        pageIndex++
        currentPageContent = ""
      }

      if (currentPageContent.length > 0) {
        currentPageContent += "\n\n"
      }
      currentPageContent += paragraph
    }

    if (currentPageContent.length > 0) {
      const preview = currentPageContent.replace(/\n/g, " ").substring(0, 200)
      pages.push({
        chapterIndex,
        pageIndex,
        title: chapter.title,
        content: currentPageContent,
        contentPreview: preview + (currentPageContent.length > 200 ? "..." : ""),
        contentLength: currentPageContent.length
      })
    }
  }

  return pages
}
