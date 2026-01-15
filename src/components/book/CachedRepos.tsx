import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Download, Trash2, Loader2, GitBranch, FolderOpen } from "lucide-react"
import { parseGitHubUrl, downloadRepository, deleteCachedRepo, getDownloadProgress } from "@/services/github"
import type { Book } from "@/types"

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

    const bookChapters = chapters.map((ch) => {
      console.log(`  Chapter ${ch.order}: ${ch.title}, content length: ${ch.content?.length || 0}`)
      return {
        id: ch.id,
        title: ch.title,
        content: ch.content || "",
        path: ch.path,
        order: ch.order,
      }
    })

    const book: Book = {
      title: repo.name,
      description: repo.description || "",
      chapters: bookChapters,
      totalChapters: bookChapters.length,
    }

    console.log("Book constructed:", book.title, book.totalChapters, "chapters")
    onBookSelect(book)
  }

  const handleDelete = async (repoId: string) => {
    await deleteCachedRepo(repoId)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/owner/repo or owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isDownloading}
            />
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
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            My Library ({cachedRepos?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cachedRepos && cachedRepos.length > 0 ? (
            <div className="space-y-2">
              {cachedRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{repo.name}</p>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {repo.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <GitBranch className="w-3 h-3" />
                      {repo.owner}/{repo.repo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenBook(repo.id)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(repo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No books downloaded yet</p>
              <p className="text-sm">Download a repository to start reading</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
