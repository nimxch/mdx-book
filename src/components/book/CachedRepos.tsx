import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Download, Trash2, Loader2, GitBranch, FolderOpen, ExternalLink } from "lucide-react"
import { parseGitHubUrl, downloadRepository, deleteCachedRepo, getDownloadProgress } from "@/services/github"
import type { Book, BookPage } from "@/types"

interface CachedReposProps {
  onBookSelect: (book: Book) => void
  onDownloadStart: () => void
}

export function CachedRepos({ onBookSelect, onDownloadStart }: CachedReposProps) {
  const [url, setUrl] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; status: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cachedRepos = useLiveQuery(() => db.cachedRepos.toArray())

  useEffect(() => {
    if (url) {
      const project = parseGitHubUrl(url.trim())
      if (project) {
        getDownloadProgress(`${project.owner}/${project.repo}`).then((progress) => {
          if (progress) {
            setDownloadProgress(progress)
          }
        })
      }
    }
  }, [url])

  const handleDownload = async () => {
    const project = parseGitHubUrl(url.trim())
    if (!project) {
      setError("Invalid GitHub URL")
      return
    }

    setIsDownloading(true)
    setError(null)
    onDownloadStart()

    try {
      const repoId = `${project.owner}/${project.repo}`
      await deleteCachedRepo(repoId)
      console.log("Cleared existing cache for:", repoId)
      
      const book = await downloadRepository(project, (current, total) => {
        setDownloadProgress({ current, total, status: "downloading" })
      })
      onBookSelect(book)
      setUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download")
    } finally {
      setIsDownloading(false)
      setDownloadProgress(null)
    }
  }

  const handleOpenBook = async (repoId: string) => {
    const repo = await db.cachedRepos.get(repoId)
    if (!repo) {
      console.error("Repo not found in cache:", repoId)
      return
    }

    const chapters = await db.cachedChapters
      .where("repoId")
      .equals(repoId)
      .sortBy("order")

    console.log(`Loaded ${chapters.length} chapters from cache for ${repoId}`)
    
    if (chapters.length === 0) {
      console.warn("No chapters found in cache, repo might be corrupted. Try re-downloading.")
      setError("Book appears corrupted. Please delete and re-download.")
      return
    }

    const bookChapters = chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      content: ch.content || "",
      path: ch.path,
      order: ch.order,
    }))

    // Generate pages from chapters (split long content into pages)
    const pages: BookPage[] = []
    bookChapters.forEach((chapter, chapterIndex) => {
      const content = chapter.content || ""
      // Split content into chunks (approximately 3000 chars per page)
      const chunkSize = 3000
      const chunks = []
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.substring(i, i + chunkSize))
      }
      
      chunks.forEach((pageContent, pageIndex) => {
        pages.push({
          chapterIndex,
          pageIndex,
          title: chapter.title,
          content: pageContent,
          contentPreview: pageContent.substring(0, 100),
          contentLength: pageContent.length,
        })
      })
    })

    const book: Book = {
      title: repo.name,
      description: repo.description || "",
      owner: repo.owner,
      repo: repo.repo,
      chapters: bookChapters,
      pages: pages,
      totalChapters: bookChapters.length,
    }

    console.log("Book constructed:", book.title, book.totalChapters, "chapters", pages.length, "pages")
    onBookSelect(book)
  }

  const handleDelete = async (repoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this book from your library?")) {
      await deleteCachedRepo(repoId)
    }
  }

  const openInGitHub = (owner: string, repo: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`https://github.com/${owner}/${repo}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1 bg-linear-to-r from-primary to-primary/50" />
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5" />
            Download Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url" className="text-sm font-medium">
              GitHub Repository
            </Label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isDownloading}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a GitHub repository URL to download and read offline
            </p>
          </div>

          {downloadProgress && downloadProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </span>
                <span>
                  {downloadProgress.current} / {downloadProgress.total}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading || !url.trim()}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download & Read
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {cachedRepos && cachedRepos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            My Library ({cachedRepos.length} {cachedRepos.length === 1 ? "book" : "books"})
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cachedRepos.map((repo) => (
              <Card
                key={repo.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md"
                onClick={() => handleOpenBook(repo.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => openInGitHub(repo.owner, repo.repo, e)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(repo.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-1 line-clamp-1">{repo.name}</h3>
                  {repo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GitBranch className="w-3 h-3" />
                    <span className="truncate">{repo.owner}/{repo.repo}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(repo.downloadedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      Read
                      <BookOpen className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {cachedRepos && cachedRepos.length === 0 && (
        <Card className="border-0 shadow-lg bg-muted/30">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Your library is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download a GitHub repository to start reading
            </p>
            <p className="text-xs text-muted-foreground">
              Your downloaded books are stored locally and available offline
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
