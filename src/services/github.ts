import type { GitHubProject, MarkdownFile, Book, BookChapter } from "@/types"
import { db } from "@/lib/db"
import { getAccessToken } from "@/services/auth"

const GITHUB_API_BASE = "https://api.github.com"

async function fetchWithAuth(url: string): Promise<Response> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }

  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(url, { headers })
}

export async function getRepositoryContent(
  project: GitHubProject
): Promise<MarkdownFile[]> {
  const { owner, repo, branch = "main", path = "" } = project
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

  const response = await fetchWithAuth(url)
  if (!response.ok) {
    const text = await response.text()
    if (text.startsWith("<")) {
      throw new Error(`GitHub API error (rate limit or not found): ${response.status} ${response.statusText}`)
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

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  _sha: string,
  branch = "main"
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

  const response = await fetchWithAuth(url)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch file content: ${response.statusText}. Response: ${text.substring(0, 200)}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got ${contentType}`)
  }

  const data = await response.json()
  return atob(data.content)
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

  return accumulatedFiles.sort((a, b) => a.path.localeCompare(b.path))
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

  await db.downloadProgress.put({
    repoId,
    current: 0,
    total: markdownFiles.length,
    status: "downloading",
  })

  const chapters: BookChapter[] = []
  for (let i = 0; i < markdownFiles.length; i++) {
    const file = markdownFiles[i]
    const content = await getFileContent(
      project.owner,
      project.repo,
      file.path,
      file.sha,
      project.branch
    )
    const chapter: BookChapter = {
      id: file.sha,
      title: extractTitle(content) || file.name.replace(".md", ""),
      content,
      path: file.path,
      order: i,
    }

    await db.cachedChapters.put({
      id: chapter.id,
      repoId,
      title: chapter.title,
      content: chapter.content,
      path: chapter.path,
      order: chapter.order,
    })

    chapters.push(chapter)
    await db.downloadProgress.put({
      repoId,
      current: i + 1,
      total: markdownFiles.length,
      status: "downloading",
    })

    onProgress?.(i + 1, markdownFiles.length)
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

  return {
    title: repoInfo.name,
    description: repoInfo.description,
    chapters,
    totalChapters: chapters.length,
  }
}

export async function loadBookFromCache(repoId: string): Promise<Book | null> {
  const repo = await db.cachedRepos.get(repoId)
  if (!repo) return null

  const chapters = await db.cachedChapters
    .where("repoId")
    .equals(repoId)
    .sortBy("order")

  return {
    title: repo.name,
    description: repo.description,
    chapters,
    totalChapters: chapters.length,
  }
}

export async function getCachedRepos(): Promise<Array<{ id: string; name: string; description: string; downloadedAt: number }>> {
  return db.cachedRepos.toArray()
}

export async function deleteCachedRepo(repoId: string): Promise<void> {
  await db.cachedChapters.where("repoId").equals(repoId).delete()
  await db.cachedRepos.delete(repoId)
  await db.downloadProgress.delete(repoId)
}

export async function getDownloadProgress(repoId: string) {
  return db.downloadProgress.get(repoId)
}

async function getRepositoryInfo(project: GitHubProject) {
  const { owner, repo } = project
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`

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
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?(?:\/(.+))?/,
    /^([^/]+)\/([^/]+)(?:\/(.+))?$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
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

  return {
    title: repoInfo.name,
    description: repoInfo.description,
    chapters,
    totalChapters: chapters.length,
  }
}
