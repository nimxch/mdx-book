import type { GitHubProject, MarkdownFile, Book, BookChapter } from "@/types"

const GITHUB_API_BASE = "https://api.github.com"

async function fetchWithAuth(url: string): Promise<Response> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }

  const token = localStorage.getItem("github_token")
  if (token) {
    headers.Authorization = `token ${token}`
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
    throw new Error(`Failed to fetch repository content: ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

export async function getFileContent(url: string): Promise<string> {
  const response = await fetchWithAuth(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`)
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

export async function buildBook(project: GitHubProject): Promise<Book> {
  const markdownFiles = await getAllMarkdownFilesRecursive(project)

  const chapters: BookChapter[] = await Promise.all(
    markdownFiles.map(async (file, index) => {
      const content = await getFileContent(file.download_url)
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
